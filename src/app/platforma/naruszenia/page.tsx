import type { Metadata } from "next";

import {
  ClientEmptyState,
  ClientPageHeader,
  ClientPortalAccessDenied,
  ClientPortalNoOrganization,
  ClientPortalShell,
  ClientPrimaryAction,
  ClientRecordCard,
  ClientStatusBadge,
  withOrg,
} from "@/components/client/client-portal";
import { formatDate, getClientBreaches, riskLabel, toneForDate, toneForStatus } from "@/server/platform/data";
import { resolvePlatformContext, type PlatformSearchParams } from "../platform-page";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Naruszenia - Platforma PRIVAZY",
  robots: { follow: false, index: false },
};

export default async function ClientBreachesPage({ searchParams }: { searchParams: PlatformSearchParams }) {
  const context = await resolvePlatformContext(searchParams);
  if (!context) return <ClientPortalAccessDenied />;
  if (!context.activeAccess) return <ClientPortalNoOrganization context={context} />;

  const organizationId = context.activeAccess.organization.id;
  const breaches = await getClientBreaches(organizationId);

  return (
    <ClientPortalShell activePath="/platforma/naruszenia" context={context}>
      <ClientPageHeader
        action={<ClientPrimaryAction href={withOrg("/platforma/naruszenia/nowe", organizationId)} label="Zglos naruszenie" />}
        eyebrow="Naruszenia"
        subtitle="Rejestr zdarzen zwiazanych z naruszeniem ochrony danych. Nowe zgloszenia tworza zadanie triage w CRM."
        title="Naruszenia ochrony danych"
      />

      <section className="grid gap-3">
        {breaches.length === 0 ? (
          <ClientEmptyState
            actionHref={withOrg("/platforma/naruszenia/nowe", organizationId)}
            actionLabel="Zglos naruszenie"
            title="Brak zgloszen naruszen"
          >
            Zgloszenie uruchamia wewnetrzny proces oceny ryzyka oraz terminy 72h dla decyzji notyfikacyjnych.
          </ClientEmptyState>
        ) : (
          breaches.map((breach) => (
            <ClientRecordCard
              href={withOrg(`/platforma/naruszenia/${breach.id}`, organizationId)}
              key={breach.id}
              meta={
                <>
                  <span>{breach.incidentNumber}</span>
                  <span>Wykryto: {formatDate(breach.detectedAt)}</span>
                  <span>Ryzyko: {riskLabel(breach.riskLevel)}</span>
                  <span>Termin organu: {formatDate(breach.authorityDueAt)}</span>
                </>
              }
              status={<ClientStatusBadge status={breach.status} tone={toneForStatus(breach.riskLevel) || toneForDate(breach.authorityDueAt)} />}
              title={breach.title}
            >
              {breach.summary}
            </ClientRecordCard>
          ))
        )}
      </section>
    </ClientPortalShell>
  );
}
