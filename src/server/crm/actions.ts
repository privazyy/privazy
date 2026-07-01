"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { inngest } from "@/server/inngest/client";
import { writeCrmAudit } from "@/server/crm/audit";
import { assertAdminCrm, assertCanMutateCrm, requireCrmActor } from "@/server/crm/permissions";
import { getPrisma } from "@/server/db/prisma";

const entitySchema = z.object({
  entityId: z.string().min(1).max(160),
  entityType: z.string().min(2).max(80),
  organizationId: z.string().min(1).optional(),
});

const updateLeadStatusSchema = z.object({
  leadId: z.string().min(1),
  status: z.enum(["NEW", "CONTACT_REQUIRED", "CONTACTED", "QUALIFIED", "OFFER_SENT", "WON", "LOST", "ARCHIVED"]),
});

const assignLeadSchema = z.object({
  leadId: z.string().min(1),
  ownerId: z.string().min(1).nullable(),
});

const createNoteSchema = entitySchema.extend({
  body: z.string().trim().min(2).max(4000),
  isInternal: z.boolean().optional(),
});

const createTaskSchema = entitySchema.extend({
  description: z.string().trim().max(2000).optional(),
  dueAt: z.string().datetime().optional(),
  ownerId: z.string().min(1).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  title: z.string().trim().min(2).max(220),
});

const updateTaskStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "BLOCKED", "DONE", "CANCELLED"]),
  taskId: z.string().min(1),
});

const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["PENDING_PAYMENT", "PAID", "PAYMENT_FAILED", "CANCELLED", "FULFILLING", "COMPLETED", "REFUNDED"]),
});

const retryJobSchema = z.object({
  jobId: z.string().min(1),
});

const updateGeneratedDocumentStatusSchema = z.object({
  documentId: z.string().min(1),
  status: z.enum(["DRAFT", "GENERATED", "DELIVERED", "ARCHIVED"]),
});

const updateBreachStatusSchema = z.object({
  breachId: z.string().min(1),
  status: z.enum([
    "NEW",
    "TRIAGE",
    "INVESTIGATING",
    "RISK_ASSESSMENT",
    "NOTIFICATION_REQUIRED",
    "NOTIFIED_AUTHORITY",
    "NOTIFIED_DATA_SUBJECTS",
    "CLOSED",
    "ARCHIVED",
  ]),
});

const updateRequestStatusSchema = z.object({
  requestId: z.string().min(1),
  status: z.enum([
    "NEW",
    "IDENTITY_VERIFICATION",
    "IN_PROGRESS",
    "WAITING_FOR_CLIENT",
    "READY_FOR_REVIEW",
    "RESPONDED",
    "CLOSED",
    "ARCHIVED",
  ]),
});

export async function updateCrmLeadStatus(rawInput: unknown) {
  const actor = await requireCrmActor();
  assertCanMutateCrm(actor, "leads");
  const input = updateLeadStatusSchema.parse(rawInput);
  const prisma = getPrisma();

  const lead = await prisma.crmLead.update({
    data: {
      archivedAt: input.status === "ARCHIVED" ? new Date() : null,
      lostAt: input.status === "LOST" ? new Date() : null,
      status: input.status,
      wonAt: input.status === "WON" ? new Date() : null,
    },
    where: { id: input.leadId },
  });

  await writeCrmAudit({
    action: "crm.lead_status_changed",
    actor,
    entityId: lead.id,
    entityType: "CrmLead",
    metadata: { status: input.status },
    organizationId: lead.organizationId,
  });
  revalidatePath("/admin");
  return lead;
}

export async function assignCrmLead(rawInput: unknown) {
  const actor = await requireCrmActor();
  assertCanMutateCrm(actor, "leads");
  const input = assignLeadSchema.parse(rawInput);

  const lead = await getPrisma().crmLead.update({
    data: { ownerId: input.ownerId },
    where: { id: input.leadId },
  });

  await writeCrmAudit({
    action: "crm.lead_assigned",
    actor,
    entityId: lead.id,
    entityType: "CrmLead",
    metadata: { ownerId: input.ownerId },
    organizationId: lead.organizationId,
  });
  revalidatePath("/admin");
  return lead;
}

export async function createCrmNote(rawInput: unknown) {
  const actor = await requireCrmActor();
  assertCanMutateCrm(actor, "tasks");
  const input = createNoteSchema.parse(rawInput);
  const prisma = getPrisma();

  const note = await prisma.crmNote.create({
    data: {
      body: input.body,
      createdById: actor.id,
      entityId: input.entityId,
      entityType: input.entityType,
      isInternal: input.isInternal ?? true,
      organizationId: input.organizationId ?? null,
    },
  });

  await writeCrmAudit({
    action: "crm.note_created",
    actor,
    entityId: note.id,
    entityType: "CrmNote",
    metadata: { targetEntityId: input.entityId, targetEntityType: input.entityType },
    organizationId: note.organizationId,
  });
  revalidatePath("/admin");
  return note;
}

export async function createCrmTask(rawInput: unknown) {
  const actor = await requireCrmActor();
  assertCanMutateCrm(actor, "tasks");
  const input = createTaskSchema.parse(rawInput);
  const prisma = getPrisma();

  const task = await prisma.crmTask.create({
    data: {
      createdById: actor.id,
      description: input.description,
      dueAt: input.dueAt ? new Date(input.dueAt) : null,
      entityId: input.entityId,
      entityType: input.entityType,
      organizationId: input.organizationId ?? null,
      ownerId: input.ownerId ?? actor.id,
      priority: input.priority,
      title: input.title,
    },
  });

  await writeCrmAudit({
    action: "crm.task_created",
    actor,
    entityId: task.id,
    entityType: "CrmTask",
    metadata: { targetEntityId: input.entityId, targetEntityType: input.entityType },
    organizationId: task.organizationId,
  });
  revalidatePath("/admin");
  return task;
}

export async function updateCrmTaskStatus(rawInput: unknown) {
  const actor = await requireCrmActor();
  assertCanMutateCrm(actor, "tasks");
  const input = updateTaskStatusSchema.parse(rawInput);
  const completedAt = input.status === "DONE" ? new Date() : null;

  const task = await getPrisma().crmTask.update({
    data: {
      completedAt,
      status: input.status,
    },
    where: { id: input.taskId },
  });

  await writeCrmAudit({
    action: "crm.task_status_changed",
    actor,
    entityId: task.id,
    entityType: "CrmTask",
    metadata: { status: input.status },
    organizationId: task.organizationId,
  });
  revalidatePath("/admin");
  return task;
}

export async function updateOrderStatusFromCrm(rawInput: unknown) {
  const actor = await requireCrmActor();
  assertAdminCrm(actor);
  const input = updateOrderStatusSchema.parse(rawInput);
  const order = await getPrisma().order.update({
    data: { status: input.status },
    where: { id: input.orderId },
  });

  await writeCrmAudit({
    action: "crm.order_status_changed",
    actor,
    entityId: order.id,
    entityType: "Order",
    metadata: { status: input.status },
    organizationId: order.organizationId,
  });
  revalidatePath("/admin");
  return order;
}

export async function retryDocumentJobFromCrm(rawInput: unknown) {
  const actor = await requireCrmActor();
  assertCanMutateCrm(actor, "documents");
  const input = retryJobSchema.parse(rawInput);

  const job = await getPrisma().documentGenerationJob.update({
    data: {
      errorMessage: null,
      status: "PENDING",
    },
    where: { id: input.jobId },
  });

  await writeCrmAudit({
    action: "crm.document_job_retry_requested",
    actor,
    entityId: job.id,
    entityType: "DocumentGenerationJob",
    organizationId: job.organizationId,
  });

  await inngest.send({
    data: { jobId: job.id },
    name: "document/generate.requested",
  });

  revalidatePath("/admin");
  return job;
}

export async function updateGeneratedDocumentStatusFromCrm(rawInput: unknown) {
  const actor = await requireCrmActor();
  assertCanMutateCrm(actor, "documents");
  const input = updateGeneratedDocumentStatusSchema.parse(rawInput);

  const document = await getPrisma().generatedDocument.update({
    data: { status: input.status },
    where: { id: input.documentId },
  });

  await writeCrmAudit({
    action: "crm.generated_document_status_changed",
    actor,
    entityId: document.id,
    entityType: "GeneratedDocument",
    metadata: { status: input.status },
    organizationId: document.organizationId,
  });
  revalidatePath("/admin");
  return document;
}

export async function updateBreachStatusFromCrm(rawInput: unknown) {
  const actor = await requireCrmActor();
  assertCanMutateCrm(actor, "breaches");
  const input = updateBreachStatusSchema.parse(rawInput);

  const incident = await getPrisma().breachIncident.update({
    data: {
      closedAt: input.status === "CLOSED" ? new Date() : null,
      status: input.status,
    },
    where: { id: input.breachId },
  });

  await writeCrmAudit({
    action: "crm.breach_status_changed",
    actor,
    entityId: incident.id,
    entityType: "BreachIncident",
    metadata: { status: input.status },
    organizationId: incident.organizationId,
  });
  revalidatePath("/admin");
  return incident;
}

export async function updateDataSubjectRequestStatusFromCrm(rawInput: unknown) {
  const actor = await requireCrmActor();
  assertCanMutateCrm(actor, "requests");
  const input = updateRequestStatusSchema.parse(rawInput);

  const request = await getPrisma().dataSubjectRequest.update({
    data: {
      closedAt: input.status === "CLOSED" ? new Date() : null,
      respondedAt: input.status === "RESPONDED" ? new Date() : undefined,
      status: input.status,
    },
    where: { id: input.requestId },
  });

  await writeCrmAudit({
    action: "crm.data_subject_request_status_changed",
    actor,
    entityId: request.id,
    entityType: "DataSubjectRequest",
    metadata: { status: input.status },
    organizationId: request.organizationId,
  });
  revalidatePath("/admin");
  return request;
}
