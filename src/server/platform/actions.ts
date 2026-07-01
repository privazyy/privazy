"use server";

import { randomUUID } from "node:crypto";

import { DataSubjectRequestType, Prisma } from "@prisma/client";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { sendTransactionalEmail } from "@/server/email/transactional";
import { getPrisma } from "@/server/db/prisma";
import { writePlatformEvent } from "@/server/platform/audit";
import {
  assertCanAccessOrganization,
  assertCanManageOrganization,
  requirePlatformActor,
} from "@/server/platform/permissions";

const requiredString = z.string().trim().min(2).max(4000);
const optionalString = z.string().trim().max(4000).optional();

const organizationSchema = z.object({
  organizationId: z.string().min(1),
});

const documentFormSchema = organizationSchema.extend({
  administratorName: requiredString.max(220),
  dataCategories: requiredString.max(1200),
  notes: optionalString,
  orderItemId: z.string().min(1),
  processingPurpose: requiredString.max(1200),
});

const breachSchema = organizationSchema.extend({
  affectedPeopleEstimate: optionalString,
  dataCategories: requiredString.max(1200),
  detectedAt: z.coerce.date(),
  impact: requiredString.max(1600),
  occurredAt: z.coerce.date().optional(),
  summary: requiredString.max(2200),
  title: requiredString.max(220),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
});

const requestSchema = organizationSchema.extend({
  channel: requiredString.max(120),
  receivedAt: z.coerce.date(),
  summary: requiredString.max(2200),
  subjectEmail: z.string().trim().email().optional().or(z.literal("")),
  subjectName: requiredString.max(220),
  type: z.nativeEnum(DataSubjectRequestType),
  verified: z.enum(["yes", "no"]).default("no"),
});

const messageSchema = organizationSchema.extend({
  body: requiredString.max(4000),
  relatedEntityId: z.string().trim().optional(),
  relatedEntityType: z.string().trim().optional(),
  subject: requiredString.max(220),
  threadId: z.string().trim().optional(),
});

const taskSchema = organizationSchema.extend({
  taskId: z.string().min(1),
});

const organizationSettingsSchema = organizationSchema.extend({
  email: z.string().trim().email().optional().or(z.literal("")),
  name: requiredString.max(220),
  phone: z.string().trim().max(80).optional(),
  website: z.string().trim().max(240).optional(),
});

function formObject(formData: FormData) {
  return Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [
      key,
      typeof value === "string" && value.trim() === "" ? undefined : value,
    ]),
  );
}

function addDays(date: Date, days: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function addHours(date: Date, hours: number) {
  const value = new Date(date);
  value.setHours(value.getHours() + hours);
  return value;
}

function publicPortalPath(path: string, organizationId: string) {
  return `/platforma${path}?org=${encodeURIComponent(organizationId)}` as Route;
}

function caseNumber(prefix: string) {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function submitDocumentInputFormAction(formData: FormData) {
  const actor = await requirePlatformActor();
  const input = documentFormSchema.parse(formObject(formData));
  await assertCanAccessOrganization(input.organizationId, actor);
  const prisma = getPrisma();

  const orderItem = await prisma.orderItem.findFirst({
    include: { order: true },
    where: {
      id: input.orderItemId,
      order: { organizationId: input.organizationId },
    },
  });

  if (!orderItem) {
    throw new Error("Nie znaleziono formularza dokumentu dla tej organizacji.");
  }

  await prisma.$transaction(async (tx) => {
    const created = await tx.formSubmission.create({
      data: {
        createdById: actor.id,
        data: {
          administratorName: input.administratorName,
          dataCategories: input.dataCategories,
          notes: input.notes ?? null,
          processingPurpose: input.processingPurpose,
        } satisfies Prisma.InputJsonObject,
        formType: "DOCUMENT_INPUT",
        orderItemId: orderItem.id,
        organizationId: input.organizationId,
        status: "SUBMITTED",
      },
    });

    await tx.orderItem.update({
      data: { status: "IN_PROGRESS" },
      where: { id: orderItem.id },
    });

    await writePlatformEvent(
      {
        action: "client.document_form_submitted",
        actor,
        body: `Klient uzupelnil dane do dokumentu ${orderItem.productName}.`,
        entityId: created.id,
        entityType: "FormSubmission",
        metadata: { orderItemId: orderItem.id, orderNumber: orderItem.order.orderNumber },
        organizationId: input.organizationId,
        timelineTitle: "Uzupelniono formularz dokumentu",
        type: "DOCUMENT_FORM_SUBMITTED",
      },
      tx,
    );

    return created;
  });

  revalidatePath("/platforma");
  redirect(publicPortalPath(`/dokumenty`, input.organizationId));
}

export async function createBreachIncidentAction(formData: FormData) {
  const actor = await requirePlatformActor();
  const input = breachSchema.parse(formObject(formData));
  await assertCanAccessOrganization(input.organizationId, actor);
  const prisma = getPrisma();

  const incident = await prisma.$transaction(async (tx) => {
    const created = await tx.breachIncident.create({
      data: {
        authorityDueAt: addHours(input.detectedAt, 72),
        createdById: actor.id,
        dataSubjectsDueAt: addHours(input.detectedAt, 72),
        detectedAt: input.detectedAt,
        incidentNumber: caseNumber("NAR"),
        organizationId: input.organizationId,
        occurredAt: input.occurredAt ?? null,
        riskLevel: input.urgency,
        status: "NEW",
        summary: [
          input.summary,
          `Kategorie danych: ${input.dataCategories}`,
          input.affectedPeopleEstimate ? `Szacowana liczba osob: ${input.affectedPeopleEstimate}` : null,
          `Potencjalne skutki: ${input.impact}`,
        ].filter(Boolean).join("\n\n"),
        title: input.title,
      },
    });

    await tx.crmTask.create({
      data: {
        createdById: actor.id,
        description: "Nowe zgloszenie naruszenia z platformy klienta wymaga triage.",
        dueAt: addHours(input.detectedAt, 24),
        entityId: created.id,
        entityType: "BreachIncident",
        organizationId: input.organizationId,
        priority: input.urgency === "CRITICAL" || input.urgency === "HIGH" ? "HIGH" : "MEDIUM",
        title: `Triage naruszenia ${created.incidentNumber}`,
      },
    });

    await writePlatformEvent(
      {
        action: "client.breach_created",
        actor,
        body: "Zgloszenie trafilo do zespolu PRIVAZY. Termin 72h liczony jest od wskazanej daty wykrycia.",
        entityId: created.id,
        entityType: "BreachIncident",
        metadata: { riskLevel: input.urgency },
        organizationId: input.organizationId,
        timelineTitle: "Zgloszono naruszenie ochrony danych",
        type: "BREACH_CREATED",
      },
      tx,
    );

    return created;
  });

  await sendTransactionalEmail({
    html: `<p>Nowe zgloszenie naruszenia ${incident.incidentNumber} zostalo zapisane w platformie klienta.</p>`,
    subject: `PRIVAZY: zapisano zgloszenie naruszenia ${incident.incidentNumber}`,
    to: actor.email,
  });

  revalidatePath("/platforma");
  redirect(publicPortalPath(`/naruszenia/${incident.id}`, input.organizationId));
}

export async function createDataSubjectRequestAction(formData: FormData) {
  const actor = await requirePlatformActor();
  const input = requestSchema.parse(formObject(formData));
  await assertCanAccessOrganization(input.organizationId, actor);
  const prisma = getPrisma();
  const dueAt = addDays(input.receivedAt, 30);

  const request = await prisma.$transaction(async (tx) => {
    const created = await tx.dataSubjectRequest.create({
      data: {
        channel: input.channel,
        createdById: actor.id,
        dueAt,
        organizationId: input.organizationId,
        receivedAt: input.receivedAt,
        requestNumber: caseNumber("ZAD"),
        status: input.verified === "yes" ? "IN_PROGRESS" : "IDENTITY_VERIFICATION",
        subjectEmail: input.subjectEmail || null,
        subjectName: input.subjectName,
        summary: input.summary,
        type: input.type,
        verifiedAt: input.verified === "yes" ? new Date() : null,
      },
    });

    await tx.crmTask.create({
      data: {
        createdById: actor.id,
        description: "Nowe zadanie osoby z platformy klienta wymaga oceny i odpowiedzi w terminie.",
        dueAt,
        entityId: created.id,
        entityType: "DataSubjectRequest",
        organizationId: input.organizationId,
        priority: "MEDIUM",
        title: `Obsluz zadanie osoby ${created.requestNumber}`,
      },
    });

    await writePlatformEvent(
      {
        action: "client.data_subject_request_created",
        actor,
        body: "Zadanie osoby zostalo zapisane i jest widoczne dla zespolu PRIVAZY.",
        entityId: created.id,
        entityType: "DataSubjectRequest",
        metadata: { dueAt, type: input.type },
        organizationId: input.organizationId,
        timelineTitle: "Zarejestrowano zadanie osoby",
        type: "REQUEST_CREATED",
      },
      tx,
    );

    return created;
  });

  await sendTransactionalEmail({
    html: `<p>Zadanie osoby ${request.requestNumber} zostalo zapisane. Termin odpowiedzi: ${dueAt.toLocaleDateString("pl-PL")}.</p>`,
    subject: `PRIVAZY: zapisano zadanie osoby ${request.requestNumber}`,
    to: actor.email,
  });

  revalidatePath("/platforma");
  redirect(publicPortalPath(`/zadania-osob/${request.id}`, input.organizationId));
}

export async function createClientMessageAction(formData: FormData) {
  const actor = await requirePlatformActor();
  const input = messageSchema.parse(formObject(formData));
  await assertCanAccessOrganization(input.organizationId, actor);
  const prisma = getPrisma();

  const thread = await prisma.$transaction(async (tx) => {
    const existingThread = input.threadId
      ? await tx.clientMessageThread.findFirst({
          where: { id: input.threadId, organizationId: input.organizationId },
        })
      : null;

    const savedThread =
      existingThread ??
      (await tx.clientMessageThread.create({
        data: {
          createdById: actor.id,
          organizationId: input.organizationId,
          relatedEntityId: input.relatedEntityId || null,
          relatedEntityType: input.relatedEntityType || null,
          subject: input.subject,
        },
      }));

    const message = await tx.clientMessage.create({
      data: {
        body: input.body,
        organizationId: input.organizationId,
        senderType: "CLIENT",
        senderUserId: actor.id,
        threadId: savedThread.id,
      },
    });

    await tx.clientMessageThread.update({
      data: { lastMessageAt: message.createdAt, status: "OPEN" },
      where: { id: savedThread.id },
    });

    await writePlatformEvent(
      {
        action: "client.message_sent",
        actor,
        body: input.subject,
        entityId: savedThread.id,
        entityType: "ClientMessageThread",
        metadata: { messageId: message.id },
        organizationId: input.organizationId,
        timelineTitle: "Wyslano wiadomosc do PRIVAZY",
        type: "MESSAGE_SENT",
      },
      tx,
    );

    return savedThread;
  });

  await sendTransactionalEmail({
    html: `<p>Otrzymalismy wiadomosc w watku: <strong>${thread.subject}</strong>.</p>`,
    subject: `PRIVAZY: otrzymalismy Twoja wiadomosc`,
    to: actor.email,
  });

  revalidatePath("/platforma");
  redirect(publicPortalPath("/wiadomosci", input.organizationId));
}

export async function completeClientTaskAction(formData: FormData) {
  const actor = await requirePlatformActor();
  const input = taskSchema.parse(formObject(formData));
  await assertCanAccessOrganization(input.organizationId, actor);
  const prisma = getPrisma();

  const task = await prisma.crmTask.findFirst({
    where: { id: input.taskId, organizationId: input.organizationId },
  });

  if (!task) {
    throw new Error("Nie znaleziono zadania dla tej organizacji.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.crmTask.update({
      data: { completedAt: new Date(), status: "DONE" },
      where: { id: task.id },
    });

    await writePlatformEvent(
      {
        action: "client.task_completed",
        actor,
        body: task.title,
        entityId: task.id,
        entityType: "CrmTask",
        organizationId: input.organizationId,
        timelineTitle: "Oznaczono zadanie jako wykonane",
        type: "TASK_COMPLETED",
      },
      tx,
    );
  });

  revalidatePath("/platforma");
}

export async function updateOrganizationSettingsAction(formData: FormData) {
  const actor = await requirePlatformActor();
  const input = organizationSettingsSchema.parse(formObject(formData));
  await assertCanManageOrganization(input.organizationId, actor);
  const prisma = getPrisma();

  const organization = await prisma.$transaction(async (tx) => {
    const updated = await tx.organization.update({
      data: {
        email: input.email || null,
        name: input.name,
        phone: input.phone || null,
        website: input.website || null,
      },
      where: { id: input.organizationId },
    });

    await writePlatformEvent(
      {
        action: "client.organization_updated",
        actor,
        entityId: updated.id,
        entityType: "Organization",
        organizationId: input.organizationId,
        timelineTitle: "Zaktualizowano dane organizacji",
        type: "ORGANIZATION_UPDATED",
      },
      tx,
    );

    return updated;
  });

  revalidatePath("/platforma");
  redirect(publicPortalPath("/ustawienia", organization.id));
}
