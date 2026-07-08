import { NextResponse } from "next/server";

import { requireCrmRead, requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse, parseJson } from "@/server/crm/http";
import { leadUpdateSchema } from "@/server/crm/schemas";
import { getLead, updateLead } from "@/server/crm/service";

type RouteContext = { params: Promise<{ leadId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, context: RouteContext) {
  try {
    await requireCrmRead();
    const { leadId } = await context.params;
    return NextResponse.json(await getLead(leadId));
  } catch (error) {
    return crmErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { leadId } = await context.params;
    const input = leadUpdateSchema.parse(await parseJson(request));
    return NextResponse.json(await updateLead(leadId, input, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
