export const userRoles = ["ADMIN", "LAWYER", "OPERATOR", "CLIENT", "READ_ONLY"] as const;

export type AppRole = (typeof userRoles)[number];

export type AppActor = {
  id: string;
  email?: string | null;
  role: AppRole;
};

export type AppSessionLike = {
  user?: {
    id?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
} | null;

const crmReadRoles = new Set<AppRole>(["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY"]);
const crmMutationRoles = new Set<AppRole>(["ADMIN", "LAWYER", "OPERATOR"]);
const staffRoles = new Set<AppRole>(["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY"]);
const documentReviewRoles = new Set<AppRole>(["ADMIN", "LAWYER", "OPERATOR"]);

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && userRoles.includes(value as AppRole);
}

export function actorFromSession(session: AppSessionLike): AppActor | null {
  const user = session?.user;
  if (!user?.id || !isAppRole(user.role)) return null;

  return {
    email: user.email,
    id: user.id,
    role: user.role,
  };
}

export function canAccessCrm(actor: AppActor | null | undefined) {
  return Boolean(actor && crmReadRoles.has(actor.role));
}

export const canReadCrm = canAccessCrm;

export function canMutateCrm(actor: AppActor | null | undefined) {
  return Boolean(actor && crmMutationRoles.has(actor.role));
}

export function canManageUsers(actor: AppActor | null | undefined) {
  return actor?.role === "ADMIN";
}

export const canManageSettings = canManageUsers;

export function canReviewDocuments(actor: AppActor | null | undefined) {
  return Boolean(actor && documentReviewRoles.has(actor.role));
}

export const canRetryDocumentJob = canReviewDocuments;

export function canAccessClientPortal(actor: AppActor | null | undefined) {
  return actor?.role === "CLIENT";
}

export function isStaffActor(actor: AppActor | null | undefined) {
  return Boolean(actor && staffRoles.has(actor.role));
}
