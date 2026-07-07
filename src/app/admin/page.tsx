import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PrivazyCrm } from "@/components/crm/privazy-crm";
import { auth } from "@/server/auth";
import { actorFromSession, canAccessCrm } from "@/server/auth/permissions";
import { getCrmDatabaseData } from "@/server/crm/data";

export const metadata: Metadata = {
  title: "privazy. CRM",
  description: "Panel operacyjny CRM PRIVAZY.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminPage() {
  const actor = actorFromSession(await auth());

  if (!actor) {
    redirect("/login");
  }

  if (!canAccessCrm(actor)) {
    redirect("/client");
  }

  const data = await getCrmDatabaseData();

  return <PrivazyCrm data={data} />;
}
