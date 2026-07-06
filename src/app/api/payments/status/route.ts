import { NextResponse } from "next/server";
import { z } from "zod";

import { getPublicOrderView } from "@/server/shop/checkout";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const paymentStatusQuerySchema = z.object({
  orderNumber: z.string().trim().min(1),
  token: z.string().trim().min(12),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = paymentStatusQuerySchema.safeParse({
    orderNumber: url.searchParams.get("orderNumber"),
    token: url.searchParams.get("token"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Brak danych zamowienia." }, { status: 400 });
  }

  const order = await getPublicOrderView(parsed.data.orderNumber, parsed.data.token);
  if (!order) return NextResponse.json({ error: "Zamowienie nie istnieje." }, { status: 404 });

  return NextResponse.json(order);
}
