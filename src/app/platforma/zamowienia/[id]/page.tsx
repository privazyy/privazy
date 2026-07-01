import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ClientBackLink,
  ClientDetailGrid,
  ClientInfoPanel,
  ClientKeyValue,
  ClientPageHeader,
  ClientPortalAccessDenied,
  ClientPortalNoOrganization,
  ClientPortalShell,
  ClientStatusBadge,
  withOrg,
} from "@/components/client/client-portal";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime, getClientOrderDetail } from "@/server/platform/data";
import { resolvePlatformContext, type PlatformSearchParams } from "../../platform-page";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Zamowienie - Platforma PRIVAZY",
  robots: { follow: false, index: false },
};

export default async function ClientOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: PlatformSearchParams;
}) {
  const context = await resolvePlatformContext(searchParams);
  if (!context) return <ClientPortalAccessDenied />;
  if (!context.activeAccess) return <ClientPortalNoOrganization context={context} />;

  const organizationId = context.activeAccess.organization.id;
  const { id } = await params;
  const order = await getClientOrderDetail(organizationId, id);
  if (!order) notFound();

  return (
    <ClientPortalShell activePath="/platforma/zamowienia" context={context}>
      <ClientBackLink href={withOrg("/platforma/zamowienia", organizationId)} />
      <ClientPageHeader
        eyebrow="Zamowienie"
        subtitle="Szczegoly pozycji, platnosci i faktur przypisanych do organizacji."
        title={order.orderNumber}
      />

      <ClientDetailGrid>
        <section className="grid gap-4">
          <ClientInfoPanel title="Pozycje">
            {order.items.map((item) => (
              <ClientKeyValue
                key={item.id}
                label={item.productName}
                value={
                  <span className="flex flex-wrap items-center gap-2">
                    <ClientStatusBadge status={item.status} />
                    <span>{formatCurrency(item.totalGrossCents, item.currency)}</span>
                    {item.status === "INPUT_REQUIRED" && (
                      <Button asChild size="sm" variant="outline">
                        <Link href={withOrg(`/platforma/dokumenty/${item.id}/formularz`, organizationId)}>Uzupelnij formularz</Link>
                      </Button>
                    )}
                  </span>
                }
              />
            ))}
          </ClientInfoPanel>

          <ClientInfoPanel title="Platnosci">
            {order.payments.length === 0 ? (
              <p className="text-sm leading-6 text-[var(--text-muted)]">Brak zapisanych platnosci dla tego zamowienia.</p>
            ) : (
              order.payments.map((payment) => (
                <ClientKeyValue
                  key={payment.id}
                  label={formatDateTime(payment.createdAt)}
                  value={
                    <span className="flex flex-wrap items-center gap-2">
                      <ClientStatusBadge status={payment.status} />
                      <span>{formatCurrency(payment.amountGrossCents, payment.currency)}</span>
                    </span>
                  }
                />
              ))
            )}
          </ClientInfoPanel>
        </section>

        <aside className="grid content-start gap-4">
          <ClientInfoPanel title="Podsumowanie">
            <ClientKeyValue label="Status" value={<ClientStatusBadge status={order.status} />} />
            <ClientKeyValue label="Utworzono" value={formatDateTime(order.createdAt)} />
            <ClientKeyValue label="Oplacono" value={formatDateTime(order.paidAt)} />
            <ClientKeyValue label="Netto" value={formatCurrency(order.subtotalNetCents, order.currency)} />
            <ClientKeyValue label="VAT" value={formatCurrency(order.vatCents, order.currency)} />
            <ClientKeyValue label="Rabat" value={formatCurrency(order.discountCents, order.currency)} />
            <ClientKeyValue label="Brutto" value={formatCurrency(order.totalGrossCents, order.currency)} />
          </ClientInfoPanel>

          <ClientInfoPanel title="Dane rozliczeniowe">
            <ClientKeyValue label="Nazwa" value={order.billingProfile.name} />
            <ClientKeyValue label="Email" value={order.billingProfile.email} />
            <ClientKeyValue label="Firma" value={order.billingProfile.companyName ?? "Brak"} />
            <ClientKeyValue label="NIP" value={order.billingProfile.nip ?? "Brak"} />
            <ClientKeyValue label="Adres" value={`${order.billingProfile.addressLine1}, ${order.billingProfile.postalCode} ${order.billingProfile.city}`} />
          </ClientInfoPanel>

          <ClientInfoPanel title="Faktury">
            {order.invoices.length === 0 ? (
              <p className="text-sm leading-6 text-[var(--text-muted)]">Brak faktur dla tego zamowienia.</p>
            ) : (
              order.invoices.map((invoice) => (
                <ClientKeyValue
                  key={invoice.id}
                  label={invoice.invoiceNumber}
                  value={
                    <span className="flex flex-wrap items-center gap-2">
                      <ClientStatusBadge status={invoice.status} />
                      <span>{formatCurrency(invoice.totalGrossCents, invoice.currency)}</span>
                      <span>{formatDateTime(invoice.createdAt)}</span>
                    </span>
                  }
                />
              ))
            )}
          </ClientInfoPanel>
        </aside>
      </ClientDetailGrid>
    </ClientPortalShell>
  );
}
