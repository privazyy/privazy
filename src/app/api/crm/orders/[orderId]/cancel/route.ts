import { NextResponse } from "next/server";

import { requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse } from "@/server/crm/http";
import { cancelOrderSandbox } from "@/server/crm/orders-service";

type RouteContext = { params: Promise<{ orderId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { orderId } = await context.params;
    return NextResponse.json(await cancelOrderSandbox(orderId, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
