import { NextResponse } from "next/server";

import { requireDsrCrmRead } from "@/server/dsr/access";
import { dsrErrorResponse } from "@/server/dsr/http";
import { getCrmDsrTimeline } from "@/server/dsr/service";

type RouteContext = { params: Promise<{ requestId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, context: RouteContext) {
  try {
    await requireDsrCrmRead();
    const { requestId } = await context.params;
    return NextResponse.json(await getCrmDsrTimeline(requestId));
  } catch (error) {
    return dsrErrorResponse(error);
  }
}
