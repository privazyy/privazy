import { NextResponse } from "next/server";

import { requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse, parseJson } from "@/server/crm/http";
import { contactBodySchema } from "@/server/crm/schemas";
import { addContactPerson } from "@/server/crm/service";

type RouteContext = { params: Promise<{ organizationId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { organizationId } = await context.params;
    const input = contactBodySchema.parse(await parseJson(request));
    return NextResponse.json(await addContactPerson({ ...input, organizationId }, actor), { status: 201 });
  } catch (error) {
    return crmErrorResponse(error);
  }
}
