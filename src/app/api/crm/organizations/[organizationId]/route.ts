import { NextResponse } from "next/server";

import { requireCrmRead, requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse, parseJson } from "@/server/crm/http";
import { organizationUpdateSchema } from "@/server/crm/schemas";
import { getOrganization, updateOrganization } from "@/server/crm/service";

type RouteContext = { params: Promise<{ organizationId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, context: RouteContext) {
  try {
    await requireCrmRead();
    const { organizationId } = await context.params;
    return NextResponse.json(await getOrganization(organizationId));
  } catch (error) {
    return crmErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { organizationId } = await context.params;
    const input = organizationUpdateSchema.parse(await parseJson(request));
    return NextResponse.json(await updateOrganization(organizationId, input, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
