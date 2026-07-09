import { NextResponse } from "next/server";

import { requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse } from "@/server/crm/http";
import { retryPaymentStatusCheck } from "@/server/crm/payments-service";

type RouteContext = { params: Promise<{ paymentId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { paymentId } = await context.params;
    return NextResponse.json(await retryPaymentStatusCheck(paymentId, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
