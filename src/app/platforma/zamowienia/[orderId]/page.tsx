import type { Route } from "next";
import Link from "next/link";

import { PortalBadge, PortalCard, formatPortalMoney, statusTone } from "@/components/portal/portal-shell";
import { requireClientPortalActor } from "@/server/portal/client-portal-permissions";
import { getClientOrder } from "@/server/portal/client-portal-service";

export default async function ClientOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const actor = await requireClientPortalActor();
  const { orderId } = await params;
  const order = await getClientOrder(actor, orderId);

  return (
    <div className="space-y-5">
      <Link className="text-sm font-semibold text-[var(--brand-ink)]" href="/platforma/zamowienia">Wroc do zamowien</Link>
      <PortalCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--text-muted)]">{order.organization.name}</p>
            <h1 className="text-2xl font-bold text-[var(--text-strong)]">{order.orderNumber}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <PortalBadge tone={statusTone(order.status)}>{order.status}</PortalBadge>
            <PortalBadge tone={statusTone(order.paymentStatus)}>{order.paymentStatus}</PortalBadge>
            <PortalBadge tone={statusTone(order.invoiceStatus)}>{order.invoiceStatus}</PortalBadge>
          </div>
        </div>
        <p className="mt-4 text-xl font-bold">{formatPortalMoney(order.totalGrossCents, order.currency)}</p>
      </PortalCard>

      <div className="grid gap-3">
        {order.items.map((item) => (
          <PortalCard key={item.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-[var(--text-strong)]">{item.name}</h2>
                <p className="text-sm text-[var(--text-muted)]">{item.template?.name ?? item.documentType ?? "Pozycja zamowienia"} · {formatPortalMoney(item.totalGrossCents, order.currency)}</p>
              </div>
              <PortalBadge tone={statusTone(item.fulfillmentStatus)}>{item.fulfillmentStatus}</PortalBadge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.documentInput && (
                <Link className="rounded-[var(--radius-sm)] border border-[var(--border-default)] px-3 py-2 text-sm font-semibold" href={`/platforma/dokumenty/${item.documentInput.id}` as Route}>
                  Zobacz formularz
                </Link>
              )}
              {item.generatedDocument?.downloads.docx && (
                <Link className="rounded-[var(--radius-sm)] bg-[var(--brand)] px-3 py-2 text-sm font-bold text-white" href={`/api/portal/documents/generated/${item.generatedDocument.id}/download?fileType=docx` as Route}>
                  Pobierz DOCX
                </Link>
              )}
            </div>
          </PortalCard>
        ))}
      </div>
    </div>
  );
}
