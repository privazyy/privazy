import { NextResponse } from "next/server";

import { getPublicOrderView } from "@/server/shop/checkout";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderNumber = url.searchParams.get("orderNumber");
  const token = url.searchParams.get("token");

  if (!orderNumber || !token) {
    return NextResponse.json({ error: "Brak danych zamowienia." }, { status: 400 });
  }

  const order = await getPublicOrderView(orderNumber, token);
  if (!order) return NextResponse.json({ error: "Zamowienie nie istnieje." }, { status: 404 });

  return NextResponse.json(order);
}
