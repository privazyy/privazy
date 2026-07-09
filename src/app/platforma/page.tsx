import type { Route } from "next";
import Link from "next/link";

import { PortalBadge, PortalCard, formatPortalMoney, statusTone } from "@/components/portal/portal-shell";
import { requireClientPortalActor } from "@/server/portal/client-portal-permissions";
import { getClientDashboard } from "@/server/portal/client-portal-service";

export default async function PlatformDashboardPage() {
  const actor = await requireClientPortalActor();
  const dashboard = await getClientDashboard(actor);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-[var(--text-muted)]">{dashboard.organization?.name ?? "Portal klienta"}</p>
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Aktywne zamowienia" value={dashboard.kpis.activeOrders} />
        <Metric label="Do uzupelnienia" value={dashboard.kpis.inputsToComplete} />
        <Metric label="W generowaniu" value={dashboard.kpis.documentsGenerating} />
        <Metric label="Gotowe pliki" value={dashboard.kpis.documentsReady} />
      </div>

      {dashboard.alerts.length > 0 && (
        <div className="grid gap-3">
          {dashboard.alerts.map((alert) => (
            <Link className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 hover:bg-[var(--surface-sunken)]" href={alert.href as Route} key={`${alert.title}-${alert.href}`}>
              <PortalBadge tone={alert.tone}>{alert.title}</PortalBadge>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{alert.subtitle}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <PortalCard>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-bold text-[var(--text-strong)]">Ostatnie zamowienia</h2>
            <Link className="text-sm font-semibold text-[var(--brand-ink)]" href="/platforma/zamowienia">Wszystkie</Link>
          </div>
          <div className="space-y-3">
            {dashboard.recentOrders.map((order) => (
              <Link className="block rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-3" href={`/platforma/zamowienia/${order.id}` as Route} key={order.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{order.orderNumber}</span>
                  <PortalBadge tone={statusTone(order.paymentStatus)}>{order.paymentStatus}</PortalBadge>
                </div>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{formatPortalMoney(order.totalGrossCents, order.currency)} · {order.itemsCount} pozycji</p>
              </Link>
            ))}
            {dashboard.recentOrders.length === 0 && <EmptyState text="Brak zamowien do pokazania." />}
          </div>
        </PortalCard>

        <PortalCard>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-bold text-[var(--text-strong)]">Dokumenty</h2>
            <Link className="text-sm font-semibold text-[var(--brand-ink)]" href="/platforma/dokumenty">Otworz</Link>
          </div>
          <div className="space-y-3">
            {dashboard.recentDocumentInputs.map((input) => (
              <Link className="block rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-3" href={`/platforma/dokumenty/${input.id}` as Route} key={input.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{input.orderItem.name}</span>
                  <PortalBadge tone={statusTone(input.status)}>{input.status}</PortalBadge>
                </div>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{input.template?.name ?? input.documentType ?? "Dokument"}</p>
              </Link>
            ))}
            {dashboard.recentDocumentInputs.length === 0 && <EmptyState text="Brak formularzy dokumentow." />}
          </div>
        </PortalCard>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <PortalCard>
      <p className="text-sm font-semibold text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[var(--text-strong)]">{value}</p>
    </PortalCard>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] p-3 text-sm text-[var(--text-muted)]">{text}</div>;
}
