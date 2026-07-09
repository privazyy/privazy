import "server-only";

import type { Prisma } from "@prisma/client";

export const documentInputInclude = {
  organization: { select: { id: true, name: true, email: true } },
  order: { select: { id: true, orderNumber: true, paymentStatus: true, paidAt: true, createdAt: true } },
  orderItem: {
    select: {
      id: true,
      name: true,
      fulfillmentStatus: true,
      documentType: true,
      product: { select: { id: true, name: true, slug: true, kind: true } },
    },
  },
  product: { select: { id: true, name: true, slug: true, kind: true } },
  template: { select: { id: true, name: true, type: true, version: true, status: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  updatedBy: { select: { id: true, name: true, email: true } },
  submittedBy: { select: { id: true, name: true, email: true } },
  generationJobs: {
    select: { id: true, status: true, errorMessage: true, createdAt: true, updatedAt: true, completedAt: true },
    orderBy: { createdAt: "desc" as const },
    take: 5,
  },
} satisfies Prisma.DocumentInputInclude;

export type DocumentInputRecord = Prisma.DocumentInputGetPayload<{ include: typeof documentInputInclude }>;

export type DocumentInputTimelineRecord = Prisma.AuditLogGetPayload<{
  include: { user: { select: { id: true; name: true; email: true } } };
}>;

export function serializeDocumentInputListItemForClient(input: DocumentInputRecord) {
  return {
    id: input.id,
    orderItemId: input.orderItemId,
    status: input.status,
    documentType: input.documentType,
    documentName: input.orderItem.name,
    order: input.order
      ? {
          id: input.order.id,
          orderNumber: input.order.orderNumber,
          paymentStatus: input.order.paymentStatus,
          paidAt: input.order.paidAt,
          createdAt: input.order.createdAt,
        }
      : null,
    product: input.product ?? input.orderItem.product,
    template: {
      id: input.template.id,
      name: input.template.name,
      version: input.template.version,
      type: input.template.type,
    },
    fulfillmentStatus: input.orderItem.fulfillmentStatus,
    submittedAt: input.submittedAt,
    lockedAt: input.lockedAt,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    generationStatus: input.generationJobs[0]?.status ?? null,
  };
}

export function serializeDocumentInputDetailForClient(input: DocumentInputRecord) {
  return {
    ...serializeDocumentInputListItemForClient(input),
    data: input.dataJson,
    validationSummary: input.validationSummary,
    clientRevision: input.clientRevision,
    generationJobs: input.generationJobs.map(serializeJobSummary),
  };
}

export function serializeDocumentInputListItemForCrm(input: DocumentInputRecord) {
  return {
    ...serializeDocumentInputListItemForClient(input),
    organization: input.organization,
    createdBy: input.createdBy,
    updatedBy: input.updatedBy,
    submittedBy: input.submittedBy,
  };
}

export function serializeDocumentInputDetailForCrm(input: DocumentInputRecord, timeline: DocumentInputTimelineRecord[] = []) {
  return {
    ...serializeDocumentInputListItemForCrm(input),
    data: input.dataJson,
    validationSummary: input.validationSummary,
    clientRevision: input.clientRevision,
    generationJobs: input.generationJobs.map(serializeJobSummary),
    timeline: timeline.map(serializeDocumentInputTimelineItem),
  };
}

export function serializeDocumentInputTimelineItem(item: DocumentInputTimelineRecord) {
  return {
    id: item.id,
    action: item.action,
    entityType: item.entityType,
    entityId: item.entityId,
    metadata: item.metadata,
    actor: item.user,
    createdAt: item.createdAt,
  };
}

function serializeJobSummary(job: DocumentInputRecord["generationJobs"][number]) {
  return {
    id: job.id,
    status: job.status,
    hasSafeError: Boolean(job.errorMessage),
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt,
  };
}
