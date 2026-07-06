import "server-only";

import { Prisma, UserRole } from "@prisma/client";
import { auth } from "@/server/auth";
import { getPrisma } from "@/server/db/prisma";

export class DocumentAccessError extends Error {
  constructor(
    message: string,
    readonly status = 403,
  ) {
    super(message);
  }
}

export const internalDocumentRoles: UserRole[] = [UserRole.ADMIN, UserRole.LAWYER, UserRole.OPERATOR];

export function canMutateDocuments(role: UserRole) {
  return internalDocumentRoles.includes(role) || role === UserRole.CLIENT;
}

export function canRetryDocuments(role: UserRole) {
  return internalDocumentRoles.includes(role);
}

export function canReadDocumentDownloads(role: UserRole) {
  return role !== UserRole.READ_ONLY;
}

export async function requireDocumentUser() {
  const session = await auth();
  const sessionUserId = session?.user?.id;

  if (!sessionUserId) {
    throw new DocumentAccessError("Authentication required.", 401);
  }

  const user = await getPrisma().user.findUnique({
    where: { id: sessionUserId },
    include: { clientProfiles: true },
  });

  if (!user) {
    throw new DocumentAccessError("Authentication required.", 401);
  }

  return user;
}

export async function assertOrganizationAccess(user: Awaited<ReturnType<typeof requireDocumentUser>>, organizationId: string) {
  if (internalDocumentRoles.includes(user.role)) return;

  const ownsOrganization = user.clientProfiles.some((profile) => profile.organizationId === organizationId);

  if (!ownsOrganization) {
    throw new DocumentAccessError("Document not found.", 404);
  }
}

export async function getAccessibleOrderItem(orderItemId: string, user: Awaited<ReturnType<typeof requireDocumentUser>>) {
  const orderItem = await getPrisma().orderItem.findUnique({
    where: { id: orderItemId },
    include: {
      order: true,
      product: true,
      organization: true,
    },
  });

  if (!orderItem) {
    throw new DocumentAccessError("Order item not found.", 404);
  }

  await assertOrganizationAccess(user, orderItem.organizationId);

  return orderItem;
}

export function assertCanEditDocumentInput(role: UserRole) {
  if (role === UserRole.READ_ONLY) {
    throw new DocumentAccessError("Read-only users cannot edit document inputs.", 403);
  }

  if (!canMutateDocuments(role)) {
    throw new DocumentAccessError("Insufficient permissions.", 403);
  }
}

export function assertPaidOrInternal(orderStatus: string, role: UserRole) {
  if (orderStatus === "PAID" || orderStatus === "MANUALLY_APPROVED") return;
  if (internalDocumentRoles.includes(role)) return;

  throw new DocumentAccessError("Document input is available after paid or manually approved order.", 403);
}

export async function auditDocumentEvent(input: {
  userId?: string;
  organizationId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  await getPrisma().auditLog.create({
    data: {
      userId: input.userId,
      organizationId: input.organizationId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      ipAddress: input.ipAddress || undefined,
      userAgent: input.userAgent || undefined,
    },
  });
}

export function toSafeClientError(error: unknown) {
  if (error instanceof DocumentAccessError) {
    return { message: error.message, status: error.status };
  }

  return { message: "Document operation failed.", status: 500 };
}
