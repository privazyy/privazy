import { NextResponse } from "next/server";

import { requireCrmRead } from "@/server/crm/access";
import { crmErrorResponse } from "@/server/crm/http";
import { getPaymentEvents } from "@/server/crm/payments-service";

type RouteContext = { params: Promise<{ paymentId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, context: RouteContext) {
  try {
    const actor = await requireCrmRead();
    const { paymentId } = await context.params;
    return NextResponse.json(await getPaymentEvents(paymentId, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
