import type { UserRole } from "@prisma/client";

export type CrmApiUser = {
  id: string;
  role?: UserRole | null;
};

export const CRM_API_READ_ROLES = ["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY"] as const satisfies readonly UserRole[];
export const CRM_API_MUTATION_ROLES = ["ADMIN", "LAWYER", "OPERATOR"] as const satisfies readonly UserRole[];
export const CRM_API_ADMIN_ROLES = ["ADMIN"] as const satisfies readonly UserRole[];

export function canReadCrmApi(user: CrmApiUser | null | undefined) {
  return hasRole(user?.role, CRM_API_READ_ROLES);
}

export function canMutateCrmApi(user: CrmApiUser | null | undefined) {
  return hasRole(user?.role, CRM_API_MUTATION_ROLES);
}

export function canManageCrmApi(user: CrmApiUser | null | undefined) {
  return hasRole(user?.role, CRM_API_ADMIN_ROLES);
}

function hasRole(role: UserRole | null | undefined, allowedRoles: readonly UserRole[]) {
  return Boolean(role && allowedRoles.includes(role));
}
