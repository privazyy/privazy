import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { Prisma } from "@prisma/client";
import { z } from "zod";

import { CommerceError } from "@/server/commerce/errors";
import { assertCheckoutEnabled, assertNoLivePayments } from "@/server/commerce/flags";
import { getPrisma } from "@/server/db/prisma";
import type {
  CreatePaymentInput,
  PaymentProvider,
  PaymentWebhookEvent,
  PaymentWebhookResult,
} from "@/server/payments/provider";

const mockWebhookSchema = z.object({
  amountGrossCents: z.number().int().positive(),
  currency: z.literal("PLN"),
  eventId: z.string().trim().min(8).max(160),
  outcome: z.enum(["succeeded", "failed"]),
  paymentId: z.string().trim().min(1).max(160),
});

export class MockPaymentProvider implements PaymentProvider {
  async createPayment(input: CreatePaymentInput) {
    assertCheckoutEnabled();
    assertNoLivePayments();

    const prisma = getPrisma();
    const idempotencyKey = `mock:create:${input.orderId}`;
    const existing = await prisma.payment.findUnique({ where: { idempotencyKey } });
    const payment = existing
      ? existing.status === "FAILED" || existing.status === "CANCELLED"
        ? await prisma.payment.update({
            data: { failedAt: null, status: "PENDING" },
            where: { id: existing.id },
          })
        : existing
      : await prisma.payment.create({
        data: {
          amountGrossCents: input.amountGrossCents,
          currency: input.currency,
          idempotencyKey,
          mode: "MOCK",
          orderId: input.orderId,
          provider: "MOCK",
          status: "PENDING",
        },
      });

    if (
      payment.amountGrossCents !== input.amountGrossCents ||
      payment.currency !== input.currency
    ) {
      throw new CommerceError(
        "conflict",
        "Istniejąca płatność nie odpowiada kwocie zamówienia.",
        409,
      );
    }

    const externalId = payment.externalId ?? `mock_${payment.id}`;
    const paymentUrl = `/checkout/mock?paymentId=${encodeURIComponent(payment.id)}&token=${encodeURIComponent(input.publicAccessToken)}`;
    const updated = await prisma.payment.update({
      data: {
        externalId,
      },
      where: { id: payment.id },
    });

    if (updated.status === "SUCCEEDED") {
      await prisma.order.update({
        data: { paymentStatus: "SUCCEEDED" },
        where: { id: input.orderId },
      });
    } else {
      await prisma.order.updateMany({
        data: {
          paymentStatus: "PENDING",
          status: "PENDING_PAYMENT",
        },
        where: {
          id: input.orderId,
          status: { not: "PAID" },
        },
      });
    }

    return {
      mode: "MOCK",
      paymentId: updated.id,
      paymentUrl,
      status: updated.status === "SUCCEEDED" ? "SUCCEEDED" : "PENDING",
    } as const;
  }

  async getPaymentStatus(paymentId: string) {
    const payment = await getPrisma().payment.findUnique({
      select: { status: true },
      where: { id: paymentId },
    });

    return payment?.status ?? "UNKNOWN";
  }

  async verifyWebhook(request: Request) {
    assertCheckoutEnabled();
    assertNoLivePayments();

    const rawBody = await request.text();
    verifyMockSignature(rawBody, request.headers.get("x-privazy-mock-signature"));

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      throw new CommerceError("invalid_input", "Nieprawidłowy payload webhooka.", 400);
    }

    const parsed = mockWebhookSchema.safeParse(parsedBody);
    if (!parsed.success) {
      throw new CommerceError("invalid_input", "Nieprawidłowe dane webhooka.", 400);
    }

    return {
      ...parsed.data,
      eventType: `mock.payment.${parsed.data.outcome}`,
      payloadHash: createHash("sha256").update(rawBody).digest("hex"),
    };
  }

  async handleWebhookEvent(event: PaymentWebhookEvent) {
    return applyMockPaymentEvent(event);
  }
}

export async function simulateMockPayment(input: {
  amountGrossCents: number;
  currency: string;
  eventId: string;
  outcome: "failed" | "succeeded";
  paymentId: string;
}) {
  const canonical = JSON.stringify(input);
  return applyMockPaymentEvent({
    ...input,
    eventType: `mock.simulation.${input.outcome}`,
    payloadHash: createHash("sha256").update(canonical).digest("hex"),
  });
}

async function applyMockPaymentEvent(
  event: PaymentWebhookEvent,
): Promise<PaymentWebhookResult> {
  const prisma = getPrisma();

  try {
    return await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        include: { order: true },
        where: { id: event.paymentId },
      });

      if (!payment || payment.provider !== "MOCK" || payment.mode !== "MOCK") {
        throw new CommerceError("not_found", "Płatność mock nie istnieje.", 404);
      }

      const existingEvent = await tx.paymentEvent.findUnique({
        where: { idempotencyKey: event.eventId },
      });
      if (existingEvent) {
        return webhookResult(payment.order.orderNumber, event.eventId, "IGNORED");
      }

      const paymentEvent = await tx.paymentEvent.create({
        data: {
          amountGrossCents: event.amountGrossCents,
          currency: event.currency,
          eventType: event.eventType,
          idempotencyKey: event.eventId,
          orderId: payment.orderId,
          payloadHash: event.payloadHash,
          paymentId: payment.id,
          provider: "MOCK",
          status: "RECEIVED",
        },
      });

      const mismatch =
        event.amountGrossCents !== payment.amountGrossCents ||
        event.amountGrossCents !== payment.order.totalGrossCents ||
        event.currency !== payment.currency ||
        event.currency !== payment.order.currency;

      if (mismatch) {
        await tx.paymentEvent.update({
          data: {
            errorMessage: "amount_or_currency_mismatch",
            processedAt: new Date(),
            status: "REJECTED",
          },
          where: { id: paymentEvent.id },
        });
        await tx.auditLog.create({
          data: {
            action: "payment.mock_rejected",
            entityId: payment.id,
            entityType: "Payment",
            metadata: {
              eventId: event.eventId,
              reason: "amount_or_currency_mismatch",
            },
            organizationId: payment.order.organizationId,
          },
        });

        return webhookResult(payment.order.orderNumber, event.eventId, "REJECTED");
      }

      if (event.outcome === "failed") {
        if (payment.status === "SUCCEEDED" || payment.order.status === "PAID") {
          await markEvent(tx, paymentEvent.id, "IGNORED");
          return webhookResult(payment.order.orderNumber, event.eventId, "IGNORED");
        }

        const claimed = await tx.payment.updateMany({
          data: { failedAt: new Date(), status: "FAILED" },
          where: {
            id: payment.id,
            status: { in: ["CREATED", "PENDING"] },
          },
        });
        if (claimed.count === 0) {
          await markEvent(tx, paymentEvent.id, "IGNORED");
          return webhookResult(payment.order.orderNumber, event.eventId, "IGNORED");
        }
        await tx.order.update({
          data: { paymentStatus: "FAILED", status: "FAILED" },
          where: { id: payment.orderId },
        });
        await markEvent(tx, paymentEvent.id, "PROCESSED");

        return webhookResult(payment.order.orderNumber, event.eventId, "FAILED");
      }

      if (payment.status === "SUCCEEDED" && payment.order.status === "PAID") {
        await markEvent(tx, paymentEvent.id, "IGNORED");
        return webhookResult(payment.order.orderNumber, event.eventId, "IGNORED");
      }

      const paidAt = new Date();
      const claimed = await tx.payment.updateMany({
        data: {
          paidAt,
          providerPayload: {
            eventId: event.eventId,
            mode: "MOCK",
          },
          status: "SUCCEEDED",
        },
        where: {
          id: payment.id,
          status: { in: ["CREATED", "PENDING"] },
        },
      });
      if (claimed.count === 0) {
        await markEvent(tx, paymentEvent.id, "IGNORED");
        return webhookResult(payment.order.orderNumber, event.eventId, "IGNORED");
      }
      await tx.order.update({
        data: {
          paidAt,
          paymentStatus: "SUCCEEDED",
          status: "PAID",
        },
        where: { id: payment.orderId },
      });
      await tx.orderItem.updateMany({
        data: { status: "READY_FOR_INPUT" },
        where: {
          documentTemplateId: { not: null },
          orderId: payment.orderId,
          status: "NOT_STARTED",
        },
      });
      await tx.auditLog.create({
        data: {
          action: "payment.mock_succeeded",
          entityId: payment.id,
          entityType: "Payment",
          metadata: {
            eventId: event.eventId,
            orderId: payment.orderId,
          },
          organizationId: payment.order.organizationId,
        },
      });
      await markEvent(tx, paymentEvent.id, "PROCESSED");

      return webhookResult(payment.order.orderNumber, event.eventId, "SUCCEEDED");
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const payment = await prisma.payment.findUnique({
        include: { order: true },
        where: { id: event.paymentId },
      });
      if (payment) {
        return webhookResult(payment.order.orderNumber, event.eventId, "IGNORED");
      }
    }

    throw error;
  }
}

async function markEvent(
  tx: Prisma.TransactionClient,
  eventId: string,
  status: "IGNORED" | "PROCESSED",
) {
  await tx.paymentEvent.update({
    data: {
      processedAt: new Date(),
      status,
    },
    where: { id: eventId },
  });
}

function verifyMockSignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYMENT_MOCK_WEBHOOK_SECRET;
  if (!secret && process.env.NODE_ENV !== "production") return;
  if (!secret || !signature) {
    throw new CommerceError("forbidden", "Brak podpisu webhooka mock.", 403);
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new CommerceError("forbidden", "Nieprawidłowy podpis webhooka mock.", 403);
  }
}

function webhookResult(
  orderNumber: string,
  providerEventId: string,
  status: PaymentWebhookResult["status"],
) {
  return { orderNumber, providerEventId, status };
}
