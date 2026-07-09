import { NextResponse } from "next/server";

import { requireCrmRead } from "@/server/crm/access";
import { crmErrorResponse, queryObject } from "@/server/crm/http";
import { crmInvoiceListQuerySchema } from "@/server/crm/order-schemas";
import { listCrmInvoices } from "@/server/crm/invoices-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const actor = await requireCrmRead();
    const input = crmInvoiceListQuerySchema.parse(queryObject(request));
    return NextResponse.json(await listCrmInvoices(input, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
