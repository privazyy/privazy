import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { PrivazyCrm } from "@/components/crm/privazy-crm";
import { getOptionalCrmActor } from "@/server/crm/permissions";
import { getCrmDatabaseData } from "@/server/crm/data";

export const metadata: Metadata = {
  title: "privazy. CRM",
  description: "Panel operacyjny CRM PRIVAZY.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminPage() {
  const actor = await getOptionalCrmActor();
  if (!actor) return <CrmAccessDenied />;

  const data = await getCrmDatabaseData(actor);

  return <PrivazyCrm data={data} />;
}

function CrmAccessDenied() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--surface-page)] px-[var(--gutter)] py-12 text-[var(--text-strong)]">
      <Card className="w-full max-w-[520px] text-center" padding="lg">
        <div className="mx-auto mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-[var(--fs-h2)] font-bold">CRM jest dostepny tylko dla zespolu PRIVAZY</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
          Zaloguj sie kontem z rola ADMIN, LAWYER, OPERATOR albo READ_ONLY. Dane operacyjne nie sa pobierane bez poprawnej roli.
        </p>
        <Button asChild className="mt-6">
          <Link href="/api/auth/signin?callbackUrl=/admin">Zaloguj sie</Link>
        </Button>
      </Card>
    </main>
  );
}
