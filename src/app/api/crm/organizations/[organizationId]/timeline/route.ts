import { NextResponse } from "next/server";

import { requireCrmRead } from "@/server/crm/access";
import { crmErrorResponse, queryObject } from "@/server/crm/http";
import { crmActivityListQuerySchema } from "@/server/crm/schemas";
import { listCrmActivity } from "@/server/crm/service";

type RouteContext = { params: Promise<{ organizationId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, context: RouteContext) {
  try {
    await requireCrmRead();
    const { organizationId } = await context.params;
    const query = crmActivityListQuerySchema.parse({ ...queryObject(request), organizationId });
    return NextResponse.json(await listCrmActivity(query));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
