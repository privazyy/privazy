import type { Route } from "next";
import Link from "next/link";

import { BreachBadge, BreachCard, formatDateTime, riskTone, statusLabel, statusTone } from "@/components/breach/breach-ui";
import { requireStaffBreachRead } from "@/server/breach/breach-permissions";
import { listCrmBreachIncidents } from "@/server/breach/breach-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function CrmBreachesPage() {
  const actor = await requireStaffBreachRead();
  const breaches = await listCrmBreachIncidents(actor, { limit: 100 });

  return (
    <main className="min-h-screen bg-[var(--surface-page)] px-4 py-6 text-[var(--text-body)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[var(--container-wide)] space-y-5">
        <div>
          <p className="text-sm font-semibold text-[var(--text-muted)]">CRM</p>
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">Rejestr naruszen ochrony danych</h1>
        </div>
        <BreachCard>
          <div className="pvz-h-scroll" data-responsive-scroll="true">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-xs uppercase text-[var(--text-muted)]">
                  <th className="py-3 pr-4">Tytul</th>
                  <th className="py-3 pr-4">Organizacja</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Severity</th>
                  <th className="py-3 pr-4">Risk</th>
                  <th className="py-3 pr-4">Wykryto</th>
                  <th className="py-3 pr-4">Deadline</th>
                  <th className="py-3 pr-4">Opiekun</th>
                </tr>
              </thead>
              <tbody>
                {breaches.items.map((incident) => (
                  <tr className="border-b border-[var(--border-subtle)] last:border-b-0" key={incident.id}>
                    <td className="py-4 pr-4">
                      <Link className="font-bold text-[var(--brand-ink)]" href={`/admin/breaches/${incident.id}` as Route}>
                        {incident.title}
                      </Link>
                    </td>
                    <td className="py-4 pr-4">{incident.organization.name}</td>
                    <td className="py-4 pr-4"><BreachBadge tone={statusTone(incident.status)}>{statusLabel(incident.status)}</BreachBadge></td>
                    <td className="py-4 pr-4"><BreachBadge tone={riskTone(incident.severity)}>{incident.severity}</BreachBadge></td>
                    <td className="py-4 pr-4"><BreachBadge tone={riskTone(incident.riskLevel)}>{incident.riskLevel}</BreachBadge></td>
                    <td className="py-4 pr-4">{formatDateTime(incident.discoveredAt)}</td>
                    <td className="py-4 pr-4">{incident.deadline.label}</td>
                    <td className="py-4 pr-4">{incident.assignedTo?.name ?? incident.assignedTo?.email ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {breaches.items.length === 0 && <div className="p-6 text-sm text-[var(--text-muted)]">Brak naruszen w rejestrze.</div>}
          </div>
        </BreachCard>
      </div>
    </main>
  );
}
