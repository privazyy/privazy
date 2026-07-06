import { NextResponse } from "next/server";
import { z } from "zod";

import { getPrisma } from "@/server/db/prisma";
import { getPaymentProvider } from "@/server/payments";

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

  const order = await getPrisma().order.findFirst({
    where: {
      orderNumber: parsed.data.orderNumber,
      publicAccessToken: parsed.data.token,
    },
  });

  if (!order) return NextResponse.json({ error: "Zamowienie nie istnieje." }, { status: 404 });
  if (order.status === "PAID") return NextResponse.json({ error: "Zamowienie jest juz oplacone." }, { status: 409 });

  const payment = await getPaymentProvider().createPayment({
    amountGrossCents: order.totalGrossCents,
    currency: order.currency,
    orderId: order.id,
    orderNumber: order.orderNumber,
    publicAccessToken: order.publicAccessToken,
  });

  return NextResponse.json(payment, { status: 201 });
}
