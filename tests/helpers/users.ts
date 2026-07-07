import type { AppActor, AppRole, AppSessionLike } from "@/server/auth/permissions";

export const testUsers: Record<AppRole, AppActor> = {
  ADMIN: { email: "admin@example.com", id: "user_admin", role: "ADMIN" },
  CLIENT: { email: "client@example.com", id: "user_client", role: "CLIENT" },
  LAWYER: { email: "lawyer@example.com", id: "user_lawyer", role: "LAWYER" },
  OPERATOR: { email: "operator@example.com", id: "user_operator", role: "OPERATOR" },
  READ_ONLY: { email: "readonly@example.com", id: "user_readonly", role: "READ_ONLY" },
};

export const unauthenticated = null;

export function sessionFor(role: AppRole): AppSessionLike {
  const user = testUsers[role];

  return {
    user,
  };
}
