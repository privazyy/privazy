import "server-only";

import type { Route } from "next";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";

import { auth } from "@/server/auth";
import {
  canAccessClientPortal,
  canAccessCrm,
  canManageSettings,
  canManageUsers,
  canMutateCrm,
  canReviewDocuments,
  canRetryDocumentJob,
  getForbiddenRedirectPath,
  getPostLoginPath,
  isStaffRole,
} from "@/server/auth/permissions";

export type AuthenticatedUser = {
  email?: string | null;
  id: string;
  name?: string | null;
  role: UserRole;
};

type GuardOptions = {
  callbackUrl?: string;
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

export function authErrorStatus(error: unknown) {
  if (error instanceof UnauthorizedError) return 401;
  if (error instanceof ForbiddenError) return 403;
  return null;
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  const sessionUser = session?.user;

  if (!sessionUser?.id || !sessionUser.role) return null;

  return {
    email: sessionUser.email,
    id: sessionUser.id,
    name: sessionUser.name,
    role: sessionUser.role,
  };
}

export async function requireUser(options: GuardOptions = {}) {
  const user = await getCurrentUser();

  if (!user) {
    if (options.mode === "redirect") {
      const callback = options.callbackUrl ? `?callbackUrl=${encodeURIComponent(options.callbackUrl)}` : "";
      redirect(`${options.redirectTo ?? "/login"}${callback}` as Route);
    }

    throw new UnauthorizedError();
  }

  return user;
}

export async function requireStaff(options: GuardOptions = {}) {
  const user = await requireUser(options);

  if (!isStaffRole(user.role)) {
    if (options.mode === "redirect") {
      redirect((options.redirectTo ?? getForbiddenRedirectPath(user.role)) as Route);
    }

    throw new ForbiddenError();
  }

  return user;
}

export async function requireCrmAccess(options: GuardOptions = {}) {
  const user = await requireUser(options);

  if (!canAccessCrm(user)) {
    if (options.mode === "redirect") {
      redirect((options.redirectTo ?? getForbiddenRedirectPath(user.role)) as Route);
    }

    throw new ForbiddenError();
  }

  return user;
}

export async function requireCrmMutation(options: GuardOptions = {}) {
  const user = await requireCrmAccess(options);

  if (!canMutateCrm(user)) {
    throw new ForbiddenError("Read-only users cannot perform CRM mutations");
  }

  return user;
}

export async function requireAdmin(options: GuardOptions = {}) {
  const user = await requireStaff(options);

  if (!canManageUsers(user) || !canManageSettings(user)) {
    throw new ForbiddenError();
  }

  return user;
}

export async function requireClientPortalAccess(options: GuardOptions = {}) {
  const user = await requireUser(options);

  if (!canAccessClientPortal(user)) {
    if (options.mode === "redirect") {
      redirect((options.redirectTo ?? getPostLoginPath(user.role)) as Route);
    }

    throw new ForbiddenError();
  }

  return user;
}

export function assertCanReviewDocuments(user: AuthenticatedUser) {
  if (!canReviewDocuments(user)) {
    throw new ForbiddenError("Role cannot review documents");
  }
}

export function assertCanRetryDocumentJob(user: AuthenticatedUser) {
  if (!canRetryDocumentJob(user)) {
    throw new ForbiddenError("Role cannot retry document jobs");
  }
}
