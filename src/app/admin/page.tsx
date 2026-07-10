import type { Route } from "next";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PrivazyCrm } from "@/components/crm/privazy-crm";
import { auth } from "@/server/auth";
import { canMutateCrm } from "@/server/crm/access";
import { getCrmDatabaseData } from "@/server/crm/data";

export const metadata: Metadata = {
  title: "privazy. CRM",
  description: "Panel operacyjny CRM PRIVAZY.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user?.id || !role) {
    redirect("/login?callbackUrl=/admin" as Route);
  }

  if (role === "CLIENT") {
    redirect("/client");
  }

  const data = await getCrmDatabaseData();

  return <PrivazyCrm canMutate={canMutateCrm(role)} data={data} />;
}
