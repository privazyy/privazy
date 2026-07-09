import type { Route } from "next";
import Link from "next/link";

import { PortalBadge, PortalCard, formatPortalMoney, statusTone } from "@/components/portal/portal-shell";
import { requireClientPortalActor } from "@/server/portal/client-portal-permissions";
import { listClientOrders } from "@/server/portal/client-portal-service";

export default async function ClientOrdersPage() {
  const actor = await requireClientPortalActor();
  const orders = await listClientOrders(actor, { limit: 100 });

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-[var(--text-muted)]">Portal klienta</p>
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">Zamowienia</h1>
      </div>
      <PortalCard>
        <div className="grid gap-3">
          {orders.items.map((order) => (
            <Link className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-4 hover:bg-[var(--surface-sunken)]" href={`/platforma/zamowienia/${order.id}` as Route} key={order.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-[var(--text-strong)]">{order.orderNumber}</h2>
                  <p className="text-sm text-[var(--text-muted)]">{new Date(order.createdAt).toLocaleDateString("pl-PL")} · {order.itemsCount} pozycji</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <PortalBadge tone={statusTone(order.status)}>{order.status}</PortalBadge>
                  <PortalBadge tone={statusTone(order.paymentStatus)}>{order.paymentStatus}</PortalBadge>
                  <span className="font-bold">{formatPortalMoney(order.totalGrossCents, order.currency)}</span>
                </div>
              </div>
            </Link>
          ))}
          {orders.items.length === 0 && <div className="rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] p-4 text-sm text-[var(--text-muted)]">Brak zamowien w portalu.</div>}
        </div>
      </PortalCard>
    </div>
  );
}
