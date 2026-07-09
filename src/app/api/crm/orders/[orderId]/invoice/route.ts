import { NextResponse } from "next/server";

import { requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse, parseJson } from "@/server/crm/http";
import { invoiceRequestSchema } from "@/server/crm/order-schemas";
import { requestInvoiceForOrderFromCrm } from "@/server/crm/invoices-service";

type RouteContext = { params: Promise<{ orderId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { orderId } = await context.params;
    const input = invoiceRequestSchema.parse(await parseJson(request));
    return NextResponse.json(await requestInvoiceForOrderFromCrm(orderId, input, actor), { status: 201 });
  } catch (error) {
    return crmErrorResponse(error);
  }
}
