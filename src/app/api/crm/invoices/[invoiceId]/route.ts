import { NextResponse } from "next/server";

import { requireCrmRead } from "@/server/crm/access";
import { crmErrorResponse } from "@/server/crm/http";
import { getCrmInvoice } from "@/server/crm/invoices-service";

type RouteContext = { params: Promise<{ invoiceId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, context: RouteContext) {
  try {
    const actor = await requireCrmRead();
    const { invoiceId } = await context.params;
    return NextResponse.json(await getCrmInvoice(invoiceId, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
