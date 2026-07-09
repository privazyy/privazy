import { NextResponse } from "next/server";

import { breachErrorResponse, parseBreachJson } from "@/server/breach/breach-http";
import { requireStaffBreachRead } from "@/server/breach/breach-permissions";
import { breachStatusChangeSchema } from "@/server/breach/breach-schemas";
import { changeCrmBreachStatus } from "@/server/breach/breach-service";

type RouteContext = { params: Promise<{ incidentId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await requireStaffBreachRead();
    const { incidentId } = await context.params;
    const input = breachStatusChangeSchema.parse(await parseBreachJson(request));
    return NextResponse.json(await changeCrmBreachStatus(actor, incidentId, input));
  } catch (error) {
    return breachErrorResponse(error);
  }
}
