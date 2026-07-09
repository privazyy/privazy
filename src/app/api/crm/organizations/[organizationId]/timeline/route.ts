import { NextResponse } from "next/server";

import { requireCrmRead } from "@/server/crm/access";
import { crmErrorResponse, queryObject } from "@/server/crm/http";
import { timelineQuerySchema } from "@/server/crm/schemas";
import { getOrganizationTimeline } from "@/server/crm/timeline-service";

type RouteContext = { params: Promise<{ organizationId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, context: RouteContext) {
  try {
    await requireCrmRead();
    const { organizationId } = await context.params;
    const input = timelineQuerySchema.parse(queryObject(request));
    return NextResponse.json(await getOrganizationTimeline(organizationId, input));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
