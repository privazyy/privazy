export type DocumentJobRecord = {
  id: string;
  organizationId: string;
  templateId: string;
  status: string;
  errorMessage?: string | null;
  createdAt?: Date | string;
  completedAt?: Date | string | null;
  generatedDocument?: GeneratedDocumentRecord | null;
  template?: {
    id: string;
    name: string;
    type: string;
    version: number;
    fileKey?: string;
  } | null;
};

export type GeneratedDocumentRecord = {
  id: string;
  organizationId: string;
  templateId: string;
  templateVersion: number;
  generationJobId: string;
  type: string;
  status: string;
  docxFileKey?: string | null;
  pdfFileKey?: string | null;
  zipFileKey?: string | null;
  createdAt?: Date | string;
};

export function serializeDocumentJobForClient(job: DocumentJobRecord) {
  return {
    completedAt: job.completedAt ?? null,
    createdAt: job.createdAt,
    generatedDocument: job.generatedDocument ? serializeGeneratedDocumentForClient(job.generatedDocument) : null,
    id: job.id,
    organizationId: job.organizationId,
    status: job.status,
    template: job.template
      ? {
          id: job.template.id,
          name: job.template.name,
          type: job.template.type,
          version: job.template.version,
        }
      : null,
    templateId: job.templateId,
  };
}

export function serializeGeneratedDocumentForClient(document: GeneratedDocumentRecord) {
  return {
    createdAt: document.createdAt,
    generationJobId: document.generationJobId,
    id: document.id,
    organizationId: document.organizationId,
    status: document.status,
    templateId: document.templateId,
    templateVersion: document.templateVersion,
    type: document.type,
  };
}
