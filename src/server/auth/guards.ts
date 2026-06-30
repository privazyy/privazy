import "server-only";

import type { UserRole } from "@prisma/client";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { safeLogAuditEvent } from "@/server/audit/log";
import { auth } from "@/server/auth";
import { CRM_READ_ROLES, roleCanAccess, type AppRole } from "@/server/auth/roles";
import { getPrisma } from "@/server/db/prisma";

export type AuthenticatedUser = {
  email: string;
  id: string;
  name: string | null;
  role: UserRole;
};

type GuardOptions = {
  mode?: "throw" | "redirect";
  redirectTo?: string;
};

export class UnauthorizedError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Insufficient permissions") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  return getPrisma().user.findUnique({
    select: {
      email: true,
      id: true,
      name: true,
      role: true,
    },
    where: { id: userId },
  });
}

export async function requireUser(options: GuardOptions = {}) {
  const user = await getCurrentUser();

  if (!user) {
    if (options.mode === "redirect") {
      redirect((options.redirectTo ?? "/login") as Route);
    }

    throw new UnauthorizedError();
  }

  return user;
}

export async function requireRole(roles: readonly AppRole[], options: GuardOptions = {}) {
  const user = await requireUser(options);

  if (!roleCanAccess(user.role, roles)) {
    if (options.mode === "redirect") {
      redirect((options.redirectTo ?? "/dashboard") as Route);
    }

    throw new ForbiddenError();
  }

  return user;
}

export async function assertCanAccessOrganization(user: AuthenticatedUser, organizationId: string) {
  if (roleCanAccess(user.role, CRM_READ_ROLES)) return;

  if (user.role !== "CLIENT") {
    throw new ForbiddenError("Role cannot access organizations");
  }

  const profile = await getPrisma().clientProfile.findUnique({
    select: { id: true },
    where: {
      userId_organizationId: {
        organizationId,
        userId: user.id,
      },
    },
  });

  if (!profile) {
    throw new ForbiddenError("Organization access denied");
  }
}

export async function assertCanAccessAdmin(options: GuardOptions = {}) {
  return requireRole(CRM_READ_ROLES, options);
}

export async function logBlockedAccessAttempt(input: {
  entityId: string;
  entityType: string;
  metadata?: Record<string, string | number | boolean | null>;
  organizationId?: string;
  request: Request;
  user?: AuthenticatedUser | null;
}) {
  await safeLogAuditEvent({
    action: "access.blocked",
    entityId: input.entityId,
    entityType: input.entityType,
    metadata: input.metadata ?? {},
    organizationId: input.organizationId,
    request: input.request,
    userId: input.user?.id,
  });
}
