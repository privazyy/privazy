import { NextResponse } from "next/server";

import { breachErrorResponse, parseBreachJson } from "@/server/breach/breach-http";
import { requireClientBreachActor } from "@/server/breach/breach-permissions";
import { submitBreachIncidentSchema } from "@/server/breach/breach-schemas";
import { submitClientBreachIncident } from "@/server/breach/breach-service";

type RouteContext = { params: Promise<{ incidentId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext) {
  try {
    const actor = await requireClientBreachActor();
    const { incidentId } = await context.params;
    submitBreachIncidentSchema.parse(await parseBreachJson(request));
    return NextResponse.json(await submitClientBreachIncident(actor, incidentId));
  } catch (error) {
    return breachErrorResponse(error);
  }
}
