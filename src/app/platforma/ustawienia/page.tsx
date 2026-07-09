import Link from "next/link";

import { PortalCard } from "@/components/portal/portal-shell";
import { requireClientPortalActor } from "@/server/portal/client-portal-permissions";

export default async function ClientSettingsPage() {
  const actor = await requireClientPortalActor();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-[var(--text-muted)]">Portal klienta</p>
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">Ustawienia</h1>
      </div>
      <PortalCard>
        <h2 className="font-bold text-[var(--text-strong)]">Konto</h2>
        <dl className="mt-4 grid gap-3 md:grid-cols-2">
          <Info label="E-mail" value={actor.email ?? "-"} />
          <Info label="Nazwa" value={actor.name ?? "-"} />
          <Info label="Rola" value={actor.role} />
          <Info label="Organizacje" value={String(actor.organizationIds.length)} />
        </dl>
      </PortalCard>
      <PortalCard>
        <h2 className="font-bold text-[var(--text-strong)]">Linki</h2>
        <div className="mt-3 grid gap-2">
          <Link className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] px-3 py-2 text-sm font-semibold" href="/sklep/polityka-prywatnosci">
            Polityka prywatnosci
          </Link>
          <Link className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] px-3 py-2 text-sm font-semibold" href="/">
            Kontakt
          </Link>
        </div>
      </PortalCard>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-[var(--text-muted)]">{label}</dt>
      <dd className="mt-1 font-semibold text-[var(--text-strong)]">{value}</dd>
    </div>
  );
}
