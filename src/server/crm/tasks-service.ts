import "server-only";

import { Prisma, type CrmTaskStatus } from "@prisma/client";
import type { z } from "zod";

import { assertCrmWriteActor, type CrmActor } from "@/server/crm/access";
import { createActivity, writeCrmAudit } from "@/server/crm/activity-service";
import type {
  assignTaskSchema,
  changeTaskStatusSchema,
  createTaskSchema,
  taskListQuerySchema,
  updateTaskSchema,
} from "@/server/crm/schemas";
import { serializeCrmTask } from "@/server/crm/serializers";
import { CrmServiceError } from "@/server/crm/service";
import { getPrisma } from "@/server/db/prisma";

type CreateTaskInput = z.infer<typeof createTaskSchema>;
type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
type ChangeTaskStatusInput = z.infer<typeof changeTaskStatusSchema>;
type AssignTaskInput = z.infer<typeof assignTaskSchema>;
type TaskListInput = z.infer<typeof taskListQuerySchema>;

const taskInclude = {
  assignedTo: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  lead: { select: { id: true, companyName: true, fullName: true } },
  organization: { select: { id: true, name: true } },
} satisfies Prisma.CrmTaskInclude;

export async function listTasks(input: TaskListInput) {
  const prisma = getPrisma();
  const rows = await prisma.crmTask.findMany({
    where: {
      ...(input.status ? { status: input.status } : {}),
      ...(input.priority ? { priority: input.priority } : {}),
      ...(input.assignedToId ? { assignedToId: input.assignedToId } : {}),
      ...(input.leadId ? { leadId: input.leadId } : {}),
      ...(input.organizationId ? { organizationId: input.organizationId } : {}),
      ...(input.dueBefore || input.dueAfter
        ? {
            dueAt: {
              ...(input.dueBefore ? { lte: new Date(input.dueBefore) } : {}),
              ...(input.dueAfter ? { gte: new Date(input.dueAfter) } : {}),
            },
          }
        : {}),
      ...(input.q
        ? {
            OR: [
              { title: { contains: input.q, mode: "insensitive" } },
              { description: { contains: input.q, mode: "insensitive" } },
              { lead: { companyName: { contains: input.q, mode: "insensitive" } } },
              { organization: { name: { contains: input.q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: taskInclude,
    orderBy: [
      { status: "asc" },
      { dueAt: { sort: "asc", nulls: "last" } },
      { createdAt: "desc" },
      { id: "desc" },
    ],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  const hasMore = rows.length > input.limit;
  const items = hasMore ? rows.slice(0, input.limit) : rows;
  return {
    items: items.map(serializeCrmTask),
    nextCursor: hasMore ? items.at(-1)?.id ?? null : null,
  };
}

export async function listTasksForLead(leadId: string) {
  return listTasks({ leadId, limit: 100 });
}

export async function listTasksForOrganization(organizationId: string) {
  return listTasks({ organizationId, limit: 100 });
}

export async function getTask(taskId: string) {
  const task = await getPrisma().crmTask.findUnique({ where: { id: taskId }, include: taskInclude });
  if (!task) throw new CrmServiceError(404, "NOT_FOUND", "Nie znaleziono zadania.");
  return serializeCrmTask(task);
}

export async function createTask(input: CreateTaskInput, actor: CrmActor) {
  assertCrmWriteActor(actor);
  await assertTaskLinks(input.leadId, input.organizationId);
  await assertAssignableUser(input.assignedToId);

  const task = await getPrisma().$transaction(async (tx) => {
    const created = await tx.crmTask.create({
      data: {
        leadId: input.leadId,
        organizationId: input.organizationId,
        assignedToId: input.assignedToId ?? undefined,
        createdById: actor.id,
        title: input.title,
        description: input.description || undefined,
        priority: input.priority,
        dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
      },
      include: taskInclude,
    });
    await writeCrmAudit(tx, actor, "crm.task.created", "CrmTask", created.id, {
      leadId: created.leadId,
      organizationId: created.organizationId,
      assignedToId: created.assignedToId,
      priority: created.priority,
      status: created.status,
    }, created.organizationId);
    await createActivity(tx, {
      leadId: created.leadId,
      organizationId: created.organizationId,
      type: "TASK_CREATED",
      title: "Utworzono zadanie",
      description: created.title,
      metadata: { taskId: created.id, assignedToId: created.assignedToId, priority: created.priority },
    }, actor);
    return created;
  });

  return serializeCrmTask(task);
}

export async function updateTask(taskId: string, input: UpdateTaskInput, actor: CrmActor) {
  assertCrmWriteActor(actor);
  await assertAssignableUser(input.assignedToId);
  const existing = await getPrisma().crmTask.findUnique({
    where: { id: taskId },
    select: { id: true, leadId: true, organizationId: true, status: true },
  });
  if (!existing) throw new CrmServiceError(404, "NOT_FOUND", "Nie znaleziono zadania.");

  const task = await getPrisma().$transaction(async (tx) => {
    const statusDates = taskStatusDates(input.status, existing.status);
    const updated = await tx.crmTask.update({
      where: { id: taskId },
      data: {
        assignedToId: input.assignedToId,
        title: input.title,
        description: input.description,
        priority: input.priority,
        dueAt: input.dueAt === null ? null : input.dueAt ? new Date(input.dueAt) : undefined,
        status: input.status,
        ...statusDates,
      },
      include: taskInclude,
    });
    await writeCrmAudit(tx, actor, "crm.task.updated", "CrmTask", taskId, {
      changedFields: Object.keys(input),
      status: updated.status,
      assignedToId: updated.assignedToId,
    }, updated.organizationId);
    await createActivity(tx, {
      leadId: updated.leadId,
      organizationId: updated.organizationId,
      type: activityTypeForStatus(updated.status, existing.status, "TASK_UPDATED"),
      title: "Zaktualizowano zadanie",
      description: updated.title,
      metadata: { taskId, changedFields: Object.keys(input), status: updated.status },
    }, actor);
    return updated;
  });

  return serializeCrmTask(task);
}

export async function changeTaskStatus(taskId: string, input: ChangeTaskStatusInput, actor: CrmActor) {
  return updateTask(taskId, { status: input.status }, actor);
}

export async function assignTask(taskId: string, input: AssignTaskInput, actor: CrmActor) {
  assertCrmWriteActor(actor);
  await assertAssignableUser(input.assignedToId);
  const existing = await getPrisma().crmTask.findUnique({
    where: { id: taskId },
    select: { id: true, leadId: true, organizationId: true, assignedToId: true },
  });
  if (!existing) throw new CrmServiceError(404, "NOT_FOUND", "Nie znaleziono zadania.");

  const task = await getPrisma().$transaction(async (tx) => {
    const updated = await tx.crmTask.update({
      where: { id: taskId },
      data: { assignedToId: input.assignedToId },
      include: taskInclude,
    });
    await writeCrmAudit(tx, actor, "crm.task.assigned", "CrmTask", taskId, {
      assignedToId: input.assignedToId,
      previousAssignedToId: existing.assignedToId,
    }, updated.organizationId);
    await createActivity(tx, {
      leadId: updated.leadId,
      organizationId: updated.organizationId,
      type: "TASK_ASSIGNED",
      title: "Przypisano zadanie",
      description: updated.title,
      metadata: { taskId, assignedToId: input.assignedToId },
    }, actor);
    return updated;
  });

  return serializeCrmTask(task);
}

export async function completeTask(taskId: string, actor: CrmActor) {
  return changeTaskStatus(taskId, { status: "DONE" }, actor);
}

export async function cancelTask(taskId: string, actor: CrmActor) {
  return changeTaskStatus(taskId, { status: "CANCELLED" }, actor);
}

async function assertTaskLinks(leadId?: string, organizationId?: string) {
  const prisma = getPrisma();
  if (leadId) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true } });
    if (!lead) throw new CrmServiceError(404, "NOT_FOUND", "Nie znaleziono leada.");
  }
  if (organizationId) {
    const organization = await prisma.organization.findUnique({ where: { id: organizationId }, select: { id: true } });
    if (!organization) throw new CrmServiceError(404, "ORGANIZATION_NOT_FOUND", "Nie znaleziono organizacji.");
  }
}

async function assertAssignableUser(id?: string | null) {
  if (!id) return;
  const user = await getPrisma().user.findUnique({ where: { id }, select: { role: true } });
  if (!user || !["ADMIN", "LAWYER", "OPERATOR"].includes(user.role)) {
    throw new CrmServiceError(400, "INVALID_ASSIGNEE", "Osoba przypisana musi miec role operacyjna.");
  }
}

function taskStatusDates(next?: CrmTaskStatus, previous?: CrmTaskStatus) {
  if (!next || next === previous) return {};
  if (next === "DONE") return { completedAt: new Date(), cancelledAt: null };
  if (next === "CANCELLED") return { cancelledAt: new Date(), completedAt: null };
  return { completedAt: null, cancelledAt: null };
}

function activityTypeForStatus(next: CrmTaskStatus, previous: CrmTaskStatus, fallback: "TASK_UPDATED") {
  if (next === previous) return fallback;
  if (next === "DONE") return "TASK_COMPLETED";
  if (next === "CANCELLED") return "TASK_CANCELLED";
  return fallback;
}
