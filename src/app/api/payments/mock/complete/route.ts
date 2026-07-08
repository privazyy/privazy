import { NextResponse } from "next/server";
import { z } from "zod";

import { CommerceError, safeCommerceError } from "@/server/commerce/errors";
import { assertCheckoutEnabled, assertNoLivePayments } from "@/server/commerce/flags";
import { enforceCommerceRateLimit } from "@/server/commerce/rate-limit";
import { getPrisma } from "@/server/db/prisma";
import { simulateMockPayment } from "@/server/payments/mock-provider";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const mockCompleteSchema = z.object({
  eventId: z.string().trim().min(8).max(160),
  outcome: z.enum(["succeeded", "failed"]),
  paymentId: z.string().trim().min(1).max(160),
  token: z.string().trim().min(24).max(200),
});

export async function POST(request: Request) {
  try {
    assertCheckoutEnabled();
    assertNoLivePayments();
    enforceCommerceRateLimit(request, "payment-mock-complete", { limit: 20 });

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      throw new CommerceError("invalid_input", "Nieprawidłowy JSON.", 400);
    }

    const parsed = mockCompleteSchema.safeParse(json);
    if (!parsed.success) {
      throw new CommerceError(
        "invalid_input",
        "Nieprawidłowe dane symulacji płatności.",
        400,
      );
    }

    const payment = await getPrisma().payment.findUnique({
      include: { order: true },
      where: { id: parsed.data.paymentId },
    });
    if (
      !payment ||
      payment.order.publicAccessToken !== parsed.data.token ||
      payment.provider !== "MOCK" ||
      payment.mode !== "MOCK"
    ) {
      throw new CommerceError("not_found", "Płatność mock nie istnieje.", 404);
    }

    const result = await simulateMockPayment({
      amountGrossCents: payment.amountGrossCents,
      currency: payment.currency,
      eventId: parsed.data.eventId,
      outcome: parsed.data.outcome,
      paymentId: payment.id,
    });

    return NextResponse.json({
      ...result,
      redirectUrl:
        result.status === "SUCCEEDED" || result.status === "IGNORED"
          ? `/checkout/sukces?order=${encodeURIComponent(payment.order.orderNumber)}&token=${encodeURIComponent(parsed.data.token)}`
          : "/checkout/blad?reason=mock_failed",
    });
  } catch (error) {
    const safe = safeCommerceError(error);
    return NextResponse.json(safe.body, { status: safe.status });
  }
}
