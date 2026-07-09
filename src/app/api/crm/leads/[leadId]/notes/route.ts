import { NextResponse } from "next/server";

import { requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse, parseJson } from "@/server/crm/http";
import { crmNoteBodySchema } from "@/server/crm/schemas";
import { addCrmNote } from "@/server/crm/service";

type RouteContext = { params: Promise<{ leadId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { leadId } = await context.params;
    const input = crmNoteBodySchema.parse(await parseJson(request));
    return NextResponse.json(await addCrmNote({ ...input, leadId }, actor), { status: 201 });
  } catch (error) {
    return crmErrorResponse(error);
  }
}
