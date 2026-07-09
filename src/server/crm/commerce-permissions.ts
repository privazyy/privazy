import "server-only";

import type { UserRole } from "@prisma/client";

import { CrmAccessError, type CrmActor } from "@/server/crm/access";

const COMMERCE_READ_ROLES = new Set<UserRole>(["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY"]);
const COMMERCE_OPERATE_ROLES = new Set<UserRole>(["ADMIN", "LAWYER", "OPERATOR"]);
const COMMERCE_RETRY_ROLES = new Set<UserRole>(["ADMIN", "OPERATOR"]);
const INVOICE_REQUEST_ROLES = new Set<UserRole>(["ADMIN", "OPERATOR"]);
const ADMIN_ONLY = new Set<UserRole>(["ADMIN"]);

export function assertCanReadCommerce(actor: CrmActor) {
  if (!COMMERCE_READ_ROLES.has(actor.role)) throw forbidden();
}

export function assertCanOperateCommerce(actor: CrmActor) {
  if (!COMMERCE_OPERATE_ROLES.has(actor.role)) throw readOnly();
}

export function assertCanRetryPayment(actor: CrmActor) {
  if (!COMMERCE_RETRY_ROLES.has(actor.role)) throw readOnly();
}

export function assertCanRequestInvoice(actor: CrmActor) {
  if (!INVOICE_REQUEST_ROLES.has(actor.role)) throw readOnly();
}

export function assertCanCancelSandbox(actor: CrmActor) {
  if (!ADMIN_ONLY.has(actor.role)) throw readOnly();
}

function forbidden() {
  return new CrmAccessError(403, "FORBIDDEN", "Ta rola nie ma dostepu do danych commerce CRM.");
}

function readOnly() {
  return new CrmAccessError(403, "READ_ONLY", "Konto nie moze wykonac tej operacji commerce.");
}
