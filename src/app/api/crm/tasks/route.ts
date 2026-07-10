import { NextResponse } from "next/server";

import { requireCrmRead, requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse, parseJson, queryObject } from "@/server/crm/http";
import { crmTaskCreateSchema, crmTaskListQuerySchema } from "@/server/crm/schemas";
import { createCrmTask, listCrmTasks } from "@/server/crm/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireCrmRead();
    const query = crmTaskListQuerySchema.parse(queryObject(request));
    return NextResponse.json(await listCrmTasks(query));
  } catch (error) {
    return crmErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireCrmWrite();
    const input = crmTaskCreateSchema.parse(await parseJson(request));
    return NextResponse.json(await createCrmTask(input, actor), { status: 201 });
  } catch (error) {
    return crmErrorResponse(error);
  }
}
