import { NextResponse } from "next/server";

import { safeLogAuditEvent } from "@/server/audit/log";
import { authErrorResponse, requireApiRole } from "@/server/auth/api";
import { CRM_READ_ROLES } from "@/server/auth/roles";
import { listIodCrmLeads } from "@/server/leads/iod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireApiRole(CRM_READ_ROLES, {
      entityId: "iod-leads",
      entityType: "CrmLeadList",
      request,
    });

    const leads = await listIodCrmLeads(50);

    await safeLogAuditEvent({
      action: "crm.leads_accessed",
      entityId: "iod-leads",
      entityType: "CrmLeadList",
      metadata: { count: leads.length },
      request,
      userId: user.id,
    });

    return NextResponse.json({ leads });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;

    console.error("CRM leads list failed", error);
    return NextResponse.json(
      { error: "Nie udało się pobrać leadów z formularzy." },
      { status: 500 },
    );
  }
}
