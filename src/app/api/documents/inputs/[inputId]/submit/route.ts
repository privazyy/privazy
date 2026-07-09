import { NextResponse } from "next/server";

import { documentInputErrorResponse, parseDocumentJson } from "@/server/documents/input-errors";
import { requireDocumentInputActor } from "@/server/documents/input-permissions";
import { submitDocumentInputSchema } from "@/server/documents/input-schemas";
import { submitDocumentInput } from "@/server/documents/input-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ inputId: string }> }) {
  try {
    const actor = await requireDocumentInputActor();
    const { inputId } = await params;
    const body = await parseDocumentJson(request);
    const input = submitDocumentInputSchema.parse({ ...body, documentInputId: inputId });
    return NextResponse.json(await submitDocumentInput(input, actor));
  } catch (error) {
    return documentInputErrorResponse(error);
  }
}
