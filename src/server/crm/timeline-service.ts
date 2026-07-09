import "server-only";

import { CrmActivityType } from "@prisma/client";
import type { z } from "zod";

import type { timelineQuerySchema } from "@/server/crm/schemas";
import { CrmServiceError } from "@/server/crm/service";
import { getPrisma } from "@/server/db/prisma";

type TimelineQuery = z.infer<typeof timelineQuerySchema>;

const crmActivityTypes = new Set<string>(Object.values(CrmActivityType));

type TimelineItem = {
  id: string;
  kind: "activity" | "audit" | "note" | "task";
  type: string;
  title: string;
  description: string | null;
  actor: { id: string; name: string | null; email: string } | null;
  status: string | null;
  priority: string | null;
  createdAt: Date;
};

export async function getLeadTimeline(leadId: string, input: TimelineQuery) {
  const lead = await getPrisma().lead.findUnique({ where: { id: leadId }, select: { id: true } });
  if (!lead) throw new CrmServiceError(404, "NOT_FOUND", "Nie znaleziono leada.");
  return getTimeline({ leadId }, input);
}

export async function getOrganizationTimeline(organizationId: string, input: TimelineQuery) {
  const organization = await getPrisma().organization.findUnique({ where: { id: organizationId }, select: { id: true } });
  if (!organization) throw new CrmServiceError(404, "ORGANIZATION_NOT_FOUND", "Nie znaleziono organizacji.");
  return getTimeline({ organizationId }, input);
}

async function getTimeline(scope: { leadId?: string; organizationId?: string }, input: TimelineQuery) {
  const prisma = getPrisma();
  const cursorDate = input.cursor ? new Date(input.cursor) : undefined;
  const createdAt = cursorDate && !Number.isNaN(cursorDate.valueOf()) ? { lt: cursorDate } : undefined;
  const activityTypeFilter =
    input.type && crmActivityTypes.has(input.type) ? (input.type as CrmActivityType) : undefined;
  const take = input.limit + 1;

  const [activities, notes, tasks, audits] = await Promise.all([
    prisma.crmActivity.findMany({
      where: {
        ...scope,
        ...(activityTypeFilter ? { type: activityTypeFilter } : {}),
        ...(createdAt ? { createdAt } : {}),
      },
      include: { actor: { select: { id: true, name: true, email: true } } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take,
    }),
    prisma.crmNote.findMany({
      where: { ...scope, ...(createdAt ? { createdAt } : {}) },
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take,
    }),
    prisma.crmTask.findMany({
      where: { ...scope, ...(createdAt ? { createdAt } : {}) },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take,
    }),
    prisma.auditLog.findMany({
      where: {
        ...(scope.organizationId ? { organizationId: scope.organizationId } : {}),
        ...(scope.leadId ? { entityType: "Lead", entityId: scope.leadId } : {}),
        ...(createdAt ? { createdAt } : {}),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take,
    }),
  ]);

  const items: TimelineItem[] = [
    ...activities.map((activity) => ({
      id: activity.id,
      kind: "activity" as const,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      actor: activity.actor,
      status: null,
      priority: null,
      createdAt: activity.createdAt,
    })),
    ...notes.map((note) => ({
      id: note.id,
      kind: "note" as const,
      type: note.type,
      title: "Notatka",
      description: note.body,
      actor: note.author,
      status: null,
      priority: null,
      createdAt: note.createdAt,
    })),
    ...tasks.map((task) => ({
      id: task.id,
      kind: "task" as const,
      type: "TASK",
      title: task.title,
      description: task.description,
      actor: task.createdBy,
      status: task.status,
      priority: task.priority,
      createdAt: task.createdAt,
    })),
    ...audits.map((audit) => ({
      id: audit.id,
      kind: "audit" as const,
      type: audit.action,
      title: auditTitle(audit.action),
      description: `${audit.entityType} ${audit.entityId}`,
      actor: audit.user,
      status: null,
      priority: null,
      createdAt: audit.createdAt,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const filtered = input.type ? items.filter((item) => item.type === input.type || item.kind === input.type) : items;
  const page = filtered.slice(0, input.limit);
  const hasMore = filtered.length > input.limit;
  return {
    items: page.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
    nextCursor: hasMore ? page.at(-1)?.createdAt.toISOString() ?? null : null,
  };
}

function auditTitle(action: string) {
  if (action.includes("status")) return "Zmiana statusu";
  if (action.includes("assigned")) return "Zmiana przypisania";
  if (action.includes("converted")) return "Konwersja leada";
  if (action.includes("organization")) return "Zmiana organizacji";
  if (action.includes("lead")) return "Zmiana leada";
  return "Zdarzenie audytu";
}
