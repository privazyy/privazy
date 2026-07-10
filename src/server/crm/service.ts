import "server-only";

import {
  Prisma,
  type LeadPriority,
  type LeadStatus,
  type Organization,
  type OrganizationStatus,
} from "@prisma/client";
import type { z } from "zod";

import { assertCrmWriteActor, type CrmActor } from "@/server/crm/access";
import { createCrmActivity } from "@/server/crm/activity";
import { CrmServiceError } from "@/server/crm/errors";
import { paginatedResult } from "@/server/crm/pagination";
import type {
  contactListQuerySchema,
  contactCreateSchema,
  contactUpdateSchema,
  crmTaskAssignSchema,
  crmActivityListQuerySchema,
  crmNoteCreateSchema,
  crmTaskCreateSchema,
  crmTaskListQuerySchema,
  crmTaskStatusChangeSchema,
  crmTaskUpdateSchema,
  leadConvertSchema,
  leadCreateSchema,
  leadListQuerySchema,
  organizationCreateSchema,
  organizationListQuerySchema,
} from "@/server/crm/schemas";
import {
  serializeCrmNote,
  serializeAuditActivity,
  serializeContactPerson,
  serializeCrmTaskListItem,
  serializeLeadDetail,
  serializeLeadListItem,
  serializeOrganizationDetail,
  serializeOrganizationListItem,
} from "@/server/crm/serializers";
import { getPrisma } from "@/server/db/prisma";

type LeadCreateInput = z.infer<typeof leadCreateSchema>;
type LeadUpdateInput = {
  status?: LeadStatus;
  priority?: LeadPriority;
  companyName?: string;
  fullName?: string;
  email?: string;
  phone?: string | null;
  nip?: string | null;
  industry?: string | null;
  companySize?: string | null;
  estimatedValue?: number | null;
  consentMarketing?: boolean;
  consentPrivacy?: boolean;
  consentContact?: boolean;
  assignedToId?: string | null;
};
type LeadConvertInput = z.infer<typeof leadConvertSchema>;
type LeadListInput = z.infer<typeof leadListQuerySchema>;
type OrganizationCreateInput = z.infer<typeof organizationCreateSchema>;
type OrganizationUpdateInput = {
  name?: string;
  legalName?: string;
  nip?: string;
  regon?: string;
  website?: string;
  email?: string | null;
  phone?: string;
  industry?: string;
  size?: string;
  status?: OrganizationStatus;
  ownerId?: string | null;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
};
type OrganizationListInput = z.infer<typeof organizationListQuerySchema>;
type CrmNoteCreateInput = z.infer<typeof crmNoteCreateSchema>;
type ContactCreateInput = z.infer<typeof contactCreateSchema>;
type ContactUpdateInput = z.infer<typeof contactUpdateSchema>;
type ContactListInput = z.infer<typeof contactListQuerySchema>;
type CrmTaskCreateInput = z.infer<typeof crmTaskCreateSchema>;
type CrmTaskUpdateInput = z.infer<typeof crmTaskUpdateSchema>;
type CrmTaskStatusChangeInput = z.infer<typeof crmTaskStatusChangeSchema>;
type CrmTaskAssignInput = z.infer<typeof crmTaskAssignSchema>;
type CrmTaskListInput = z.infer<typeof crmTaskListQuerySchema>;
type CrmActivityListInput = z.infer<typeof crmActivityListQuerySchema>;

const leadSummaryInclude = {
  assignedTo: { select: { id: true, name: true, email: true } },
  organization: { select: { id: true, name: true, status: true } },
} satisfies Prisma.LeadInclude;

const leadDetailInclude = {
  ...leadSummaryInclude,
  contactPersons: { orderBy: [{ isPrimary: "desc" as const }, { createdAt: "asc" as const }] },
  notes: {
    orderBy: { createdAt: "desc" as const },
    include: { author: { select: { id: true, name: true, email: true } } },
  },
  tasks: {
    orderBy: [{ status: "asc" as const }, { dueAt: "asc" as const }],
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  },
  formSubmission: { select: { id: true, formType: true, status: true, createdAt: true } },
} satisfies Prisma.LeadInclude;

const organizationSummaryInclude = {
  owner: { select: { id: true, name: true, email: true } },
  _count: { select: { leads: true, contactPersons: true, crmNotes: true, crmTasks: true } },
} satisfies Prisma.OrganizationInclude;

const organizationDetailInclude = {
  ...organizationSummaryInclude,
  contactPersons: { orderBy: [{ isPrimary: "desc" as const }, { createdAt: "asc" as const }] },
  leads: {
    orderBy: { createdAt: "desc" as const },
    include: { assignedTo: { select: { id: true, name: true, email: true } } },
  },
  crmNotes: {
    orderBy: { createdAt: "desc" as const },
    include: { author: { select: { id: true, name: true, email: true } } },
  },
  crmTasks: {
    orderBy: [{ status: "asc" as const }, { dueAt: "asc" as const }],
    include: { assignedTo: { select: { id: true, name: true, email: true } } },
  },
} satisfies Prisma.OrganizationInclude;

const taskInclude = {
  assignedTo: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  lead: { select: { id: true, companyName: true, fullName: true } },
  organization: { select: { id: true, name: true } },
} satisfies Prisma.CrmTaskInclude;

const auditActivityInclude = {
  organization: { select: { id: true, name: true } },
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.AuditLogInclude;

export async function listLeads(input: LeadListInput) {
  const prisma = getPrisma();
  const where: Prisma.LeadWhereInput = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.priority ? { priority: input.priority } : {}),
    ...(input.source ? { source: input.source } : {}),
    ...(input.assignedToId ? { assignedToId: input.assignedToId } : {}),
    ...(input.q
      ? {
          OR: [
            { companyName: { contains: input.q, mode: "insensitive" } },
            { fullName: { contains: input.q, mode: "insensitive" } },
            { email: { contains: input.q, mode: "insensitive" } },
            { nip: { contains: input.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const rows = await prisma.lead.findMany({
    where,
    include: leadSummaryInclude,
    orderBy: leadOrderBy(input.sort),
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  return paginatedResult(rows, input.limit, serializeLeadListItem);
}

export async function getLead(id: string) {
  const lead = await getPrisma().lead.findUnique({ where: { id }, include: leadDetailInclude });
  if (!lead) throw new CrmServiceError(404, "NOT_FOUND", "Nie znaleziono leada.");
  return serializeLeadDetail(lead);
}

export async function createLead(input: LeadCreateInput, actor: CrmActor) {
  assertCrmWriteActor(actor);
  const prisma = getPrisma();
  await assertAssignableUser(input.assignedToId);

  const lead = await prisma.$transaction(async (tx) => {
    const created = await tx.lead.create({
      data: {
        ...input,
        sourceDetails: input.sourceDetails ? toJson(input.sourceDetails) : undefined,
      },
      include: leadSummaryInclude,
    });
    await writeAudit(tx, actor, "crm.lead.created", "Lead", created.id, {
      source: created.source,
      status: created.status,
    });
    return created;
  });
  return serializeLeadListItem(lead);
}

export async function updateLead(id: string, input: LeadUpdateInput, actor: CrmActor) {
  assertCrmWriteActor(actor);
  const prisma = getPrisma();
  const existing = await prisma.lead.findUnique({
    where: { id },
    select: { id: true, status: true, assignedToId: true },
  });
  if (!existing) throw new CrmServiceError(404, "NOT_FOUND", "Nie znaleziono leada.");
  if (input.status === "CONVERTED" && existing.status !== "CONVERTED") {
    throw new CrmServiceError(400, "USE_CONVERSION_ENDPOINT", "Użyj bezpiecznej operacji konwersji leada.");
  }
  await assertAssignableUser(input.assignedToId ?? undefined);

  const lead = await prisma.$transaction(async (tx) => {
    const updated = await tx.lead.update({
      where: { id },
      data: {
        ...input,
        ...(input.status === "CONTACTED" ? { lastContactedAt: new Date() } : {}),
      },
      include: leadSummaryInclude,
    });
    const action =
      input.status && input.status !== existing.status
        ? "crm.lead.status_changed"
        : "assignedToId" in input && input.assignedToId !== existing.assignedToId
          ? "crm.lead.assigned"
          : "crm.lead.updated";
    await writeAudit(tx, actor, action, "Lead", id, {
      changedFields: Object.keys(input),
      ...(input.status ? { beforeStatus: existing.status, afterStatus: input.status } : {}),
      ...("assignedToId" in input ? { assignedToId: input.assignedToId } : {}),
    });
    return updated;
  });
  return serializeLeadListItem(lead);
}

export async function archiveLead(id: string, actor: CrmActor) {
  assertCrmWriteActor(actor);
  const prisma = getPrisma();
  const existing = await prisma.lead.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!existing) throw new CrmServiceError(404, "NOT_FOUND", "Nie znaleziono leada.");

  const lead = await prisma.$transaction(async (tx) => {
    const archived = await tx.lead.update({
      where: { id },
      data: { status: "ARCHIVED" },
      include: leadSummaryInclude,
    });
    await writeAudit(tx, actor, "crm.lead.archived", "Lead", id, {
      beforeStatus: existing.status,
      afterStatus: "ARCHIVED",
    });
    return archived;
  });

  return serializeLeadListItem(lead);
}

export async function convertLead(id: string, input: LeadConvertInput, actor: CrmActor) {
  assertCrmWriteActor(actor);
  const prisma = getPrisma();

  const result = await prisma.$transaction(async (tx) => {
    const lead = await tx.lead.findUnique({ where: { id } });
    if (!lead) throw new CrmServiceError(404, "NOT_FOUND", "Nie znaleziono leada.");
    if (lead.organizationId) {
      throw new CrmServiceError(409, "ALREADY_CONVERTED", "Lead jest już powiązany z organizacją.", {
        organizationId: lead.organizationId,
      });
    }

    let organization: Organization;
    if (input.organizationId) {
      const existing = await tx.organization.findUnique({ where: { id: input.organizationId } });
      if (!existing) throw new CrmServiceError(404, "ORGANIZATION_NOT_FOUND", "Nie znaleziono wskazanej organizacji.");
      organization = existing;
    } else {
      const conflicts = await tx.organization.findMany({
        where: {
          OR: [
            ...(lead.nip ? [{ nip: lead.nip }] : []),
            { name: { equals: input.organizationName ?? lead.companyName, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, nip: true },
        take: 5,
      });
      if (conflicts.length > 0) {
        throw new CrmServiceError(
          409,
          "REVIEW_REQUIRED",
          "Istnieje podobna organizacja. Wybierz ją jawnie albo zweryfikuj duplikat.",
          { matches: conflicts },
        );
      }

      organization = await tx.organization.create({
        data: {
          name: input.organizationName ?? lead.companyName,
          legalName: lead.companyName,
          nip: lead.nip,
          email: lead.email,
          phone: lead.phone,
          industry: lead.industry,
          size: lead.companySize,
          status: "PROSPECT",
          ownerId: lead.assignedToId,
        },
      });
    }

    const updatedLead = await tx.lead.update({
      where: { id },
      data: {
        organizationId: organization.id,
        convertedAt: new Date(),
        status: "CONVERTED",
      },
      include: leadDetailInclude,
    });
    await tx.contactPerson.create({
      data: {
        leadId: id,
        organizationId: organization.id,
        fullName: lead.fullName,
        email: lead.email,
        phone: lead.phone,
        isPrimary: true,
      },
    });
    await writeAudit(tx, actor, "crm.lead.converted", "Lead", id, {
      organizationId: organization.id,
      usedExistingOrganization: Boolean(input.organizationId),
    }, organization.id);
    return { lead: updatedLead, organization };
  });

  return {
    lead: serializeLeadDetail(result.lead),
    organization: await getOrganization(result.organization.id),
  };
}

export async function listOrganizations(input: OrganizationListInput) {
  const prisma = getPrisma();
  const rows = await prisma.organization.findMany({
    where: {
      ...(input.status ? { status: input.status } : {}),
      ...(input.industry ? { industry: { equals: input.industry, mode: "insensitive" } } : {}),
      ...(input.ownerId ? { ownerId: input.ownerId } : {}),
      ...(input.q
        ? {
            OR: [
              { name: { contains: input.q, mode: "insensitive" } },
              { legalName: { contains: input.q, mode: "insensitive" } },
              { email: { contains: input.q, mode: "insensitive" } },
              { nip: { contains: input.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: organizationSummaryInclude,
    orderBy: organizationOrderBy(input.sort),
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  return paginatedResult(rows, input.limit, serializeOrganizationListItem);
}

export async function getOrganization(id: string) {
  const organization = await getPrisma().organization.findUnique({
    where: { id },
    include: organizationDetailInclude,
  });
  if (!organization) throw new CrmServiceError(404, "NOT_FOUND", "Nie znaleziono organizacji.");
  return serializeOrganizationDetail(organization);
}

export async function createOrganization(input: OrganizationCreateInput, actor: CrmActor) {
  assertCrmWriteActor(actor);
  const prisma = getPrisma();
  await assertAssignableUser(input.ownerId);
  await assertOrganizationConflict(input.name, input.nip);

  const organization = await prisma.$transaction(async (tx) => {
    const created = await tx.organization.create({
      data: input,
      include: organizationSummaryInclude,
    });
    await writeAudit(tx, actor, "crm.organization.created", "Organization", created.id, {
      status: created.status,
    }, created.id);
    return created;
  });
  return serializeOrganizationListItem(organization);
}

export async function updateOrganization(id: string, input: OrganizationUpdateInput, actor: CrmActor) {
  assertCrmWriteActor(actor);
  const prisma = getPrisma();
  const existing = await prisma.organization.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new CrmServiceError(404, "NOT_FOUND", "Nie znaleziono organizacji.");
  await assertAssignableUser(input.ownerId ?? undefined);

  const organization = await prisma.$transaction(async (tx) => {
    const updated = await tx.organization.update({
      where: { id },
      data: input,
      include: organizationSummaryInclude,
    });
    await writeAudit(tx, actor, input.status === "ARCHIVED" ? "crm.organization.archived" : "crm.organization.updated", "Organization", id, {
      changedFields: Object.keys(input),
      ...(input.status ? { afterStatus: input.status } : {}),
    }, id);
    return updated;
  });
  return serializeOrganizationListItem(organization);
}

export async function archiveOrganization(id: string, actor: CrmActor) {
  assertCrmWriteActor(actor);
  const prisma = getPrisma();
  const existing = await prisma.organization.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!existing) throw new CrmServiceError(404, "NOT_FOUND", "Nie znaleziono organizacji.");

  const organization = await prisma.$transaction(async (tx) => {
    const archived = await tx.organization.update({
      where: { id },
      data: { status: "ARCHIVED" },
      include: organizationSummaryInclude,
    });
    await writeAudit(tx, actor, "crm.organization.archived", "Organization", id, {
      beforeStatus: existing.status,
      afterStatus: "ARCHIVED",
    }, id);
    return archived;
  });

  return serializeOrganizationListItem(organization);
}

export async function addCrmNote(input: CrmNoteCreateInput, actor: CrmActor) {
  assertCrmWriteActor(actor);
  const prisma = getPrisma();
  if (input.leadId) await assertLeadExists(input.leadId);
  if (input.organizationId) {
    const organization = await prisma.organization.findUnique({ where: { id: input.organizationId }, select: { id: true } });
    if (!organization) throw new CrmServiceError(404, "ORGANIZATION_NOT_FOUND", "Nie znaleziono organizacji.");
  }

  const note = await prisma.$transaction(async (tx) => {
    const created = await tx.crmNote.create({
      data: { ...input, authorId: actor.id },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    await writeAudit(tx, actor, input.leadId ? "crm.lead.note_added" : "crm.organization.note_added", "CrmNote", created.id, {
      leadId: input.leadId,
      organizationId: input.organizationId,
    }, input.organizationId);
    return created;
  });
  return serializeCrmNote(note);
}

export async function listCrmTasks(input: CrmTaskListInput) {
  const prisma = getPrisma();
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const where: Prisma.CrmTaskWhereInput = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.priority ? { priority: input.priority } : {}),
    ...(input.assignedToId ? { assignedToId: input.assignedToId } : {}),
    ...(input.leadId ? { leadId: input.leadId } : {}),
    ...(input.organizationId ? { organizationId: input.organizationId } : {}),
    ...(input.due === "overdue" ? { dueAt: { lt: now }, status: { notIn: ["DONE", "CANCELLED"] } } : {}),
    ...(input.due === "today" ? { dueAt: { gte: startOfToday, lt: endOfToday } } : {}),
    ...(input.due === "upcoming" ? { dueAt: { gte: endOfToday } } : {}),
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
  };

  const rows = await prisma.crmTask.findMany({
    where,
    include: taskInclude,
    orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }, { id: "desc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  return paginatedResult(rows, input.limit, serializeCrmTaskListItem);
}

export async function getCrmTask(id: string) {
  const task = await getPrisma().crmTask.findUnique({ where: { id }, include: taskInclude });
  if (!task) throw new CrmServiceError(404, "NOT_FOUND", "Nie znaleziono zadania CRM.");
  return serializeCrmTaskListItem(task);
}

export async function createCrmTask(input: CrmTaskCreateInput, actor: CrmActor) {
  assertCrmWriteActor(actor);
  const prisma = getPrisma();
  await assertTaskLinks(input.leadId, input.organizationId);
  await assertAssignableUser(input.assignedToId ?? undefined);

  const task = await prisma.$transaction(async (tx) => {
    const created = await tx.crmTask.create({
      data: {
        leadId: input.leadId,
        organizationId: input.organizationId,
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        dueAt: input.dueAt,
        assignedToId: input.assignedToId,
        createdById: actor.id,
        completedAt: input.status === "DONE" ? new Date() : null,
      },
      include: taskInclude,
    });
    await writeAudit(tx, actor, "crm.task.created", "CrmTask", created.id, {
      leadId: created.leadId,
      organizationId: created.organizationId,
      assignedToId: created.assignedToId,
      status: created.status,
      priority: created.priority,
    }, created.organizationId ?? undefined);
    return created;
  });

  return serializeCrmTaskListItem(task);
}

export async function updateCrmTask(id: string, input: CrmTaskUpdateInput, actor: CrmActor) {
  assertCrmWriteActor(actor);
  const prisma = getPrisma();
  const existing = await prisma.crmTask.findUnique({
    where: { id },
    select: { id: true, status: true, organizationId: true, assignedToId: true },
  });
  if (!existing) throw new CrmServiceError(404, "NOT_FOUND", "Nie znaleziono zadania CRM.");
  await assertAssignableUser(input.assignedToId ?? undefined);

  const task = await prisma.$transaction(async (tx) => {
    const updated = await tx.crmTask.update({
      where: { id },
      data: {
        ...input,
        completedAt: input.status ? (input.status === "DONE" ? new Date() : null) : undefined,
      },
      include: taskInclude,
    });
    await writeAudit(tx, actor, taskAuditAction(input, existing), "CrmTask", id, {
      changedFields: Object.keys(input),
      beforeStatus: existing.status,
      afterStatus: input.status,
      ...("assignedToId" in input ? { beforeAssignedToId: existing.assignedToId, afterAssignedToId: input.assignedToId } : {}),
    }, updated.organizationId ?? existing.organizationId ?? undefined);
    return updated;
  });

  return serializeCrmTaskListItem(task);
}

export function updateCrmTaskStatus(id: string, input: CrmTaskStatusChangeInput, actor: CrmActor) {
  return updateCrmTask(id, input, actor);
}

export function assignCrmTask(id: string, input: CrmTaskAssignInput, actor: CrmActor) {
  return updateCrmTask(id, input, actor);
}

export function completeCrmTask(id: string, actor: CrmActor) {
  return updateCrmTask(id, { status: "DONE" }, actor);
}

export function cancelCrmTask(id: string, actor: CrmActor) {
  return updateCrmTask(id, { status: "CANCELLED" }, actor);
}

export async function addContactPerson(input: ContactCreateInput, actor: CrmActor) {
  assertCrmWriteActor(actor);
  const prisma = getPrisma();
  await assertTaskLinks(input.leadId, input.organizationId);

  const contact = await prisma.$transaction(async (tx) => {
    if (input.isPrimary && input.organizationId) {
      await tx.contactPerson.updateMany({
        where: { organizationId: input.organizationId, isPrimary: true },
        data: { isPrimary: false },
      });
    }
    if (input.isPrimary && input.leadId) {
      await tx.contactPerson.updateMany({
        where: { leadId: input.leadId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const created = await tx.contactPerson.create({
      data: input,
    });
    await writeAudit(tx, actor, "crm.contact.created", "ContactPerson", created.id, {
      leadId: created.leadId,
      organizationId: created.organizationId,
      isPrimary: created.isPrimary,
    }, created.organizationId ?? undefined);
    return created;
  });

  return serializeContactPerson(contact);
}

export async function listContactPersons(organizationId: string, input: ContactListInput) {
  const organization = await getPrisma().organization.findUnique({ where: { id: organizationId }, select: { id: true } });
  if (!organization) throw new CrmServiceError(404, "ORGANIZATION_NOT_FOUND", "Nie znaleziono organizacji.");

  const rows = await getPrisma().contactPerson.findMany({
    where: { organizationId },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }, { id: "asc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });

  return paginatedResult(rows, input.limit, serializeContactPerson);
}

export async function updateContactPerson(id: string, input: ContactUpdateInput, actor: CrmActor) {
  assertCrmWriteActor(actor);
  const prisma = getPrisma();
  const existing = await prisma.contactPerson.findUnique({
    where: { id },
    select: { id: true, leadId: true, organizationId: true },
  });
  if (!existing) throw new CrmServiceError(404, "NOT_FOUND", "Nie znaleziono kontaktu.");

  const contact = await prisma.$transaction(async (tx) => {
    if (input.isPrimary && existing.organizationId) {
      await tx.contactPerson.updateMany({
        where: { organizationId: existing.organizationId, isPrimary: true, NOT: { id } },
        data: { isPrimary: false },
      });
    }
    if (input.isPrimary && existing.leadId) {
      await tx.contactPerson.updateMany({
        where: { leadId: existing.leadId, isPrimary: true, NOT: { id } },
        data: { isPrimary: false },
      });
    }

    const updated = await tx.contactPerson.update({ where: { id }, data: input });
    await writeAudit(tx, actor, "crm.contact.updated", "ContactPerson", id, {
      changedFields: Object.keys(input),
      leadId: existing.leadId,
      organizationId: existing.organizationId,
      isPrimary: updated.isPrimary,
    }, existing.organizationId ?? undefined);
    return updated;
  });

  return serializeContactPerson(contact);
}

export async function listCrmActivity(input: CrmActivityListInput) {
  const where: Prisma.AuditLogWhereInput = {
    ...(input.organizationId ? { organizationId: input.organizationId } : {}),
    ...(input.leadId ? { entityType: "Lead", entityId: input.leadId } : {}),
  };
  const rows = await getPrisma().auditLog.findMany({
    where,
    include: auditActivityInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  return paginatedResult(rows, input.limit, serializeAuditActivity);
}

export async function listCrmAssignees() {
  return getPrisma().user.findMany({
    where: { role: { in: ["ADMIN", "LAWYER", "OPERATOR"] } },
    select: { id: true, name: true, email: true, role: true },
    orderBy: [{ name: "asc" }, { email: "asc" }],
  });
}

async function assertLeadExists(id: string) {
  const lead = await getPrisma().lead.findUnique({ where: { id }, select: { id: true } });
  if (!lead) throw new CrmServiceError(404, "NOT_FOUND", "Nie znaleziono leada.");
}

async function assertTaskLinks(leadId?: string, organizationId?: string) {
  const prisma = getPrisma();
  if (leadId) await assertLeadExists(leadId);
  if (organizationId) {
    const organization = await prisma.organization.findUnique({ where: { id: organizationId }, select: { id: true } });
    if (!organization) throw new CrmServiceError(404, "ORGANIZATION_NOT_FOUND", "Nie znaleziono organizacji.");
  }
}

async function assertAssignableUser(id?: string | null) {
  if (!id) return;
  const user = await getPrisma().user.findUnique({ where: { id }, select: { role: true } });
  if (!user || !["ADMIN", "LAWYER", "OPERATOR"].includes(user.role)) {
    throw new CrmServiceError(400, "INVALID_ASSIGNEE", "Opiekun musi mieć aktywną rolę operacyjną.");
  }
}

async function assertOrganizationConflict(name: string, nip?: string) {
  const conflict = await getPrisma().organization.findFirst({
    where: {
      OR: [
        ...(nip ? [{ nip }] : []),
        { name: { equals: name, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, nip: true },
  });
  if (conflict) {
    throw new CrmServiceError(409, "REVIEW_REQUIRED", "Podobna organizacja już istnieje.", {
      matches: [conflict],
    });
  }
}

function leadOrderBy(sort: LeadListInput["sort"]): Prisma.LeadOrderByWithRelationInput[] {
  if (sort === "updated") return [{ updatedAt: "desc" }, { id: "desc" }];
  if (sort === "priority") return [{ priority: "desc" }, { updatedAt: "desc" }, { id: "desc" }];
  return [{ createdAt: "desc" }, { id: "desc" }];
}

function organizationOrderBy(sort: OrganizationListInput["sort"]): Prisma.OrganizationOrderByWithRelationInput[] {
  if (sort === "name") return [{ name: "asc" }, { id: "asc" }];
  if (sort === "newest") return [{ createdAt: "desc" }, { id: "desc" }];
  return [{ updatedAt: "desc" }, { id: "desc" }];
}

function taskAuditAction(
  input: CrmTaskUpdateInput,
  existing: { assignedToId: string | null; status: string },
) {
  if (input.status === "DONE" && existing.status !== "DONE") return "crm.task.completed";
  if (input.status === "CANCELLED" && existing.status !== "CANCELLED") return "crm.task.cancelled";
  if (input.status && input.status !== existing.status) return "crm.task.status_changed";
  if ("assignedToId" in input && input.assignedToId !== existing.assignedToId) return "crm.task.assigned";
  return "crm.task.updated";
}

async function writeAudit(
  tx: Prisma.TransactionClient,
  actor: CrmActor,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown>,
  organizationId?: string,
) {
  await createCrmActivity(tx, {
    action,
    actor,
    entityId,
    entityType,
    metadata,
    organizationId,
  });
}

function toJson(value: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject;
}
