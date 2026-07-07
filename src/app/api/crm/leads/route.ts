import { NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";

import { auth } from "@/server/auth";
import { listIodCrmLeads } from "@/server/leads/iod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CRM_READ_ROLES = new Set<UserRole>(["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY"]);

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Wymagane logowanie." }, { status: 401 });
  }

  if (!session.user.role || !CRM_READ_ROLES.has(session.user.role)) {
    return NextResponse.json({ error: "Brak uprawnień do CRM." }, { status: 403 });
  }

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
