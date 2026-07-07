import { NextResponse } from "next/server";

import { safeJsonError } from "@/server/api/errors";
import { auth } from "@/server/auth";
import { crmLeadsQuerySchema, requireCrmApiRead, serializeCrmLead } from "@/server/crm/security";
import { listIodCrmLeads } from "@/server/leads/iod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    requireCrmApiRead(await auth());

    const url = new URL(request.url);
    const query = crmLeadsQuerySchema.parse({
      limit: url.searchParams.get("limit") ?? undefined,
    });
    const leads = await listIodCrmLeads(query.limit);

    return NextResponse.json({ leads: leads.map(serializeCrmLead) });
  } catch (error) {
    console.error("CRM leads list failed", error);
    return safeJsonError(error);
  }
}
