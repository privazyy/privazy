import "server-only";

import {
  Prisma,
  type DataSubjectRequestStatus,
  type DataSubjectRequestVerificationStatus,
} from "@prisma/client";
import type { z } from "zod";

import type { CrmActor } from "@/server/crm/access";
import { assertCanPrepareDsrResponse, type PortalDsrActor } from "@/server/dsr/access";
import { calculateDsrDeadline } from "@/server/dsr/deadline";
import { DsrServiceError } from "@/server/dsr/http";
import type {
  crmDsrIdentitySchema,
  crmDsrNoteSchema,
  crmDsrPrepareResponseSchema,
  crmDsrStatusSchema,
  crmDsrUpdateSchema,
  dsrListQuerySchema,
  portalDsrCreateSchema,
  portalDsrDraftUpdateSchema,
} from "@/server/dsr/schemas";
import { dsrDetailInclude, serializeDsrDetail, serializeDsrListItem } from "@/server/dsr/serializers";
import { getPrisma } from "@/server/db/prisma";

type PortalDsrCreateInput = z.infer<typeof portalDsrCreateSchema>;
type PortalDsrDraftUpdateInput = z.infer<typeof portalDsrDraftUpdateSchema>;
type DsrListInput = z.infer<typeof dsrListQuerySchema>;
type CrmDsrUpdateInput = z.infer<typeof crmDsrUpdateSchema>;
type CrmDsrStatusInput = z.infer<typeof crmDsrStatusSchema>;
type CrmDsrIdentityInput = z.infer<typeof crmDsrIdentitySchema>;
type CrmDsrPrepareResponseInput = z.infer<typeof crmDsrPrepareResponseSchema>;
type CrmDsrNoteInput = z.infer<typeof crmDsrNoteSchema>;

const editablePortalStatuses = new Set<DataSubjectRequestStatus>(["DRAFT"]);
const closedStatuses = new Set<DataSubjectRequestStatus>(["RESPONDED", "REJECTED", "CLOSED", "CANCELLED"]);

export async function listPortalDsrRequests(actor: PortalDsrActor, input: DsrListInput) {
  return listDsrRequests({ ...input, organizationId: actor.organizationId }, "portal");
}

export async function createPortalDsrRequest(input: PortalDsrCreateInput, actor: PortalDsrActor) {
  const prisma = getPrisma();
  const request = await prisma.$transaction(async (tx) => {
    const created = await tx.dataSubjectRequest.create({
      data: {
        organizationId: actor.organizationId,
        reportedById: actor.id,
        requesterName: input.requesterName,
        requesterEmail: input.requesterEmail,
        requesterPhone: input.requesterPhone,
        relationship: input.relationship,
        type: input.type,
        priority: input.priority,
        requestDescription: input.requestDescription,
        additionalInformation: input.additionalInformation,
      },
      include: dsrDetailInclude,
    });
    await addActivity(tx, created.id, actor.id, "CREATED", "PUBLIC", "Utworzono szkic wniosku DSR.", undefined, {
      type: created.type,
      status: created.status,
    });
    await writeAudit(tx, actor.id, actor.organizationId, "dsr.request.created", created.id, {
      type: created.type,
      status: created.status,
      source: "portal",
    });
    return created;
  });

  return serializeDsrDetail(request, "portal");
}

export async function getPortalDsrRequest(id: string, actor: PortalDsrActor) {
  const request = await getDsrForOrganization(id, actor.organizationId);
  return serializeDsrDetail(request, "portal");
}

export async function updatePortalDsrDraft(id: string, input: PortalDsrDraftUpdateInput, actor: PortalDsrActor) {
  const existing = await getDsrForOrganization(id, actor.organizationId);
  if (!editablePortalStatuses.has(existing.status)) {
    throw new DsrServiceError(409, "NOT_EDITABLE", "Wniosek po wyslaniu nie moze byc edytowany przez portal.");
  }

  const prisma = getPrisma();
  const request = await prisma.$transaction(async (tx) => {
    const updated = await tx.dataSubjectRequest.update({
      where: { id },
      data: input,
      include: dsrDetailInclude,
    });
    await addActivity(tx, id, actor.id, "UPDATED", "PUBLIC", "Zaktualizowano szkic wniosku.", undefined, {
      changedFields: safeChangedFields(input),
    });
    await writeAudit(tx, actor.id, actor.organizationId, "dsr.request.updated_by_client", id, {
      changedFields: safeChangedFields(input),
    });
    return updated;
  });

  return serializeDsrDetail(request, "portal");
}

export async function submitPortalDsrRequest(id: string, actor: PortalDsrActor) {
  const existing = await getDsrForOrganization(id, actor.organizationId);
  if (existing.status !== "DRAFT") {
    throw new DsrServiceError(409, "ALREADY_SUBMITTED", "Ten wniosek zostal juz wyslany.");
  }

  const now = new Date();
  const dueAt = calculateDsrDeadline(now);
  const prisma = getPrisma();
  const request = await prisma.$transaction(async (tx) => {
    const updated = await tx.dataSubjectRequest.update({
      where: { id },
      data: {
        receivedAt: now,
        dueAt,
        status: "RECEIVED",
        verificationStatus: "PENDING",
      },
      include: dsrDetailInclude,
    });
    const task = await tx.crmTask.create({
      data: {
        organizationId: actor.organizationId,
        dataSubjectRequestId: id,
        title: "Triage wniosku osoby, ktorej dane dotycza",
        description: "Zweryfikuj zakres wniosku, tozsamosc oraz wlasciciela odpowiedzi.",
        priority: mapDsrPriorityToLeadPriority(updated.priority),
        dueAt,
        createdById: actor.id,
      },
    });
    await addActivity(tx, id, actor.id, "SUBMITTED", "PUBLIC", "Wniosek zostal wyslany do obslugi.", undefined, {
      status: updated.status,
      dueAt,
    });
    await addActivity(tx, id, actor.id, "TASK_CREATED", "INTERNAL", "Utworzono zadanie triage DSR.", undefined, {
      taskId: task.id,
      dueAt,
    });
    await writeAudit(tx, actor.id, actor.organizationId, "dsr.request.submitted", id, {
      status: updated.status,
      dueAt,
      taskId: task.id,
    });
    return updated;
  });

  return serializeDsrDetail(request, "portal");
}

export async function listCrmDsrRequests(input: DsrListInput) {
  return listDsrRequests(input, "crm");
}

export async function getCrmDsrRequest(id: string) {
  const request = await getDsr(id);
  return serializeDsrDetail(request, "crm");
}

export async function updateCrmDsrRequest(id: string, input: CrmDsrUpdateInput, actor: CrmActor) {
  const existing = await getDsr(id);
  if (closedStatuses.has(existing.status)) {
    throw new DsrServiceError(409, "CLOSED", "Zamkniety wniosek wymaga osobnej decyzji przed dalsza edycja.");
  }
  await assertAssignableUser(input.assignedToId ?? undefined);

  const extensionUntil = input.extensionUntil ?? undefined;
  const dueAt = extensionUntil ? calculateDsrDeadline(existing.receivedAt ?? existing.createdAt, extensionUntil) : undefined;
  const data = {
    assignedToId: input.assignedToId,
    priority: input.priority,
    additionalInformation: input.additionalInformation,
    extensionUntil: input.extensionUntil,
    extensionReason: input.extensionReason,
    ...(dueAt ? { dueAt } : {}),
  };

  const prisma = getPrisma();
  const request = await prisma.$transaction(async (tx) => {
    const updated = await tx.dataSubjectRequest.update({ where: { id }, data, include: dsrDetailInclude });
    await addActivity(tx, id, actor.id, "UPDATED", "INTERNAL", "Zaktualizowano dane operacyjne DSR.", undefined, {
      changedFields: safeChangedFields(input),
    });
    await writeAudit(tx, actor.id, updated.organizationId, "dsr.request.updated_by_staff", id, {
      changedFields: safeChangedFields(input),
      dueAt,
    });
    return updated;
  });

  return serializeDsrDetail(request, "crm");
}

export async function changeCrmDsrStatus(id: string, input: CrmDsrStatusInput, actor: CrmActor) {
  const existing = await getDsr(id);
  const now = new Date();
  const data: Prisma.DataSubjectRequestUpdateInput = {
    status: input.status,
    ...(input.status === "CLOSED" || input.status === "CANCELLED" || input.status === "REJECTED" ? { closedAt: now } : {}),
    ...(input.status === "RESPONDED" ? { responseSentAt: now, closedAt: now } : {}),
  };

  const prisma = getPrisma();
  const request = await prisma.$transaction(async (tx) => {
    const updated = await tx.dataSubjectRequest.update({ where: { id }, data, include: dsrDetailInclude });
    await addActivity(tx, id, actor.id, "STATUS_CHANGED", "PUBLIC", `Zmieniono status z ${existing.status} na ${updated.status}.`, input.note, {
      beforeStatus: existing.status,
      afterStatus: updated.status,
    });
    await writeAudit(tx, actor.id, updated.organizationId, "dsr.request.status_changed", id, {
      beforeStatus: existing.status,
      afterStatus: updated.status,
      hasNote: Boolean(input.note),
    });
    return updated;
  });

  return serializeDsrDetail(request, "crm");
}

export async function updateCrmDsrIdentity(id: string, input: CrmDsrIdentityInput, actor: CrmActor) {
  const existing = await getDsr(id);
  const verifiedAt = input.verificationStatus === "VERIFIED" || input.verificationStatus === "NOT_REQUIRED" ? new Date() : null;
  const nextStatus = nextStatusAfterVerification(existing.status, input.verificationStatus);

  const prisma = getPrisma();
  const request = await prisma.$transaction(async (tx) => {
    const updated = await tx.dataSubjectRequest.update({
      where: { id },
      data: {
        verificationStatus: input.verificationStatus,
        verificationMethod: input.verificationMethod,
        verificationNote: input.verificationNote,
        verifiedAt,
        ...(nextStatus ? { status: nextStatus } : {}),
      },
      include: dsrDetailInclude,
    });
    await addActivity(tx, id, actor.id, "IDENTITY_VERIFICATION_UPDATED", "PUBLIC", "Zaktualizowano status weryfikacji tozsamosci.", undefined, {
      verificationStatus: input.verificationStatus,
      hasMethod: Boolean(input.verificationMethod),
      hasInternalNote: Boolean(input.verificationNote),
    });
    await writeAudit(tx, actor.id, updated.organizationId, "dsr.request.identity_verification_updated", id, {
      verificationStatus: input.verificationStatus,
      hasMethod: Boolean(input.verificationMethod),
      hasInternalNote: Boolean(input.verificationNote),
    });
    return updated;
  });

  return serializeDsrDetail(request, "crm");
}

export async function prepareCrmDsrResponse(id: string, input: CrmDsrPrepareResponseInput, actor: CrmActor) {
  assertCanPrepareDsrResponse(actor);
  const existing = await getDsr(id);
  if (existing.verificationStatus !== "VERIFIED" && existing.verificationStatus !== "NOT_REQUIRED") {
    throw new DsrServiceError(409, "IDENTITY_NOT_VERIFIED", "Najpierw zakoncz weryfikacje tozsamosci.");
  }

  const prisma = getPrisma();
  const request = await prisma.$transaction(async (tx) => {
    const updated = await tx.dataSubjectRequest.update({
      where: { id },
      data: {
        responseSummary: input.responseSummary,
        responseDraft: input.responseDraft,
        responseDecision: input.responseDecision,
        decisionRationale: input.decisionRationale,
        responsePreparedAt: new Date(),
        status: "RESPONSE_PREPARED",
      },
      include: dsrDetailInclude,
    });
    await addActivity(tx, id, actor.id, "RESPONSE_PREPARED", "INTERNAL", "Przygotowano projekt odpowiedzi DSR.", undefined, {
      responseDecision: input.responseDecision,
      hasSummary: Boolean(input.responseSummary),
      hasDraft: Boolean(input.responseDraft),
      hasRationale: Boolean(input.decisionRationale),
    });
    await writeAudit(tx, actor.id, updated.organizationId, "dsr.request.response_prepared", id, {
      responseDecision: input.responseDecision,
      hasSummary: Boolean(input.responseSummary),
      hasDraft: Boolean(input.responseDraft),
      hasRationale: Boolean(input.decisionRationale),
    });
    return updated;
  });

  return serializeDsrDetail(request, "crm");
}

export async function addCrmDsrNote(id: string, input: CrmDsrNoteInput, actor: CrmActor) {
  const existing = await getDsr(id);
  const prisma = getPrisma();
  const request = await prisma.$transaction(async (tx) => {
    await addActivity(tx, id, actor.id, "NOTE_ADDED", input.visibility, "Dodano notatke do wniosku DSR.", input.note, {
      visibility: input.visibility,
      hasNote: true,
    });
    await writeAudit(tx, actor.id, existing.organizationId, "dsr.request.note_added", id, {
      visibility: input.visibility,
      hasNote: true,
    });
    return tx.dataSubjectRequest.findUniqueOrThrow({ where: { id }, include: dsrDetailInclude });
  });

  return serializeDsrDetail(request, "crm");
}

export async function getCrmDsrTimeline(id: string) {
  const request = await getDsr(id);
  return {
    requestId: request.id,
    items: serializeDsrDetail(request, "crm").activities,
  };
}

async function listDsrRequests(input: DsrListInput, scope: "crm" | "portal") {
  const prisma = getPrisma();
  const where: Prisma.DataSubjectRequestWhereInput = {
    ...(input.organizationId ? { organizationId: input.organizationId } : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.type ? { type: input.type } : {}),
    ...(input.assignedToId ? { assignedToId: input.assignedToId } : {}),
    ...(input.q
      ? {
          OR: [
            { requesterName: { contains: input.q, mode: "insensitive" } },
            { requesterEmail: { contains: input.q, mode: "insensitive" } },
            { organization: { name: { contains: input.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
  const rows = await prisma.dataSubjectRequest.findMany({
    where,
    include: dsrDetailInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  const hasMore = rows.length > input.limit;
  const items = hasMore ? rows.slice(0, input.limit) : rows;

  return {
    items: items.map((request) => (scope === "crm" ? serializeDsrListItem(request) : serializeDsrDetail(request, "portal"))),
    nextCursor: hasMore ? items.at(-1)?.id ?? null : null,
  };
}

async function getDsr(id: string) {
  const request = await getPrisma().dataSubjectRequest.findUnique({ where: { id }, include: dsrDetailInclude });
  if (!request) throw new DsrServiceError(404, "NOT_FOUND", "Nie znaleziono wniosku DSR.");
  return request;
}

async function getDsrForOrganization(id: string, organizationId: string) {
  const request = await getPrisma().dataSubjectRequest.findFirst({
    where: { id, organizationId },
    include: dsrDetailInclude,
  });
  if (!request) throw new DsrServiceError(404, "NOT_FOUND", "Nie znaleziono wniosku DSR.");
  return request;
}

async function assertAssignableUser(id?: string | null) {
  if (!id) return;
  const user = await getPrisma().user.findUnique({ where: { id }, select: { role: true } });
  if (!user || !["ADMIN", "LAWYER", "OPERATOR"].includes(user.role)) {
    throw new DsrServiceError(400, "INVALID_ASSIGNEE", "Opiekun musi miec role operacyjna.");
  }
}

function nextStatusAfterVerification(status: DataSubjectRequestStatus, verificationStatus: DataSubjectRequestVerificationStatus) {
  if (verificationStatus === "PENDING" && status === "RECEIVED") return "IDENTITY_VERIFICATION" as const;
  if ((verificationStatus === "VERIFIED" || verificationStatus === "NOT_REQUIRED") && (status === "RECEIVED" || status === "IDENTITY_VERIFICATION")) {
    return "IN_PROGRESS" as const;
  }
  return undefined;
}

async function addActivity(
  tx: Prisma.TransactionClient,
  requestId: string,
  actorId: string | null,
  type: Prisma.DataSubjectRequestActivityCreateInput["type"],
  visibility: Prisma.DataSubjectRequestActivityCreateInput["visibility"],
  title: string,
  note?: string,
  metadata?: Record<string, unknown>,
) {
  await tx.dataSubjectRequestActivity.create({
    data: {
      requestId,
      actorId,
      type,
      visibility,
      title,
      note,
      metadata: metadata ? toJson(metadata) : undefined,
    },
  });
}

async function writeAudit(
  tx: Prisma.TransactionClient,
  userId: string | null,
  organizationId: string,
  action: string,
  entityId: string,
  metadata: Record<string, unknown>,
) {
  await tx.auditLog.create({
    data: {
      userId,
      organizationId,
      action,
      entityType: "DataSubjectRequest",
      entityId,
      metadata: toJson(metadata),
    },
  });
}

function safeChangedFields(input: Record<string, unknown>) {
  const sensitive = new Set(["requestDescription", "responseDraft", "responseSummary", "decisionRationale", "verificationNote", "note"]);
  return Object.keys(input).filter((key) => !sensitive.has(key));
}

function mapDsrPriorityToLeadPriority(priority: "LOW" | "NORMAL" | "HIGH" | "URGENT") {
  return priority;
}

function toJson(value: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject;
}
