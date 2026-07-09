import "server-only";

import { Prisma } from "@prisma/client";
import type { z } from "zod";

import type { CrmActor } from "@/server/crm/access";
import { writeCrmAudit } from "@/server/crm/audit-service";
import { assertCanCancelSandbox, assertCanReadCommerce, assertCanRequestInvoice } from "@/server/crm/commerce-permissions";
import type { crmInvoiceListQuerySchema, invoiceRequestSchema } from "@/server/crm/order-schemas";
import { serializeCrmInvoiceDetail, serializeCrmInvoiceListItem } from "@/server/crm/order-serializers";
import { CrmServiceError } from "@/server/crm/service";
import { getPrisma } from "@/server/db/prisma";

type InvoiceListInput = z.infer<typeof crmInvoiceListQuerySchema>;
type InvoiceRequestInput = z.infer<typeof invoiceRequestSchema>;

const invoiceListInclude = {
  order: { select: { id: true, orderNumber: true, organization: { select: { id: true, name: true } } } },
} satisfies Prisma.InvoiceInclude;

const invoiceDetailInclude = {
  ...invoiceListInclude,
  requestedBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.InvoiceInclude;

export async function listCrmInvoices(input: InvoiceListInput, actor: CrmActor) {
  assertCanReadCommerce(actor);
  const rows = await getPrisma().invoice.findMany({
    where: {
      ...(input.status ? { status: input.status } : {}),
      ...(input.mode ? { mode: input.mode } : {}),
      ...(input.orderId ? { orderId: input.orderId } : {}),
      ...(input.organizationId ? { order: { organizationId: input.organizationId } } : {}),
      ...(input.q
        ? {
            OR: [
              { invoiceNumber: { contains: input.q, mode: "insensitive" } },
              { buyerName: { contains: input.q, mode: "insensitive" } },
              { buyerTaxId: { contains: input.q, mode: "insensitive" } },
              { order: { orderNumber: { contains: input.q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: invoiceListInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  const items = rows.slice(0, input.limit);
  return {
    items: items.map(serializeCrmInvoiceListItem),
    nextCursor: rows.length > input.limit ? items.at(-1)?.id ?? null : null,
  };
}

export async function getCrmInvoice(invoiceId: string, actor: CrmActor) {
  assertCanReadCommerce(actor);
  const invoice = await getPrisma().invoice.findUnique({ where: { id: invoiceId }, include: invoiceDetailInclude });
  if (!invoice) throw new CrmServiceError(404, "INVOICE_NOT_FOUND", "Nie znaleziono faktury.");
  return serializeCrmInvoiceDetail(invoice);
}

export async function requestInvoiceForOrderFromCrm(orderId: string, input: InvoiceRequestInput, actor: CrmActor) {
  assertCanRequestInvoice(actor);
  const prisma = getPrisma();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { invoices: { where: { status: { not: "CANCELLED" } }, select: { id: true } } },
  });
  if (!order) throw new CrmServiceError(404, "ORDER_NOT_FOUND", "Nie znaleziono zamowienia.");
  if (order.invoices.length > 0) {
    throw new CrmServiceError(409, "INVOICE_ALREADY_EXISTS", "Zamowienie ma juz aktywna fakture mock/sandbox.");
  }

  const invoice = await prisma.$transaction(async (tx) => {
    const created = await tx.invoice.create({
      data: {
        orderId,
        mode: input.mode,
        status: "REQUESTED",
        buyerName: order.buyerName,
        buyerTaxId: order.buyerTaxId,
        buyerEmail: order.customerEmail,
        totalNetCents: order.totalNetCents,
        totalVatCents: order.totalVatCents,
        totalGrossCents: order.totalGrossCents,
        currency: order.currency,
        requestedById: actor.id,
      },
      include: invoiceDetailInclude,
    });
    await tx.order.update({ where: { id: orderId }, data: { invoiceStatus: "REQUESTED" } });
    await writeCrmAudit(tx, actor, "crm.invoice.requested", "Order", orderId, { invoiceId: created.id, mode: input.mode }, order.organizationId);
    return created;
  });

  return serializeCrmInvoiceDetail(invoice);
}

export async function retryInvoiceIssueSandbox(invoiceId: string, actor: CrmActor) {
  assertCanRequestInvoice(actor);
  const prisma = getPrisma();
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { order: { select: { id: true, organizationId: true } } },
  });
  if (!invoice) throw new CrmServiceError(404, "INVOICE_NOT_FOUND", "Nie znaleziono faktury.");
  if (!["MOCK", "SANDBOX"].includes(invoice.mode)) {
    throw new CrmServiceError(400, "LIVE_INVOICES_DISABLED", "Retry jest dostepny tylko dla mock/sandbox.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "ISSUED",
        issuedAt: new Date(),
        invoiceNumber: invoice.invoiceNumber ?? `MOCK-${invoice.id.slice(-8).toUpperCase()}`,
        providerRef: invoice.providerRef ?? `mock:${invoice.id}`,
      },
      include: invoiceDetailInclude,
    });
    await tx.order.update({ where: { id: invoice.orderId }, data: { invoiceStatus: "ISSUED" } });
    await writeCrmAudit(tx, actor, "crm.invoice.retry_issued_sandbox", "Invoice", invoiceId, { mode: invoice.mode }, invoice.order.organizationId);
    return next;
  });
  return serializeCrmInvoiceDetail(updated);
}

export async function cancelInvoiceSandbox(invoiceId: string, actor: CrmActor) {
  assertCanCancelSandbox(actor);
  const prisma = getPrisma();
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { order: { select: { id: true, organizationId: true } } },
  });
  if (!invoice) throw new CrmServiceError(404, "INVOICE_NOT_FOUND", "Nie znaleziono faktury.");

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.invoice.update({
      where: { id: invoiceId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
      include: invoiceDetailInclude,
    });
    await tx.order.update({ where: { id: invoice.orderId }, data: { invoiceStatus: "CANCELLED" } });
    await writeCrmAudit(tx, actor, "crm.invoice.cancelled_sandbox", "Invoice", invoiceId, { mode: invoice.mode }, invoice.order.organizationId);
    return next;
  });
  return serializeCrmInvoiceDetail(updated);
}
