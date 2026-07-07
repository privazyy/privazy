import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ConfigurationErrorState } from "@/components/ops/configuration-error-state";
import { PrivazyCrm } from "@/components/crm/privazy-crm";
import { auth } from "@/server/auth";
import { getCrmDatabaseData } from "@/server/crm/data";
import { getRuntimeConfigStatus } from "@/server/env/status";

export const metadata: Metadata = {
  title: "privazy. CRM",
  description: "Panel operacyjny CRM PRIVAZY.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/admin");
  }

  const role = session.user.role;
  const canReadAdmin = role === "ADMIN" || role === "LAWYER" || role === "OPERATOR" || role === "READ_ONLY";

  if (!canReadAdmin) {
    redirect("/");
  }

  const configStatus = getRuntimeConfigStatus();

  if (!configStatus.isDatabaseConfigured) {
    return <ConfigurationErrorState missing={["DATABASE_URL"]} />;
  }

  const data = await getCrmDatabaseData();

  return <PrivazyCrm data={data} />;
}
