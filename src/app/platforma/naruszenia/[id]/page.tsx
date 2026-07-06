import type { Metadata } from "next";
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
import { formatDateTime, getClientBreachDetail, riskLabel, toneForDate, toneForStatus } from "@/server/platform/data";
import { resolvePlatformContext, type PlatformSearchParams } from "../../platform-page";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Naruszenie - Platforma PRIVAZY",
  robots: { follow: false, index: false },
};

export default async function ClientBreachDetailPage({
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
  const breach = await getClientBreachDetail(organizationId, id);
  if (!breach) notFound();

  return (
    <ClientPortalShell activePath="/platforma/naruszenia" context={context}>
      <ClientBackLink href={withOrg("/platforma/naruszenia", organizationId)} />
      <ClientPageHeader
        eyebrow={breach.incidentNumber}
        subtitle="Szczegoly zgloszenia i terminy oceny ryzyka dla aktywnej organizacji."
        title={breach.title}
      />

      <ClientDetailGrid>
        <section className="grid gap-4">
          <ClientInfoPanel title="Opis">
            <ClientKeyValue label="Status" value={<ClientStatusBadge status={breach.status} tone={toneForStatus(breach.riskLevel)} />} />
            <ClientKeyValue label="Ryzyko" value={riskLabel(breach.riskLevel)} />
            <ClientKeyValue label="Opis" value={<span className="whitespace-pre-line">{breach.summary ?? "Brak opisu"}</span>} />
            <ClientKeyValue label="Decyzja notyfikacyjna" value={breach.decisionNotes ?? "Brak decyzji"} />
          </ClientInfoPanel>
        </section>

        <aside className="grid content-start gap-4">
          <ClientInfoPanel title="Terminy">
            <ClientKeyValue label="Wykryto" value={formatDateTime(breach.detectedAt)} />
            <ClientKeyValue label="Wystapilo" value={formatDateTime(breach.occurredAt)} />
            <ClientKeyValue
              label="Termin organu"
              value={<ClientStatusBadge status={breach.status} tone={toneForDate(breach.authorityDueAt)} />}
            />
            <ClientKeyValue label="Data terminu organu" value={formatDateTime(breach.authorityDueAt)} />
            <ClientKeyValue label="Termin osob" value={formatDateTime(breach.dataSubjectsDueAt)} />
            <ClientKeyValue label="Zamknieto" value={formatDateTime(breach.closedAt)} />
          </ClientInfoPanel>

          <ClientInfoPanel title="Odpowiedzialnosc">
            <ClientKeyValue label="Przypisane do" value={breach.assignedTo?.name ?? breach.assignedTo?.email ?? "Nie przypisano"} />
            <ClientKeyValue label="Utworzyl" value={breach.createdBy?.name ?? breach.createdBy?.email ?? "System"} />
            <ClientKeyValue label="Utworzono" value={formatDateTime(breach.createdAt)} />
            <ClientKeyValue label="Aktualizacja" value={formatDateTime(breach.updatedAt)} />
          </ClientInfoPanel>
        </aside>
      </ClientDetailGrid>
    </ClientPortalShell>
  );
}
