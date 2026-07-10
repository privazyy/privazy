import { NextResponse } from "next/server";

import { requireCrmRead } from "@/server/crm/access";
import { crmErrorResponse, queryObject } from "@/server/crm/http";
import { crmActivityListQuerySchema } from "@/server/crm/schemas";
import { listCrmActivity } from "@/server/crm/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireCrmRead();
    const query = crmActivityListQuerySchema.parse(queryObject(request));
    return NextResponse.json(await listCrmActivity(query));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
