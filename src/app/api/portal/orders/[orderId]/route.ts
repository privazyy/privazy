import { NextResponse } from "next/server";

import { clientPortalErrorResponse } from "@/server/portal/client-portal-errors";
import { requireClientPortalActor } from "@/server/portal/client-portal-permissions";
import { getClientOrder } from "@/server/portal/client-portal-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const actor = await requireClientPortalActor();
    const { orderId } = await params;
    return NextResponse.json(await getClientOrder(actor, orderId));
  } catch (error) {
    return clientPortalErrorResponse(error);
  }
}
