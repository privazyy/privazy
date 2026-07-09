import { NextResponse } from "next/server";

import { requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse, parseJson } from "@/server/crm/http";
import { documentReviewSchema } from "@/server/crm/order-schemas";
import { markDocumentForReview } from "@/server/crm/document-operations-service";

type RouteContext = { params: Promise<{ documentId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { documentId } = await context.params;
    const input = documentReviewSchema.parse(await parseJson(request));
    return NextResponse.json(await markDocumentForReview(documentId, input, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
