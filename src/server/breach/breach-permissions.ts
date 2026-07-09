import "server-only";

import type { DataBreachIncidentStatus, UserRole } from "@prisma/client";

import { auth } from "@/server/auth";
import { getPrisma } from "@/server/db/prisma";
import { BreachError } from "@/server/breach/breach-http";

const STAFF_READ_ROLES = new Set<UserRole>(["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY"]);
const TRIAGE_ROLES = new Set<UserRole>(["ADMIN", "LAWYER", "OPERATOR"]);
const RISK_ROLES = new Set<UserRole>(["ADMIN", "LAWYER"]);

export type ClientBreachActor = {
  id: string;
  role: "CLIENT";
  organizationIds: string[];
};

export type StaffBreachActor = {
  id: string;
  role: Exclude<UserRole, "CLIENT">;
};

export async function requireClientBreachActor(): Promise<ClientBreachActor> {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id || !role) {
    throw new BreachError(401, "UNAUTHENTICATED", "Zaloguj sie, aby obslugiwac naruszenia.");
  }
  if (role !== "CLIENT") {
    throw new BreachError(403, "CLIENT_ONLY", "Portal naruszen jest dostepny tylko dla roli CLIENT.");
  }

  const profiles = await getPrisma().clientProfile.findMany({
    where: { userId: session.user.id },
    select: { organizationId: true },
  });

  if (profiles.length === 0) {
    throw new BreachError(403, "NO_CLIENT_ORGANIZATION", "Konto klienta nie jest przypisane do organizacji.");
  }

  return { id: session.user.id, role, organizationIds: profiles.map((profile) => profile.organizationId) };
}

export async function requireStaffBreachRead(): Promise<StaffBreachActor> {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id || !role) {
    throw new BreachError(401, "UNAUTHENTICATED", "Zaloguj sie, aby otworzyc CRM.");
  }
  if (!STAFF_READ_ROLES.has(role)) {
    throw new BreachError(403, "FORBIDDEN", "Ta rola nie ma dostepu do naruszen w CRM.");
  }
  return { id: session.user.id, role: role as StaffBreachActor["role"] };
}

export function assertClientOrganizationAccess(actor: ClientBreachActor, organizationId: string) {
  if (!actor.organizationIds.includes(organizationId)) {
    throw new BreachError(403, "CROSS_TENANT_BLOCKED", "Brak dostepu do naruszenia tej organizacji.");
  }
}

export function assertClientCanEdit(status: DataBreachIncidentStatus) {
  if (!["DRAFT", "REPORTED"].includes(status)) {
    throw new BreachError(403, "CLIENT_EDIT_BLOCKED", "Ten status nie pozwala juz klientowi edytowac zgloszenia.");
  }
}

export function assertCanTriage(actor: StaffBreachActor) {
  if (!TRIAGE_ROLES.has(actor.role)) {
    throw new BreachError(403, "READ_ONLY", "Rola READ_ONLY moze czytac, ale nie moze mutowac naruszen.");
  }
}

export function assertCanRiskAssess(actor: StaffBreachActor) {
  if (!RISK_ROLES.has(actor.role)) {
    throw new BreachError(403, "FORBIDDEN", "Ocena ryzyka i decyzja notyfikacyjna wymaga roli LAWYER albo ADMIN.");
  }
}

export function assertCanSetStatus(actor: StaffBreachActor, status: DataBreachIncidentStatus) {
  if (actor.role === "ADMIN") return;
  if (actor.role === "READ_ONLY") {
    throw new BreachError(403, "READ_ONLY", "Rola READ_ONLY moze czytac, ale nie moze mutowac naruszen.");
  }
  if (["TRIAGE", "RISK_ASSESSMENT"].includes(status) && ["OPERATOR", "LAWYER"].includes(actor.role)) return;
  if (
    [
      "NOTIFICATION_REQUIRED",
      "NOTIFICATION_NOT_REQUIRED",
      "NOTIFIED_AUTHORITY",
      "NOTIFIED_DATA_SUBJECTS",
      "CLOSED",
      "CANCELLED",
    ].includes(status) &&
    actor.role === "LAWYER"
  ) {
    return;
  }
  throw new BreachError(403, "FORBIDDEN", "Ta rola nie moze ustawic wybranego statusu naruszenia.");
}
