import { NextResponse } from "next/server";

import { requireCrmRead } from "@/server/crm/access";
import { crmErrorResponse } from "@/server/crm/http";
import { getCrmOrderTimeline } from "@/server/crm/orders-service";

type RouteContext = { params: Promise<{ orderId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, context: RouteContext) {
  try {
    const actor = await requireCrmRead();
    const { orderId } = await context.params;
    return NextResponse.json(await getCrmOrderTimeline(orderId, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
