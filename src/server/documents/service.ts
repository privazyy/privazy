import "server-only";

import {
  DocumentGenerationStatus,
  DocumentInputStatus,
  DocumentReviewStatus,
  DocumentTemplateSource,
  DocumentType,
  GeneratedDocumentStatus,
  GeneratedFileType,
  OrderItemStatus,
  Prisma,
  UserRole,
} from "@prisma/client";
import { mapPrivacyPolicyInputToTemplate } from "@/lib/document-forms/privacy-policy/map-to-template";
import {
  privacyPolicyDraftSchema,
  privacyPolicyFormSchema,
  type PrivacyPolicyFormData,
} from "@/lib/document-forms/privacy-policy/schema";
import {
  assertCanEditDocumentInput,
  canRetryDocuments,
  DocumentAccessError,
  assertPaidOrInternal,
  auditDocumentEvent,
  getAccessibleOrderItem,
  requireDocumentUser,
} from "@/server/documents/acl";
import { DocxRenderer } from "@/server/documents/renderers";
import { getPrisma } from "@/server/db/prisma";
import { downloadPrivateObject, uploadPrivateObject } from "@/server/storage/r2";
import { createGeneratedDocumentStorageKey, safeStorageFileName } from "@/server/storage/keys";
import { logDocumentNotification } from "@/server/email/resend";

export async function savePrivacyPolicyDraft(input: {
  orderItemId: string;
  data: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const user = await requireDocumentUser();
  assertCanEditDocumentInput(user.role);

  const parsed = privacyPolicyDraftSchema.safeParse(input.data);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const orderItem = await getAccessibleOrderItem(input.orderItemId, user);
  assertDocumentOrderItem(orderItem.kind, orderItem.documentType);
  assertPaidOrInternal(orderItem.order.status, user.role);

  const documentInput = await upsertDocumentInput({
    data: parsed.data,
    orderItemId: orderItem.id,
    organizationId: orderItem.organizationId,
    status: DocumentInputStatus.DRAFT,
    userId: user.id,
  });

  await auditDocumentEvent({
    userId: user.id,
    organizationId: orderItem.organizationId,
    action: "document_input.draft_saved",
    entityType: "DocumentInput",
    entityId: documentInput.id,
    metadata: { orderItemId: orderItem.id, documentType: DocumentType.PRIVACY_POLICY },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return { ok: true as const, documentInput };
}

export async function submitPrivacyPolicyInput(input: {
  orderItemId: string;
  data: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const user = await requireDocumentUser();
  assertCanEditDocumentInput(user.role);

  const parsed = privacyPolicyFormSchema.safeParse(input.data);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const orderItem = await getAccessibleOrderItem(input.orderItemId, user);
  assertDocumentOrderItem(orderItem.kind, orderItem.documentType);
  assertPaidOrInternal(orderItem.order.status, user.role);

  const template = await resolvePrivacyPolicyTemplate(user.role);
  const reviewRequired = Boolean(orderItem.product?.requiresReview ?? template.requiresReview);

  const documentInput = await upsertDocumentInput({
    data: parsed.data,
    orderItemId: orderItem.id,
    organizationId: orderItem.organizationId,
    status: DocumentInputStatus.GENERATING,
    submittedAt: new Date(),
    templateId: template.id,
    userId: user.id,
  });

  await getPrisma().orderItem.update({
    where: { id: orderItem.id },
    data: { status: OrderItemStatus.GENERATING },
  });

  const job = await getPrisma().documentGenerationJob.create({
    data: {
      organizationId: orderItem.organizationId,
      templateId: template.id,
      documentInputId: documentInput.id,
      orderItemId: orderItem.id,
      status: DocumentGenerationStatus.PENDING,
      inputSnapshot: parsed.data as Prisma.InputJsonValue,
      createdById: user.id,
    },
  });

  await auditDocumentEvent({
    userId: user.id,
    organizationId: orderItem.organizationId,
    action: "document_input.submitted",
    entityType: "DocumentInput",
    entityId: documentInput.id,
    metadata: {
      jobId: job.id,
      orderItemId: orderItem.id,
      reviewRequired,
      documentType: DocumentType.PRIVACY_POLICY,
    },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  await logDocumentNotification({
    event: "document.generating",
    organizationId: orderItem.organizationId,
    orderItemId: orderItem.id,
    userId: user.id,
  });

  return { ok: true as const, documentInput, job };
}

export async function generateDocumentFromJob(jobId: string) {
  const prisma = getPrisma();

  const job = await prisma.documentGenerationJob.findUnique({
    where: { id: jobId },
    include: {
      documentInput: true,
      orderItem: {
        include: {
          order: true,
          product: true,
        },
      },
      template: true,
    },
  });

  if (!job || !job.documentInput || !job.orderItem) {
    throw new Error("Document generation job is incomplete.");
  }

  if (job.status === DocumentGenerationStatus.COMPLETED) {
    return prisma.generatedDocument.findUniqueOrThrow({ where: { generationJobId: job.id } });
  }

  await prisma.documentGenerationJob.update({
    where: { id: job.id },
    data: { status: DocumentGenerationStatus.PROCESSING, errorMessage: null, safeErrorMessage: null },
  });

  try {
    const parsed = privacyPolicyFormSchema.parse(job.inputSnapshot) as PrivacyPolicyFormData;
    const template = await resolvePrivacyPolicyTemplate(UserRole.OPERATOR, job.templateId ?? undefined);
    const templateBuffer =
      template.source === DocumentTemplateSource.R2 && template.fileKey
        ? await downloadPrivateObject(template.fileKey)
        : undefined;

    if (template.isSample && process.env.NODE_ENV === "production") {
      throw new Error("Production generation requires a reviewed R2 DOCX template.");
    }

    const variables = mapPrivacyPolicyInputToTemplate(parsed);
    const reviewRequired = Boolean(job.orderItem.product?.requiresReview ?? template.requiresReview);
    const generatedDocument = await prisma.generatedDocument.create({
      data: {
        organizationId: job.organizationId,
        orderItemId: job.orderItemId,
        documentInputId: job.documentInputId,
        templateId: template.id,
        templateVersion: template.version,
        generationJobId: job.id,
        type: DocumentType.PRIVACY_POLICY,
        status: GeneratedDocumentStatus.PROCESSING,
        reviewStatus: reviewRequired ? DocumentReviewStatus.REQUIRED : DocumentReviewStatus.NOT_REQUIRED,
        inputSnapshot: parsed as Prisma.InputJsonValue,
        createdById: job.createdById,
      },
    });

    const renderer = new DocxRenderer();
    const rendered = await renderer.render({ templateBuffer, variables });
    const fileName = `${safeStorageFileName("polityka-prywatnosci-rodo")}-v${template.version}.${rendered.extension}`;
    const fileKey = createGeneratedDocumentStorageKey({
      organizationId: job.organizationId,
      orderId: job.orderItem.orderId,
      orderItemId: job.orderItem.id,
      generatedDocumentId: generatedDocument.id,
      fileType: GeneratedFileType.DOCX,
      fileName,
    });

    await uploadPrivateObject({
      key: fileKey,
      body: rendered.body,
      contentType: rendered.contentType,
    });

    const readyStatus = reviewRequired ? GeneratedDocumentStatus.REVIEW_REQUIRED : GeneratedDocumentStatus.READY;
    const inputStatus = reviewRequired ? DocumentInputStatus.REVIEW_REQUIRED : DocumentInputStatus.READY;
    const itemStatus = reviewRequired ? OrderItemStatus.REVIEW_REQUIRED : OrderItemStatus.READY;

    const [updatedDocument] = await prisma.$transaction([
      prisma.generatedDocument.update({
        where: { id: generatedDocument.id },
        data: {
          status: readyStatus,
          docxFileKey: fileKey,
          files: {
            create: {
              organizationId: job.organizationId,
              type: GeneratedFileType.DOCX,
              fileName,
              fileKey,
              contentType: rendered.contentType,
              byteSize: Buffer.isBuffer(rendered.body) ? rendered.body.byteLength : Buffer.byteLength(rendered.body),
            },
          },
          reviews: reviewRequired
            ? {
                create: {
                  organizationId: job.organizationId,
                  status: DocumentReviewStatus.REQUIRED,
                },
              }
            : undefined,
        },
      }),
      prisma.documentGenerationJob.update({
        where: { id: job.id },
        data: { status: DocumentGenerationStatus.COMPLETED, completedAt: new Date() },
      }),
      prisma.documentInput.update({
        where: { id: job.documentInput.id },
        data: { status: inputStatus },
      }),
      prisma.orderItem.update({
        where: { id: job.orderItem.id },
        data: { status: itemStatus },
      }),
    ]);

    await auditDocumentEvent({
      userId: job.createdById,
      organizationId: job.organizationId,
      action: "document.generated",
      entityType: "GeneratedDocument",
      entityId: updatedDocument.id,
      metadata: {
        generationJobId: job.id,
        orderItemId: job.orderItem.id,
        fileType: GeneratedFileType.DOCX,
        reviewRequired,
      },
    });

    await logDocumentNotification({
      event: reviewRequired ? "document.review_required" : "document.ready",
      organizationId: job.organizationId,
      orderItemId: job.orderItem.id,
      generatedDocumentId: updatedDocument.id,
      userId: job.createdById,
    });

    return updatedDocument;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown document generation error";
    const safeErrorMessage = "Nie udalo sie wygenerowac dokumentu. Zespol PRIVAZY moze ponowic job po weryfikacji.";

    await prisma.$transaction([
      prisma.documentGenerationJob.update({
        where: { id: job.id },
        data: {
          status: DocumentGenerationStatus.FAILED,
          errorMessage: message.slice(0, 2000),
          safeErrorMessage,
        },
      }),
      prisma.documentInput.update({
        where: { id: job.documentInput.id },
        data: { status: DocumentInputStatus.FAILED },
      }),
      prisma.orderItem.update({
        where: { id: job.orderItem.id },
        data: { status: OrderItemStatus.FAILED },
      }),
    ]);

    await auditDocumentEvent({
      userId: job.createdById,
      organizationId: job.organizationId,
      action: "document.generation_failed",
      entityType: "DocumentGenerationJob",
      entityId: job.id,
      metadata: { safeErrorMessage },
    });

    await logDocumentNotification({
      event: "document.failed",
      organizationId: job.organizationId,
      orderItemId: job.orderItem.id,
      userId: job.createdById,
    });

    throw error;
  }
}

export async function retryDocumentGeneration(jobId: string) {
  const user = await requireDocumentUser();

  if (!canRetryDocuments(user.role)) {
    throw new DocumentAccessError("Only internal document roles can retry jobs.", 403);
  }

  const job = await getPrisma().documentGenerationJob.findUnique({
    where: { id: jobId },
    include: { documentInput: true, orderItem: true },
  });

  if (!job || !job.orderItem || !job.documentInput) {
    throw new DocumentAccessError("Document job not found.", 404);
  }

  if (job.status !== DocumentGenerationStatus.FAILED) {
    throw new DocumentAccessError("Only failed jobs can be retried.", 400);
  }

  await getPrisma().$transaction([
    getPrisma().documentGenerationJob.update({
      where: { id: job.id },
      data: {
        status: DocumentGenerationStatus.PENDING,
        errorMessage: null,
        safeErrorMessage: null,
        attempt: { increment: 1 },
      },
    }),
    getPrisma().documentInput.update({
      where: { id: job.documentInput.id },
      data: { status: DocumentInputStatus.GENERATING },
    }),
    getPrisma().orderItem.update({
      where: { id: job.orderItem.id },
      data: { status: OrderItemStatus.GENERATING },
    }),
  ]);

  await auditDocumentEvent({
    userId: user.id,
    organizationId: job.organizationId,
    action: "document.generation_retry_requested",
    entityType: "DocumentGenerationJob",
    entityId: job.id,
    metadata: { attempt: job.attempt + 1 },
  });

  return job;
}

async function upsertDocumentInput(input: {
  orderItemId: string;
  organizationId: string;
  userId: string;
  data: unknown;
  status: DocumentInputStatus;
  templateId?: string | null;
  submittedAt?: Date;
}) {
  const current = await getPrisma().documentInput.findFirst({
    where: { orderItemId: input.orderItemId },
    orderBy: { version: "desc" },
  });

  if (!current) {
    return getPrisma().documentInput.create({
      data: {
        orderItemId: input.orderItemId,
        organizationId: input.organizationId,
        createdById: input.userId,
        documentType: DocumentType.PRIVACY_POLICY,
        status: input.status,
        templateId: input.templateId,
        data: input.data as Prisma.InputJsonValue,
        submittedAt: input.submittedAt,
      },
    });
  }

  return getPrisma().documentInput.update({
    where: { id: current.id },
    data: {
      createdById: input.userId,
      status: input.status,
      templateId: input.templateId ?? current.templateId,
      data: input.data as Prisma.InputJsonValue,
      submittedAt: input.submittedAt ?? current.submittedAt,
      version: input.status === DocumentInputStatus.GENERATING ? { increment: 1 } : current.version,
    },
  });
}

function assertDocumentOrderItem(kind: string, documentType: DocumentType | null) {
  if (kind !== "DOCUMENT" || documentType !== DocumentType.PRIVACY_POLICY) {
    throw new Error("Order item is not a privacy policy document product.");
  }
}

async function resolvePrivacyPolicyTemplate(role: UserRole, templateId?: string) {
  const prisma = getPrisma();
  const template = templateId
    ? await prisma.documentTemplate.findUnique({ where: { id: templateId } })
    : await prisma.documentTemplate.findFirst({
        where: { type: DocumentType.PRIVACY_POLICY, status: "ACTIVE" },
        orderBy: { version: "desc" },
      });

  if (template) {
    return template;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("No active production DOCX template is configured for privacy policy documents.");
  }

  return {
    id: null,
    type: DocumentType.PRIVACY_POLICY,
    name: "Polityka prywatnosci RODO - development sample",
    version: 1,
    status: "ACTIVE",
    fileKey: null,
    source: DocumentTemplateSource.LOCAL_DEVELOPMENT_SAMPLE,
    isSample: true,
    requiresReview: role === UserRole.LAWYER,
    variablesSchema: {},
    createdById: "",
    approvedById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
