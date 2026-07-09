import "server-only";

import type { UserRole } from "@prisma/client";

import { auth } from "@/server/auth";
import { getPrisma } from "@/server/db/prisma";
import { ClientPortalError } from "@/server/portal/client-portal-errors";

export type ClientPortalActor = {
  id: string;
  email?: string | null;
  name?: string | null;
  role: UserRole;
  organizationIds: string[];
};

export async function requireClientPortalActor(): Promise<ClientPortalActor> {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user?.id || !role) {
    throw new ClientPortalError(401, "UNAUTHENTICATED", "Zaloguj sie, aby otworzyc portal klienta.");
  }

  if (role !== "CLIENT") {
    throw new ClientPortalError(403, "CLIENT_ONLY", "Portal klienta jest dostepny tylko dla roli CLIENT.");
  }

  const profiles = await getPrisma().clientProfile.findMany({
    where: { userId: session.user.id },
    select: { organizationId: true },
  });

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role,
    organizationIds: profiles.map((profile) => profile.organizationId),
  };
}

export function assertHasClientOrganization(actor: ClientPortalActor) {
  if (actor.organizationIds.length === 0) {
    throw new ClientPortalError(403, "NO_CLIENT_ORGANIZATION", "Konto klienta nie jest przypisane do organizacji.");
  }
}

export function assertClientOrganizationAccess(actor: ClientPortalActor, organizationId: string) {
  if (!actor.organizationIds.includes(organizationId)) {
    throw new ClientPortalError(403, "CROSS_TENANT_BLOCKED", "Brak dostepu do danych tej organizacji.");
  }
}

export async function assertCanReadClientOrder(actor: ClientPortalActor, orderId: string) {
  assertHasClientOrganization(actor);
  const order = await getPrisma().portalOrder.findUnique({
    where: { id: orderId },
    select: { id: true, organizationId: true },
  });
  if (!order) throw new ClientPortalError(404, "ORDER_NOT_FOUND", "Nie znaleziono zamowienia.");
  assertClientOrganizationAccess(actor, order.organizationId);
}

export async function assertCanReadClientDocumentInput(actor: ClientPortalActor, inputId: string) {
  assertHasClientOrganization(actor);
  const input = await getPrisma().portalDocumentInput.findUnique({
    where: { id: inputId },
    select: { id: true, organizationId: true },
  });
  if (!input) throw new ClientPortalError(404, "DOCUMENT_INPUT_NOT_FOUND", "Nie znaleziono formularza dokumentu.");
  assertClientOrganizationAccess(actor, input.organizationId);
}

export async function assertCanReadGeneratedDocument(actor: ClientPortalActor, documentId: string) {
  assertHasClientOrganization(actor);
  const document = await getPrisma().generatedDocument.findUnique({
    where: { id: documentId },
    select: { id: true, organizationId: true },
  });
  if (!document) throw new ClientPortalError(404, "DOCUMENT_NOT_FOUND", "Nie znaleziono dokumentu.");
  assertClientOrganizationAccess(actor, document.organizationId);
}
