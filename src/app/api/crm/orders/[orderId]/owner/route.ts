import { NextResponse } from "next/server";

import { requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse, parseJson } from "@/server/crm/http";
import { assignOrderOwnerSchema } from "@/server/crm/order-schemas";
import { assignOrderOwner } from "@/server/crm/orders-service";

type RouteContext = { params: Promise<{ orderId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { orderId } = await context.params;
    const input = assignOrderOwnerSchema.parse(await parseJson(request));
    return NextResponse.json(await assignOrderOwner(orderId, input, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
