import { NextResponse } from "next/server";

import { clientPortalErrorResponse, portalQueryObject } from "@/server/portal/client-portal-errors";
import { requireClientPortalActor } from "@/server/portal/client-portal-permissions";
import { portalDownloadQuerySchema } from "@/server/portal/client-portal-schemas";
import { createClientGeneratedDocumentDownloadUrl } from "@/server/portal/client-portal-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ documentId: string }> }) {
  try {
    const actor = await requireClientPortalActor();
    const { documentId } = await params;
    const query = portalDownloadQuerySchema.parse(portalQueryObject(request));
    const { url } = await createClientGeneratedDocumentDownloadUrl(actor, documentId, query.fileType);
    return NextResponse.redirect(url);
  } catch (error) {
    return clientPortalErrorResponse(error);
  }
}
