import { NextResponse } from "next/server";

import { requirePortalDsrActor } from "@/server/dsr/access";
import { dsrErrorResponse } from "@/server/dsr/http";
import { getPortalDsrRequest } from "@/server/dsr/service";

type RouteContext = { params: Promise<{ requestId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, context: RouteContext) {
  try {
    const actor = await requirePortalDsrActor();
    const { requestId } = await context.params;
    return NextResponse.json(await getPortalDsrRequest(requestId, actor));
  } catch (error) {
    return dsrErrorResponse(error);
  }
}
