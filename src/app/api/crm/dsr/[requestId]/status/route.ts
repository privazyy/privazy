import { NextResponse } from "next/server";

import { requireDsrCrmWrite } from "@/server/dsr/access";
import { dsrErrorResponse, parseJson } from "@/server/dsr/http";
import { crmDsrStatusSchema } from "@/server/dsr/schemas";
import { changeCrmDsrStatus } from "@/server/dsr/service";

type RouteContext = { params: Promise<{ requestId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await requireDsrCrmWrite();
    const { requestId } = await context.params;
    const input = crmDsrStatusSchema.parse(await parseJson(request));
    return NextResponse.json(await changeCrmDsrStatus(requestId, input, actor));
  } catch (error) {
    return dsrErrorResponse(error);
  }
}
