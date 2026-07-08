import { NextResponse } from "next/server";

import { safeCommerceError } from "@/server/commerce/errors";
import { enforceCommerceRateLimit } from "@/server/commerce/rate-limit";
import { handlePaymentWebhook } from "@/server/payments/webhook-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    enforceCommerceRateLimit(request, "payment-mock-webhook", { limit: 60 });
    const result = await handlePaymentWebhook(request);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Mock payment webhook failed", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    const safe = safeCommerceError(error);
    return NextResponse.json(safe.body, { status: safe.status });
  }
}
