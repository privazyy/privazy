import "server-only";

import { Prisma } from "@prisma/client";
import { z } from "zod";

import { getPrisma } from "@/server/db/prisma";
import { paymentConfirmedEmail, paymentFailedEmail, sendTransactionalEmail } from "@/server/email/transactional";
import { issueInvoiceForOrder } from "@/server/invoices/invoice-service";
import { inngest } from "@/server/inngest/client";
import type { CreatePaymentInput, PaymentProviderClient, PaymentWebhookResult } from "@/server/payments/payment-provider";

const mockPaymentWebhookSchema = z.object({
  amountGrossCents: z.number().int().positive().optional(),
  currency: z.string().trim().length(3).optional(),
  eventId: z.string().trim().min(3),
  paymentId: z.string().trim().min(1),
  status: z.enum(["paid", "failed"]).default("paid"),
});

type MockPaymentEventInput = {
  amountGrossCents?: number;
  currency?: string;
  eventType: string;
  paymentId: string;
  providerEventId: string;
  rawPayload: unknown;
  status: "paid" | "failed";
};

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
    if (secret && signature !== secret) throw new Error("Nieprawidlowy podpis webhooka.");
    if (!secret && process.env.NODE_ENV === "production") throw new Error("Brak konfiguracji podpisu webhooka.");

    const payload = mockPaymentWebhookSchema.parse(await request.json());

    return applyMockPaymentEvent({
      amountGrossCents: payload.amountGrossCents,
      currency: payload.currency,
      eventType: `mock.webhook.${payload.status}`,
      paymentId: payload.paymentId,
      providerEventId: payload.eventId,
      rawPayload: payload,
      status: payload.status,
    });
  }

  async refundPayment() {
    return { status: "REFUND_NOT_IMPLEMENTED" } as const;
  }
}

export async function markPaymentPaid(paymentId: string, event?: Partial<Omit<MockPaymentEventInput, "paymentId" | "status">>) {
  return applyMockPaymentEvent({
    eventType: event?.eventType ?? "mock.complete",
    paymentId,
    providerEventId: event?.providerEventId ?? `mock-complete:${paymentId}`,
    rawPayload: event?.rawPayload ?? { paymentId, source: "mock_complete_url" },
    status: "paid",
  });
}

export async function markPaymentFailed(paymentId: string, event?: Partial<Omit<MockPaymentEventInput, "paymentId" | "status">>) {
  return applyMockPaymentEvent({
    eventType: event?.eventType ?? "mock.failed",
    paymentId,
    providerEventId: event?.providerEventId ?? `mock-failed:${paymentId}`,
    rawPayload: event?.rawPayload ?? { paymentId, source: "mock_failure" },
    status: "failed",
  });
}

async function applyMockPaymentEvent(input: MockPaymentEventInput): Promise<PaymentWebhookResult> {
  const prisma = getPrisma();
  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      include: { order: true },
      where: { id: input.paymentId },
    });

    if (!payment) throw new Error("Platnosc nie istnieje.");

    const existingEvent = await tx.paymentEvent.findUnique({
      where: {
        provider_providerEventId: {
          provider: "MOCK",
          providerEventId: input.providerEventId,
        },
      },
    });

    if (existingEvent) {
      return {
        email: "none" as const,
        order: payment.order,
        providerEventId: input.providerEventId,
        status: "IGNORED" as const,
      };
    }

    const event = await tx.paymentEvent.create({
      data: {
        amountGrossCents: input.amountGrossCents ?? payment.amountGrossCents,
        currency: input.currency ?? payment.currency,
        eventType: input.eventType,
        orderId: payment.orderId,
        paymentId: payment.id,
        provider: "MOCK",
        providerEventId: input.providerEventId,
        rawPayload: toJsonValue(input.rawPayload),
        status: "RECEIVED",
      },
    });

    const mismatch = detectAmountMismatch(payment, input);
    if (mismatch) {
      await tx.paymentEvent.update({
        data: {
          errorMessage: mismatch,
          processedAt: now,
          status: "FAILED",
        },
        where: { id: event.id },
      });
      await tx.auditLog.create({
        data: {
          action: "payment.webhook_rejected",
          entityId: payment.id,
          entityType: "Payment",
          metadata: { message: mismatch, providerEventId: input.providerEventId },
          organizationId: payment.order.organizationId,
        },
      });

      return {
        email: "none" as const,
        order: payment.order,
        providerEventId: input.providerEventId,
        status: "FAILED" as const,
      };
    }

    if (input.status === "failed") {
      return markPaymentFailedInTransaction(tx, payment, event.id, input.providerEventId, now);
    }

    return markPaymentPaidInTransaction(tx, payment, event.id, input.providerEventId, now);
  });

  if (result.email === "paid") {
    await issueInvoiceForOrder(result.order.id);
    await inngest
      .send({
        data: {
          orderId: result.order.id,
          orderItemIds: "items" in result.order ? result.order.items.map((item) => item.id) : [],
          orderNumber: result.order.orderNumber,
        },
        name: "order/paid",
      })
      .catch((error) => {
        console.error("order/paid event dispatch failed", error);
      });
    await sendTransactionalEmail({
      to: result.order.email,
      ...paymentConfirmedEmail({
        orderNumber: result.order.orderNumber,
        statusUrl: buildOrderStatusUrl(result.order.orderNumber, result.order.publicAccessToken),
      }),
    }).catch((error) => {
      console.error("Payment confirmed email failed", error);
    });
  }

  if (result.email === "failed") {
    await sendTransactionalEmail({
      to: result.order.email,
      ...paymentFailedEmail({
        orderNumber: result.order.orderNumber,
        statusUrl: buildOrderStatusUrl(result.order.orderNumber, result.order.publicAccessToken),
      }),
    }).catch((error) => {
      console.error("Payment failed email failed", error);
    });
  }

  return {
    orderNumber: result.order.orderNumber,
    providerEventId: result.providerEventId,
    status: result.status,
  };
}

async function markPaymentPaidInTransaction(
  tx: Prisma.TransactionClient,
  payment: Prisma.PaymentGetPayload<{ include: { order: true } }>,
  eventId: string,
  providerEventId: string,
  now: Date,
) {
  if (payment.status === "PAID" && payment.order.status === "PAID") {
    await tx.paymentEvent.update({
      data: {
        processedAt: now,
        status: "IGNORED",
      },
      where: { id: eventId },
    });
    return { email: "none" as const, order: payment.order, providerEventId, status: "IGNORED" as const };
  }

  const paidPayment = await tx.payment.update({
    data: {
      paidAt: now,
      rawProviderData: { mockCapturedAt: now.toISOString(), providerEventId },
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
      metadata: { orderId: order.id, provider: "MOCK", providerEventId },
      organizationId: order.organizationId,
    },
  });

  await tx.paymentEvent.update({
    data: {
      processedAt: now,
      status: "PROCESSED",
    },
    where: { id: eventId },
  });

  return { email: "paid" as const, order, providerEventId, status: "PAID" as const };
}

async function markPaymentFailedInTransaction(
  tx: Prisma.TransactionClient,
  payment: Prisma.PaymentGetPayload<{ include: { order: true } }>,
  eventId: string,
  providerEventId: string,
  now: Date,
) {
  if (payment.status === "FAILED") {
    await tx.paymentEvent.update({
      data: {
        processedAt: now,
        status: "IGNORED",
      },
      where: { id: eventId },
    });
    return { email: "none" as const, order: payment.order, providerEventId, status: "IGNORED" as const };
  }

  const failedPayment = await tx.payment.update({
    data: {
      failedAt: now,
      status: "FAILED",
    },
    where: { id: payment.id },
  });

  const failedOrder =
    payment.order.status === "PAID"
      ? payment.order
      : await tx.order.update({
          data: { status: "PAYMENT_FAILED" },
          where: { id: payment.orderId },
        });

  await tx.auditLog.create({
    data: {
      action: "payment.failed",
      entityId: failedPayment.id,
      entityType: "Payment",
      metadata: { orderId: failedOrder.id, provider: "MOCK", providerEventId },
      organizationId: failedOrder.organizationId,
    },
  });

  await tx.paymentEvent.update({
    data: {
      processedAt: now,
      status: "PROCESSED",
    },
    where: { id: eventId },
  });

  return { email: "failed" as const, order: failedOrder, providerEventId, status: "FAILED" as const };
}

function detectAmountMismatch(
  payment: Prisma.PaymentGetPayload<{ include: { order: true } }>,
  input: Pick<MockPaymentEventInput, "amountGrossCents" | "currency">,
) {
  const amount = input.amountGrossCents ?? payment.amountGrossCents;
  const currency = input.currency ?? payment.currency;

  if (amount !== payment.amountGrossCents || amount !== payment.order.totalGrossCents) {
    return "Webhook amount does not match payment/order amount.";
  }
  if (currency !== payment.currency || currency !== payment.order.currency) {
    return "Webhook currency does not match payment/order currency.";
  }

  return null;
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function buildOrderStatusUrl(orderNumber: string, token: string) {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${baseUrl}/zamowienie/${orderNumber}?token=${encodeURIComponent(token)}`;
}
