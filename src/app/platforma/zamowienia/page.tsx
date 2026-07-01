import type { Metadata } from "next";

import {
  ClientEmptyState,
  ClientPageHeader,
  ClientPortalAccessDenied,
  ClientPortalNoOrganization,
  ClientPortalShell,
  ClientRecordCard,
  ClientStatusBadge,
  withOrg,
} from "@/components/client/client-portal";
import { formatCurrency, formatDate, getClientOrders } from "@/server/platform/data";
import { resolvePlatformContext, type PlatformSearchParams } from "../platform-page";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Zamowienia - Platforma PRIVAZY",
  robots: { follow: false, index: false },
};

export default async function ClientOrdersPage({ searchParams }: { searchParams: PlatformSearchParams }) {
  const context = await resolvePlatformContext(searchParams);
  if (!context) return <ClientPortalAccessDenied />;
  if (!context.activeAccess) return <ClientPortalNoOrganization context={context} />;

  const organizationId = context.activeAccess.organization.id;
  const orders = await getClientOrders(organizationId);

  return (
    <ClientPortalShell activePath="/platforma/zamowienia" context={context}>
      <ClientPageHeader
        eyebrow="Zamowienia"
        subtitle="Historia zakupow, pozycje dokumentow, platnosci i faktury dla aktywnej organizacji."
        title="Zamowienia"
      />

      <section className="grid gap-3">
        {orders.length === 0 ? (
          <ClientEmptyState title="Brak zamowien">Zamowienia pojawia sie tutaj po zakupie dokumentow albo uslug PRIVAZY.</ClientEmptyState>
        ) : (
          orders.map((order) => (
            <ClientRecordCard
              href={withOrg(`/platforma/zamowienia/${order.id}`, organizationId)}
              key={order.id}
              meta={
                <>
                  <span>{formatDate(order.createdAt)}</span>
                  <span>{formatCurrency(order.totalGrossCents, order.currency)}</span>
                  <span>Pozycje: {order._count.items}</span>
                  <span>Platnosci: {order._count.payments}</span>
                  <span>Faktury: {order._count.invoices}</span>
                </>
              }
              status={<ClientStatusBadge status={order.status} />}
              title={order.orderNumber}
            >
              {order.items.slice(0, 3).map((item) => item.productName).join(", ")}
            </ClientRecordCard>
          ))
        )}
      </section>
    </ClientPortalShell>
  );
}
