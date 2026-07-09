import "server-only";

import type { Prisma } from "@prisma/client";

type ProductSummary = { id: string; sku: string; name: string; documentType: string | null };

type OrderListRecord = Prisma.OrderGetPayload<{
  include: {
    organization: { select: { id: true; name: true; email: true; status: true } };
    owner: { select: { id: true; name: true; email: true } };
    _count: { select: { items: true; payments: true; invoices: true; generatedDocuments: true } };
  };
}>;

type OrderDetailRecord = Prisma.OrderGetPayload<{
  include: {
    organization: { select: { id: true; name: true; email: true; status: true } };
    owner: { select: { id: true; name: true; email: true } };
    lead: { select: { id: true; companyName: true; fullName: true; email: true } };
    items: { include: { product: { select: { id: true; sku: true; name: true; documentType: true } } } };
    payments: { include: { events: true } };
    invoices: true;
    documentInputs: true;
    generationJobs: { include: { template: { select: { id: true; name: true; type: true } } } };
    generatedDocuments: { include: { files: true } };
  };
}>;

type PaymentListRecord = Prisma.PaymentGetPayload<{
  include: {
    order: { select: { id: true; orderNumber: true; organization: { select: { id: true; name: true } } } };
    _count: { select: { events: true } };
  };
}>;

type PaymentDetailRecord = Prisma.PaymentGetPayload<{
  include: {
    order: { select: { id: true; orderNumber: true; totalGrossCents: true; currency: true; organization: { select: { id: true; name: true } } } };
    events: true;
    reviewedBy: { select: { id: true; name: true; email: true } };
  };
}>;

type InvoiceListRecord = Prisma.InvoiceGetPayload<{
  include: {
    order: { select: { id: true; orderNumber: true; organization: { select: { id: true; name: true } } } };
  };
}>;

type InvoiceDetailRecord = Prisma.InvoiceGetPayload<{
  include: {
    order: { select: { id: true; orderNumber: true; organization: { select: { id: true; name: true } } } };
    requestedBy: { select: { id: true; name: true; email: true } };
  };
}>;

export function serializeCrmOrderListItem(order: OrderListRecord) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    organization: order.organization,
    owner: order.owner,
    status: order.status,
    paymentStatus: order.paymentStatus,
    invoiceStatus: order.invoiceStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    customerEmail: order.customerEmail,
    buyerName: order.buyerName,
    totals: money(order.totalNetCents, order.totalVatCents, order.totalGrossCents, order.currency),
    counts: order._count,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export function serializeCrmOrderDetail(order: OrderDetailRecord) {
  return {
    ...serializeCrmOrderListItem({
      ...order,
      _count: {
        items: order.items.length,
        payments: order.payments.length,
        invoices: order.invoices.length,
        generatedDocuments: order.generatedDocuments.length,
      },
    }),
    lead: order.lead,
    buyerTaxId: order.buyerTaxId,
    billingAddress: order.billingAddress,
    source: order.source,
    internalNote: order.internalNote,
    cancelledAt: order.cancelledAt,
    archivedAt: order.archivedAt,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      documentType: item.documentType,
      quantity: item.quantity,
      product: item.product ? product(item.product) : null,
      fulfillmentStatus: item.fulfillmentStatus,
      totals: money(item.totalNetCents, item.totalVatCents, item.totalGrossCents, order.currency),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
    payments: order.payments.map(serializePaymentInline),
    invoices: order.invoices.map(serializeInvoiceInline),
    documentInputs: order.documentInputs.map((input) => ({
      id: input.id,
      status: input.status,
      submittedAt: input.submittedAt,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    })),
    documentJobs: order.generationJobs.map((job) => ({
      id: job.id,
      status: job.status,
      template: job.template,
      retryCount: job.retryCount,
      safeErrorSummary: safeSummary(job.errorMessage),
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt,
    })),
    generatedDocuments: order.generatedDocuments.map((document) => ({
      id: document.id,
      type: document.type,
      status: document.status,
      reviewStatus: document.reviewStatus,
      fileCount: document.files.length,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    })),
  };
}

export function serializeCrmPaymentListItem(payment: PaymentListRecord) {
  return {
    id: payment.id,
    order: payment.order,
    provider: payment.provider,
    mode: payment.mode,
    status: payment.status,
    reviewStatus: payment.reviewStatus,
    amount: amount(payment.amountCents, payment.currency),
    payloadHash: payment.payloadHash,
    eventCount: payment._count.events,
    safeErrorSummary: safeSummary(payment.safeError),
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

export function serializeCrmPaymentDetail(payment: PaymentDetailRecord) {
  return {
    ...serializeCrmPaymentListItem({ ...payment, _count: { events: payment.events.length } }),
    providerPaymentId: payment.providerPaymentId,
    idempotencyKey: mask(payment.idempotencyKey),
    reviewedBy: payment.reviewedBy,
    reviewedAt: payment.reviewedAt,
    events: payment.events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      status: event.status,
      payloadHash: event.payloadHash,
      safeSummary: event.safeSummary,
      createdAt: event.createdAt,
    })),
  };
}

export function serializeCrmInvoiceListItem(invoice: InvoiceListRecord) {
  return {
    id: invoice.id,
    order: invoice.order,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    mode: invoice.mode,
    buyerName: invoice.buyerName,
    buyerTaxId: invoice.buyerTaxId,
    buyerEmail: invoice.buyerEmail,
    totals: money(invoice.totalNetCents, invoice.totalVatCents, invoice.totalGrossCents, invoice.currency),
    providerRef: invoice.providerRef,
    externalUrl: invoice.externalUrl,
    payloadHash: invoice.payloadHash,
    safeErrorSummary: safeSummary(invoice.safeError),
    issuedAt: invoice.issuedAt,
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
  };
}

export function serializeCrmInvoiceDetail(invoice: InvoiceDetailRecord) {
  return {
    ...serializeCrmInvoiceListItem(invoice),
    requestedBy: invoice.requestedBy,
    cancelledAt: invoice.cancelledAt,
  };
}

function serializePaymentInline(payment: OrderDetailRecord["payments"][number]) {
  return {
    id: payment.id,
    provider: payment.provider,
    mode: payment.mode,
    status: payment.status,
    reviewStatus: payment.reviewStatus,
    amount: amount(payment.amountCents, payment.currency),
    payloadHash: payment.payloadHash,
    eventCount: payment.events.length,
    safeErrorSummary: safeSummary(payment.safeError),
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

function serializeInvoiceInline(invoice: OrderDetailRecord["invoices"][number]) {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    mode: invoice.mode,
    totals: money(invoice.totalNetCents, invoice.totalVatCents, invoice.totalGrossCents, invoice.currency),
    issuedAt: invoice.issuedAt,
    createdAt: invoice.createdAt,
  };
}

function product(value: ProductSummary) {
  return {
    id: value.id,
    sku: value.sku,
    name: value.name,
    documentType: value.documentType,
  };
}

function money(netCents: number, vatCents: number, grossCents: number, currency: string) {
  return {
    netCents,
    vatCents,
    grossCents,
    currency,
    grossDisplay: new Intl.NumberFormat("pl-PL", { currency, style: "currency" }).format(grossCents / 100),
  };
}

function amount(cents: number, currency: string) {
  return {
    cents,
    currency,
    display: new Intl.NumberFormat("pl-PL", { currency, style: "currency" }).format(cents / 100),
  };
}

function mask(value: string | null) {
  if (!value) return null;
  if (value.length <= 8) return "****";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function safeSummary(value: string | null) {
  if (!value) return null;
  return value.slice(0, 240);
}
