import "server-only";

import type { UserRole } from "@prisma/client";

export const DOCUMENT_GENERATION_STAFF_ROLES = ["ADMIN", "LAWYER", "OPERATOR"] as const satisfies UserRole[];

export function canGenerateDocuments(role: UserRole | undefined) {
  return DOCUMENT_GENERATION_STAFF_ROLES.some((staffRole) => staffRole === role);
}

export function canReadDocumentGenerationStatus(role: UserRole | undefined) {
  return role === "READ_ONLY" || role === "CLIENT" || canGenerateDocuments(role);
}
