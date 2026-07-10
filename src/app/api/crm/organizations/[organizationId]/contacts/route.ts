import { NextResponse } from "next/server";

import { requireCrmRead, requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse, parseJson, queryObject } from "@/server/crm/http";
import { contactBodySchema, contactListQuerySchema } from "@/server/crm/schemas";
import { addContactPerson, listContactPersons } from "@/server/crm/service";

type RouteContext = { params: Promise<{ organizationId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, context: RouteContext) {
  try {
    await requireCrmRead();
    const { organizationId } = await context.params;
    const query = contactListQuerySchema.parse(queryObject(request));
    return NextResponse.json(await listContactPersons(organizationId, query));
  } catch (error) {
    return crmErrorResponse(error);
  }
}

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
