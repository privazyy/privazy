import type { Metadata } from "next";

import { PrivazyCrm } from "@/components/crm/privazy-crm";
import { assertCanAccessAdmin } from "@/server/auth/guards";
import { getCrmDatabaseData } from "@/server/crm/data";

export const metadata: Metadata = {
  title: "privazy. CRM",
  description: "Panel operacyjny CRM PRIVAZY.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminPage() {
  await assertCanAccessAdmin({ mode: "redirect", redirectTo: "/login?callbackUrl=/admin" });

  const data = await getCrmDatabaseData();

  return <PrivazyCrm data={data} />;
}
