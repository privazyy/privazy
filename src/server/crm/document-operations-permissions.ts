import "server-only";

import type { UserRole } from "@prisma/client";

import { CrmAccessError, type CrmActor } from "@/server/crm/access";

const DOCUMENT_READ_ROLES = new Set<UserRole>(["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY"]);
const DOCUMENT_RETRY_ROLES = new Set<UserRole>(["ADMIN", "LAWYER", "OPERATOR"]);
const DOCUMENT_REVIEW_ROLES = new Set<UserRole>(["ADMIN", "LAWYER"]);

export function assertCanReadDocumentOperations(actor: CrmActor) {
  if (!DOCUMENT_READ_ROLES.has(actor.role)) throw forbidden();
}

export function assertCanRetryDocumentJob(actor: CrmActor) {
  if (!DOCUMENT_RETRY_ROLES.has(actor.role)) throw readOnly();
}

export function assertCanReviewGeneratedDocument(actor: CrmActor) {
  if (!DOCUMENT_REVIEW_ROLES.has(actor.role)) throw readOnly();
}

function forbidden() {
  return new CrmAccessError(403, "FORBIDDEN", "Ta rola nie ma dostepu do operacji dokumentowych CRM.");
}

function readOnly() {
  return new CrmAccessError(403, "READ_ONLY", "Konto nie moze wykonac tej operacji dokumentowej.");
}
