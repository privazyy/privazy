import { NextResponse } from "next/server";

import { requireCrmRead } from "@/server/crm/access";
import { crmErrorResponse } from "@/server/crm/http";
import { getCrmDocumentJob } from "@/server/crm/document-operations-service";

type RouteContext = { params: Promise<{ jobId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, context: RouteContext) {
  try {
    const actor = await requireCrmRead();
    const { jobId } = await context.params;
    return NextResponse.json(await getCrmDocumentJob(jobId, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
