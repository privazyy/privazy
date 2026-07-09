import { NextResponse } from "next/server";

import { breachErrorResponse, breachQueryObject } from "@/server/breach/breach-http";
import { requireStaffBreachRead } from "@/server/breach/breach-permissions";
import { breachListQuerySchema } from "@/server/breach/breach-schemas";
import { listCrmBreachIncidents } from "@/server/breach/breach-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const actor = await requireStaffBreachRead();
    const query = breachListQuerySchema.parse(breachQueryObject(request));
    return NextResponse.json(await listCrmBreachIncidents(actor, query));
  } catch (error) {
    return breachErrorResponse(error);
  }
}
