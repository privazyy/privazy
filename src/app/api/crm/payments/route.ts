import { NextResponse } from "next/server";

import { requireCrmRead } from "@/server/crm/access";
import { crmErrorResponse, queryObject } from "@/server/crm/http";
import { crmPaymentListQuerySchema } from "@/server/crm/order-schemas";
import { listCrmPayments } from "@/server/crm/payments-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const actor = await requireCrmRead();
    const input = crmPaymentListQuerySchema.parse(queryObject(request));
    return NextResponse.json(await listCrmPayments(input, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
