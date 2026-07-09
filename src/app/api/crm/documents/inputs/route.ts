import { NextResponse } from "next/server";

import { documentInputErrorResponse, documentQueryObject } from "@/server/documents/input-errors";
import { assertCrmInputRead, requireDocumentInputActor } from "@/server/documents/input-permissions";
import { documentInputQuerySchema } from "@/server/documents/input-schemas";
import { listDocumentInputsForCrm } from "@/server/documents/input-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const actor = await requireDocumentInputActor();
    assertCrmInputRead(actor);
    const query = documentInputQuerySchema.parse(documentQueryObject(request));
    return NextResponse.json(await listDocumentInputsForCrm(actor, query));
  } catch (error) {
    return documentInputErrorResponse(error);
  }
}
