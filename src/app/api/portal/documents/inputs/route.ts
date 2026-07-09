import { NextResponse } from "next/server";

import { clientPortalErrorResponse, portalQueryObject } from "@/server/portal/client-portal-errors";
import { requireClientPortalActor } from "@/server/portal/client-portal-permissions";
import { portalDocumentQuerySchema } from "@/server/portal/client-portal-schemas";
import { listClientDocumentInputs } from "@/server/portal/client-portal-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const actor = await requireClientPortalActor();
    const query = portalDocumentQuerySchema.parse(portalQueryObject(request));
    return NextResponse.json(await listClientDocumentInputs(actor, query));
  } catch (error) {
    return clientPortalErrorResponse(error);
  }
}
