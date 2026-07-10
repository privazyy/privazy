import { NextResponse } from "next/server";

import { requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse, parseJson } from "@/server/crm/http";
import { contactUpdateSchema } from "@/server/crm/schemas";
import { updateContactPerson } from "@/server/crm/service";

type RouteContext = { params: Promise<{ contactId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { contactId } = await context.params;
    const input = contactUpdateSchema.parse(await parseJson(request));
    return NextResponse.json(await updateContactPerson(contactId, input, actor));
  } catch (error) {
    return crmErrorResponse(error);
  }
}
