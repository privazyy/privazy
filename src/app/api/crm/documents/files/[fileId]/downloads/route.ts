import { NextResponse } from "next/server";

import { requireCrmRead } from "@/server/crm/access";
import { crmErrorResponse } from "@/server/crm/http";
import { getDocumentDownloadsForFile } from "@/server/crm/document-operations-service";

type RouteContext = { params: Promise<{ fileId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, context: RouteContext) {
  try {
    const actor = await requireCrmRead();
    const { fileId } = await context.params;
    return NextResponse.json(await getDocumentDownloadsForFile(fileId, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
