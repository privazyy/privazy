import "server-only";

import type { UserRole } from "@prisma/client";

import { auth } from "@/server/auth";
import { CrmAccessError, requireCrmRead, requireCrmWrite, type CrmActor } from "@/server/crm/access";
import { getPrisma } from "@/server/db/prisma";

const RESPONSE_ROLES = new Set<UserRole>(["ADMIN", "LAWYER"]);

export type PortalDsrActor = {
  id: string;
  organizationId: string;
  role: "CLIENT";
};

export async function requirePortalDsrActor(): Promise<PortalDsrActor> {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user?.id || !role) {
    throw new CrmAccessError(401, "UNAUTHENTICATED", "Zaloguj sie, aby otworzyc portal klienta.");
  }

  if (role !== "CLIENT") {
    throw new CrmAccessError(403, "FORBIDDEN", "Ten portal jest dostepny tylko dla roli CLIENT.");
  }

  const profile = await getPrisma().clientProfile.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: { organizationId: true },
  });

  if (!profile) {
    throw new CrmAccessError(403, "FORBIDDEN", "Konto klienta nie jest powiazane z organizacja.");
  }

  return { id: session.user.id, organizationId: profile.organizationId, role };
}

export async function requireDsrCrmRead() {
  return requireCrmRead();
}

export async function requireDsrCrmWrite() {
  return requireCrmWrite();
}

export function assertCanPrepareDsrResponse(actor: CrmActor) {
  if (!RESPONSE_ROLES.has(actor.role)) {
    throw new CrmAccessError(403, "FORBIDDEN", "Tylko ADMIN albo LAWYER moze przygotowac odpowiedz DSR.");
  }
}
