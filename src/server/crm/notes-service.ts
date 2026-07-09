import "server-only";

import { Prisma, type CrmNoteType } from "@prisma/client";
import type { z } from "zod";

import { assertCrmWriteActor, type CrmActor } from "@/server/crm/access";
import { createActivity, writeCrmAudit } from "@/server/crm/activity-service";
import type { crmNoteCreateSchema, crmNoteUpdateSchema } from "@/server/crm/schemas";
import { serializeCrmNote } from "@/server/crm/serializers";
import { CrmServiceError } from "@/server/crm/service";
import { getPrisma } from "@/server/db/prisma";

type CreateNoteInput = z.infer<typeof crmNoteCreateSchema>;
type UpdateNoteInput = z.infer<typeof crmNoteUpdateSchema>;

const noteInclude = {
  author: { select: { id: true, name: true, email: true } },
} satisfies Prisma.CrmNoteInclude;

export async function listNotesForLead(leadId: string) {
  await assertLeadExists(leadId);
  const notes = await getPrisma().crmNote.findMany({
    where: { leadId },
    include: noteInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 100,
  });
  return { items: notes.map(serializeCrmNote) };
}

export async function listNotesForOrganization(organizationId: string) {
  await assertOrganizationExists(organizationId);
  const notes = await getPrisma().crmNote.findMany({
    where: { organizationId },
    include: noteInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 100,
  });
  return { items: notes.map(serializeCrmNote) };
}

export async function createLeadNote(leadId: string, input: Omit<CreateNoteInput, "leadId">, actor: CrmActor) {
  return createNote({ ...input, leadId }, actor);
}

export async function createOrganizationNote(
  organizationId: string,
  input: Omit<CreateNoteInput, "organizationId">,
  actor: CrmActor,
) {
  return createNote({ ...input, organizationId }, actor);
}

export async function createNote(input: CreateNoteInput, actor: CrmActor) {
  assertCrmWriteActor(actor);
  const prisma = getPrisma();
  if (input.leadId) await assertLeadExists(input.leadId);
  if (input.organizationId) await assertOrganizationExists(input.organizationId);

  const note = await prisma.$transaction(async (tx) => {
    const created = await tx.crmNote.create({
      data: {
        authorId: actor.id,
        body: input.body,
        leadId: input.leadId,
        organizationId: input.organizationId,
        type: input.type as CrmNoteType,
        visibility: "INTERNAL",
      },
      include: noteInclude,
    });
    await writeCrmAudit(tx, actor, "crm.note.created", "CrmNote", created.id, {
      leadId: created.leadId,
      organizationId: created.organizationId,
      type: created.type,
    }, created.organizationId);
    await createActivity(tx, {
      leadId: created.leadId,
      organizationId: created.organizationId,
      type: "NOTE_ADDED",
      title: "Dodano notatke CRM",
      description: noteTypeLabel(created.type),
      metadata: { resourceType: "CrmNote", resourceId: created.id, type: created.type },
    }, actor);
    return created;
  });

  return serializeCrmNote(note);
}

export async function updateNote(noteId: string, input: UpdateNoteInput, actor: CrmActor) {
  assertCrmWriteActor(actor);
  const prisma = getPrisma();
  const existing = await prisma.crmNote.findUnique({
    where: { id: noteId },
    select: { id: true, leadId: true, organizationId: true, type: true },
  });
  if (!existing) throw new CrmServiceError(404, "NOT_FOUND", "Nie znaleziono notatki.");

  const note = await prisma.$transaction(async (tx) => {
    const updated = await tx.crmNote.update({
      where: { id: noteId },
      data: {
        body: input.body,
        type: input.type,
      },
      include: noteInclude,
    });
    await writeCrmAudit(tx, actor, "crm.note.updated", "CrmNote", noteId, {
      changedFields: Object.keys(input),
      leadId: existing.leadId,
      organizationId: existing.organizationId,
      type: input.type ?? existing.type,
    }, existing.organizationId);
    await createActivity(tx, {
      leadId: existing.leadId,
      organizationId: existing.organizationId,
      type: "NOTE_UPDATED",
      title: "Zaktualizowano notatke CRM",
      description: noteTypeLabel(input.type ?? existing.type),
      metadata: { resourceType: "CrmNote", resourceId: noteId, changedFields: Object.keys(input) },
    }, actor);
    return updated;
  });

  return serializeCrmNote(note);
}

async function assertLeadExists(id: string) {
  const lead = await getPrisma().lead.findUnique({ where: { id }, select: { id: true } });
  if (!lead) throw new CrmServiceError(404, "NOT_FOUND", "Nie znaleziono leada.");
}

async function assertOrganizationExists(id: string) {
  const organization = await getPrisma().organization.findUnique({ where: { id }, select: { id: true } });
  if (!organization) throw new CrmServiceError(404, "ORGANIZATION_NOT_FOUND", "Nie znaleziono organizacji.");
}

function noteTypeLabel(type: string) {
  return {
    CALL: "Telefon",
    EMAIL: "E-mail",
    GENERAL: "Ogólna",
    INTERNAL: "Wewnętrzna",
    LEGAL: "Prawna",
    MEETING: "Spotkanie",
  }[type] ?? type;
}
