import { NextResponse } from "next/server";

import { requireCrmRead } from "@/server/crm/access";
import { crmErrorResponse } from "@/server/crm/http";
import { listCrmAssignees } from "@/server/crm/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await requireCrmRead();
    return NextResponse.json({ items: await listCrmAssignees() });
  } catch (error) {
    return crmErrorResponse(error);
  }
}
