import type { UserRole } from "@prisma/client";

export type AppRole = UserRole;

export type AuthzUser = {
  id?: string;
  role?: AppRole | null;
};

export const STAFF_ROLES = ["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY"] as const satisfies readonly AppRole[];
export const CRM_MUTATION_ROLES = ["ADMIN", "LAWYER", "OPERATOR"] as const satisfies readonly AppRole[];
export const ADMIN_ROLES = ["ADMIN"] as const satisfies readonly AppRole[];
export const CLIENT_ROLES = ["CLIENT"] as const satisfies readonly AppRole[];

export function isStaffRole(role: AppRole | null | undefined) {
  return roleCanAccess(role, STAFF_ROLES);
}

export function isClientRole(role: AppRole | null | undefined) {
  return role === "CLIENT";
}

export function roleCanAccess(role: AppRole | null | undefined, allowedRoles: readonly AppRole[]) {
  return Boolean(role && allowedRoles.includes(role));
}

export function canAccessCrm(user: AuthzUser | null | undefined) {
  return isStaffRole(user?.role);
}

export function canReadCrm(user: AuthzUser | null | undefined) {
  return canAccessCrm(user);
}

export function canMutateCrm(user: AuthzUser | null | undefined) {
  return roleCanAccess(user?.role, CRM_MUTATION_ROLES);
}

export function canManageUsers(user: AuthzUser | null | undefined) {
  return roleCanAccess(user?.role, ADMIN_ROLES);
}

export function canManageSettings(user: AuthzUser | null | undefined) {
  return roleCanAccess(user?.role, ADMIN_ROLES);
}

export function canReviewDocuments(user: AuthzUser | null | undefined) {
  return roleCanAccess(user?.role, ["ADMIN", "LAWYER", "OPERATOR"] as const);
}

export function canRetryDocumentJob(user: AuthzUser | null | undefined) {
  return roleCanAccess(user?.role, CRM_MUTATION_ROLES);
}

export function canAccessClientPortal(user: AuthzUser | null | undefined) {
  return isClientRole(user?.role);
}

export function getPostLoginPath(role: AppRole | null | undefined) {
  if (role === "CLIENT") return "/platforma";
  if (isStaffRole(role)) return "/admin";
  return "/dashboard";
}

export function getForbiddenRedirectPath(role: AppRole | null | undefined) {
  if (role === "CLIENT") return "/platforma";
  return "/login";
}
