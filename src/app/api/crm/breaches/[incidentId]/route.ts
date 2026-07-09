import { NextResponse } from "next/server";

import { breachErrorResponse, parseBreachJson } from "@/server/breach/breach-http";
import { requireStaffBreachRead } from "@/server/breach/breach-permissions";
import { updateBreachIncidentSchema } from "@/server/breach/breach-schemas";
import { getCrmBreachIncident, updateCrmBreachIncident } from "@/server/breach/breach-service";

type RouteContext = { params: Promise<{ incidentId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, context: RouteContext) {
  try {
    const actor = await requireStaffBreachRead();
    const { incidentId } = await context.params;
    return NextResponse.json(await getCrmBreachIncident(actor, incidentId));
  } catch (error) {
    return breachErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await requireStaffBreachRead();
    const { incidentId } = await context.params;
    const input = updateBreachIncidentSchema.parse(await parseBreachJson(request));
    return NextResponse.json(await updateCrmBreachIncident(actor, incidentId, input));
  } catch (error) {
    return breachErrorResponse(error);
  }
}
