import { NextResponse } from "next/server";

import { requireCrmRead } from "@/server/crm/access";
import { crmErrorResponse, queryObject } from "@/server/crm/http";
import { crmActivityListQuerySchema } from "@/server/crm/schemas";
import { listCrmActivity } from "@/server/crm/service";

type RouteContext = { params: Promise<{ leadId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, context: RouteContext) {
  try {
    await requireCrmRead();
    const { leadId } = await context.params;
    const query = crmActivityListQuerySchema.parse({ ...queryObject(request), leadId });
    return NextResponse.json(await listCrmActivity(query));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
