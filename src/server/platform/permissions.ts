import "server-only";

import type { ClientOrganizationRole, UserRole } from "@prisma/client";

import { auth } from "@/server/auth";
import { getPrisma } from "@/server/db/prisma";

const internalRoles: UserRole[] = ["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY"];

export type PlatformActor = {
  email: string;
  id: string;
  name: string | null;
  role: UserRole;
};

export type PlatformOrganizationAccess = {
  canManage: boolean;
  isInternal: boolean;
  organization: {
    email: string | null;
    id: string;
    name: string;
    nip: string | null;
    phone: string | null;
  };
  role: ClientOrganizationRole | "INTERNAL";
};

export async function getOptionalPlatformActor(): Promise<PlatformActor | null> {
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

  if (!user) return null;
  if (user.role !== "CLIENT" && !internalRoles.includes(user.role)) return null;
  return user;
}

export async function requirePlatformActor() {
  const actor = await getOptionalPlatformActor();
  if (!actor) throw new Error("Platforma klienta wymaga zalogowanego uzytkownika.");
  return actor;
}

export function isInternalPlatformRole(role: UserRole) {
  return internalRoles.includes(role);
}

export function canManageOrganization(role: ClientOrganizationRole | "INTERNAL") {
  return role === "INTERNAL" || role === "OWNER" || role === "ADMIN";
}

export async function listAccessibleOrganizations(actor: PlatformActor) {
  const prisma = getPrisma();

  if (isInternalPlatformRole(actor.role)) {
    const organizations = await prisma.organization.findMany({
      orderBy: { updatedAt: "desc" },
      select: { email: true, id: true, name: true, nip: true, phone: true },
      take: 100,
    });

    return organizations.map<PlatformOrganizationAccess>((organization) => ({
      canManage: actor.role === "ADMIN",
      isInternal: true,
      organization,
      role: "INTERNAL",
    }));
  }

  const profiles = await prisma.clientProfile.findMany({
    include: {
      organization: {
        select: { email: true, id: true, name: true, nip: true, phone: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    where: { userId: actor.id },
  });

  return profiles.map<PlatformOrganizationAccess>((profile) => ({
    canManage: canManageOrganization(profile.role),
    isInternal: false,
    organization: profile.organization,
    role: profile.role,
  }));
}

export async function getPlatformContext(requestedOrganizationId?: string) {
  const actor = await getOptionalPlatformActor();
  if (!actor) return null;

  const organizations = await listAccessibleOrganizations(actor);
  const activeAccess =
    organizations.find((access) => access.organization.id === requestedOrganizationId) ??
    organizations[0] ??
    null;

  return {
    actor,
    activeAccess,
    organizations,
  };
}

export async function assertCanAccessOrganization(organizationId: string, actor?: PlatformActor) {
  const checkedActor = actor ?? (await requirePlatformActor());
  const organizations = await listAccessibleOrganizations(checkedActor);
  const access = organizations.find((item) => item.organization.id === organizationId);

  if (!access) {
    throw new Error("Brak dostepu do danych tej organizacji.");
  }

  return { actor: checkedActor, access };
}

export async function assertCanManageOrganization(organizationId: string, actor?: PlatformActor) {
  const result = await assertCanAccessOrganization(organizationId, actor);

  if (!result.access.canManage) {
    throw new Error("Nie masz uprawnien do edycji ustawien tej organizacji.");
  }

  return result;
}
