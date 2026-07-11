import type { Route } from "next";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PrivazyCrm } from "@/components/crm/privazy-crm";
import type { CrmRoute } from "@/components/crm/crm-data";
import { auth } from "@/server/auth";
import { canMutateCrm } from "@/server/crm/access";
import { getCrmDatabaseData } from "@/server/crm/data";

export const metadata: Metadata = {
  title: "privazy. CRM",
  description: "Panel operacyjny CRM PRIVAZY.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const routeMap: Record<string, CrmRoute> = {
  "": "dashboard",
  leads: "leads",
  clients: "clients",
  organizations: "clients",
  tasks: "tasks",
  orders: "orders",
  documents: "documents",
  breaches: "breaches",
  dsr: "requests",
  notifications: "inbox",
  settings: "settings",
  audit: "admin",
};

export default async function CrmPage({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user?.id || !role) {
    redirect("/login?callbackUrl=/crm" as Route);
  }

  if (role === "CLIENT") {
    redirect("/client");
  }

  const { segments = [] } = await params;
  const initialRoute = routeMap[segments[0] ?? ""];
  if (!initialRoute || segments.length > 2) notFound();

  const data = await getCrmDatabaseData();
  return <PrivazyCrm actorName={session.user.name ?? session.user.email ?? "Użytkownik"} actorRole={role} canMutate={canMutateCrm(role)} data={data} initialRoute={initialRoute} />;
}
