import "server-only";

import type { DocumentInputStatus, UserRole } from "@prisma/client";

import { auth } from "@/server/auth";
import { getPrisma } from "@/server/db/prisma";
import { DocumentInputError } from "@/server/documents/input-errors";

export type DocumentInputActor = {
  id: string;
  role: UserRole;
};

export type DocumentInputContext = {
  documentInputId?: string;
  orderId?: string | null;
  orderItemId: string;
  organizationId: string;
  templateId: string | null;
  documentType: string | null;
  paymentStatus: string;
  fulfillmentStatus: string;
  status?: DocumentInputStatus;
};

const STAFF_READ_ROLES = new Set<UserRole>(["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY"]);
const STAFF_MUTATE_ROLES = new Set<UserRole>(["ADMIN", "LAWYER", "OPERATOR"]);
const STAFF_REVIEW_ROLES = new Set<UserRole>(["ADMIN", "LAWYER", "OPERATOR"]);

export async function requireDocumentInputActor(): Promise<DocumentInputActor> {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user?.id || !role) {
    throw new DocumentInputError(401, "UNAUTHENTICATED", "Zaloguj sie, aby otworzyc formularz dokumentu.");
  }

  return { id: session.user.id, role };
}

export function canStaffManageDocumentInput(actor: DocumentInputActor) {
  return STAFF_MUTATE_ROLES.has(actor.role);
}

export async function resolveDocumentInputContextFromOrderItem(orderItemId: string, actor: DocumentInputActor) {
  const item = await getPrisma().orderItem.findUnique({
    where: { id: orderItemId },
    include: {
      order: { select: { id: true, organizationId: true, paymentStatus: true } },
      product: { select: { id: true, kind: true, templateId: true, documentType: true } },
      template: { select: { id: true, type: true } },
      documentInput: { select: { id: true, status: true } },
    },
  });

  if (!item) throw new DocumentInputError(404, "ORDER_ITEM_NOT_FOUND", "Nie znaleziono elementu zamowienia.");

  const context: DocumentInputContext = {
    documentInputId: item.documentInput?.id,
    orderId: item.orderId,
    orderItemId: item.id,
    organizationId: item.organizationId,
    templateId: item.templateId ?? item.product?.templateId ?? null,
    documentType: item.documentType ?? item.product?.documentType ?? item.template?.type ?? null,
    paymentStatus: item.order.paymentStatus,
    fulfillmentStatus: item.fulfillmentStatus,
    status: item.documentInput?.status,
  };

  await assertCanCreateDocumentInputForOrderItem(actor, context);
  return context;
}

export async function assertCanReadDocumentInput(actor: DocumentInputActor, documentInputId: string) {
  const input = await getPrisma().documentInput.findUnique({
    where: { id: documentInputId },
    select: { id: true, organizationId: true, orderItemId: true, status: true },
  });

  if (!input) throw new DocumentInputError(404, "DOCUMENT_INPUT_NOT_FOUND", "Nie znaleziono formularza dokumentu.");
  await assertCanReadOrganization(actor, input.organizationId);
  return input;
}

export async function assertCanEditDocumentInput(actor: DocumentInputActor, documentInputId: string) {
  const input = await assertCanReadDocumentInput(actor, documentInputId);

  if (STAFF_MUTATE_ROLES.has(actor.role)) return input;
  if (actor.role !== "CLIENT") throw new DocumentInputError(403, "FORBIDDEN", "Ta rola nie moze edytowac formularza.");
  if (!["DRAFT", "NEEDS_CORRECTION"].includes(input.status)) {
    throw new DocumentInputError(403, "INPUT_LOCKED", "Po wyslaniu formularz nie moze byc edytowany.");
  }

  const item = await getPrisma().orderItem.findUnique({
    where: { id: input.orderItemId },
    include: { order: { select: { paymentStatus: true } } },
  });
  if (!item || item.order.paymentStatus !== "PAID") {
    throw new DocumentInputError(403, "ORDER_NOT_PAID", "Formularz mozna edytowac tylko dla oplaconego zamowienia.");
  }

  return input;
}

export async function assertCanSubmitDocumentInput(actor: DocumentInputActor, documentInputId: string) {
  const input = await assertCanEditDocumentInput(actor, documentInputId);
  if (actor.role === "READ_ONLY") throw new DocumentInputError(403, "READ_ONLY", "Konto ma dostep wylacznie do odczytu.");
  return input;
}

export async function assertCanCreateDocumentInputForOrderItem(actor: DocumentInputActor, context: DocumentInputContext) {
  if (STAFF_MUTATE_ROLES.has(actor.role)) return;
  if (actor.role !== "CLIENT") throw new DocumentInputError(403, "FORBIDDEN", "Ta rola nie moze utworzyc formularza dokumentu.");
  await assertCanReadOrganization(actor, context.organizationId);
  if (context.paymentStatus !== "PAID") {
    throw new DocumentInputError(403, "ORDER_NOT_PAID", "Formularz mozna utworzyc dopiero po oplaceniu zamowienia.");
  }
  if (!context.templateId || !context.documentType) {
    throw new DocumentInputError(400, "NOT_DOCUMENT_ITEM", "Element zamowienia nie jest gotowy jako produkt dokumentowy.");
  }
}

export async function assertCanReadOrganization(actor: DocumentInputActor, organizationId: string) {
  if (STAFF_READ_ROLES.has(actor.role)) return;
  if (actor.role !== "CLIENT") throw new DocumentInputError(403, "FORBIDDEN", "Brak dostepu do organizacji.");

  const profile = await getPrisma().clientProfile.findUnique({
    where: { userId_organizationId: { userId: actor.id, organizationId } },
    select: { id: true },
  });
  if (!profile) throw new DocumentInputError(403, "CROSS_TENANT_BLOCKED", "Nie masz dostepu do tego dokumentu.");
}

export function assertCanMutateDocumentInputInCrm(actor: DocumentInputActor) {
  if (!STAFF_MUTATE_ROLES.has(actor.role)) {
    throw new DocumentInputError(403, actor.role === "READ_ONLY" ? "READ_ONLY" : "FORBIDDEN", "Ta rola nie moze mutowac CRM.");
  }
}

export function assertCanReviewDocumentInputInCrm(actor: DocumentInputActor) {
  if (!STAFF_REVIEW_ROLES.has(actor.role)) {
    throw new DocumentInputError(403, actor.role === "READ_ONLY" ? "READ_ONLY" : "FORBIDDEN", "Ta rola nie moze reviewowac formularza.");
  }
}

export function assertCrmInputRead(actor: DocumentInputActor) {
  if (!STAFF_READ_ROLES.has(actor.role)) {
    throw new DocumentInputError(403, "CRM_FORBIDDEN", "Ta rola nie ma dostepu do CRM.");
  }
}
