import { NextResponse } from "next/server";

import { requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse } from "@/server/crm/http";
import { retryInvoiceIssueSandbox } from "@/server/crm/invoices-service";

type RouteContext = { params: Promise<{ invoiceId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { invoiceId } = await context.params;
    return NextResponse.json(await retryInvoiceIssueSandbox(invoiceId, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
