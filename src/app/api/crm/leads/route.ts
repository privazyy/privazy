import { NextResponse } from "next/server";

import { authErrorStatus, requireCrmAccess } from "@/server/auth/guards";
import { listIodCrmLeads } from "@/server/leads/iod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await requireCrmAccess();

    const leads = await listIodCrmLeads(50);

    return NextResponse.json({ leads });
  } catch (error) {
    const status = authErrorStatus(error);

    if (status) {
      return NextResponse.json({ error: status === 401 ? "Authentication required" : "Insufficient permissions" }, { status });
    }

    console.error("CRM leads list failed", error);
    return NextResponse.json(
      { error: "Nie udało się pobrać leadów z formularzy." },
      { status: 500 },
    );
  }
}
