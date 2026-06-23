import "server-only";
import { DocumentGenerationStatus, GeneratedDocumentStatus, Prisma } from "@prisma/client";
import { getPrisma } from "@/server/db/prisma";
import { renderDocxTemplate } from "@/server/documents/docx";
import type { DocumentGenerationInput } from "@/server/documents/schemas";
import { createStorageKey } from "@/server/storage/keys";
import { downloadPrivateObject, uploadPrivateObject } from "@/server/storage/r2";

export async function requestDocumentGeneration(input: DocumentGenerationInput) {
  const prisma = getPrisma();

  return prisma.documentGenerationJob.create({
    data: {
      organizationId: input.organizationId,
      templateId: input.templateId,
      createdById: input.createdById,
      inputSnapshot: input.data as Prisma.InputJsonValue,
      status: DocumentGenerationStatus.PENDING,
    },
  });
}

export async function generateDocumentFromJob(jobId: string) {
  const prisma = getPrisma();

  const job = await prisma.documentGenerationJob.update({
    where: { id: jobId },
    data: { status: DocumentGenerationStatus.PROCESSING, errorMessage: null },
    include: { template: true },
  });

  try {
    const templateBuffer = await downloadPrivateObject(job.template.fileKey);
    const inputSnapshot = job.inputSnapshot as Record<string, unknown>;
    const docxBuffer = renderDocxTemplate(templateBuffer, inputSnapshot);
    const docxFileKey = createStorageKey("generated-documents", [
      job.organizationId,
      job.id,
      `${job.template.type.toLowerCase()}-v${job.template.version}.docx`,
    ]);

    await uploadPrivateObject({
      key: docxFileKey,
      body: docxBuffer,
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const generatedDocument = await prisma.generatedDocument.create({
      data: {
        organizationId: job.organizationId,
        templateId: job.templateId,
        templateVersion: job.template.version,
        generationJobId: job.id,
        type: job.template.type,
        status: GeneratedDocumentStatus.GENERATED,
        inputSnapshot: inputSnapshot as Prisma.InputJsonValue,
        docxFileKey,
        createdById: job.createdById,
      },
    });

    await prisma.documentGenerationJob.update({
      where: { id: job.id },
      data: {
        status: DocumentGenerationStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: job.createdById,
        organizationId: job.organizationId,
        action: "document.generated",
        entityType: "GeneratedDocument",
        entityId: generatedDocument.id,
        metadata: {
          generationJobId: job.id,
          templateId: job.templateId,
          docxFileKey,
        },
      },
    });

    return generatedDocument;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown document generation error";

    await prisma.documentGenerationJob.update({
      where: { id: job.id },
      data: {
        status: DocumentGenerationStatus.FAILED,
        errorMessage: message,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: job.createdById,
        organizationId: job.organizationId,
        action: "document.generation_failed",
        entityType: "DocumentGenerationJob",
        entityId: job.id,
        metadata: { errorMessage: message },
      },
    });

    throw error;
  }
}
