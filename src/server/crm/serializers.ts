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

type TaskRecord = Prisma.CrmTaskGetPayload<{
  include: {
    assignedTo: { select: { id: true; name: true; email: true } };
    createdBy: { select: { id: true; name: true; email: true } };
  };
}>;

type ContactRecord = Prisma.ContactPersonGetPayload<Record<string, never>>;

type TaskListRecord = Prisma.CrmTaskGetPayload<{
  include: {
    assignedTo: { select: { id: true; name: true; email: true } };
    createdBy: { select: { id: true; name: true; email: true } };
    lead: { select: { id: true; companyName: true; fullName: true } };
    organization: { select: { id: true; name: true } };
  };
}>;

type AuditActivityRecord = Prisma.AuditLogGetPayload<{
  include: {
    organization: { select: { id: true; name: true } };
    user: { select: { id: true; name: true; email: true } };
  };
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
    assignedTo: task.assignedTo,
    createdBy: task.createdBy,
    completedAt: task.completedAt,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

export function serializeContactPerson(contact: ContactRecord) {
  return {
    id: contact.id,
    leadId: contact.leadId,
    organizationId: contact.organizationId,
    fullName: contact.fullName,
    email: contact.email,
    phone: contact.phone,
    role: contact.role,
    isPrimary: contact.isPrimary,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  };
}

export function serializeCrmTaskListItem(task: TaskListRecord) {
  return {
    ...serializeCrmTask(task),
    lead: task.lead,
    organization: task.organization,
  };
}

export function serializeAuditActivity(log: AuditActivityRecord) {
  return {
    id: log.id,
    type: "audit",
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    actor: log.user,
    organization: log.organization,
    createdAt: log.createdAt,
  };
}
