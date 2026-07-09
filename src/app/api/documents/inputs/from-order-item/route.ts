import { NextResponse } from "next/server";

import { documentInputErrorResponse, parseDocumentJson } from "@/server/documents/input-errors";
import { requireDocumentInputActor } from "@/server/documents/input-permissions";
import { createDocumentInputFromOrderItemSchema } from "@/server/documents/input-schemas";
import { createDocumentInputForOrderItem } from "@/server/documents/input-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const actor = await requireDocumentInputActor();
    const input = createDocumentInputFromOrderItemSchema.parse(await parseDocumentJson(request));
    return NextResponse.json(await createDocumentInputForOrderItem(input.orderItemId, actor), { status: 201 });
  } catch (error) {
    return documentInputErrorResponse(error);
  }
}
