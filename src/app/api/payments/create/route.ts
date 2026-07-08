import { NextResponse } from "next/server";
import { z } from "zod";

import { safeCommerceError } from "@/server/commerce/errors";
import { assertCheckoutEnabled } from "@/server/commerce/flags";
import { enforceCommerceRateLimit } from "@/server/commerce/rate-limit";
import { createPaymentForPublicOrder } from "@/server/payments/payment-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const createPaymentSchema = z.object({
  orderNumber: z.string().min(1),
  token: z.string().min(12),
});

export async function POST(request: Request) {
  try {
    assertCheckoutEnabled();
    enforceCommerceRateLimit(request, "payment-create", { limit: 10 });
  } catch (error) {
    const safe = safeCommerceError(error);
    return NextResponse.json(safe.body, { status: safe.status });
  }

  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidlowy format danych." }, { status: 400 });
  }

  const parsed = createPaymentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Brak danych zamowienia.", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const payment = await createPaymentForPublicOrder(parsed.data);
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    const safe = safeCommerceError(error);
    return NextResponse.json(safe.body, { status: safe.status });
  }
}
