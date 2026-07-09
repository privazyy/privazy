import { NextResponse } from "next/server";

import { requireCrmRead, requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse, parseJson } from "@/server/crm/http";
import { updateOrderInternalStatusSchema } from "@/server/crm/order-schemas";
import { getCrmOrder, updateOrderInternalStatus } from "@/server/crm/orders-service";

type RouteContext = { params: Promise<{ orderId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, context: RouteContext) {
  try {
    const actor = await requireCrmRead();
    const { orderId } = await context.params;
    return NextResponse.json(await getCrmOrder(orderId, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { orderId } = await context.params;
    const input = updateOrderInternalStatusSchema.parse(await parseJson(request));
    return NextResponse.json(await updateOrderInternalStatus(orderId, input, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
