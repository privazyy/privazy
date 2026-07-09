import { NextResponse } from "next/server";

import { requireCrmRead, requireCrmWrite } from "@/server/crm/access";
import { crmErrorResponse, parseJson } from "@/server/crm/http";
import { crmNoteBodySchema } from "@/server/crm/schemas";
import { createOrganizationNote, listNotesForOrganization } from "@/server/crm/notes-service";

type RouteContext = { params: Promise<{ organizationId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, context: RouteContext) {
  try {
    await requireCrmRead();
    const { organizationId } = await context.params;
    return NextResponse.json(await listNotesForOrganization(organizationId));
  } catch (error) {
    return crmErrorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const actor = await requireCrmWrite();
    const { organizationId } = await context.params;
    const input = crmNoteBodySchema.parse(await parseJson(request));
    return NextResponse.json(await createOrganizationNote(organizationId, input, actor), { status: 201 });
  } catch (error) {
    return crmErrorResponse(error);
  }
}
