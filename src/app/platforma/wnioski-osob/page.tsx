import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import { DsrEmpty, DsrPageHeader, DsrStatusBadge, dsrTypeLabels, formatDate } from "@/components/dsr/dsr-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requirePortalDsrActor } from "@/server/dsr/access";
import { listPortalDsrRequests } from "@/server/dsr/service";

export const metadata: Metadata = {
  title: "Wnioski osob - privazy.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PortalDsrPage() {
  const actor = await requirePortalDsrActor();
  const data = await listPortalDsrRequests(actor, { limit: 50 });

  return (
    <div className="space-y-5">
      <DsrPageHeader actionHref="/platforma/wnioski-osob/nowe" actionLabel="Nowy wniosek" eyebrow="Platforma klienta" title="Wnioski osob" />
      {data.items.length === 0 ? (
        <DsrEmpty text="Brak wnioskow DSR dla tej organizacji." />
      ) : (
        <div className="grid gap-3">
          {data.items.map((item) => (
            <Card key={item.id} padding="md" variant="flat">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <DsrStatusBadge status={item.status} />
                    <span className="text-sm font-semibold text-[var(--text-muted)]">{dsrTypeLabels[item.type] ?? item.type}</span>
                  </div>
                  <h2 className="mt-2 truncate text-lg font-bold text-[var(--text-strong)]">{item.requesterName}</h2>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">Termin: {formatDate(item.dueAt)} · Aktualizacja: {formatDate(item.updatedAt)}</p>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/platforma/wnioski-osob/${item.id}` as Route}>Otworz</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
