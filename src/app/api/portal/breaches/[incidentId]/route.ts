import { NextResponse } from "next/server";

import { breachErrorResponse } from "@/server/breach/breach-http";
import { requireClientBreachActor } from "@/server/breach/breach-permissions";
import { getClientBreachIncident } from "@/server/breach/breach-service";

type RouteContext = { params: Promise<{ incidentId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, context: RouteContext) {
  try {
    const actor = await requireClientBreachActor();
    const { incidentId } = await context.params;
    return NextResponse.json(await getClientBreachIncident(actor, incidentId));
  } catch (error) {
    return breachErrorResponse(error);
  }
}
