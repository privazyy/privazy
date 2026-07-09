import { NextResponse } from "next/server";

import { requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse, parseJson } from "@/server/crm/http";
import { crmNoteUpdateSchema } from "@/server/crm/schemas";
import { updateNote } from "@/server/crm/notes-service";

type RouteContext = { params: Promise<{ noteId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { noteId } = await context.params;
    const input = crmNoteUpdateSchema.parse(await parseJson(request));
    return NextResponse.json(await updateNote(noteId, input, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
