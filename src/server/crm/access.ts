import "server-only";

import type { UserRole } from "@prisma/client";

import { auth } from "@/server/auth";

const CRM_READ_ROLES = new Set<UserRole>(["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY"]);
const CRM_WRITE_ROLES = new Set<UserRole>(["ADMIN", "LAWYER", "OPERATOR"]);

export type CrmActor = {
  id: string;
  role: UserRole;
};

export class CrmAccessError extends Error {
  constructor(
    public readonly status: 401 | 403,
    public readonly code: "UNAUTHENTICATED" | "FORBIDDEN" | "READ_ONLY",
    message: string,
  ) {
    super(message);
    this.name = "CrmAccessError";
  }
}

export async function requireCrmRead(): Promise<CrmActor> {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user?.id || !role) {
    throw new CrmAccessError(401, "UNAUTHENTICATED", "Zaloguj się, aby otworzyć CRM.");
  }

  if (!CRM_READ_ROLES.has(role)) {
    throw new CrmAccessError(403, "FORBIDDEN", "Ta rola nie ma dostępu do CRM.");
  }

  return { id: session.user.id, role };
}

export async function requireCrmWrite(): Promise<CrmActor> {
  const actor = await requireCrmRead();

  if (!CRM_WRITE_ROLES.has(actor.role)) {
    throw new CrmAccessError(403, "READ_ONLY", "Konto ma dostęp wyłącznie do odczytu.");
  }

  return actor;
}

export function canMutateCrm(role: UserRole) {
  return CRM_WRITE_ROLES.has(role);
}

export function assertCrmWriteActor(actor: CrmActor) {
  if (!CRM_WRITE_ROLES.has(actor.role)) {
    throw new CrmAccessError(403, "READ_ONLY", "Konto ma dostęp wyłącznie do odczytu.");
  }
}
