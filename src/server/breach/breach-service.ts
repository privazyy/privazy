import "server-only";

import {
  Prisma,
  type DataBreachRiskLevel,
} from "@prisma/client";
import type { z } from "zod";

import { calculateBreachAuthorityDeadline } from "@/server/breach/breach-deadline";
import { BreachError } from "@/server/breach/breach-http";
import {
  assertCanRiskAssess,
  assertCanSetStatus,
  assertCanTriage,
  assertClientCanEdit,
  assertClientOrganizationAccess,
  type ClientBreachActor,
  type StaffBreachActor,
} from "@/server/breach/breach-permissions";
import type {
  breachListQuerySchema,
  breachNoteCreateSchema,
  breachRiskAssessmentSchema,
  breachStatusChangeSchema,
  createBreachIncidentSchema,
  updateBreachIncidentSchema,
} from "@/server/breach/breach-schemas";
import { breachDetailInclude, breachListInclude, serializeBreachDetail, serializeBreachListItem } from "@/server/breach/breach-serializers";
import { getPrisma } from "@/server/db/prisma";

type CreateInput = z.infer<typeof createBreachIncidentSchema>;
type UpdateInput = z.infer<typeof updateBreachIncidentSchema>;
type ListInput = z.infer<typeof breachListQuerySchema>;
type RiskInput = z.infer<typeof breachRiskAssessmentSchema>;
type StatusInput = z.infer<typeof breachStatusChangeSchema>;
type NoteInput = z.infer<typeof breachNoteCreateSchema>;

export async function listClientBreachIncidents(actor: ClientBreachActor, input: ListInput) {
  const rows = await getPrisma().dataBreachIncident.findMany({
    where: {
      organizationId: { in: actor.organizationIds },
      ...listFilters(input),
    },
    include: breachListInclude,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  return paginate(rows, input.limit, serializeBreachListItem);
}

export async function createClientBreachIncident(actor: ClientBreachActor, input: CreateInput) {
  const organizationId = actor.organizationIds[0];
  const deadlineAt = calculateBreachAuthorityDeadline(input.discoveredAt);
  const prisma = getPrisma();

  const incident = await prisma.$transaction(async (tx) => {
    const created = await tx.dataBreachIncident.create({
      data: {
        organizationId,
        reportedById: actor.id,
        title: input.title,
        description: input.description,
        occurredAt: input.occurredAt ?? undefined,
        discoveredAt: input.discoveredAt,
        authorityNotificationDeadlineAt: deadlineAt,
        affectedDataCategories: input.affectedDataCategories,
        affectedDataSubjectCategories: input.affectedDataSubjectCategories,
        approximateAffectedSubjects: input.approximateAffectedSubjects ?? undefined,
        cause: input.cause ?? undefined,
        consequences: input.consequences ?? undefined,
        measuresTaken: input.measuresTaken ?? undefined,
        measuresPlanned: input.measuresPlanned ?? undefined,
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
      },
      include: breachDetailInclude,
    });
    await writeBreachActivity(tx, created.id, actor.id, "CREATED", "Utworzono szkic zgloszenia", "PUBLIC", {
      status: created.status,
      severity: created.severity,
      deadlineAt,
    });
    await writeBreachAudit(tx, actor.id, organizationId, "breach.incident.created", created.id, {
      status: created.status,
      severity: created.severity,
      affectedDataCategoriesCount: created.affectedDataCategories.length,
      affectedDataSubjectCategoriesCount: created.affectedDataSubjectCategories.length,
    });
    return created;
  });

  return serializeBreachDetail(incident, { includeInternal: false });
}

export async function getClientBreachIncident(actor: ClientBreachActor, incidentId: string) {
  const incident = await getIncidentOrThrow(incidentId);
  assertClientOrganizationAccess(actor, incident.organizationId);
  return serializeBreachDetail(incident, { includeInternal: false });
}

export async function updateClientBreachDraft(actor: ClientBreachActor, incidentId: string, input: UpdateInput) {
  const prisma = getPrisma();
  const existing = await prisma.dataBreachIncident.findUnique({
    where: { id: incidentId },
    select: { id: true, organizationId: true, status: true },
  });
  if (!existing) throw new BreachError(404, "NOT_FOUND", "Nie znaleziono naruszenia.");
  assertClientOrganizationAccess(actor, existing.organizationId);
  assertClientCanEdit(existing.status);

  const incident = await prisma.$transaction(async (tx) => {
    const updated = await tx.dataBreachIncident.update({
      where: { id: incidentId },
      data: {
        ...normalizeIncidentInput(input),
        ...(input.discoveredAt ? { authorityNotificationDeadlineAt: calculateBreachAuthorityDeadline(input.discoveredAt) } : {}),
      },
      include: breachDetailInclude,
    });
    await writeBreachActivity(tx, incidentId, actor.id, "UPDATED", "Klient zaktualizowal zgloszenie", "PUBLIC", {
      changedFields: Object.keys(input),
    });
    await writeBreachAudit(tx, actor.id, updated.organizationId, "breach.incident.updated_by_client", incidentId, {
      changedFields: safeChangedFields(input),
    });
    return updated;
  });
  return serializeBreachDetail(incident, { includeInternal: false });
}

export async function submitClientBreachIncident(actor: ClientBreachActor, incidentId: string) {
  const prisma = getPrisma();
  const existing = await prisma.dataBreachIncident.findUnique({
    where: { id: incidentId },
    select: { id: true, organizationId: true, status: true, assignedToId: true, title: true },
  });
  if (!existing) throw new BreachError(404, "NOT_FOUND", "Nie znaleziono naruszenia.");
  assertClientOrganizationAccess(actor, existing.organizationId);
  assertClientCanEdit(existing.status);

  const incident = await prisma.$transaction(async (tx) => {
    const updated = await tx.dataBreachIncident.update({
      where: { id: incidentId },
      data: { status: "REPORTED", reportedAt: new Date() },
      include: breachDetailInclude,
    });
    await writeBreachActivity(tx, incidentId, actor.id, "SUBMITTED", "Klient wyslal zgloszenie do obslugi", "PUBLIC", {
      status: "REPORTED",
    });
    await tx.crmTask.create({
      data: {
        organizationId: existing.organizationId,
        breachIncidentId: incidentId,
        title: `Triage naruszenia: ${existing.title}`,
        description: "Zweryfikuj zgloszenie i rozpocznij ocene 72h.",
        priority: "URGENT",
        createdById: actor.id,
        assignedToId: existing.assignedToId,
        dueAt: updated.authorityNotificationDeadlineAt,
      },
    });
    await writeBreachActivity(tx, incidentId, actor.id, "TASK_CREATED", "Utworzono zadanie triage", "INTERNAL", {
      dueAt: updated.authorityNotificationDeadlineAt,
    });
    await writeBreachAudit(tx, actor.id, updated.organizationId, "breach.incident.submitted", incidentId, {
      status: "REPORTED",
      deadlineAt: updated.authorityNotificationDeadlineAt,
    });
    return updated;
  });
  return serializeBreachDetail(incident, { includeInternal: false });
}

export async function listCrmBreachIncidents(_actor: StaffBreachActor, input: ListInput) {
  const rows = await getPrisma().dataBreachIncident.findMany({
    where: listFilters(input),
    include: breachListInclude,
    orderBy: [{ authorityNotificationDeadlineAt: "asc" }, { updatedAt: "desc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  return paginate(rows, input.limit, serializeBreachListItem);
}

export async function getCrmBreachIncident(_actor: StaffBreachActor, incidentId: string) {
  return serializeBreachDetail(await getIncidentOrThrow(incidentId), { includeInternal: true });
}

export async function updateCrmBreachIncident(actor: StaffBreachActor, incidentId: string, input: UpdateInput) {
  assertCanTriage(actor);
  if (input.assignedToId) await assertAssignableUser(input.assignedToId);
  const existing = await getPrisma().dataBreachIncident.findUnique({ where: { id: incidentId }, select: { organizationId: true } });
  if (!existing) throw new BreachError(404, "NOT_FOUND", "Nie znaleziono naruszenia.");

  const incident = await getPrisma().$transaction(async (tx) => {
    const updated = await tx.dataBreachIncident.update({
      where: { id: incidentId },
      data: {
        ...normalizeIncidentInput(input),
        ...(input.discoveredAt ? { authorityNotificationDeadlineAt: calculateBreachAuthorityDeadline(input.discoveredAt) } : {}),
      },
      include: breachDetailInclude,
    });
    await writeBreachActivity(tx, incidentId, actor.id, "UPDATED", "Staff zaktualizowal incydent", "INTERNAL", {
      changedFields: safeChangedFields(input),
    });
    await writeBreachAudit(tx, actor.id, updated.organizationId, "breach.incident.updated_by_staff", incidentId, {
      changedFields: safeChangedFields(input),
    });
    return updated;
  });
  return serializeBreachDetail(incident, { includeInternal: true });
}

export async function changeCrmBreachStatus(actor: StaffBreachActor, incidentId: string, input: StatusInput) {
  assertCanSetStatus(actor, input.status);
  const existing = await getPrisma().dataBreachIncident.findUnique({
    where: { id: incidentId },
    select: { status: true, organizationId: true },
  });
  if (!existing) throw new BreachError(404, "NOT_FOUND", "Nie znaleziono naruszenia.");

  const incident = await getPrisma().$transaction(async (tx) => {
    const updated = await tx.dataBreachIncident.update({
      where: { id: incidentId },
      data: {
        status: input.status,
        ...(input.status === "CLOSED" || input.status === "CANCELLED" ? { closedAt: new Date() } : {}),
      },
      include: breachDetailInclude,
    });
    await writeBreachActivity(
      tx,
      incidentId,
      actor.id,
      input.status === "CLOSED" ? "CLOSED" : "STATUS_CHANGED",
      `Zmieniono status: ${existing.status} -> ${input.status}`,
      "PUBLIC",
      { beforeStatus: existing.status, afterStatus: input.status, hasRationale: Boolean(input.rationale) },
    );
    await writeBreachAudit(tx, actor.id, updated.organizationId, "breach.incident.status_changed", incidentId, {
      beforeStatus: existing.status,
      afterStatus: input.status,
      hasRationale: Boolean(input.rationale),
    });
    return updated;
  });
  return serializeBreachDetail(incident, { includeInternal: true });
}

export async function updateCrmBreachRiskAssessment(actor: StaffBreachActor, incidentId: string, input: RiskInput) {
  assertCanRiskAssess(actor);
  const suggestedRiskLevel = suggestRiskLevel(input);

  const incident = await getPrisma().$transaction(async (tx) => {
    const updated = await tx.dataBreachIncident.update({
      where: { id: incidentId },
      data: {
        ...input,
        suggestedRiskLevel,
        status: input.authorityNotificationRequired ? "NOTIFICATION_REQUIRED" : "NOTIFICATION_NOT_REQUIRED",
      },
      include: breachDetailInclude,
    });
    await writeBreachActivity(tx, incidentId, actor.id, "RISK_ASSESSMENT_UPDATED", "Zaktualizowano ocene ryzyka", "INTERNAL", {
      severity: input.severity,
      riskLevel: input.riskLevel,
      suggestedRiskLevel,
    });
    await writeBreachActivity(tx, incidentId, actor.id, "NOTIFICATION_DECISION_CHANGED", "Zapisano decyzje notyfikacyjna", "INTERNAL", {
      authorityNotificationRequired: input.authorityNotificationRequired,
      dataSubjectsNotificationRequired: input.dataSubjectsNotificationRequired,
      hasRationale: Boolean(input.decisionRationale),
    });
    await writeBreachAudit(tx, actor.id, updated.organizationId, "breach.incident.risk_assessment_updated", incidentId, {
      severity: input.severity,
      riskLevel: input.riskLevel,
      suggestedRiskLevel,
      authorityNotificationRequired: input.authorityNotificationRequired,
      dataSubjectsNotificationRequired: input.dataSubjectsNotificationRequired,
      hasDecisionRationale: Boolean(input.decisionRationale),
    });
    return updated;
  });
  return serializeBreachDetail(incident, { includeInternal: true });
}

export async function addCrmBreachNote(actor: StaffBreachActor, incidentId: string, input: NoteInput) {
  assertCanTriage(actor);
  const existing = await getPrisma().dataBreachIncident.findUnique({ where: { id: incidentId }, select: { organizationId: true } });
  if (!existing) throw new BreachError(404, "NOT_FOUND", "Nie znaleziono naruszenia.");

  const activity = await getPrisma().$transaction(async (tx) => {
    const created = await writeBreachActivity(tx, incidentId, actor.id, "NOTE_ADDED", "Dodano notatke", input.visibility, {
      visibility: input.visibility,
    }, input.body);
    await writeBreachAudit(tx, actor.id, existing.organizationId, "breach.incident.note_added", incidentId, {
      visibility: input.visibility,
      hasBody: Boolean(input.body),
    });
    return created;
  });
  return activity;
}

export async function getCrmBreachTimeline(_actor: StaffBreachActor, incidentId: string) {
  const incident = await getIncidentOrThrow(incidentId);
  return serializeBreachDetail(incident, { includeInternal: true }).timeline;
}

async function getIncidentOrThrow(incidentId: string) {
  const incident = await getPrisma().dataBreachIncident.findUnique({
    where: { id: incidentId },
    include: breachDetailInclude,
  });
  if (!incident) throw new BreachError(404, "NOT_FOUND", "Nie znaleziono naruszenia.");
  return incident;
}

function listFilters(input: ListInput): Prisma.DataBreachIncidentWhereInput {
  return {
    ...(input.status ? { status: input.status } : {}),
    ...(input.riskLevel ? { riskLevel: input.riskLevel } : {}),
    ...(input.severity ? { severity: input.severity } : {}),
    ...(input.assignedToId ? { assignedToId: input.assignedToId } : {}),
    ...(input.q
      ? {
          OR: [
            { title: { contains: input.q, mode: "insensitive" } },
            { organization: { name: { contains: input.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
}

function normalizeIncidentInput(input: Partial<CreateInput & UpdateInput>): Prisma.DataBreachIncidentUncheckedUpdateInput {
  return {
    title: input.title,
    description: input.description,
    occurredAt: input.occurredAt ?? undefined,
    discoveredAt: input.discoveredAt,
    affectedDataCategories: input.affectedDataCategories,
    affectedDataSubjectCategories: input.affectedDataSubjectCategories,
    approximateAffectedSubjects: input.approximateAffectedSubjects ?? undefined,
    cause: input.cause ?? undefined,
    consequences: input.consequences ?? undefined,
    measuresTaken: input.measuresTaken ?? undefined,
    measuresPlanned: input.measuresPlanned ?? undefined,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    assignedToId: input.assignedToId,
    severity: input.severity,
  };
}

function safeChangedFields(input: Record<string, unknown>) {
  return Object.keys(input).filter((field) => !["description", "cause", "consequences", "measuresTaken", "measuresPlanned"].includes(field));
}

function suggestRiskLevel(input: RiskInput): DataBreachRiskLevel {
  if (input.encryptedData && input.accessRecovered && input.mitigationMeasuresApplied && !input.specialCategoryData && !input.childrenData) {
    return "LOW";
  }
  if (input.specialCategoryData || input.childrenData || input.largeScale || input.identityTheftRisk) {
    return "HIGH";
  }
  return "MEDIUM";
}

async function assertAssignableUser(id?: string | null) {
  if (!id) return;
  const user = await getPrisma().user.findUnique({ where: { id }, select: { role: true } });
  if (!user || !["ADMIN", "LAWYER", "OPERATOR"].includes(user.role)) {
    throw new BreachError(400, "INVALID_ASSIGNEE", "Opiekun musi miec aktywna role operacyjna.");
  }
}

async function writeBreachActivity(
  tx: Prisma.TransactionClient,
  incidentId: string,
  actorId: string | null,
  type: Prisma.DataBreachActivityCreateInput["type"],
  title: string,
  visibility: Prisma.DataBreachActivityCreateInput["visibility"],
  metadata: Record<string, unknown>,
  body?: string,
) {
  return tx.dataBreachActivity.create({
    data: {
      incidentId,
      actorId,
      type,
      title,
      body,
      visibility,
      metadata: toJson(metadata),
    },
  });
}

async function writeBreachAudit(
  tx: Prisma.TransactionClient,
  actorId: string,
  organizationId: string,
  action: string,
  incidentId: string,
  metadata: Record<string, unknown>,
) {
  await tx.auditLog.create({
    data: {
      userId: actorId,
      organizationId,
      action,
      entityType: "DataBreachIncident",
      entityId: incidentId,
      metadata: toJson(metadata),
    },
  });
}

function paginate<T extends { id: string }, R>(rows: T[], limit: number, serialize: (row: T) => R) {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  return {
    items: items.map(serialize),
    nextCursor: hasMore ? items.at(-1)?.id ?? null : null,
  };
}

function toJson(value: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject;
}
