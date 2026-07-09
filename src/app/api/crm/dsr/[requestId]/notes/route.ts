import { NextResponse } from "next/server";

import { requireDsrCrmWrite } from "@/server/dsr/access";
import { dsrErrorResponse, parseJson } from "@/server/dsr/http";
import { crmDsrNoteSchema } from "@/server/dsr/schemas";
import { addCrmDsrNote } from "@/server/dsr/service";

type RouteContext = { params: Promise<{ requestId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext) {
  try {
    const actor = await requireDsrCrmWrite();
    const { requestId } = await context.params;
    const input = crmDsrNoteSchema.parse(await parseJson(request));
    return NextResponse.json(await addCrmDsrNote(requestId, input, actor), { status: 201 });
  } catch (error) {
    return dsrErrorResponse(error);
  }
}
