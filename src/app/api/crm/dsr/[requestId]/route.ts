import { NextResponse } from "next/server";

import { requireDsrCrmRead, requireDsrCrmWrite } from "@/server/dsr/access";
import { dsrErrorResponse, parseJson } from "@/server/dsr/http";
import { crmDsrUpdateSchema } from "@/server/dsr/schemas";
import { getCrmDsrRequest, updateCrmDsrRequest } from "@/server/dsr/service";

type RouteContext = { params: Promise<{ requestId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, context: RouteContext) {
  try {
    await requireDsrCrmRead();
    const { requestId } = await context.params;
    return NextResponse.json(await getCrmDsrRequest(requestId));
  } catch (error) {
    return dsrErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await requireDsrCrmWrite();
    const { requestId } = await context.params;
    const input = crmDsrUpdateSchema.parse(await parseJson(request));
    return NextResponse.json(await updateCrmDsrRequest(requestId, input, actor));
  } catch (error) {
    return dsrErrorResponse(error);
  }
}
