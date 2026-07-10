import "server-only";

import { CrmAccessError, requireCrmRead, requireCrmWrite, type CrmActor } from "@/server/crm/access";

export async function requireCrmMutation() {
  return requireCrmWrite();
}

export async function requireCrmAdmin() {
  const actor = await requireCrmRead();
  if (actor.role !== "ADMIN") {
    throw new CrmAccessError(403, "FORBIDDEN", "Tylko administrator moze wykonac te operacje CRM.");
  }
  return actor;
}

export async function requireCrmLegalOperation() {
  const actor = await requireCrmRead();
  if (!["ADMIN", "LAWYER"].includes(actor.role)) {
    throw new CrmAccessError(403, "FORBIDDEN", "Ta operacja wymaga roli ADMIN albo LAWYER.");
  }
  return actor;
}

export const requireCrmDocumentOperation = requireCrmLegalOperation;

export function assertReadOnlyCannotMutate(actor: CrmActor) {
  if (actor.role === "READ_ONLY") {
    throw new CrmAccessError(403, "READ_ONLY", "Konto ma dostep wylacznie do odczytu.");
  }
}

export function assertClientCannotAccessCrm(actor: CrmActor) {
  if (actor.role === "CLIENT") {
    throw new CrmAccessError(403, "FORBIDDEN", "Klient nie ma dostepu do CRM.");
  }
}
