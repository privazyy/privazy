import type { Route } from "next";
import Link from "next/link";

import { BreachBadge, BreachCard, BreachLink, formatDateTime, riskTone, statusLabel, statusTone } from "@/components/breach/breach-ui";
import { requireClientBreachActor } from "@/server/breach/breach-permissions";
import { listClientBreachIncidents } from "@/server/breach/breach-service";

export default async function ClientBreachesPage() {
  const actor = await requireClientBreachActor();
  const breaches = await listClientBreachIncidents(actor, { limit: 100 });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--text-muted)]">Portal klienta</p>
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">Naruszenia ochrony danych</h1>
        </div>
        <BreachLink href="/platforma/naruszenia/nowe">Zglos naruszenie</BreachLink>
      </div>

      <BreachCard>
        <div className="grid gap-3">
          {breaches.items.map((incident) => (
            <Link className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-4 hover:bg-[var(--surface-sunken)]" href={`/platforma/naruszenia/${incident.id}` as Route} key={incident.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-[var(--text-strong)]">{incident.title}</h2>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Wykryto: {formatDateTime(incident.discoveredAt)} - termin: {incident.deadline.label}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <BreachBadge tone={statusTone(incident.status)}>{statusLabel(incident.status)}</BreachBadge>
                  <BreachBadge tone={riskTone(incident.riskLevel)}>{incident.riskLevel}</BreachBadge>
                  {incident.deadline.isOverdue && <BreachBadge tone="danger">overdue</BreachBadge>}
                </div>
              </div>
            </Link>
          ))}
          {breaches.items.length === 0 && (
            <div className="rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] p-4 text-sm text-[var(--text-muted)]">
              Brak zgloszonych naruszen dla Twojej organizacji.
            </div>
          )}
        </div>
      </BreachCard>
    </div>
  );
}
