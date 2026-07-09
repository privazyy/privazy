import { NextResponse } from "next/server";

import { requirePortalDsrActor } from "@/server/dsr/access";
import { dsrErrorResponse, parseJson } from "@/server/dsr/http";
import { portalDsrSubmitSchema } from "@/server/dsr/schemas";
import { submitPortalDsrRequest } from "@/server/dsr/service";

type RouteContext = { params: Promise<{ requestId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext) {
  try {
    const actor = await requirePortalDsrActor();
    portalDsrSubmitSchema.parse(await parseJson(request));
    const { requestId } = await context.params;
    return NextResponse.json(await submitPortalDsrRequest(requestId, actor));
  } catch (error) {
    return dsrErrorResponse(error);
  }
}
