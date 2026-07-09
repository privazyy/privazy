import { NextResponse } from "next/server";

import { breachErrorResponse, parseBreachJson } from "@/server/breach/breach-http";
import { requireClientBreachActor } from "@/server/breach/breach-permissions";
import { updateBreachIncidentSchema } from "@/server/breach/breach-schemas";
import { updateClientBreachDraft } from "@/server/breach/breach-service";

type RouteContext = { params: Promise<{ incidentId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await requireClientBreachActor();
    const { incidentId } = await context.params;
    const input = updateBreachIncidentSchema.parse(await parseBreachJson(request));
    return NextResponse.json(await updateClientBreachDraft(actor, incidentId, input));
  } catch (error) {
    return breachErrorResponse(error);
  }
}
