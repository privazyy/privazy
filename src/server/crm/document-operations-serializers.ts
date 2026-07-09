import "server-only";

import type { Prisma } from "@prisma/client";

type DocumentJobListRecord = Prisma.DocumentGenerationJobGetPayload<{
  include: {
    organization: { select: { id: true; name: true } };
    template: { select: { id: true; name: true; type: true } };
    createdBy: { select: { id: true; name: true; email: true } };
    order: { select: { id: true; orderNumber: true } };
    orderItem: { select: { id: true; name: true } };
    generatedDocument: { select: { id: true; status: true; reviewStatus: true } };
  };
}>;

type GeneratedDocumentListRecord = Prisma.GeneratedDocumentGetPayload<{
  include: {
    organization: { select: { id: true; name: true } };
    template: { select: { id: true; name: true; type: true } };
    order: { select: { id: true; orderNumber: true } };
    orderItem: { select: { id: true; name: true } };
    reviewedBy: { select: { id: true; name: true; email: true } };
    files: true;
    downloads: true;
  };
}>;

type DownloadRecord = Prisma.DocumentDownloadGetPayload<{
  include: {
    downloadedBy: { select: { id: true; name: true; email: true } };
    file: { select: { id: true; format: true; fileName: true } };
  };
}>;

export function serializeCrmDocumentJobListItem(job: DocumentJobListRecord) {
  return {
    id: job.id,
    organization: job.organization,
    template: job.template,
    order: job.order,
    orderItem: job.orderItem,
    status: job.status,
    retryCount: job.retryCount,
    safeErrorSummary: safeSummary(job.errorMessage),
    createdBy: job.createdBy,
    generatedDocument: job.generatedDocument,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt,
  };
}

export function serializeCrmDocumentJobDetail(job: DocumentJobListRecord) {
  return serializeCrmDocumentJobListItem(job);
}

export function serializeCrmGeneratedDocumentListItem(document: GeneratedDocumentListRecord) {
  return {
    id: document.id,
    organization: document.organization,
    template: document.template,
    order: document.order,
    orderItem: document.orderItem,
    type: document.type,
    status: document.status,
    reviewStatus: document.reviewStatus,
    reviewedBy: document.reviewedBy,
    reviewedAt: document.reviewedAt,
    reviewNote: document.reviewNote,
    fileCount: document.files.length,
    downloadCount: document.downloads.length,
    files: document.files.map(serializeCrmGeneratedDocumentFile),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function serializeCrmGeneratedDocumentDetail(document: GeneratedDocumentListRecord) {
  return serializeCrmGeneratedDocumentListItem(document);
}

export function serializeCrmGeneratedDocumentFile(file: Prisma.GeneratedDocumentFileGetPayload<object>) {
  return {
    id: file.id,
    format: file.format,
    fileName: file.fileName,
    contentType: file.contentType,
    sizeBytes: file.sizeBytes,
    secureDownloadAvailable: true,
    createdAt: file.createdAt,
  };
}

export function serializeCrmDocumentDownloadListItem(download: DownloadRecord) {
  return {
    id: download.id,
    organizationId: download.organizationId,
    generatedDocumentId: download.generatedDocumentId,
    file: download.file,
    channel: download.channel,
    downloadedBy: download.downloadedBy,
    ipAddress: download.ipAddress,
    userAgent: download.userAgent,
    createdAt: download.createdAt,
  };
}

function safeSummary(value: string | null) {
  if (!value) return null;
  return value.slice(0, 240);
}
