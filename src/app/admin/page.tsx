import type { Metadata } from "next";

import { ConfigurationErrorState } from "@/components/auth/access-states";
import { PrivazyCrm } from "@/components/crm/privazy-crm";
import { requireCrmAccess } from "@/server/auth/guards";
import { getCrmDatabaseData } from "@/server/crm/data";
import { getPrivateDatabaseConfigurationStatus } from "@/server/env/private";

export const metadata: Metadata = {
  title: "privazy. CRM",
  description: "Panel operacyjny CRM PRIVAZY.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminPage() {
  await requireCrmAccess({ callbackUrl: "/admin", mode: "redirect" });

  const configuration = getPrivateDatabaseConfigurationStatus();

  if (!configuration.ok) {
    return (
      <ConfigurationErrorState
        title="CRM wymaga konfiguracji serwera"
        description={`Panel jest chroniony, ale nie moze pobrac danych bez wymaganej konfiguracji: ${configuration.missing.join(", ")}. Uzupelnij prywatne zmienne srodowiskowe poza repozytorium.`}
      />
    );
  }

  const data = await getCrmDatabaseData().catch((error: unknown) => {
    console.error("CRM data load failed after access guard", error);

    return null;
  });

  if (!data) {
    return (
      <ConfigurationErrorState
        title="CRM chwilowo nie moze pobrac danych"
        description="Dostep zostal zweryfikowany, ale warstwa danych zwrocila kontrolowany blad. Szczegoly techniczne zapisano w logach serwera."
      />
    );
  }

  return <PrivazyCrm data={data} />;
}
