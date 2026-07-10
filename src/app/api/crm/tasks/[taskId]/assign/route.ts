import { NextResponse } from "next/server";

import { requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse, parseJson } from "@/server/crm/http";
import { crmTaskAssignSchema } from "@/server/crm/schemas";
import { assignCrmTask } from "@/server/crm/service";

type RouteContext = { params: Promise<{ taskId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { taskId } = await context.params;
    const input = crmTaskAssignSchema.parse(await parseJson(request));
    return NextResponse.json(await assignCrmTask(taskId, input, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
