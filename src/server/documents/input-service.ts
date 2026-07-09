import "server-only";

import { DocumentGenerationStatus, Prisma } from "@prisma/client";
import type { z } from "zod";

import { getPrisma } from "@/server/db/prisma";
import { DocumentInputError } from "@/server/documents/input-errors";
import {
  assertCanEditDocumentInput,
  assertCanMutateDocumentInputInCrm,
  assertCanReadDocumentInput,
  assertCanReadOrganization,
  assertCanReviewDocumentInputInCrm,
  resolveDocumentInputContextFromOrderItem,
  type DocumentInputActor,
} from "@/server/documents/input-permissions";
import type {
  documentInputNeedsCorrectionSchema,
  documentInputQuerySchema,
  saveDocumentInputDraftSchema,
  submitDocumentInputSchema,
} from "@/server/documents/input-schemas";
import {
  documentInputInclude,
  serializeDocumentInputDetailForClient,
  serializeDocumentInputDetailForCrm,
  serializeDocumentInputListItemForClient,
  serializeDocumentInputListItemForCrm,
} from "@/server/documents/input-serializers";

type QueryInput = z.infer<typeof documentInputQuerySchema>;
type DraftInput = z.infer<typeof saveDocumentInputDraftSchema>;
type SubmitInput = z.infer<typeof submitDocumentInputSchema>;
type NeedsCorrectionInput = z.infer<typeof documentInputNeedsCorrectionSchema>;

export async function getDocumentInputForOrderItem(orderItemId: string, actor: DocumentInputActor) {
  const context = await resolveDocumentInputContextFromOrderItem(orderItemId, actor);
  const input = await getPrisma().documentInput.findUnique({
    where: { orderItemId },
    include: documentInputInclude,
  });

  if (!input) return null;
  await assertCanReadOrganization(actor, context.organizationId);
  return actor.role === "CLIENT" ? serializeDocumentInputDetailForClient(input) : serializeDocumentInputDetailForCrm(input);
}

export async function createDocumentInputForOrderItem(orderItemId: string, actor: DocumentInputActor) {
  const context = await resolveDocumentInputContextFromOrderItem(orderItemId, actor);
  if (!context.templateId || !context.documentType) {
    throw new DocumentInputError(400, "NOT_DOCUMENT_ITEM", "Element zamowienia nie ma szablonu dokumentu.");
  }
  const templateId = context.templateId;
  const documentType = context.documentType;

  const prisma = getPrisma();
  const existing = await prisma.documentInput.findUnique({ where: { orderItemId }, include: documentInputInclude });
  if (existing) {
    return actor.role === "CLIENT" ? serializeDocumentInputDetailForClient(existing) : serializeDocumentInputDetailForCrm(existing);
  }

  const item = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { product: true, template: true, order: true },
  });
  if (!item) throw new DocumentInputError(404, "ORDER_ITEM_NOT_FOUND", "Nie znaleziono elementu zamowienia.");

  const inputId = await prisma.$transaction(async (tx) => {
    const created = await tx.documentInput.create({
      data: {
        organizationId: item.organizationId,
        orderId: item.orderId,
        orderItemId: item.id,
        productId: item.productId,
        templateId,
        templateVersion: item.template?.version,
        documentType: documentType as never,
        status: "DRAFT",
        dataJson: {},
        validationSummary: { status: "draft_created" },
        createdById: actor.id,
      },
    });

    await tx.orderItem.update({
      where: { id: item.id },
      data: { fulfillmentStatus: "READY_FOR_INPUT" },
    });
    await writeDocumentInputAudit(tx, actor, "document_input.created", created.id, item.organizationId, {
      orderItemId: item.id,
      orderId: item.orderId,
      statusAfter: created.status,
    });
    return created.id;
  });

  const input = await prisma.documentInput.findUnique({ where: { id: inputId }, include: documentInputInclude });
  if (!input) throw new DocumentInputError(404, "DOCUMENT_INPUT_NOT_FOUND", "Nie znaleziono formularza dokumentu.");

  return actor.role === "CLIENT" ? serializeDocumentInputDetailForClient(input) : serializeDocumentInputDetailForCrm(input);
}

export async function saveDocumentInputDraft(input: DraftInput, actor: DocumentInputActor) {
  const documentInputId = input.documentInputId ?? (input.orderItemId ? await ensureInputId(input.orderItemId, actor) : null);
  if (!documentInputId) throw new DocumentInputError(400, "MISSING_INPUT", "Brak formularza dokumentu.");
  await assertCanEditDocumentInput(actor, documentInputId);

  const prisma = getPrisma();
  const updated = await prisma.$transaction(async (tx) => {
    const current = await tx.documentInput.findUnique({
      where: { id: documentInputId },
      select: { id: true, organizationId: true, orderItemId: true, status: true, clientRevision: true },
    });
    if (!current) throw new DocumentInputError(404, "DOCUMENT_INPUT_NOT_FOUND", "Nie znaleziono formularza dokumentu.");

    const nextRevision = input.clientRevision ?? current.clientRevision + 1;
    const saved = await tx.documentInput.update({
      where: { id: documentInputId },
      data: {
        dataJson: toJson(input.data),
        status: current.status === "NEEDS_CORRECTION" ? "NEEDS_CORRECTION" : "DRAFT",
        validationSummary: { mode: "draft", savedAt: new Date().toISOString() },
        clientRevision: nextRevision,
        updatedById: actor.id,
      },
      include: documentInputInclude,
    });

    await tx.orderItem.update({
      where: { id: current.orderItemId },
      data: { fulfillmentStatus: "INPUT_IN_PROGRESS" },
    });
    await writeDocumentInputAudit(tx, actor, "document_input.draft_saved", current.id, current.organizationId, {
      orderItemId: current.orderItemId,
      statusBefore: current.status,
      statusAfter: saved.status,
      clientRevision: nextRevision,
      dataKeys: Object.keys(input.data as Record<string, unknown>),
    });
    return saved;
  });

  return actor.role === "CLIENT" ? serializeDocumentInputDetailForClient(updated) : serializeDocumentInputDetailForCrm(updated);
}

export async function submitDocumentInput(input: SubmitInput, actor: DocumentInputActor) {
  await assertCanEditDocumentInput(actor, input.documentInputId);
  const prisma = getPrisma();

  const submitted = await prisma.$transaction(async (tx) => {
    const current = await tx.documentInput.findUnique({
      where: { id: input.documentInputId },
      include: { orderItem: true, template: true },
    });
    if (!current) throw new DocumentInputError(404, "DOCUMENT_INPUT_NOT_FOUND", "Nie znaleziono formularza dokumentu.");
    if (!["DRAFT", "NEEDS_CORRECTION"].includes(current.status)) {
      throw new DocumentInputError(403, "INPUT_LOCKED", "Tego formularza nie mozna ponownie wyslac.");
    }

    const updated = await tx.documentInput.update({
      where: { id: current.id },
      data: {
        dataJson: toJson(input.data),
        status: "GENERATION_PENDING",
        validationSummary: { mode: "submit", valid: true, submittedAt: new Date().toISOString() },
        submittedById: actor.id,
        updatedById: actor.id,
        submittedAt: new Date(),
        lockedAt: new Date(),
      },
      include: documentInputInclude,
    });

    await tx.orderItem.update({
      where: { id: current.orderItemId },
      data: { fulfillmentStatus: "GENERATION_PENDING" },
    });

    const job = await tx.documentGenerationJob.create({
      data: {
        organizationId: current.organizationId,
        templateId: current.templateId,
        documentInputId: current.id,
        inputSnapshot: toJson(input.data),
        status: DocumentGenerationStatus.PENDING,
        createdById: actor.id,
      },
    });

    await writeDocumentInputAudit(tx, actor, "document_input.submitted", current.id, current.organizationId, {
      orderItemId: current.orderItemId,
      statusBefore: current.status,
      statusAfter: updated.status,
      generationJobId: job.id,
      dataKeys: Object.keys(input.data as Record<string, unknown>),
    });
    await writeDocumentInputAudit(tx, actor, "document_input.generation_job_created", job.id, current.organizationId, {
      documentInputId: current.id,
      orderItemId: current.orderItemId,
      jobStatus: job.status,
    });
    return updated;
  });

  return actor.role === "CLIENT" ? serializeDocumentInputDetailForClient(submitted) : serializeDocumentInputDetailForCrm(submitted);
}

export async function listDocumentInputsForClient(actor: DocumentInputActor, params: QueryInput) {
  if (actor.role !== "CLIENT") return listDocumentInputsForCrm(actor, params);
  const prisma = getPrisma();
  const profiles = await prisma.clientProfile.findMany({ where: { userId: actor.id }, select: { organizationId: true } });
  const organizationIds = profiles.map((profile) => profile.organizationId);
  if (organizationIds.length === 0) return { items: [], nextCursor: null };

  const rows = await prisma.documentInput.findMany({
    where: {
      organizationId: { in: organizationIds },
      ...(params.status ? { status: params.status } : {}),
      ...(params.orderItemId ? { orderItemId: params.orderItemId } : {}),
    },
    include: documentInputInclude,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: params.limit + 1,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
  });
  return paginate(rows, params.limit, serializeDocumentInputListItemForClient);
}

export async function listClientDocumentWorkItems(actor: DocumentInputActor) {
  if (actor.role !== "CLIENT") {
    return { inputs: await listDocumentInputsForCrm(actor, { limit: 50 }), availableOrderItems: [] };
  }
  const prisma = getPrisma();
  const profiles = await prisma.clientProfile.findMany({ where: { userId: actor.id }, select: { organizationId: true } });
  const organizationIds = profiles.map((profile) => profile.organizationId);
  if (organizationIds.length === 0) return { inputs: { items: [], nextCursor: null }, availableOrderItems: [] };

  const [inputs, orderItems] = await Promise.all([
    listDocumentInputsForClient(actor, { limit: 50 }),
    prisma.orderItem.findMany({
      where: {
        organizationId: { in: organizationIds },
        templateId: { not: null },
        order: { paymentStatus: "PAID" },
        documentInput: null,
        fulfillmentStatus: { in: ["READY_FOR_INPUT", "NOT_STARTED"] },
      },
      include: {
        order: { select: { id: true, orderNumber: true, paidAt: true, createdAt: true } },
        product: { select: { id: true, name: true, slug: true } },
        template: { select: { id: true, name: true, type: true, version: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 50,
    }),
  ]);

  return {
    inputs,
    availableOrderItems: orderItems.map((item) => ({
      id: item.id,
      name: item.name,
      documentType: item.documentType ?? item.template?.type ?? null,
      fulfillmentStatus: item.fulfillmentStatus,
      order: item.order,
      product: item.product,
      template: item.template,
      createdAt: item.createdAt,
    })),
  };
}

export async function listDocumentInputsForCrm(actor: DocumentInputActor, params: QueryInput) {
  if (!["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY"].includes(actor.role)) {
    throw new DocumentInputError(403, "CRM_FORBIDDEN", "Ta rola nie ma dostepu do CRM.");
  }
  const rows = await getPrisma().documentInput.findMany({
    where: {
      ...(params.status ? { status: params.status } : {}),
      ...(params.orderItemId ? { orderItemId: params.orderItemId } : {}),
      ...(params.organizationId ? { organizationId: params.organizationId } : {}),
      ...(params.documentType ? { documentType: params.documentType } : {}),
    },
    include: documentInputInclude,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: params.limit + 1,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
  });
  return paginate(rows, params.limit, serializeDocumentInputListItemForCrm);
}

export async function getDocumentInputDetail(actor: DocumentInputActor, documentInputId: string) {
  await assertCanReadDocumentInput(actor, documentInputId);
  const input = await getPrisma().documentInput.findUnique({
    where: { id: documentInputId },
    include: documentInputInclude,
  });
  if (!input) throw new DocumentInputError(404, "DOCUMENT_INPUT_NOT_FOUND", "Nie znaleziono formularza dokumentu.");

  if (actor.role === "CLIENT") return serializeDocumentInputDetailForClient(input);

  const timeline = await getPrisma().auditLog.findMany({
    where: { OR: [{ entityType: "DocumentInput", entityId: documentInputId }, { metadata: { path: ["documentInputId"], equals: documentInputId } }] },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return serializeDocumentInputDetailForCrm(input, timeline);
}

export async function markDocumentInputNeedsCorrection(actor: DocumentInputActor, documentInputId: string, input: NeedsCorrectionInput) {
  assertCanReviewDocumentInputInCrm(actor);
  await assertCanReadDocumentInput(actor, documentInputId);

  const updated = await getPrisma().$transaction(async (tx) => {
    const current = await tx.documentInput.findUnique({ where: { id: documentInputId }, select: { status: true, organizationId: true, orderItemId: true } });
    if (!current) throw new DocumentInputError(404, "DOCUMENT_INPUT_NOT_FOUND", "Nie znaleziono formularza dokumentu.");
    const saved = await tx.documentInput.update({
      where: { id: documentInputId },
      data: {
        status: "NEEDS_CORRECTION",
        lockedAt: null,
        updatedById: actor.id,
        validationSummary: { mode: "staff_review", needsCorrectionReason: input.reason },
      },
      include: documentInputInclude,
    });
    await tx.orderItem.update({ where: { id: current.orderItemId }, data: { fulfillmentStatus: "INPUT_IN_PROGRESS" } });
    await writeDocumentInputAudit(tx, actor, "document_input.needs_correction", documentInputId, current.organizationId, {
      orderItemId: current.orderItemId,
      statusBefore: current.status,
      statusAfter: saved.status,
      reasonLength: input.reason.length,
    });
    return saved;
  });

  return serializeDocumentInputDetailForCrm(updated);
}

export async function lockDocumentInput(actor: DocumentInputActor, documentInputId: string) {
  assertCanMutateDocumentInputInCrm(actor);
  await assertCanReadDocumentInput(actor, documentInputId);

  const updated = await getPrisma().$transaction(async (tx) => {
    const current = await tx.documentInput.findUnique({ where: { id: documentInputId }, select: { status: true, organizationId: true, orderItemId: true } });
    if (!current) throw new DocumentInputError(404, "DOCUMENT_INPUT_NOT_FOUND", "Nie znaleziono formularza dokumentu.");
    const saved = await tx.documentInput.update({
      where: { id: documentInputId },
      data: { status: "LOCKED", lockedAt: new Date(), updatedById: actor.id },
      include: documentInputInclude,
    });
    await writeDocumentInputAudit(tx, actor, "document_input.locked", documentInputId, current.organizationId, {
      orderItemId: current.orderItemId,
      statusBefore: current.status,
      statusAfter: saved.status,
    });
    return saved;
  });

  return serializeDocumentInputDetailForCrm(updated);
}

async function ensureInputId(orderItemId: string, actor: DocumentInputActor) {
  const existing = await getPrisma().documentInput.findUnique({ where: { orderItemId }, select: { id: true } });
  if (existing) return existing.id;
  const created = await createDocumentInputForOrderItem(orderItemId, actor);
  return created.id;
}

function paginate<T, R>(rows: T[], limit: number, serialize: (row: T) => R) {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  return {
    items: items.map(serialize),
    nextCursor: hasMore ? (items.at(-1) as { id?: string } | undefined)?.id ?? null : null,
  };
}

async function writeDocumentInputAudit(
  tx: Prisma.TransactionClient,
  actor: DocumentInputActor,
  action: string,
  entityId: string,
  organizationId: string,
  metadata: Record<string, unknown>,
) {
  await tx.auditLog.create({
    data: {
      userId: actor.id,
      organizationId,
      action,
      entityType: action.includes("generation_job") ? "DocumentGenerationJob" : "DocumentInput",
      entityId,
      metadata: toJson(metadata),
    },
  });
}

function toJson(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
