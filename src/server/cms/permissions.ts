import "server-only";

import type { BlogPostStatus } from "@prisma/client";

import type { CrmActor } from "@/server/crm/permissions";

export function canReadCms(actor: CrmActor) {
  return ["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY"].includes(actor.role);
}

export function canEditCmsDraft(actor: CrmActor) {
  return actor.role === "ADMIN" || actor.role === "LAWYER" || actor.role === "OPERATOR";
}

export function canReviewCms(actor: CrmActor) {
  return actor.role === "ADMIN" || actor.role === "LAWYER";
}

export function canPublishCms(actor: CrmActor) {
  return actor.role === "ADMIN" || actor.role === "LAWYER";
}

export function assertCanReadCms(actor: CrmActor) {
  if (!canReadCms(actor)) throw new Error("CMS jest dostepny tylko dla rol wewnetrznych.");
}

export function assertCanEditCmsDraft(actor: CrmActor) {
  if (!canEditCmsDraft(actor)) throw new Error("Ta rola nie moze edytowac tresci CMS.");
}

export function assertCanTransitionCms(actor: CrmActor, status: BlogPostStatus) {
  if (status === "PUBLISHED" || status === "SCHEDULED") {
    if (!canPublishCms(actor)) throw new Error("Publikacja wymaga roli LAWYER albo ADMIN.");
    return;
  }

  if (status === "IN_REVIEW") {
    if (!canEditCmsDraft(actor)) throw new Error("Ta rola nie moze wyslac tresci do review.");
    return;
  }

  if (status === "ARCHIVED") {
    if (!canPublishCms(actor)) throw new Error("Archiwizacja wymaga roli LAWYER albo ADMIN.");
    return;
  }

  assertCanEditCmsDraft(actor);
}
