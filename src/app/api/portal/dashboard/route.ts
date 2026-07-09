import { NextResponse } from "next/server";

import { clientPortalErrorResponse } from "@/server/portal/client-portal-errors";
import { requireClientPortalActor } from "@/server/portal/client-portal-permissions";
import { getClientDashboard } from "@/server/portal/client-portal-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const actor = await requireClientPortalActor();
    return NextResponse.json(await getClientDashboard(actor));
  } catch (error) {
    return clientPortalErrorResponse(error);
  }
}
