import "server-only";

const MAX_ERROR_LENGTH = 240;

interface DocumentTemplateRecord {
  id: string;
  name: string;
  status: string;
  type: string;
  version: number;
}

interface GeneratedDocumentRecord {
  createdAt: Date;
  id: string;
  organizationId: string;
  status: string;
  templateId: string;
  templateVersion: number;
  type: string;
}

interface DocumentJobRecord {
  completedAt: Date | null;
  createdAt: Date;
  errorMessage: string | null;
  generatedDocument: GeneratedDocumentRecord | null;
  id: string;
  organization: {
    id: string;
    name: string;
  };
  organizationId: string;
  status: string;
  template: DocumentTemplateRecord;
  templateId: string;
}

export function serializeDocumentJobForCrm(job: DocumentJobRecord) {
  return {
    completedAt: job.completedAt,
    createdAt: job.createdAt,
    errorMessage: truncateError(job.errorMessage),
    generatedDocument: job.generatedDocument
      ? serializeGeneratedDocumentForCrm(job.generatedDocument)
      : null,
    id: job.id,
    organization: job.organization,
    organizationId: job.organizationId,
    status: job.status,
    template: serializeDocumentTemplateForCrm(job.template),
    templateId: job.templateId,
  };
}

export function serializeDocumentJobForClient(job: DocumentJobRecord) {
  return {
    completedAt: job.completedAt,
    createdAt: job.createdAt,
    generatedDocument: job.generatedDocument
      ? serializeGeneratedDocumentForClient(job.generatedDocument)
      : null,
    id: job.id,
    organizationId: job.organizationId,
    status: job.status,
    template: serializeDocumentTemplateForClient(job.template),
    templateId: job.templateId,
  };
}

export function serializeGeneratedDocumentForCrm(document: GeneratedDocumentRecord) {
  return {
    createdAt: document.createdAt,
    id: document.id,
    organizationId: document.organizationId,
    status: document.status,
    templateId: document.templateId,
    templateVersion: document.templateVersion,
    type: document.type,
  };
}

export function serializeGeneratedDocumentForClient(document: GeneratedDocumentRecord) {
  return {
    createdAt: document.createdAt,
    id: document.id,
    status: document.status,
    templateVersion: document.templateVersion,
    type: document.type,
  };
}

export function serializeDocumentFileForClient(document: GeneratedDocumentRecord) {
  return {
    documentId: document.id,
    status: document.status,
    type: document.type,
  };
}

export function serializeDocumentTemplateForCrm(template: DocumentTemplateRecord) {
  return {
    id: template.id,
    name: template.name,
    status: template.status,
    type: template.type,
    version: template.version,
  };
}

export function serializeDocumentTemplateForClient(template: DocumentTemplateRecord) {
  return {
    id: template.id,
    name: template.name,
    type: template.type,
    version: template.version,
  };
}

function truncateError(errorMessage: string | null) {
  if (!errorMessage) {
    return null;
  }

  return errorMessage.length > MAX_ERROR_LENGTH
    ? `${errorMessage.slice(0, MAX_ERROR_LENGTH)}...`
    : errorMessage;
}
