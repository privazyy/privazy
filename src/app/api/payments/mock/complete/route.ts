import { NextResponse } from "next/server";

import { getPrisma } from "@/server/db/prisma";
import { markPaymentPaid } from "@/server/payments/mock-provider";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const paymentId = url.searchParams.get("paymentId");
  const token = url.searchParams.get("token");

  if (!paymentId || !token) {
    return NextResponse.redirect(new URL("/checkout/blad?reason=missing_payment", url.origin));
  }

  const payment = await getPrisma().payment.findUnique({
    include: { order: true },
    where: { id: paymentId },
  });

  if (!payment || payment.order.publicAccessToken !== token) {
    return NextResponse.redirect(new URL("/checkout/blad?reason=invalid_payment", url.origin));
  }

  try {
    await markPaymentPaid(payment.id);
    return NextResponse.redirect(
      new URL(`/checkout/sukces?order=${encodeURIComponent(payment.order.orderNumber)}&token=${encodeURIComponent(token)}`, url.origin),
    );
  } catch (error) {
    console.error("Mock payment completion failed", error);
    return NextResponse.redirect(new URL("/checkout/blad?reason=payment_failed", url.origin));
  }
}
