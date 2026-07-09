import { NextResponse } from "next/server";

import { documentInputErrorResponse } from "@/server/documents/input-errors";
import { assertCrmInputRead, requireDocumentInputActor } from "@/server/documents/input-permissions";
import { getDocumentInputDetail } from "@/server/documents/input-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ inputId: string }> }) {
  try {
    const actor = await requireDocumentInputActor();
    assertCrmInputRead(actor);
    const { inputId } = await params;
    return NextResponse.json(await getDocumentInputDetail(actor, inputId));
  } catch (error) {
    return documentInputErrorResponse(error);
  }
}
