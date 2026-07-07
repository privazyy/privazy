import "server-only";

import { TRPCError } from "@trpc/server";
import type { PrismaClient, UserRole } from "@prisma/client";

export interface AccessUser {
  id: string;
  role?: UserRole;
}

const STAFF_READ_ROLES = ["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY"] as const satisfies UserRole[];
const STAFF_MUTATION_ROLES = ["ADMIN", "LAWYER", "OPERATOR"] as const satisfies UserRole[];

export function isStaffReader(role: UserRole | undefined) {
  return STAFF_READ_ROLES.some((staffRole) => staffRole === role);
}

export function isStaffMutator(role: UserRole | undefined) {
  return STAFF_MUTATION_ROLES.some((staffRole) => staffRole === role);
}

export async function getUserOrganizationIds(prisma: PrismaClient, userId: string) {
  const profiles = await prisma.clientProfile.findMany({
    where: { userId },
    select: { organizationId: true },
  });

  return profiles.map((profile) => profile.organizationId);
}

export async function canAccessOrganization(prisma: PrismaClient, user: AccessUser, organizationId: string) {
  if (isStaffReader(user.role)) {
    return true;
  }

  if (user.role !== "CLIENT") {
    return false;
  }

  const profile = await prisma.clientProfile.findUnique({
    where: {
      userId_organizationId: {
        organizationId,
        userId: user.id,
      },
    },
    select: { id: true },
  });

  return Boolean(profile);
}

export async function assertOrganizationAccess(prisma: PrismaClient, user: AccessUser, organizationId: string) {
  if (!(await canAccessOrganization(prisma, user, organizationId))) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Document organization access denied.",
    });
  }
}

export async function canReadOrganizationDocuments(prisma: PrismaClient, user: AccessUser, organizationId: string) {
  return canAccessOrganization(prisma, user, organizationId);
}

export async function canMutateOrganizationDocuments(prisma: PrismaClient, user: AccessUser, organizationId: string) {
  if (!isStaffMutator(user.role)) {
    return false;
  }

  return canAccessOrganization(prisma, user, organizationId);
}

export async function assertCanReadDocumentJob(prisma: PrismaClient, user: AccessUser, jobId: string) {
  const job = await prisma.documentGenerationJob.findUnique({
    where: { id: jobId },
    select: { id: true, organizationId: true },
  });

  if (!job) {
    throw notFound();
  }

  if (!(await canReadOrganizationDocuments(prisma, user, job.organizationId))) {
    throw notFound();
  }

  return job;
}

export async function assertCanReadGeneratedDocument(prisma: PrismaClient, user: AccessUser, documentId: string) {
  const document = await prisma.generatedDocument.findUnique({
    where: { id: documentId },
    select: { id: true, organizationId: true },
  });

  if (!document) {
    throw notFound();
  }

  if (!(await canReadOrganizationDocuments(prisma, user, document.organizationId))) {
    throw notFound();
  }

  return document;
}

export async function assertCanReadDocumentTemplate(
  prisma: PrismaClient,
  user: AccessUser,
  templateId: string,
  context: { staffOnly?: boolean } = {},
) {
  const template = await prisma.documentTemplate.findUnique({
    where: { id: templateId },
    select: { id: true, status: true },
  });

  if (!template) {
    throw notFound();
  }

  if (context.staffOnly && !isStaffReader(user.role)) {
    throw notFound();
  }

  if (!isStaffReader(user.role) && template.status !== "ACTIVE") {
    throw notFound();
  }

  return template;
}

export async function resolveDocumentListOrganizationScope(
  prisma: PrismaClient,
  user: AccessUser,
  organizationId?: string,
) {
  if (isStaffReader(user.role)) {
    return organizationId ? { organizationId } : {};
  }

  if (user.role !== "CLIENT") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Document access requires an authorized role.",
    });
  }

  if (organizationId) {
    await assertOrganizationAccess(prisma, user, organizationId);

    return { organizationId };
  }

  const organizationIds = await getUserOrganizationIds(prisma, user.id);

  if (organizationIds.length === 0) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Client organization scope is not configured.",
    });
  }

  return { organizationId: { in: organizationIds } };
}

function notFound() {
  return new TRPCError({
    code: "NOT_FOUND",
    message: "Document resource was not found.",
  });
}
