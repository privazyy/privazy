import "server-only";

import type { UserRole } from "@prisma/client";

import {
  CrmAccessError,
  canMutateCrm as canRoleMutateCrm,
  requireCrmRead,
  requireCrmWrite,
  type CrmActor,
} from "@/server/crm/access";

const CRM_READ_ROLES = new Set<UserRole>(["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY"]);

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

export { requireCrmRead };

export function canReadCrm(actor: CrmActor | UserRole) {
  const role = typeof actor === "string" ? actor : actor.role;
  return CRM_READ_ROLES.has(role);
}

export function canMutateCrm(actor: CrmActor | UserRole) {
  const role = typeof actor === "string" ? actor : actor.role;
  return canRoleMutateCrm(role);
}

export function canManageLead(actor: CrmActor | UserRole) {
  return canMutateCrm(actor);
}

export function canManageOrganization(actor: CrmActor | UserRole) {
  return canMutateCrm(actor);
}

export function canManageTask(actor: CrmActor | UserRole) {
  return canMutateCrm(actor);
}

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
