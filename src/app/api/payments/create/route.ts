import { NextResponse } from "next/server";
import { z } from "zod";

import { createPaymentForPublicOrder } from "@/server/payments/payment-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const createPaymentSchema = z.object({
  orderNumber: z.string().min(1),
  token: z.string().min(12),
});

export async function POST(request: Request) {
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
    const message = error instanceof Error ? error.message : "Nie udalo sie utworzyc platnosci.";
    const status = message.includes("nie istnieje") ? 404 : message.includes("juz oplacone") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
