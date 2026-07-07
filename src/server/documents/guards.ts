import "server-only";

import { DocumentTemplateStatus, type DocumentTemplate, type Organization, type User, type UserRole } from "@prisma/client";
import { auth } from "@/server/auth";
import { getPrisma } from "@/server/db/prisma";
import type { DocumentGenerateApiInput } from "@/server/documents/schemas";
import { canGenerateDocuments } from "@/server/documents/permissions";

export type DocumentGenerationErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "INVALID_STATE"
  | "NOT_READY"
  | "INTERNAL_ERROR";

export class DocumentGenerationApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: DocumentGenerationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "DocumentGenerationApiError";
  }
}

export type DocumentGenerationActor = Pick<User, "id" | "email" | "name" | "role">;

export interface VerifiedDocumentGenerationContext {
  actorUserId: string;
  actorRole: UserRole;
  data: Record<string, unknown>;
  idempotencyKey?: string;
  organization: Pick<Organization, "id" | "name">;
  organizationId: string;
  reason?: string;
  source: "staff_manual";
  template: Pick<DocumentTemplate, "id" | "name" | "status" | "type" | "version">;
  templateId: string;
}

export async function requireDocumentGenerationAccess(input: DocumentGenerateApiInput) {
  const actor = await getDocumentGenerationActor();

  assertCanGenerateDocument(actor);

  return resolveDocumentGenerationContext(input, actor);
}

export function assertCanGenerateDocument(user: Pick<User, "id" | "role">) {
  if (!canGenerateDocuments(user.role)) {
    throw new DocumentGenerationApiError(
      403,
      "FORBIDDEN",
      "Document generation requires an authorized staff role.",
    );
  }
}

export async function assertCanGenerateForOrderItem() {
  throw new DocumentGenerationApiError(
    501,
    "NOT_READY",
    "Client document generation requires an order item gate that is not available yet.",
  );
}

export async function assertCanGenerateForOrganization(
  user: Pick<User, "id" | "role">,
  organizationId: string,
) {
  assertCanGenerateDocument(user);

  const organization = await getPrisma().organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true },
  });

  if (!organization) {
    throw new DocumentGenerationApiError(404, "NOT_FOUND", "Organization was not found.");
  }

  return organization;
}

export async function assertCanUseTemplate(
  user: Pick<User, "id" | "role">,
  templateId: string,
) {
  assertCanGenerateDocument(user);

  const template = await getPrisma().documentTemplate.findUnique({
    where: { id: templateId },
    select: { id: true, name: true, status: true, type: true, version: true },
  });

  if (!template) {
    throw new DocumentGenerationApiError(404, "NOT_FOUND", "Document template was not found.");
  }

  if (template.status !== DocumentTemplateStatus.ACTIVE) {
    throw new DocumentGenerationApiError(409, "INVALID_STATE", "Document template is not active.");
  }

  return template;
}

export async function resolveDocumentGenerationContext(
  input: DocumentGenerateApiInput,
  user: DocumentGenerationActor,
): Promise<VerifiedDocumentGenerationContext> {
  const [organization, template] = await Promise.all([
    assertCanGenerateForOrganization(user, input.organizationId),
    assertCanUseTemplate(user, input.templateId),
  ]);

  return {
    actorRole: user.role,
    actorUserId: user.id,
    data: input.data,
    idempotencyKey: input.idempotencyKey,
    organization,
    organizationId: organization.id,
    reason: input.reason,
    source: "staff_manual",
    template,
    templateId: template.id,
  };
}

export function safeDocumentGenerationError(error: unknown) {
  if (error instanceof DocumentGenerationApiError) {
    return {
      body: { error: error.message, code: error.code },
      status: error.status,
    };
  }

  return {
    body: { error: "Document generation request failed.", code: "INTERNAL_ERROR" satisfies DocumentGenerationErrorCode },
    status: 500,
  };
}

async function getDocumentGenerationActor(): Promise<DocumentGenerationActor> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new DocumentGenerationApiError(401, "UNAUTHENTICATED", "Authentication is required.");
  }

  const user = await getPrisma().user.findUnique({
    where: { id: session.user.id },
    select: { email: true, id: true, name: true, role: true },
  });

  if (!user) {
    throw new DocumentGenerationApiError(401, "UNAUTHENTICATED", "Authentication is required.");
  }

  return user;
}
