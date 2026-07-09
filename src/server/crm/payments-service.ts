import "server-only";

import { Prisma } from "@prisma/client";
import type { z } from "zod";

import type { CrmActor } from "@/server/crm/access";
import { writeCrmAudit } from "@/server/crm/audit-service";
import { assertCanOperateCommerce, assertCanReadCommerce, assertCanRetryPayment } from "@/server/crm/commerce-permissions";
import type { crmPaymentListQuerySchema, paymentReviewSchema } from "@/server/crm/order-schemas";
import { serializeCrmPaymentDetail, serializeCrmPaymentListItem } from "@/server/crm/order-serializers";
import { CrmServiceError } from "@/server/crm/service";
import { getPrisma } from "@/server/db/prisma";

type PaymentListInput = z.infer<typeof crmPaymentListQuerySchema>;
type PaymentReviewInput = z.infer<typeof paymentReviewSchema>;

const paymentListInclude = {
  order: { select: { id: true, orderNumber: true, organization: { select: { id: true, name: true } } } },
  _count: { select: { events: true } },
} satisfies Prisma.PaymentInclude;

const paymentDetailInclude = {
  order: { select: { id: true, orderNumber: true, totalGrossCents: true, currency: true, organization: { select: { id: true, name: true } } } },
  events: { orderBy: { createdAt: "desc" as const }, take: 100 },
  reviewedBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.PaymentInclude;

export async function listCrmPayments(input: PaymentListInput, actor: CrmActor) {
  assertCanReadCommerce(actor);
  const where: Prisma.PaymentWhereInput = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.provider ? { provider: input.provider } : {}),
    ...(input.orderId ? { orderId: input.orderId } : {}),
    ...(input.organizationId ? { order: { organizationId: input.organizationId } } : {}),
    ...(input.q
      ? {
          OR: [
            { id: { contains: input.q, mode: "insensitive" } },
            { providerPaymentId: { contains: input.q, mode: "insensitive" } },
            { order: { orderNumber: { contains: input.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
  const rows = await getPrisma().payment.findMany({
    where,
    include: paymentListInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  const items = rows.slice(0, input.limit);
  return {
    items: items.map(serializeCrmPaymentListItem),
    nextCursor: rows.length > input.limit ? items.at(-1)?.id ?? null : null,
  };
}

export async function getCrmPayment(paymentId: string, actor: CrmActor) {
  assertCanReadCommerce(actor);
  const payment = await getPrisma().payment.findUnique({ where: { id: paymentId }, include: paymentDetailInclude });
  if (!payment) throw new CrmServiceError(404, "PAYMENT_NOT_FOUND", "Nie znaleziono platnosci.");
  return serializeCrmPaymentDetail(payment);
}

export async function getPaymentEvents(paymentId: string, actor: CrmActor) {
  assertCanReadCommerce(actor);
  const payment = await getCrmPayment(paymentId, actor);
  return { items: payment.events };
}

export async function retryPaymentStatusCheck(paymentId: string, actor: CrmActor) {
  assertCanRetryPayment(actor);
  const prisma = getPrisma();
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: { select: { id: true, organizationId: true } } },
  });
  if (!payment) throw new CrmServiceError(404, "PAYMENT_NOT_FOUND", "Nie znaleziono platnosci.");
  if (!["MOCK", "SANDBOX"].includes(payment.provider)) {
    throw new CrmServiceError(400, "LIVE_PROVIDER_DISABLED", "Retry jest dostepny tylko dla mock/sandbox.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.paymentEvent.create({
      data: {
        paymentId,
        eventType: "crm.retry_status_check",
        status: payment.status,
        payloadHash: payment.payloadHash,
        safeSummary: "CRM retry status check queued in sandbox mode.",
      },
    });
    await writeCrmAudit(tx, actor, "crm.payment.retry_status", "Payment", paymentId, { status: payment.status }, payment.order.organizationId);
  });

  return getCrmPayment(paymentId, actor);
}

export async function markPaymentAsReviewed(paymentId: string, input: PaymentReviewInput, actor: CrmActor) {
  assertCanOperateCommerce(actor);
  const prisma = getPrisma();
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: { select: { organizationId: true } } },
  });
  if (!payment) throw new CrmServiceError(404, "PAYMENT_NOT_FOUND", "Nie znaleziono platnosci.");

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: { reviewStatus: input.reviewStatus, reviewedById: actor.id, reviewedAt: new Date() },
    });
    await writeCrmAudit(tx, actor, "crm.payment.reviewed", "Payment", paymentId, { reviewStatus: input.reviewStatus }, payment.order.organizationId);
  });

  return getCrmPayment(paymentId, actor);
}
