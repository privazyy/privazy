import { NextResponse } from "next/server";

import { requireCrmRead, requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse, parseJson } from "@/server/crm/http";
import { updateTaskSchema } from "@/server/crm/schemas";
import { getTask, updateTask } from "@/server/crm/tasks-service";

type RouteContext = { params: Promise<{ taskId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, context: RouteContext) {
  try {
    await requireCrmRead();
    const { taskId } = await context.params;
    return NextResponse.json(await getTask(taskId));
  } catch (error) {
    return crmErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { taskId } = await context.params;
    const input = updateTaskSchema.parse(await parseJson(request));
    return NextResponse.json(await updateTask(taskId, input, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
