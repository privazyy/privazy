import "server-only";

import { Prisma } from "@prisma/client";
import type { z } from "zod";

import type { CrmActor } from "@/server/crm/access";
import { writeCrmAudit } from "@/server/crm/audit-service";
import {
  assertCanReadDocumentOperations,
  assertCanRetryDocumentJob,
  assertCanReviewGeneratedDocument,
} from "@/server/crm/document-operations-permissions";
import type {
  documentJobListQuerySchema,
  documentReviewSchema,
  generatedDocumentListQuerySchema,
} from "@/server/crm/order-schemas";
import {
  serializeCrmDocumentDownloadListItem,
  serializeCrmDocumentJobDetail,
  serializeCrmDocumentJobListItem,
  serializeCrmGeneratedDocumentDetail,
  serializeCrmGeneratedDocumentListItem,
} from "@/server/crm/document-operations-serializers";
import { CrmServiceError } from "@/server/crm/errors";
import { getPrisma } from "@/server/db/prisma";

type DocumentJobListInput = z.infer<typeof documentJobListQuerySchema>;
type GeneratedDocumentListInput = z.infer<typeof generatedDocumentListQuerySchema>;
type DocumentReviewInput = z.infer<typeof documentReviewSchema>;

const jobInclude = {
  organization: { select: { id: true, name: true } },
  template: { select: { id: true, name: true, type: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  order: { select: { id: true, orderNumber: true } },
  orderItem: { select: { id: true, name: true } },
  generatedDocument: { select: { id: true, status: true, reviewStatus: true } },
} satisfies Prisma.DocumentGenerationJobInclude;

const generatedInclude = {
  organization: { select: { id: true, name: true } },
  template: { select: { id: true, name: true, type: true } },
  order: { select: { id: true, orderNumber: true } },
  orderItem: { select: { id: true, name: true } },
  reviewedBy: { select: { id: true, name: true, email: true } },
  files: true,
  downloads: true,
} satisfies Prisma.GeneratedDocumentInclude;

const downloadInclude = {
  downloadedBy: { select: { id: true, name: true, email: true } },
  file: { select: { id: true, format: true, fileName: true } },
} satisfies Prisma.DocumentDownloadInclude;

export async function listCrmDocumentJobs(input: DocumentJobListInput, actor: CrmActor) {
  assertCanReadDocumentOperations(actor);
  const rows = await getPrisma().documentGenerationJob.findMany({
    where: {
      ...(input.status ? { status: input.status } : {}),
      ...(input.organizationId ? { organizationId: input.organizationId } : {}),
      ...(input.orderId ? { orderId: input.orderId } : {}),
    },
    include: jobInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  const items = rows.slice(0, input.limit);
  return {
    items: items.map(serializeCrmDocumentJobListItem),
    nextCursor: rows.length > input.limit ? items.at(-1)?.id ?? null : null,
  };
}

export async function getCrmDocumentJob(jobId: string, actor: CrmActor) {
  assertCanReadDocumentOperations(actor);
  const job = await getPrisma().documentGenerationJob.findUnique({ where: { id: jobId }, include: jobInclude });
  if (!job) throw new CrmServiceError(404, "DOCUMENT_JOB_NOT_FOUND", "Nie znaleziono joba dokumentu.");
  return serializeCrmDocumentJobDetail(job);
}

export async function retryDocumentGeneration(jobId: string, actor: CrmActor) {
  assertCanRetryDocumentJob(actor);
  const prisma = getPrisma();
  const job = await prisma.documentGenerationJob.findUnique({ where: { id: jobId }, select: { id: true, organizationId: true, status: true } });
  if (!job) throw new CrmServiceError(404, "DOCUMENT_JOB_NOT_FOUND", "Nie znaleziono joba dokumentu.");

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.documentGenerationJob.update({
      where: { id: jobId },
      data: { status: "PENDING", errorMessage: null, retryCount: { increment: 1 }, completedAt: null },
      include: jobInclude,
    });
    await writeCrmAudit(tx, actor, "crm.document_job.retry", "DocumentGenerationJob", jobId, { beforeStatus: job.status }, job.organizationId);
    return next;
  });
  return serializeCrmDocumentJobDetail(updated);
}

export async function listCrmGeneratedDocuments(input: GeneratedDocumentListInput, actor: CrmActor) {
  assertCanReadDocumentOperations(actor);
  const rows = await getPrisma().generatedDocument.findMany({
    where: {
      ...(input.status ? { status: input.status } : {}),
      ...(input.reviewStatus ? { reviewStatus: input.reviewStatus } : {}),
      ...(input.organizationId ? { organizationId: input.organizationId } : {}),
      ...(input.orderId ? { orderId: input.orderId } : {}),
    },
    include: generatedInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  const items = rows.slice(0, input.limit);
  return {
    items: items.map(serializeCrmGeneratedDocumentListItem),
    nextCursor: rows.length > input.limit ? items.at(-1)?.id ?? null : null,
  };
}

export async function getCrmGeneratedDocument(documentId: string, actor: CrmActor) {
  assertCanReadDocumentOperations(actor);
  const document = await getPrisma().generatedDocument.findUnique({ where: { id: documentId }, include: generatedInclude });
  if (!document) throw new CrmServiceError(404, "DOCUMENT_NOT_FOUND", "Nie znaleziono dokumentu.");
  return serializeCrmGeneratedDocumentDetail(document);
}

export async function markDocumentForReview(documentId: string, input: DocumentReviewInput, actor: CrmActor) {
  assertCanReviewGeneratedDocument(actor);
  return updateReview(documentId, "PENDING", "crm.document.marked_for_review", input, actor);
}

export async function approveDocumentForClient(documentId: string, input: DocumentReviewInput, actor: CrmActor) {
  assertCanReviewGeneratedDocument(actor);
  return updateReview(documentId, "APPROVED", "crm.document.approved_for_client", input, actor);
}

export async function rejectDocumentForClient(documentId: string, input: DocumentReviewInput, actor: CrmActor) {
  assertCanReviewGeneratedDocument(actor);
  return updateReview(documentId, "REJECTED", "crm.document.rejected_for_client", input, actor);
}

export async function getDocumentDownloadsForFile(fileId: string, actor: CrmActor) {
  assertCanReadDocumentOperations(actor);
  const downloads = await getPrisma().documentDownload.findMany({
    where: { fileId },
    include: downloadInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 100,
  });
  return { items: downloads.map(serializeCrmDocumentDownloadListItem) };
}

export async function getDocumentDownloadsForOrganization(organizationId: string, actor: CrmActor) {
  assertCanReadDocumentOperations(actor);
  const downloads = await getPrisma().documentDownload.findMany({
    where: { organizationId },
    include: downloadInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 100,
  });
  return { items: downloads.map(serializeCrmDocumentDownloadListItem) };
}

async function updateReview(
  documentId: string,
  reviewStatus: "PENDING" | "APPROVED" | "REJECTED",
  action: string,
  input: DocumentReviewInput,
  actor: CrmActor,
) {
  const prisma = getPrisma();
  const document = await prisma.generatedDocument.findUnique({ where: { id: documentId }, select: { id: true, organizationId: true } });
  if (!document) throw new CrmServiceError(404, "DOCUMENT_NOT_FOUND", "Nie znaleziono dokumentu.");

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.generatedDocument.update({
      where: { id: documentId },
      data: {
        reviewStatus,
        reviewedById: actor.id,
        reviewedAt: new Date(),
        reviewNote: input.note,
      },
      include: generatedInclude,
    });
    await writeCrmAudit(tx, actor, action, "GeneratedDocument", documentId, { reviewStatus }, document.organizationId);
    return next;
  });
  return serializeCrmGeneratedDocumentDetail(updated);
}
