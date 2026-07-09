import { NextResponse } from "next/server";

import { breachErrorResponse, breachQueryObject, parseBreachJson } from "@/server/breach/breach-http";
import { requireClientBreachActor } from "@/server/breach/breach-permissions";
import { breachListQuerySchema, createBreachIncidentSchema } from "@/server/breach/breach-schemas";
import { createClientBreachIncident, listClientBreachIncidents } from "@/server/breach/breach-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const actor = await requireClientBreachActor();
    const query = breachListQuerySchema.parse(breachQueryObject(request));
    return NextResponse.json(await listClientBreachIncidents(actor, query));
  } catch (error) {
    return breachErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireClientBreachActor();
    const input = createBreachIncidentSchema.parse(await parseBreachJson(request));
    return NextResponse.json(await createClientBreachIncident(actor, input), { status: 201 });
  } catch (error) {
    return breachErrorResponse(error);
  }
}
