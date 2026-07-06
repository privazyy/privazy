import { NextResponse } from "next/server";
import { z } from "zod";

import { getPrisma } from "@/server/db/prisma";
import { markPaymentPaid } from "@/server/payments/mock-provider";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const mockCompleteQuerySchema = z.object({
  paymentId: z.string().trim().min(1),
  token: z.string().trim().min(12),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = mockCompleteQuerySchema.safeParse({
    paymentId: url.searchParams.get("paymentId"),
    token: url.searchParams.get("token"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/checkout/blad?reason=missing_payment", url.origin));
  }

  const payment = await getPrisma().payment.findUnique({
    include: { order: true },
    where: { id: parsed.data.paymentId },
  });

  if (!payment || payment.order.publicAccessToken !== parsed.data.token) {
    return NextResponse.redirect(new URL("/checkout/blad?reason=invalid_payment", url.origin));
  }

  try {
    await markPaymentPaid(payment.id);
    return NextResponse.redirect(
      new URL(`/checkout/sukces?order=${encodeURIComponent(payment.order.orderNumber)}&token=${encodeURIComponent(parsed.data.token)}`, url.origin),
    );
  } catch (error) {
    console.error("Mock payment completion failed", error);
    return NextResponse.redirect(new URL("/checkout/blad?reason=payment_failed", url.origin));
  }
}
