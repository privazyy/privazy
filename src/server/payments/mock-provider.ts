import "server-only";

import { getPrisma } from "@/server/db/prisma";
import { buildIdempotencyKey } from "@/server/automations/idempotency";
import { emitEvent } from "@/server/events/emit-event";
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
    await getPrisma().webhookEvent.upsert({
      create: {
        eventType: "payment.mock",
        externalEventId: `${payload.paymentId}:${payload.status ?? "paid"}`,
        metadata: { paymentId: payload.paymentId, status: payload.status ?? "paid" },
        provider: "MOCK",
        status: "RECEIVED",
      },
      update: {
        metadata: { paymentId: payload.paymentId, status: payload.status ?? "paid" },
        status: "RECEIVED",
      },
      where: {
        provider_externalEventId: {
          externalEventId: `${payload.paymentId}:${payload.status ?? "paid"}`,
          provider: "MOCK",
        },
      },
    });
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

  await emitEvent({
    eventType: "order.payment.succeeded.v1",
    idempotencyKey: buildIdempotencyKey(["payment-succeeded", payment.id]),
    organizationId: updated.organizationId,
    payload: {
      orderId: updated.id,
      orderItemIds: updated.items.map((item) => item.id),
      organizationId: updated.organizationId,
      paymentId: payment.id,
      resourceId: payment.id,
    },
    source: "payment-provider",
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

  await emitEvent({
    eventType: "order.payment.failed.v1",
    idempotencyKey: buildIdempotencyKey(["payment-failed", payment.id]),
    organizationId: order.organizationId,
    payload: {
      orderId: order.id,
      organizationId: order.organizationId,
      paymentId: payment.id,
      resourceId: payment.id,
    },
    source: "payment-provider",
  });

  return { orderNumber: order.orderNumber, status: "FAILED" } as const;
}
