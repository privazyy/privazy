import { NextResponse } from "next/server";

import { requirePortalDsrActor } from "@/server/dsr/access";
import { dsrErrorResponse, parseJson, queryObject } from "@/server/dsr/http";
import { dsrListQuerySchema, portalDsrCreateSchema } from "@/server/dsr/schemas";
import { createPortalDsrRequest, listPortalDsrRequests } from "@/server/dsr/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const actor = await requirePortalDsrActor();
    const query = dsrListQuerySchema.parse(queryObject(request));
    return NextResponse.json(await listPortalDsrRequests(actor, query));
  } catch (error) {
    return dsrErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requirePortalDsrActor();
    const input = portalDsrCreateSchema.parse(await parseJson(request));
    return NextResponse.json(await createPortalDsrRequest(input, actor), { status: 201 });
  } catch (error) {
    return dsrErrorResponse(error);
  }
}
