import { NextResponse } from "next/server";

import { requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse, parseJson } from "@/server/crm/http";
import { leadStatusChangeSchema } from "@/server/crm/schemas";
import { updateLead } from "@/server/crm/service";

type RouteContext = { params: Promise<{ leadId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { leadId } = await context.params;
    const input = leadStatusChangeSchema.parse(await parseJson(request));
    return NextResponse.json(await updateLead(leadId, input, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
