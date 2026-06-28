import { NextResponse } from "next/server";

import { listIodCrmLeads } from "@/server/leads/iod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const leads = await listIodCrmLeads(50);

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("CRM leads list failed", error);
    return NextResponse.json(
      { error: "Nie udało się pobrać leadów z formularzy." },
      { status: 500 },
    );
  }
}
