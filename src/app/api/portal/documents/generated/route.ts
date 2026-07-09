import { NextResponse } from "next/server";

import { clientPortalErrorResponse, portalQueryObject } from "@/server/portal/client-portal-errors";
import { requireClientPortalActor } from "@/server/portal/client-portal-permissions";
import { portalGeneratedDocumentQuerySchema } from "@/server/portal/client-portal-schemas";
import { listClientGeneratedDocuments } from "@/server/portal/client-portal-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const actor = await requireClientPortalActor();
    const query = portalGeneratedDocumentQuerySchema.parse(portalQueryObject(request));
    return NextResponse.json(await listClientGeneratedDocuments(actor, query));
  } catch (error) {
    return clientPortalErrorResponse(error);
  }
}
