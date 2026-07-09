import { NextResponse } from "next/server";

import { documentInputErrorResponse, parseDocumentJson } from "@/server/documents/input-errors";
import { requireDocumentInputActor } from "@/server/documents/input-permissions";
import { saveDocumentInputDraftSchema } from "@/server/documents/input-schemas";
import { saveDocumentInputDraft } from "@/server/documents/input-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ inputId: string }> }) {
  try {
    const actor = await requireDocumentInputActor();
    const { inputId } = await params;
    const body = await parseDocumentJson(request);
    const input = saveDocumentInputDraftSchema.parse({ ...body, documentInputId: inputId });
    return NextResponse.json(await saveDocumentInputDraft(input, actor));
  } catch (error) {
    return documentInputErrorResponse(error);
  }
}
