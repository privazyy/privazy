import "server-only";

import type { UserRole } from "@prisma/client";

import { auth } from "@/server/auth";
import { getPrisma } from "@/server/db/prisma";

export type CrmActor = {
  email: string;
  id: string;
  name: string | null;
  role: UserRole;
};

export type CrmPermissionScope =
  | "admin"
  | "breaches"
  | "clients"
  | "documents"
  | "employees"
  | "leads"
  | "messages"
  | "orders"
  | "reports"
  | "requests"
  | "settings"
  | "tasks";

const crmRoles: UserRole[] = ["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY"];

const crmRoutes = [
  "dashboard",
  "traffic",
  "leads",
  "sales",
  "clients",
  "orgs",
  "orders",
  "documents",
  "packages",
  "products",
  "outsourcing",
  "breaches",
  "requests",
  "inbox",
  "tasks",
  "calendar",
  "reports",
  "accounting",
  "blog",
  "newsletter",
  "employees",
  "platform",
  "automations",
  "settings",
  "admin",
] as const;

const detailRoutes = [
  "lead-detail",
  "client-detail",
  "doc-review",
  "breach-detail",
  "request-detail",
  "outsourcing-detail",
  "product-editor",
  "blog-editor",
] as const;

export type CrmRouteName = (typeof crmRoutes)[number] | (typeof detailRoutes)[number];

const roleRoutes: Record<UserRole, CrmRouteName[]> = {
  ADMIN: [...crmRoutes, ...detailRoutes],
  LAWYER: [
    "dashboard",
    "clients",
    "orgs",
    "orders",
    "documents",
    "doc-review",
    "breaches",
    "breach-detail",
    "requests",
    "request-detail",
    "tasks",
    "calendar",
    "reports",
    "platform",
  ],
  OPERATOR: [
    "dashboard",
    "traffic",
    "leads",
    "lead-detail",
    "sales",
    "clients",
    "client-detail",
    "orders",
    "documents",
    "doc-review",
    "requests",
    "request-detail",
    "inbox",
    "tasks",
    "calendar",
    "reports",
    "accounting",
    "platform",
  ],
  READ_ONLY: [
    "dashboard",
    "traffic",
    "leads",
    "lead-detail",
    "sales",
    "clients",
    "client-detail",
    "orgs",
    "orders",
    "documents",
    "doc-review",
    "packages",
    "products",
    "outsourcing",
    "breaches",
    "breach-detail",
    "requests",
    "request-detail",
    "inbox",
    "tasks",
    "calendar",
    "reports",
    "accounting",
    "blog",
    "newsletter",
    "platform",
    "automations",
  ],
  CLIENT: [],
};

const mutationScopes: Record<UserRole, CrmPermissionScope[]> = {
  ADMIN: ["admin", "breaches", "clients", "documents", "employees", "leads", "messages", "orders", "reports", "requests", "settings", "tasks"],
  LAWYER: ["breaches", "documents", "messages", "requests", "tasks"],
  OPERATOR: ["clients", "leads", "messages", "orders", "tasks"],
  READ_ONLY: [],
  CLIENT: [],
};

export async function getOptionalCrmActor(): Promise<CrmActor | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await getPrisma().user.findUnique({
    select: {
      email: true,
      id: true,
      name: true,
      role: true,
    },
    where: { id: userId },
  });

  if (!user || !crmRoles.includes(user.role)) return null;
  return user;
}

export async function requireCrmActor() {
  const actor = await getOptionalCrmActor();
  if (!actor) throw new Error("CRM access requires an internal PRIVAZY role.");
  return actor;
}

export function getAllowedCrmRoutes(role: UserRole) {
  return roleRoutes[role] ?? [];
}

export function canAccessCrmRoute(role: UserRole, route: CrmRouteName) {
  return getAllowedCrmRoutes(role).includes(route);
}

export function canMutateCrm(actor: CrmActor, scope: CrmPermissionScope) {
  return mutationScopes[actor.role]?.includes(scope) ?? false;
}

export function assertCanMutateCrm(actor: CrmActor, scope: CrmPermissionScope) {
  if (actor.role === "READ_ONLY") {
    throw new Error("READ_ONLY cannot mutate CRM records.");
  }

  if (!canMutateCrm(actor, scope)) {
    throw new Error(`Role ${actor.role} cannot mutate ${scope}.`);
  }
}

export function assertAdminCrm(actor: CrmActor) {
  if (actor.role !== "ADMIN") {
    throw new Error("This CRM action is available only to ADMIN.");
  }
}

export function crmRoleLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    ADMIN: "Admin",
    CLIENT: "Client",
    LAWYER: "Lawyer",
    OPERATOR: "Operator",
    READ_ONLY: "Read only",
  };

  return labels[role];
}
