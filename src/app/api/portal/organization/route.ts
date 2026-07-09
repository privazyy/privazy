import { NextResponse } from "next/server";

import { clientPortalErrorResponse, parsePortalJson } from "@/server/portal/client-portal-errors";
import { requireClientPortalActor } from "@/server/portal/client-portal-permissions";
import { portalOrganizationUpdateSchema } from "@/server/portal/client-portal-schemas";
import { getClientOrganization, updateClientOrganizationProfile } from "@/server/portal/client-portal-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const actor = await requireClientPortalActor();
    return NextResponse.json(await getClientOrganization(actor));
  } catch (error) {
    return clientPortalErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const actor = await requireClientPortalActor();
    const input = portalOrganizationUpdateSchema.parse(await parsePortalJson(request));
    return NextResponse.json(await updateClientOrganizationProfile(actor, input));
  } catch (error) {
    return clientPortalErrorResponse(error);
  }
}
