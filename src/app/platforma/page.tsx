import type { Metadata } from "next";
import Link from "next/link";

import {
  ClientDownloadLinks,
  ClientEmptyState,
  ClientMetricGrid,
  ClientPageHeader,
  ClientPortalAccessDenied,
  ClientPortalNoOrganization,
  ClientPortalShell,
  ClientPrimaryAction,
  ClientRecordCard,
  ClientStatusBadge,
  ClientTimeline,
  withOrg,
} from "@/components/client/client-portal";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  getClientPortalDashboard,
  priorityLabel,
  requestTypeLabel,
  riskLabel,
  toneForDate,
  toneForStatus,
} from "@/server/platform/data";
import { resolvePlatformContext, type PlatformSearchParams } from "./platform-page";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Platforma klienta - PRIVAZY",
  robots: { follow: false, index: false },
};

export default async function PlatformPage({ searchParams }: { searchParams: PlatformSearchParams }) {
  const context = await resolvePlatformContext(searchParams);
  if (!context) return <ClientPortalAccessDenied />;
  if (!context.activeAccess) return <ClientPortalNoOrganization context={context} />;

  const organizationId = context.activeAccess.organization.id;
  const dashboard = await getClientPortalDashboard(organizationId);

  return (
    <ClientPortalShell activePath="/platforma" context={context}>
      <ClientPageHeader
        action={
          <>
            <ClientPrimaryAction href={withOrg("/platforma/naruszenia/nowe", organizationId)} label="Zglos naruszenie" />
            <Button asChild variant="outline">
              <Link href={withOrg("/platforma/zadania-osob/nowe", organizationId)}>Dodaj zadanie osoby</Link>
            </Button>
          </>
        }
        eyebrow="Panel organizacji"
        subtitle="Najwazniejsze dokumenty, terminy i kontakty dla aktywnej organizacji."
        title={context.activeAccess.organization.name}
      />

      <ClientMetricGrid items={dashboard.metrics} organizationId={organizationId} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="grid gap-6">
          <section className="grid gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold">Najnowsze dokumenty</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Pliki sa wydawane przez chroniony endpoint pobierania.</p>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link href={withOrg("/platforma/dokumenty", organizationId)}>Otworz dokumenty</Link>
              </Button>
            </div>
            <div className="mt-4 grid gap-3">
              {dashboard.latestDocuments.length === 0 ? (
                <ClientEmptyState title="Brak dokumentow">Gotowe dokumenty pojawia sie tutaj po wygenerowaniu i przypisaniu do organizacji.</ClientEmptyState>
              ) : (
                dashboard.latestDocuments.map((document) => (
                  <ClientRecordCard
                    action={
                      <>
                        <Button asChild size="sm" variant="ghost">
                          <Link href={withOrg(`/platforma/dokumenty/${document.id}`, organizationId)}>Szczegoly</Link>
                        </Button>
                        <ClientDownloadLinks formats={document.downloads} />
                      </>
                    }
                    key={document.id}
                    meta={
                      <>
                        <span>{formatDate(document.createdAt)}</span>
                        <span>Wersja {document.templateVersion}</span>
                      </>
                    }
                    status={<ClientStatusBadge status={document.status} />}
                    title={document.label}
                  />
                ))
              )}
            </div>
          </section>

          <section className="grid gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold">Pilne zadania</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Terminy z CRM widoczne dla klienta w aktywnej organizacji.</p>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link href={withOrg("/platforma/zadania", organizationId)}>Otworz zadania</Link>
              </Button>
            </div>
            <div className="mt-4 grid gap-3">
              {dashboard.urgentTasks.length === 0 ? (
                <ClientEmptyState title="Brak pilnych zadan">Nie ma otwartych zadan z terminem w najblizszych siedmiu dniach.</ClientEmptyState>
              ) : (
                dashboard.urgentTasks.map((task) => (
                  <ClientRecordCard
                    key={task.id}
                    meta={
                      <>
                        <span>Termin: {formatDate(task.dueAt)}</span>
                        <span>Priorytet: {priorityLabel(task.priority)}</span>
                      </>
                    }
                    status={<ClientStatusBadge status={task.status} tone={toneForDate(task.dueAt)} />}
                    title={task.title}
                  >
                    {task.description}
                  </ClientRecordCard>
                ))
              )}
            </div>
          </section>
        </section>

        <aside className="grid gap-6">
          <section className="grid gap-3">
            <h2 className="text-lg font-bold">Ostatnie sprawy</h2>
            <div className="mt-4 grid gap-3">
              {dashboard.latestBreaches.map((breach) => (
                <ClientRecordCard
                  href={withOrg(`/platforma/naruszenia/${breach.id}`, organizationId)}
                  key={breach.id}
                  meta={
                    <>
                      <span>{breach.incidentNumber}</span>
                      <span>Ryzyko: {riskLabel(breach.riskLevel)}</span>
                    </>
                  }
                  status={<ClientStatusBadge status={breach.status} tone={toneForStatus(breach.riskLevel)} />}
                  title={breach.title}
                />
              ))}
              {dashboard.latestRequests.map((request) => (
                <ClientRecordCard
                  href={withOrg(`/platforma/zadania-osob/${request.id}`, organizationId)}
                  key={request.id}
                  meta={
                    <>
                      <span>{request.requestNumber}</span>
                      <span>{requestTypeLabel(request.type)}</span>
                      <span>Termin: {formatDate(request.dueAt)}</span>
                    </>
                  }
                  status={<ClientStatusBadge status={request.status} />}
                  title={request.subjectName}
                />
              ))}
              {dashboard.latestBreaches.length === 0 && dashboard.latestRequests.length === 0 && (
                <ClientEmptyState title="Brak aktywnych spraw">Nowe naruszenia i zadania osob pojawia sie w tym miejscu po rejestracji.</ClientEmptyState>
              )}
            </div>
          </section>

          <section className="grid gap-3">
            <h2 className="text-lg font-bold">Ostatnia aktywnosc</h2>
            <div className="mt-4">
              <ClientTimeline events={dashboard.timeline} />
            </div>
          </section>
        </aside>
      </div>
    </ClientPortalShell>
  );
}
