import { NextResponse } from "next/server";

import { documentInputErrorResponse, parseDocumentJson } from "@/server/documents/input-errors";
import { requireDocumentInputActor } from "@/server/documents/input-permissions";
import { documentInputNeedsCorrectionSchema } from "@/server/documents/input-schemas";
import { markDocumentInputNeedsCorrection } from "@/server/documents/input-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ inputId: string }> }) {
  try {
    const actor = await requireDocumentInputActor();
    const { inputId } = await params;
    const input = documentInputNeedsCorrectionSchema.parse(await parseDocumentJson(request));
    return NextResponse.json(await markDocumentInputNeedsCorrection(actor, inputId, input));
  } catch (error) {
    return documentInputErrorResponse(error);
  }
}
