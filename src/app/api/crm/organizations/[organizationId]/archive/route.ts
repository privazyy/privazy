import { NextResponse } from "next/server";

import { requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse } from "@/server/crm/http";
import { archiveOrganization } from "@/server/crm/service";

type RouteContext = { params: Promise<{ organizationId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { organizationId } = await context.params;
    return NextResponse.json(await archiveOrganization(organizationId, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
