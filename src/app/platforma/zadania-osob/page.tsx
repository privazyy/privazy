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
import { formatDate, getClientRequests, requestTypeLabel, toneForDate } from "@/server/platform/data";
import { resolvePlatformContext, type PlatformSearchParams } from "../platform-page";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Zadania osob - Platforma PRIVAZY",
  robots: { follow: false, index: false },
};

export default async function ClientRequestsPage({ searchParams }: { searchParams: PlatformSearchParams }) {
  const context = await resolvePlatformContext(searchParams);
  if (!context) return <ClientPortalAccessDenied />;
  if (!context.activeAccess) return <ClientPortalNoOrganization context={context} />;

  const organizationId = context.activeAccess.organization.id;
  const requests = await getClientRequests(organizationId);

  return (
    <ClientPortalShell activePath="/platforma/zadania-osob" context={context}>
      <ClientPageHeader
        action={<ClientPrimaryAction href={withOrg("/platforma/zadania-osob/nowe", organizationId)} label="Dodaj zadanie osoby" />}
        eyebrow="Zadania osob"
        subtitle="Rejestr zadan wynikajacych z praw osob, z terminami i statusem weryfikacji."
        title="Zadania osob, ktorych dane dotycza"
      />

      <section className="grid gap-3">
        {requests.length === 0 ? (
          <ClientEmptyState
            actionHref={withOrg("/platforma/zadania-osob/nowe", organizationId)}
            actionLabel="Dodaj zadanie"
            title="Brak zadan osob"
          >
            Dodaj zadanie po otrzymaniu prosby o dostep, usuniecie, sprostowanie, sprzeciw albo inny typ realizacji praw osoby.
          </ClientEmptyState>
        ) : (
          requests.map((request) => (
            <ClientRecordCard
              href={withOrg(`/platforma/zadania-osob/${request.id}`, organizationId)}
              key={request.id}
              meta={
                <>
                  <span>{request.requestNumber}</span>
                  <span>{requestTypeLabel(request.type)}</span>
                  <span>Otrzymano: {formatDate(request.receivedAt)}</span>
                  <span>Termin: {formatDate(request.dueAt)}</span>
                </>
              }
              status={<ClientStatusBadge status={request.status} tone={toneForDate(request.dueAt)} />}
              title={request.subjectName}
            >
              {request.summary}
            </ClientRecordCard>
          ))
        )}
      </section>
    </ClientPortalShell>
  );
}
