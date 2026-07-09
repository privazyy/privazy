import { NextResponse } from "next/server";

import { requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse, parseJson } from "@/server/crm/http";
import { paymentReviewSchema } from "@/server/crm/order-schemas";
import { markPaymentAsReviewed } from "@/server/crm/payments-service";

type RouteContext = { params: Promise<{ paymentId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { paymentId } = await context.params;
    const input = paymentReviewSchema.parse(await parseJson(request));
    return NextResponse.json(await markPaymentAsReviewed(paymentId, input, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
