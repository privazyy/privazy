import { NextResponse } from "next/server";

import { requirePortalDsrActor } from "@/server/dsr/access";
import { dsrErrorResponse, parseJson } from "@/server/dsr/http";
import { portalDsrDraftUpdateSchema } from "@/server/dsr/schemas";
import { updatePortalDsrDraft } from "@/server/dsr/service";

type RouteContext = { params: Promise<{ requestId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await requirePortalDsrActor();
    const { requestId } = await context.params;
    const input = portalDsrDraftUpdateSchema.parse(await parseJson(request));
    return NextResponse.json(await updatePortalDsrDraft(requestId, input, actor));
  } catch (error) {
    return dsrErrorResponse(error);
  }
}
