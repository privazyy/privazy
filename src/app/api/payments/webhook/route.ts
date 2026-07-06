import { NextResponse } from "next/server";

import { handlePaymentWebhook } from "@/server/payments/webhook-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const result = await handlePaymentWebhook(request);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Payment webhook failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nie udalo sie obsluzyc webhooka platnosci." },
      { status: 400 },
    );
  }
}
