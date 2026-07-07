import { safeHttpError } from "@/server/api/errors";
import { canMutateCrm, isStaffActor, type AppActor } from "@/server/auth/permissions";

export type OrganizationMembership = {
  organizationId: string;
  userId: string;
};

export function canAccessOrganization(
  actor: AppActor | null | undefined,
  organizationId: string,
  memberships: OrganizationMembership[] = [],
) {
  if (!actor) return false;
  if (isStaffActor(actor)) return true;

  return actor.role === "CLIENT" && memberships.some((membership) => membership.userId === actor.id && membership.organizationId === organizationId);
}

export function canReadOrganizationDocuments(
  actor: AppActor | null | undefined,
  organizationId: string,
  memberships: OrganizationMembership[] = [],
) {
  return canAccessOrganization(actor, organizationId, memberships);
}

export function assertOrganizationAccess(
  actor: AppActor | null | undefined,
  organizationId: string,
  memberships: OrganizationMembership[] = [],
) {
  if (!actor) throw safeHttpError("unauthorized", "Authentication required.");
  if (!canAccessOrganization(actor, organizationId, memberships)) {
    throw safeHttpError("forbidden", "Organization access denied.");
  }

  return true;
}

export function assertCanMutateOrganization(
  actor: AppActor | null | undefined,
  organizationId: string,
  memberships: OrganizationMembership[] = [],
) {
  assertOrganizationAccess(actor, organizationId, memberships);

  if (!actor || !canMutateCrm(actor)) {
    throw safeHttpError("forbidden", "Organization mutation denied.");
  }

  return true;
}

export function assertCanReadDocumentJob(
  actor: AppActor | null | undefined,
  job: { organizationId: string },
  memberships: OrganizationMembership[] = [],
) {
  return assertOrganizationAccess(actor, job.organizationId, memberships);
}

export function assertCanReadGeneratedDocument(
  actor: AppActor | null | undefined,
  document: { organizationId: string },
  memberships: OrganizationMembership[] = [],
) {
  return assertOrganizationAccess(actor, document.organizationId, memberships);
}
