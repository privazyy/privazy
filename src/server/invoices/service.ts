import "server-only";

import { InvoiceStatus, type Invoice, type UserRole } from "@prisma/client";

import { CommerceError } from "@/server/commerce/errors";
import { getPrisma } from "@/server/db/prisma";
import { getInvoiceProvider } from "@/server/invoices";
import { assertMockInvoiceIssuingEnabled } from "@/server/invoices/flags";
import { isInvoiceUniqueConflict } from "@/server/invoices/mock-provider";

export type InvoiceActor = {
  role: UserRole;
  userId: string;
};

const staffReadRoles = new Set<UserRole>([
  "ADMIN",
  "LAWYER",
  "OPERATOR",
  "READ_ONLY",
]);
const invoiceMutationRoles = new Set<UserRole>([
  "ADMIN",
  "LAWYER",
  "OPERATOR",
  "CLIENT",
]);

export async function requestInvoiceForOrder(
  orderId: string,
  actor: InvoiceActor,
) {
  assertMockInvoiceIssuingEnabled();
  assertCanMutate(actor);

  const prisma = getPrisma();
  const order = await prisma.order.findUnique({
    include: {
      billingProfile: true,
      invoice: true,
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
    where: { id: orderId },
  });
  if (!order) {
    throw new CommerceError("not_found", "Zamówienie nie istnieje.", 404);
  }

  await assertCanAccessOrder(actor, order);
  assertInvoiceEligible(order);

  if (order.invoice) {
    return { created: false, invoice: order.invoice };
  }

  try {
    const invoice = await prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          buyerAddress: {
            addressLine1: order.billingProfile.addressLine1,
            addressLine2: order.billingProfile.addressLine2,
            city: order.billingProfile.city,
            country: order.billingProfile.country,
            postalCode: order.billingProfile.postalCode,
          },
          buyerCompany: order.billingProfile.companyName,
          buyerEmail: order.billingProfile.email,
          buyerName: order.billingProfile.name,
          buyerTaxId: order.billingProfile.nip,
          currency: order.currency,
          discountCents: order.discountCents,
          mode: "MOCK",
          orderId: order.id,
          organizationId: order.organizationId,
          provider: "MOCK",
          status: "REQUESTED",
          totalGrossCents: order.totalGrossCents,
          totalNetCents: order.subtotalNetCents,
          totalVatCents: order.vatCents,
          userId: order.userId,
        },
      });
      await tx.auditLog.create({
        data: {
          action: "invoice.requested",
          entityId: created.id,
          entityType: "Invoice",
          metadata: {
            mode: "MOCK",
            orderId: order.id,
          },
          organizationId: order.organizationId,
          userId: actor.userId,
        },
      });

      return created;
    });

    return { created: true, invoice };
  } catch (error) {
    if (isInvoiceUniqueConflict(error)) {
      const existing = await prisma.invoice.findUnique({
        where: { orderId: order.id },
      });
      if (existing) return { created: false, invoice: existing };
    }

    throw error;
  }
}

export async function createMockInvoiceForPaidOrder(
  orderId: string,
  actor: InvoiceActor,
) {
  const requested = await requestInvoiceForOrder(orderId, actor);
  await getInvoiceProvider().createInvoice({
    actorUserId: actor.userId,
    invoiceId: requested.invoice.id,
  });
  const invoice = await getPrisma().invoice.findUnique({
    where: { id: requested.invoice.id },
  });
  if (!invoice) {
    throw new CommerceError(
      "not_found",
      "Faktura nie istnieje po wystawieniu.",
      404,
    );
  }

  return {
    created: requested.created,
    invoice,
  };
}

export async function getInvoiceForOrder(
  orderId: string,
  actor: InvoiceActor,
) {
  const invoice = await getPrisma().invoice.findUnique({
    include: { order: true },
    where: { orderId },
  });
  if (!invoice) return null;

  await assertCanAccessOrder(actor, invoice.order);
  return invoice;
}

export async function getInvoiceById(
  invoiceId: string,
  actor: InvoiceActor,
) {
  const invoice = await getPrisma().invoice.findUnique({
    include: {
      events: {
        orderBy: { createdAt: "desc" },
      },
      order: true,
    },
    where: { id: invoiceId },
  });
  if (!invoice) return null;

  await assertCanAccessOrder(actor, invoice.order);
  return invoice;
}

export async function listInvoices(
  params: { limit?: number; status?: InvoiceStatus },
  actor: InvoiceActor,
) {
  const prisma = getPrisma();
  const limit = Math.max(1, Math.min(params.limit ?? 50, 100));

  if (staffReadRoles.has(actor.role)) {
    return prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      where: params.status ? { status: params.status } : undefined,
    });
  }
  if (actor.role !== "CLIENT") {
    throw new CommerceError("forbidden", "Brak dostępu do faktur.", 403);
  }

  const organizationIds = await getClientOrganizationIds(actor.userId);
  return prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    where: {
      AND: [
        params.status ? { status: params.status } : {},
        {
          OR: [
            { userId: actor.userId },
            ...(organizationIds.length > 0
              ? [{ organizationId: { in: organizationIds } }]
              : []),
          ],
        },
      ],
    },
  });
}

export function serializeInvoiceForClient(invoice: Invoice) {
  return {
    buyer: {
      address: invoice.buyerAddress,
      company: invoice.buyerCompany,
      email: invoice.buyerEmail,
      name: invoice.buyerName,
      taxId: invoice.buyerTaxId,
    },
    createdAt: invoice.createdAt,
    currency: invoice.currency,
    discountCents: invoice.discountCents,
    documentKind: "TEST_INVOICE_NOT_ACCOUNTING_DOCUMENT",
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    issuedAt: invoice.issuedAt,
    mode: invoice.mode,
    pdfAvailable: Boolean(invoice.pdfFileId),
    provider: invoice.provider,
    status: invoice.status,
    totalGrossCents: invoice.totalGrossCents,
    totalNetCents: invoice.totalNetCents,
    totalVatCents: invoice.totalVatCents,
  };
}

export function serializeInvoiceForCrm(invoice: Invoice) {
  return {
    ...serializeInvoiceForClient(invoice),
    externalId: invoice.externalId,
    externalUrl:
      process.env.NODE_ENV === "production" ? null : invoice.externalUrl,
    failureReason: invoice.failureReason,
    orderId: invoice.orderId,
    organizationId: invoice.organizationId,
    userId: invoice.userId,
  };
}

function assertCanMutate(actor: InvoiceActor) {
  if (actor.role === "READ_ONLY") {
    throw new CommerceError(
      "forbidden",
      "Rola READ_ONLY nie może wystawiać faktur.",
      403,
    );
  }
  if (!invoiceMutationRoles.has(actor.role)) {
    throw new CommerceError("forbidden", "Brak uprawnień do faktur.", 403);
  }
}

async function assertCanAccessOrder(
  actor: InvoiceActor,
  order: { organizationId: string | null; userId: string | null },
) {
  if (staffReadRoles.has(actor.role)) return;
  if (actor.role !== "CLIENT") {
    throw new CommerceError("forbidden", "Brak dostępu do zamówienia.", 403);
  }
  if (order.userId === actor.userId) return;
  if (order.organizationId) {
    const profile = await getPrisma().clientProfile.findFirst({
      select: { id: true },
      where: {
        organizationId: order.organizationId,
        userId: actor.userId,
      },
    });
    if (profile) return;
  }

  throw new CommerceError("forbidden", "Brak dostępu do zamówienia.", 403);
}

function assertInvoiceEligible(order: {
  currency: string;
  discountCents: number;
  paymentStatus: string;
  payments: Array<{
    amountGrossCents: number;
    currency: string;
    status: string;
  }>;
  status: string;
  subtotalNetCents: number;
  totalGrossCents: number;
  vatCents: number;
  wantsInvoice: boolean;
}) {
  if (!order.wantsInvoice) {
    throw new CommerceError(
      "conflict",
      "Dla zamówienia nie zapisano intencji faktury.",
      409,
    );
  }
  if (order.status !== "PAID" || order.paymentStatus !== "SUCCEEDED") {
    throw new CommerceError(
      "conflict",
      "Faktura może powstać wyłącznie dla opłaconego zamówienia.",
      409,
    );
  }
  const confirmedPayment = order.payments.some(
    (payment) =>
      payment.status === "SUCCEEDED" &&
      payment.amountGrossCents === order.totalGrossCents &&
      payment.currency === order.currency,
  );
  if (!confirmedPayment) {
    throw new CommerceError(
      "conflict",
      "Brak zgodnej, zakończonej płatności dla zamówienia.",
      409,
    );
  }
  if (
    order.totalGrossCents !==
    order.subtotalNetCents + order.vatCents - order.discountCents
  ) {
    throw new CommerceError(
      "conflict",
      "Sumy zamówienia są niespójne.",
      409,
    );
  }
}

async function getClientOrganizationIds(userId: string) {
  const profiles = await getPrisma().clientProfile.findMany({
    select: { organizationId: true },
    where: { userId },
  });

  return profiles.map((profile) => profile.organizationId);
}
