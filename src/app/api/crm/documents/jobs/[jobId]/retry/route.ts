import { NextResponse } from "next/server";

import { requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse } from "@/server/crm/http";
import { retryDocumentGeneration } from "@/server/crm/document-operations-service";

type RouteContext = { params: Promise<{ jobId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { jobId } = await context.params;
    return NextResponse.json(await retryDocumentGeneration(jobId, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
