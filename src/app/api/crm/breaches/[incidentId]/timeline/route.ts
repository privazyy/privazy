import { NextResponse } from "next/server";

import { breachErrorResponse } from "@/server/breach/breach-http";
import { requireStaffBreachRead } from "@/server/breach/breach-permissions";
import { getCrmBreachTimeline } from "@/server/breach/breach-service";

type RouteContext = { params: Promise<{ incidentId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, context: RouteContext) {
  try {
    const actor = await requireStaffBreachRead();
    const { incidentId } = await context.params;
    return NextResponse.json(await getCrmBreachTimeline(actor, incidentId));
  } catch (error) {
    return breachErrorResponse(error);
  }
}
