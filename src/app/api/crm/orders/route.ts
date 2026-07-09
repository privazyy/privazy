import { NextResponse } from "next/server";

import { requireCrmRead } from "@/server/crm/access";
import { crmErrorResponse, queryObject } from "@/server/crm/http";
import { crmOrderListQuerySchema } from "@/server/crm/order-schemas";
import { listCrmOrders } from "@/server/crm/orders-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const actor = await requireCrmRead();
    const input = crmOrderListQuerySchema.parse(queryObject(request));
    return NextResponse.json(await listCrmOrders(input, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
