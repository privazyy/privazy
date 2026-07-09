import { NextResponse } from "next/server";

import { requireDsrCrmRead } from "@/server/dsr/access";
import { dsrErrorResponse, queryObject } from "@/server/dsr/http";
import { dsrListQuerySchema } from "@/server/dsr/schemas";
import { listCrmDsrRequests } from "@/server/dsr/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireDsrCrmRead();
    const query = dsrListQuerySchema.parse(queryObject(request));
    return NextResponse.json(await listCrmDsrRequests(query));
  } catch (error) {
    return dsrErrorResponse(error);
  }
}
