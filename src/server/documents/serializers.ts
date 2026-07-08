import "server-only";

import type { GeneratedDocument, GeneratedDocumentStatus } from "@prisma/client";

export const documentFileVariants = ["docx", "pdf", "zip"] as const;

export type DocumentFileVariant = (typeof documentFileVariants)[number];

type DocumentFileSource = Pick<
  GeneratedDocument,
  "createdAt" | "docxFileKey" | "id" | "pdfFileKey" | "status" | "templateVersion" | "type" | "zipFileKey"
> & {
  template?: {
    name: string;
  };
};

export type DownloadableFile = {
  createdAt: string;
  documentId: string;
  downloadUrlEndpoint: string;
  fileId: string;
  fileName: string;
  mimeType: string;
  size: null;
  status: GeneratedDocumentStatus;
  variant: DocumentFileVariant;
};

export function buildDocumentFileId(documentId: string, variant: DocumentFileVariant) {
  return `${documentId}.${variant}`;
}

export function parseDocumentFileId(fileId: string) {
  const match = /^([a-z0-9]+)\.(docx|pdf|zip)$/i.exec(fileId);
  if (!match) return null;

  return {
    documentId: match[1],
    variant: match[2].toLowerCase() as DocumentFileVariant,
  };
}

export function getDocumentFileKey(document: DocumentFileSource, variant: DocumentFileVariant) {
  if (variant === "docx") return document.docxFileKey;
  if (variant === "pdf") return document.pdfFileKey;
  return document.zipFileKey;
}

export function serializeDownloadableFileForClient(document: DocumentFileSource, variant: DocumentFileVariant): DownloadableFile | null {
  return serializeDownloadableFile(document, variant);
}

export function serializeDownloadableFileForCrm(document: DocumentFileSource, variant: DocumentFileVariant): DownloadableFile | null {
  return serializeDownloadableFile(document, variant);
}

export function serializeDownloadableFilesForClient(document: DocumentFileSource) {
  return documentFileVariants
    .map((variant) => serializeDownloadableFileForClient(document, variant))
    .filter((file): file is DownloadableFile => Boolean(file));
}

export function serializeDownloadableFilesForCrm(document: DocumentFileSource) {
  return documentFileVariants
    .map((variant) => serializeDownloadableFileForCrm(document, variant))
    .filter((file): file is DownloadableFile => Boolean(file));
}

function serializeDownloadableFile(document: DocumentFileSource, variant: DocumentFileVariant): DownloadableFile | null {
  if (!getDocumentFileKey(document, variant)) return null;

  const fileId = buildDocumentFileId(document.id, variant);

  return {
    createdAt: document.createdAt.toISOString(),
    documentId: document.id,
    downloadUrlEndpoint: `/api/documents/files/${encodeURIComponent(fileId)}/download`,
    fileId,
    fileName: buildDocumentFileName(document, variant),
    mimeType: mimeTypeForVariant(variant),
    size: null,
    status: document.status,
    variant,
  };
}

function buildDocumentFileName(document: DocumentFileSource, variant: DocumentFileVariant) {
  const templateName = document.template?.name ?? document.type.toLowerCase();
  const safeName = templateName
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return `${safeName || document.type.toLowerCase()}-v${document.templateVersion}.${variant}`;
}

function mimeTypeForVariant(variant: DocumentFileVariant) {
  if (variant === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (variant === "pdf") return "application/pdf";
  return "application/zip";
}
