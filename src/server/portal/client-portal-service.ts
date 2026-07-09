import "server-only";

import { Prisma } from "@prisma/client";
import type { z } from "zod";

import { getPrisma } from "@/server/db/prisma";
import { createPrivateDownloadUrl } from "@/server/storage/r2";
import { ClientPortalError } from "@/server/portal/client-portal-errors";
import {
  assertCanReadClientDocumentInput,
  assertCanReadClientOrder,
  assertCanReadGeneratedDocument,
  assertHasClientOrganization,
  type ClientPortalActor,
} from "@/server/portal/client-portal-permissions";
import type {
  portalDocumentQuerySchema,
  portalGeneratedDocumentQuerySchema,
  portalListQuerySchema,
  portalOrganizationUpdateSchema,
} from "@/server/portal/client-portal-schemas";
import {
  portalDocumentInputInclude,
  portalGeneratedDocumentInclude,
  portalOrderDetailInclude,
  portalOrderListInclude,
  portalOrganizationInclude,
  serializePortalDocumentInput,
  serializePortalGeneratedDocument,
  serializePortalOrderDetail,
  serializePortalOrderListItem,
  serializePortalOrganization,
} from "@/server/portal/client-portal-serializers";

type ListQuery = z.infer<typeof portalListQuerySchema>;
type DocumentQuery = z.infer<typeof portalDocumentQuerySchema>;
type GeneratedDocumentQuery = z.infer<typeof portalGeneratedDocumentQuerySchema>;
type OrganizationUpdate = z.infer<typeof portalOrganizationUpdateSchema>;

export async function getClientDashboard(actor: ClientPortalActor) {
  assertHasClientOrganization(actor);
  const prisma = getPrisma();
  const orgWhere = { organizationId: { in: actor.organizationIds } };

  const [orders, inputs, generatedDocuments, organization] = await Promise.all([
    prisma.portalOrder.findMany({
      where: orgWhere,
      include: portalOrderListInclude,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 5,
    }),
    prisma.portalDocumentInput.findMany({
      where: orgWhere,
      include: portalDocumentInputInclude,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      take: 5,
    }),
    prisma.generatedDocument.findMany({
      where: { organizationId: { in: actor.organizationIds }, status: { in: ["GENERATED", "DELIVERED"] } },
      include: portalGeneratedDocumentInclude,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      take: 5,
    }),
    prisma.organization.findFirst({
      where: { id: { in: actor.organizationIds } },
      include: portalOrganizationInclude,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const allInputStatuses = await prisma.portalDocumentInput.groupBy({
    by: ["status"],
    where: orgWhere,
    _count: { status: true },
  });

  return {
    organization: organization ? serializePortalOrganization(organization) : null,
    kpis: {
      activeOrders: orders.filter((order) => !["COMPLETED", "CANCELLED"].includes(order.status)).length,
      inputsToComplete: allInputStatuses
        .filter((row) => ["DRAFT", "NEEDS_CORRECTION"].includes(row.status))
        .reduce((sum, row) => sum + row._count.status, 0),
      documentsGenerating: allInputStatuses
        .filter((row) => row.status === "GENERATION_PENDING")
        .reduce((sum, row) => sum + row._count.status, 0),
      documentsReady: generatedDocuments.length,
    },
    recentOrders: orders.map(serializePortalOrderListItem),
    recentDocumentInputs: inputs.map(serializePortalDocumentInput),
    recentGeneratedDocuments: generatedDocuments.map(serializePortalGeneratedDocument),
    alerts: buildClientAlerts(inputs, generatedDocuments.length),
  };
}

export async function listClientOrders(actor: ClientPortalActor, params: ListQuery) {
  assertHasClientOrganization(actor);
  const rows = await getPrisma().portalOrder.findMany({
    where: { organizationId: { in: actor.organizationIds } },
    include: portalOrderListInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: params.limit + 1,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
  });
  return paginate(rows, params.limit, serializePortalOrderListItem);
}

export async function getClientOrder(actor: ClientPortalActor, orderId: string) {
  await assertCanReadClientOrder(actor, orderId);
  const order = await getPrisma().portalOrder.findUnique({ where: { id: orderId }, include: portalOrderDetailInclude });
  if (!order) throw new ClientPortalError(404, "ORDER_NOT_FOUND", "Nie znaleziono zamowienia.");
  return serializePortalOrderDetail(order);
}

export async function listClientDocumentInputs(actor: ClientPortalActor, params: DocumentQuery) {
  assertHasClientOrganization(actor);
  const rows = await getPrisma().portalDocumentInput.findMany({
    where: {
      organizationId: { in: actor.organizationIds },
      ...(params.status ? { status: params.status } : {}),
    },
    include: portalDocumentInputInclude,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: params.limit + 1,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
  });
  return paginate(rows, params.limit, serializePortalDocumentInput);
}

export async function getClientDocumentInput(actor: ClientPortalActor, inputId: string) {
  await assertCanReadClientDocumentInput(actor, inputId);
  const input = await getPrisma().portalDocumentInput.findUnique({
    where: { id: inputId },
    include: portalDocumentInputInclude,
  });
  if (!input) throw new ClientPortalError(404, "DOCUMENT_INPUT_NOT_FOUND", "Nie znaleziono formularza dokumentu.");
  return serializePortalDocumentInput(input);
}

export async function listClientGeneratedDocuments(actor: ClientPortalActor, params: GeneratedDocumentQuery) {
  assertHasClientOrganization(actor);
  const rows = await getPrisma().generatedDocument.findMany({
    where: {
      organizationId: { in: actor.organizationIds },
      ...(params.status ? { status: params.status } : {}),
    },
    include: portalGeneratedDocumentInclude,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: params.limit + 1,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
  });
  return paginate(rows, params.limit, serializePortalGeneratedDocument);
}

export async function getClientOrganization(actor: ClientPortalActor) {
  assertHasClientOrganization(actor);
  const organization = await getPrisma().organization.findFirst({
    where: { id: { in: actor.organizationIds } },
    include: portalOrganizationInclude,
    orderBy: { updatedAt: "desc" },
  });
  if (!organization) throw new ClientPortalError(404, "ORGANIZATION_NOT_FOUND", "Nie znaleziono organizacji klienta.");
  return serializePortalOrganization(organization);
}

export async function updateClientOrganizationProfile(actor: ClientPortalActor, input: OrganizationUpdate) {
  assertHasClientOrganization(actor);
  const organizationId = actor.organizationIds[0];
  const updated = await getPrisma().$transaction(async (tx) => {
    const organization = await tx.organization.update({
      where: { id: organizationId },
      data: input,
      include: portalOrganizationInclude,
    });
    await tx.auditLog.create({
      data: {
        userId: actor.id,
        organizationId,
        action: "client_portal.organization.updated",
        entityType: "Organization",
        entityId: organizationId,
        metadata: toJson({ changedFields: Object.keys(input) }),
      },
    });
    return organization;
  });
  return serializePortalOrganization(updated);
}

export async function createClientGeneratedDocumentDownloadUrl(
  actor: ClientPortalActor,
  documentId: string,
  fileType: "docx" | "pdf" | "zip",
) {
  await assertCanReadGeneratedDocument(actor, documentId);
  const prisma = getPrisma();
  const document = await prisma.generatedDocument.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      organizationId: true,
      status: true,
      docxFileKey: true,
      pdfFileKey: true,
      zipFileKey: true,
    },
  });
  if (!document) throw new ClientPortalError(404, "DOCUMENT_NOT_FOUND", "Nie znaleziono dokumentu.");
  if (!["GENERATED", "DELIVERED"].includes(document.status)) {
    throw new ClientPortalError(403, "DOCUMENT_NOT_READY", "Dokument nie jest jeszcze gotowy do pobrania.");
  }

  const key = fileType === "pdf" ? document.pdfFileKey : fileType === "zip" ? document.zipFileKey : document.docxFileKey;
  if (!key) throw new ClientPortalError(404, "FILE_NOT_AVAILABLE", "Wybrany plik nie jest dostepny.");

  const url = await createPrivateDownloadUrl(key, 180);
  await prisma.$transaction(async (tx) => {
    await tx.portalDocumentDownload.create({
      data: {
        organizationId: document.organizationId,
        generatedDocumentId: document.id,
        downloadedById: actor.id,
        fileType,
      },
    });
    await tx.auditLog.create({
      data: {
        userId: actor.id,
        organizationId: document.organizationId,
        action: "client_portal.document.downloaded",
        entityType: "GeneratedDocument",
        entityId: document.id,
        metadata: toJson({ fileType, channel: "CLIENT_PORTAL" }),
      },
    });
  });

  return { url };
}

function buildClientAlerts(inputs: Array<{ id: string; status: string; orderItem: { name: string } }>, readyDocuments: number) {
  const correction = inputs.find((input) => input.status === "NEEDS_CORRECTION");
  const draft = inputs.find((input) => input.status === "DRAFT");
  return [
    ...(correction
      ? [{ tone: "warning" as const, title: "Formularz wymaga poprawy", subtitle: correction.orderItem.name, href: `/platforma/dokumenty/${correction.id}` }]
      : []),
    ...(draft
      ? [{ tone: "brand" as const, title: "Dokoncz formularz dokumentu", subtitle: draft.orderItem.name, href: `/platforma/dokumenty/${draft.id}` }]
      : []),
    ...(readyDocuments > 0
      ? [{ tone: "success" as const, title: "Dokumenty gotowe do pobrania", subtitle: `${readyDocuments} plikow`, href: "/platforma/pliki" }]
      : []),
  ];
}

function paginate<T extends { id: string }, R>(rows: T[], limit: number, serialize: (row: T) => R) {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  return {
    items: items.map(serialize),
    nextCursor: hasMore ? items.at(-1)?.id ?? null : null,
  };
}

function toJson(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
