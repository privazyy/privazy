import "server-only";

import type { Prisma } from "@prisma/client";

type LeadListRecord = Prisma.LeadGetPayload<{
  include: {
    assignedTo: { select: { id: true; name: true; email: true } };
    organization: { select: { id: true; name: true; status: true } };
  };
}>;

type LeadDetailRecord = Prisma.LeadGetPayload<{
  include: {
    assignedTo: { select: { id: true; name: true; email: true } };
    organization: { select: { id: true; name: true; status: true } };
    contactPersons: true;
    notes: { include: { author: { select: { id: true; name: true; email: true } } } };
    tasks: {
      include: {
        assignedTo: { select: { id: true; name: true; email: true } };
        createdBy: { select: { id: true; name: true; email: true } };
      };
    };
    formSubmission: { select: { id: true; formType: true; status: true; createdAt: true } };
  };
}>;

type OrganizationListRecord = Prisma.OrganizationGetPayload<{
  include: {
    owner: { select: { id: true; name: true; email: true } };
    _count: { select: { leads: true; contactPersons: true; crmNotes: true; crmTasks: true } };
  };
}>;

type OrganizationDetailRecord = Prisma.OrganizationGetPayload<{
  include: {
    owner: { select: { id: true; name: true; email: true } };
    _count: { select: { leads: true; contactPersons: true; crmNotes: true; crmTasks: true } };
    contactPersons: true;
    leads: { include: { assignedTo: { select: { id: true; name: true; email: true } } } };
    crmNotes: { include: { author: { select: { id: true; name: true; email: true } } } };
    crmTasks: { include: { assignedTo: { select: { id: true; name: true; email: true } } } };
  };
}>;

type NoteRecord = Prisma.CrmNoteGetPayload<{
  include: { author: { select: { id: true; name: true; email: true } } };
}>;

type TaskRecord = {
  id: string;
  leadId: string | null;
  organizationId: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assignedTo: { id: string; name: string | null; email: string } | null;
  createdBy?: { id: string; name: string | null; email: string };
  lead?: { id: string; companyName: string; fullName: string } | null;
  organization?: { id: string; name: string } | null;
};

type ActivityRecord = Prisma.CrmActivityGetPayload<{
  include: { actor: { select: { id: true; name: true; email: true } } };
}>;

export function serializeLeadListItem(lead: LeadListRecord) {
  return {
    id: lead.id,
    source: lead.source,
    status: lead.status,
    priority: lead.priority,
    companyName: lead.companyName,
    fullName: lead.fullName,
    email: lead.email,
    phone: lead.phone,
    industry: lead.industry,
    estimatedValue: lead.estimatedValue === null ? null : Number(lead.estimatedValue),
    assignedToId: lead.assignedToId,
    assignedTo: lead.assignedTo,
    organization: lead.organization,
    convertedAt: lead.convertedAt,
    lastContactedAt: lead.lastContactedAt,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

export function serializeLeadDetail(lead: LeadDetailRecord) {
  return {
    ...serializeLeadListItem(lead),
    nip: lead.nip,
    companySize: lead.companySize,
    iodCheckerResult: lead.iodCheckerResult,
    consentContact: lead.consentContact,
    consentMarketing: lead.consentMarketing,
    consentPrivacy: lead.consentPrivacy,
    formSubmission: lead.formSubmission,
    contactPersons: lead.contactPersons.map((contact) => ({
      id: contact.id,
      fullName: contact.fullName,
      email: contact.email,
      phone: contact.phone,
      role: contact.role,
      isPrimary: contact.isPrimary,
      createdAt: contact.createdAt,
    })),
    notes: lead.notes.map(serializeCrmNote),
    tasks: lead.tasks.map(serializeCrmTask),
  };
}

export function serializeOrganizationListItem(organization: OrganizationListRecord) {
  return {
    id: organization.id,
    name: organization.name,
    legalName: organization.legalName,
    nip: organization.nip,
    email: organization.email,
    phone: organization.phone,
    website: organization.website,
    industry: organization.industry,
    size: organization.size,
    status: organization.status,
    ownerId: organization.ownerId,
    owner: organization.owner,
    city: organization.city,
    country: organization.country,
    counts: organization._count,
    createdAt: organization.createdAt,
    updatedAt: organization.updatedAt,
  };
}

export function serializeOrganizationDetail(organization: OrganizationDetailRecord) {
  return {
    ...serializeOrganizationListItem(organization),
    regon: organization.regon,
    addressLine1: organization.addressLine1,
    addressLine2: organization.addressLine2,
    postalCode: organization.postalCode,
    contactPersons: organization.contactPersons.map((contact) => ({
      id: contact.id,
      fullName: contact.fullName,
      email: contact.email,
      phone: contact.phone,
      role: contact.role,
      isPrimary: contact.isPrimary,
      createdAt: contact.createdAt,
    })),
    leads: organization.leads.map((lead) => ({
      id: lead.id,
      companyName: lead.companyName,
      fullName: lead.fullName,
      status: lead.status,
      priority: lead.priority,
      assignedTo: lead.assignedTo,
      createdAt: lead.createdAt,
    })),
    crmNotes: organization.crmNotes.map(serializeCrmNote),
    crmTasks: organization.crmTasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueAt: task.dueAt,
      assignedTo: task.assignedTo,
      completedAt: task.completedAt,
      createdAt: task.createdAt,
    })),
  };
}

export function serializeCrmNote(note: NoteRecord) {
  return {
    id: note.id,
    body: note.body,
    type: note.type,
    visibility: note.visibility,
    author: note.author,
    leadId: note.leadId,
    organizationId: note.organizationId,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

export function serializeCrmTask(task: TaskRecord) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueAt: task.dueAt,
    leadId: task.leadId,
    organizationId: task.organizationId,
    lead: "lead" in task ? task.lead : undefined,
    organization: "organization" in task ? task.organization : undefined,
    assignedTo: task.assignedTo,
    createdBy: task.createdBy,
    completedAt: task.completedAt,
    cancelledAt: task.cancelledAt,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

export function serializeCrmActivity(activity: ActivityRecord) {
  return {
    id: activity.id,
    type: activity.type,
    title: activity.title,
    description: activity.description,
    actor: activity.actor,
    leadId: activity.leadId,
    organizationId: activity.organizationId,
    createdAt: activity.createdAt,
    metadata: redactActivityMetadata(activity.metadata),
  };
}

export function serializeTimelineItem(item: {
  id: string;
  kind: "activity" | "note" | "task";
  type: string;
  title: string;
  description: string | null;
  actor?: { id: string; name: string | null; email: string } | null;
  status?: string | null;
  priority?: string | null;
  createdAt: Date;
}) {
  return item;
}

function redactActivityMetadata(metadata: Prisma.JsonValue) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return undefined;
  const allowedKeys = new Set([
    "afterStatus",
    "assignedToId",
    "beforeStatus",
    "changedFields",
    "leadId",
    "organizationId",
    "priority",
    "resourceId",
    "resourceType",
    "status",
    "taskId",
  ]);
  return Object.fromEntries(
    Object.entries(metadata).filter(([key, value]) => allowedKeys.has(key) && typeof value !== "object"),
  );
}
