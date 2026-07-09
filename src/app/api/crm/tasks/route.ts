import { NextResponse } from "next/server";

import { requireCrmRead, requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse, parseJson, queryObject } from "@/server/crm/http";
import { createTaskSchema, taskListQuerySchema } from "@/server/crm/schemas";
import { createTask, listTasks } from "@/server/crm/tasks-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireCrmRead();
    const input = taskListQuerySchema.parse(queryObject(request));
    return NextResponse.json(await listTasks(input));
  } catch (error) {
    return crmErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireCrmWrite();
    const input = createTaskSchema.parse(await parseJson(request));
    return NextResponse.json(await createTask(input, actor), { status: 201 });
  } catch (error) {
    return crmErrorResponse(error);
  }
}
