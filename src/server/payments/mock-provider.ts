import "server-only";

import { getPrisma } from "@/server/db/prisma";
import { paymentConfirmedEmail, paymentFailedEmail, sendTransactionalEmail } from "@/server/email/transactional";
import { getInvoiceProvider } from "@/server/invoices";
import { inngest } from "@/server/inngest/client";
import type { CreatePaymentInput, PaymentProviderClient } from "@/server/payments/payment-provider";

export class MockPaymentProvider implements PaymentProviderClient {
  async createPayment(input: CreatePaymentInput) {
    const prisma = getPrisma();
    const payment = await prisma.payment.upsert({
      create: {
        amountGrossCents: input.amountGrossCents,
        currency: input.currency,
        idempotencyKey: `mock:create:${input.orderId}`,
        orderId: input.orderId,
        provider: "MOCK",
        status: "PENDING",
      },
      update: {
        amountGrossCents: input.amountGrossCents,
        currency: input.currency,
        failedAt: null,
        status: "PENDING",
      },
      where: { idempotencyKey: `mock:create:${input.orderId}` },
    });
    const providerPaymentId = payment.providerPaymentId ?? `mock_${payment.id}`;
    const paymentUrl = `/api/payments/mock/complete?paymentId=${payment.id}&token=${input.publicAccessToken}`;

    const updated = await prisma.payment.update({
      data: {
        paymentUrl,
        providerPaymentId,
      },
      where: { id: payment.id },
    });

    return {
      paymentId: updated.id,
      paymentUrl,
      status: "PENDING",
    } as const;
  }

  async getPaymentStatus(paymentId: string) {
    const payment = await getPrisma().payment.findUnique({ where: { id: paymentId } });
    return payment?.status ?? "UNKNOWN";
  }

  async handleWebhook(request: Request) {
    const signature = request.headers.get("x-privazy-mock-signature");
    const secret = process.env.PAYMENT_MOCK_WEBHOOK_SECRET;
    if (secret && signature !== secret) throw new Error("Nieprawidłowy podpis webhooka.");
    if (!secret && process.env.NODE_ENV === "production") throw new Error("Brak konfiguracji podpisu webhooka.");

    const payload = (await request.json()) as { paymentId?: string; status?: string };
    if (!payload.paymentId) throw new Error("Brak paymentId.");
    if (payload.status === "failed") return markPaymentFailed(payload.paymentId);
    return markPaymentPaid(payload.paymentId);
  }

  async refundPayment() {
    return { status: "REFUND_NOT_IMPLEMENTED" } as const;
  }
}

export async function markPaymentPaid(paymentId: string) {
  const prisma = getPrisma();
  const payment = await prisma.payment.findUnique({
    include: { order: true },
    where: { id: paymentId },
  });

  if (!payment) throw new Error("Płatność nie istnieje.");
  if (payment.status === "PAID" && payment.order.status === "PAID") {
    return { orderNumber: payment.order.orderNumber, status: "IGNORED" } as const;
  }

  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    const paidPayment = await tx.payment.update({
      data: {
        paidAt: now,
        rawProviderData: { mockCapturedAt: now.toISOString() },
        status: "PAID",
      },
      where: { id: payment.id },
    });

    const order = await tx.order.update({
      data: {
        paidAt: now,
        status: "PAID",
      },
      include: { items: true },
      where: { id: payment.orderId },
    });

    await tx.orderItem.updateMany({
      data: { status: "INPUT_REQUIRED" },
      where: {
        orderId: order.id,
        status: "PENDING_PAYMENT",
      },
    });

    await tx.auditLog.create({
      data: {
        action: "payment.paid",
        entityId: paidPayment.id,
        entityType: "Payment",
        metadata: { orderId: order.id, provider: "MOCK" },
        organizationId: order.organizationId,
      },
    });

    return order;
  });

  await getInvoiceProvider().issueInvoice({ orderId: updated.id });
  await inngest
    .send({
      data: {
        orderId: updated.id,
        orderItemIds: updated.items.map((item) => item.id),
        orderNumber: updated.orderNumber,
      },
      name: "order/paid",
    })
    .catch((error) => {
      console.error("order/paid event dispatch failed", error);
    });
  await sendTransactionalEmail({
    to: updated.email,
    ...paymentConfirmedEmail({
      orderNumber: updated.orderNumber,
      statusUrl: buildOrderStatusUrl(updated.orderNumber, updated.publicAccessToken),
    }),
  });

  return { orderNumber: updated.orderNumber, status: "PAID" } as const;
}

export async function markPaymentFailed(paymentId: string) {
  const prisma = getPrisma();
  const payment = await prisma.payment.findUnique({
    include: { order: true },
    where: { id: paymentId },
  });

  if (!payment) throw new Error("Płatność nie istnieje.");
  if (payment.status === "FAILED") return { orderNumber: payment.order.orderNumber, status: "IGNORED" } as const;

  const order = await prisma.$transaction(async (tx) => {
    const failedPayment = await tx.payment.update({
      data: {
        failedAt: new Date(),
        status: "FAILED",
      },
      where: { id: payment.id },
    });
    const failedOrder = await tx.order.update({
      data: { status: "PAYMENT_FAILED" },
      where: { id: payment.orderId },
    });

    await tx.auditLog.create({
      data: {
        action: "payment.failed",
        entityId: failedPayment.id,
        entityType: "Payment",
        metadata: { orderId: failedOrder.id, provider: "MOCK" },
        organizationId: failedOrder.organizationId,
      },
    });

    return failedOrder;
  });

  await sendTransactionalEmail({
    to: order.email,
    ...paymentFailedEmail({
      orderNumber: order.orderNumber,
      statusUrl: buildOrderStatusUrl(order.orderNumber, order.publicAccessToken),
    }),
  }).catch((error) => {
    console.error("Payment failed email failed", error);
  });

  return { orderNumber: order.orderNumber, status: "FAILED" } as const;
}

function buildOrderStatusUrl(orderNumber: string, token: string) {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${baseUrl}/zamowienie/${orderNumber}?token=${encodeURIComponent(token)}`;
}
