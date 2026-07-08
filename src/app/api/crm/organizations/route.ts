import { NextResponse } from "next/server";

import { requireCrmRead, requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse, parseJson, queryObject } from "@/server/crm/http";
import { organizationCreateSchema, organizationListQuerySchema } from "@/server/crm/schemas";
import { createOrganization, listOrganizations } from "@/server/crm/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireCrmRead();
    const query = organizationListQuerySchema.parse(queryObject(request));
    return NextResponse.json(await listOrganizations(query));
  } catch (error) {
    return crmErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireCrmWrite();
    const input = organizationCreateSchema.parse(await parseJson(request));
    return NextResponse.json(await createOrganization(input, actor), { status: 201 });
  } catch (error) {
    return crmErrorResponse(error);
  }
}
