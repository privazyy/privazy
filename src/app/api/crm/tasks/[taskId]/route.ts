import { NextResponse } from "next/server";

import { requireCrmRead, requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse, parseJson } from "@/server/crm/http";
import { crmTaskUpdateSchema } from "@/server/crm/schemas";
import { getCrmTask, updateCrmTask } from "@/server/crm/service";

type RouteContext = { params: Promise<{ taskId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, context: RouteContext) {
  try {
    await requireCrmRead();
    const { taskId } = await context.params;
    return NextResponse.json(await getCrmTask(taskId));
  } catch (error) {
    return crmErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { taskId } = await context.params;
    const input = crmTaskUpdateSchema.parse(await parseJson(request));
    return NextResponse.json(await updateCrmTask(taskId, input, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
