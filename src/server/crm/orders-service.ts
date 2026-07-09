import "server-only";

import { Prisma, type OrderStatus, type FulfillmentStatus } from "@prisma/client";
import type { z } from "zod";

import type { CrmActor } from "@/server/crm/access";
import { writeCrmAudit } from "@/server/crm/audit-service";
import {
  assertCanCancelSandbox,
  assertCanOperateCommerce,
  assertCanReadCommerce,
} from "@/server/crm/commerce-permissions";
import type {
  assignOrderOwnerSchema,
  crmOrderListQuerySchema,
  orderNoteSchema,
  updateOrderInternalStatusSchema,
} from "@/server/crm/order-schemas";
import { serializeCrmNote } from "@/server/crm/serializers";
import { serializeCrmOrderDetail, serializeCrmOrderListItem } from "@/server/crm/order-serializers";
import { CrmServiceError } from "@/server/crm/errors";
import { getPrisma } from "@/server/db/prisma";

type OrderListInput = z.infer<typeof crmOrderListQuerySchema>;
type OrderNoteInput = z.infer<typeof orderNoteSchema>;
type AssignOwnerInput = z.infer<typeof assignOrderOwnerSchema>;
type UpdateStatusInput = z.infer<typeof updateOrderInternalStatusSchema>;

const orderListInclude = {
  organization: { select: { id: true, name: true, email: true, status: true } },
  owner: { select: { id: true, name: true, email: true } },
  _count: { select: { items: true, payments: true, invoices: true, generatedDocuments: true } },
} satisfies Prisma.OrderInclude;

const orderDetailInclude = {
  organization: { select: { id: true, name: true, email: true, status: true } },
  owner: { select: { id: true, name: true, email: true } },
  lead: { select: { id: true, companyName: true, fullName: true, email: true } },
  items: { orderBy: { createdAt: "asc" as const }, include: { product: { select: { id: true, sku: true, name: true, documentType: true } } } },
  payments: { orderBy: { createdAt: "desc" as const }, include: { events: { orderBy: { createdAt: "desc" as const }, take: 10 } } },
  invoices: { orderBy: { createdAt: "desc" as const } },
  documentInputs: { orderBy: { createdAt: "desc" as const } },
  generationJobs: { orderBy: { createdAt: "desc" as const }, include: { template: { select: { id: true, name: true, type: true } } } },
  generatedDocuments: { orderBy: { createdAt: "desc" as const }, include: { files: true } },
} satisfies Prisma.OrderInclude;

export async function listCrmOrders(input: OrderListInput, actor: CrmActor) {
  assertCanReadCommerce(actor);
  const prisma = getPrisma();
  const where: Prisma.OrderWhereInput = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.paymentStatus ? { paymentStatus: input.paymentStatus } : {}),
    ...(input.invoiceStatus ? { invoiceStatus: input.invoiceStatus } : {}),
    ...(input.fulfillmentStatus ? { fulfillmentStatus: input.fulfillmentStatus } : {}),
    ...(input.organizationId ? { organizationId: input.organizationId } : {}),
    ...(input.email ? { customerEmail: input.email } : {}),
    ...(input.productId ? { items: { some: { productId: input.productId } } } : {}),
    ...(input.documentType ? { items: { some: { documentType: input.documentType } } } : {}),
    ...(input.dateFrom || input.dateTo
      ? {
          createdAt: {
            ...(input.dateFrom ? { gte: new Date(input.dateFrom) } : {}),
            ...(input.dateTo ? { lte: new Date(input.dateTo) } : {}),
          },
        }
      : {}),
    ...(input.q
      ? {
          OR: [
            { orderNumber: { contains: input.q, mode: "insensitive" } },
            { customerEmail: { contains: input.q, mode: "insensitive" } },
            { buyerName: { contains: input.q, mode: "insensitive" } },
            { buyerTaxId: { contains: input.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const rows = await prisma.order.findMany({
    where,
    include: orderListInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  const items = rows.slice(0, input.limit);
  return {
    items: items.map(serializeCrmOrderListItem),
    nextCursor: rows.length > input.limit ? items.at(-1)?.id ?? null : null,
  };
}

export async function getCrmOrder(orderId: string, actor: CrmActor) {
  assertCanReadCommerce(actor);
  const order = await getPrisma().order.findUnique({ where: { id: orderId }, include: orderDetailInclude });
  if (!order) throw new CrmServiceError(404, "ORDER_NOT_FOUND", "Nie znaleziono zamowienia.");
  return serializeCrmOrderDetail(order);
}

export async function getCrmOrderTimeline(orderId: string, actor: CrmActor) {
  assertCanReadCommerce(actor);
  await assertOrderExists(orderId);
  const logs = await getPrisma().auditLog.findMany({
    where: { entityType: "Order", entityId: orderId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 100,
  });
  return {
    items: logs.map((log) => ({
      id: log.id,
      type: log.action,
      title: auditTitle(log.action),
      actor: log.user,
      createdAt: log.createdAt,
    })),
  };
}

export async function addOrderNote(orderId: string, input: OrderNoteInput, actor: CrmActor) {
  assertCanOperateCommerce(actor);
  const prisma = getPrisma();
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true, organizationId: true } });
  if (!order) throw new CrmServiceError(404, "ORDER_NOT_FOUND", "Nie znaleziono zamowienia.");

  const note = await prisma.$transaction(async (tx) => {
    const created = await tx.crmNote.create({
      data: { organizationId: order.organizationId, authorId: actor.id, body: input.body },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    await writeCrmAudit(tx, actor, "crm.order.note_added", "Order", order.id, { noteId: created.id }, order.organizationId);
    return created;
  });
  return serializeCrmNote(note);
}

export async function assignOrderOwner(orderId: string, input: AssignOwnerInput, actor: CrmActor) {
  assertCanOperateCommerce(actor);
  await assertAssignableUser(input.ownerId);
  return updateOrder(
    orderId,
    { owner: input.ownerId ? { connect: { id: input.ownerId } } : { disconnect: true } },
    actor,
    "crm.order.owner_assigned",
  );
}

export async function updateOrderInternalStatus(orderId: string, input: UpdateStatusInput, actor: CrmActor) {
  assertCanOperateCommerce(actor);
  return updateOrder(
    orderId,
    {
      ...(input.status ? { status: input.status as OrderStatus } : {}),
      ...(input.fulfillmentStatus ? { fulfillmentStatus: input.fulfillmentStatus as FulfillmentStatus } : {}),
      ...(input.internalNote !== undefined ? { internalNote: input.internalNote } : {}),
    },
    actor,
    "crm.order.status_updated",
  );
}

export async function cancelOrderSandbox(orderId: string, actor: CrmActor) {
  assertCanCancelSandbox(actor);
  return updateOrder(
    orderId,
    { status: "CANCELLED", fulfillmentStatus: "CANCELLED", cancelledAt: new Date() },
    actor,
    "crm.order.cancelled_sandbox",
  );
}

async function updateOrder(orderId: string, data: Prisma.OrderUpdateInput, actor: CrmActor, action: string) {
  const prisma = getPrisma();
  const existing = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true, organizationId: true } });
  if (!existing) throw new CrmServiceError(404, "ORDER_NOT_FOUND", "Nie znaleziono zamowienia.");

  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({ where: { id: orderId }, data, include: orderDetailInclude });
    await writeCrmAudit(tx, actor, action, "Order", orderId, { changedFields: Object.keys(data) }, existing.organizationId);
    return updated;
  });
  return serializeCrmOrderDetail(order);
}

async function assertOrderExists(orderId: string) {
  const order = await getPrisma().order.findUnique({ where: { id: orderId }, select: { id: true } });
  if (!order) throw new CrmServiceError(404, "ORDER_NOT_FOUND", "Nie znaleziono zamowienia.");
}

async function assertAssignableUser(id?: string | null) {
  if (!id) return;
  const user = await getPrisma().user.findUnique({ where: { id }, select: { role: true } });
  if (!user || !["ADMIN", "LAWYER", "OPERATOR"].includes(user.role)) {
    throw new CrmServiceError(400, "INVALID_ASSIGNEE", "Opiekun musi miec role operacyjna.");
  }
}

function auditTitle(action: string) {
  if (action.includes("invoice")) return "Faktura";
  if (action.includes("payment")) return "Platnosc";
  if (action.includes("note")) return "Notatka";
  if (action.includes("status")) return "Status";
  return "Zdarzenie";
}
