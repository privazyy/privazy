import "server-only";

import type { UserRole } from "@prisma/client";

import { auth } from "@/server/auth";

const CMS_READ_ROLES = new Set<UserRole>(["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY"]);
const CMS_WRITE_ROLES = new Set<UserRole>(["ADMIN", "LAWYER", "OPERATOR"]);
const CMS_PUBLISH_ROLES = new Set<UserRole>(["ADMIN", "OPERATOR"]);

export type CmsAction = "read" | "create" | "update" | "submitReview" | "publish" | "archive";

export type CmsActor = {
  id: string;
  role: UserRole;
};

export class CmsAccessError extends Error {
  constructor(
    public readonly status: 401 | 403,
    public readonly code: "UNAUTHENTICATED" | "FORBIDDEN" | "READ_ONLY",
    message: string,
  ) {
    super(message);
    this.name = "CmsAccessError";
  }
}

export async function requireCmsRead(): Promise<CmsActor> {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user?.id || !role) {
    throw new CmsAccessError(401, "UNAUTHENTICATED", "Zaloguj sie, aby otworzyc CMS.");
  }

  if (!CMS_READ_ROLES.has(role)) {
    throw new CmsAccessError(403, "FORBIDDEN", "Ta rola nie ma dostepu do CMS.");
  }

  return { id: session.user.id, role };
}

export async function requireCmsWrite(action: CmsAction = "update"): Promise<CmsActor> {
  const actor = await requireCmsRead();
  assertCmsMutation(actor, action);
  return actor;
}

export function canReadCms(role: UserRole) {
  return CMS_READ_ROLES.has(role);
}

export function canMutateCms(role: UserRole) {
  return CMS_WRITE_ROLES.has(role);
}

export function canPublishCms(role: UserRole) {
  return CMS_PUBLISH_ROLES.has(role);
}

export function assertCmsMutation(actor: CmsActor, action: CmsAction = "update") {
  if (!CMS_WRITE_ROLES.has(actor.role)) {
    throw new CmsAccessError(403, "READ_ONLY", "Konto ma dostep wylacznie do odczytu.");
  }

  if ((action === "publish" || action === "archive") && !CMS_PUBLISH_ROLES.has(actor.role)) {
    throw new CmsAccessError(403, "FORBIDDEN", "Ta rola nie moze publikowac ani archiwizowac wpisow.");
  }
}
