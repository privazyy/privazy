import { NextResponse } from "next/server";

import { requireCrmRead } from "@/server/crm/access";
import { crmErrorResponse, queryObject } from "@/server/crm/http";
import { documentJobListQuerySchema } from "@/server/crm/order-schemas";
import { listCrmDocumentJobs } from "@/server/crm/document-operations-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const actor = await requireCrmRead();
    const input = documentJobListQuerySchema.parse(queryObject(request));
    return NextResponse.json(await listCrmDocumentJobs(input, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
