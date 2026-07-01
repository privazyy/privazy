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
import { formatDateTime, getClientRequestDetail, requestTypeLabel, toneForDate } from "@/server/platform/data";
import { resolvePlatformContext, type PlatformSearchParams } from "../../platform-page";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Zadanie osoby - Platforma PRIVAZY",
  robots: { follow: false, index: false },
};

export default async function ClientRequestDetailPage({
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
  const request = await getClientRequestDetail(organizationId, id);
  if (!request) notFound();

  return (
    <ClientPortalShell activePath="/platforma/zadania-osob" context={context}>
      <ClientBackLink href={withOrg("/platforma/zadania-osob", organizationId)} />
      <ClientPageHeader
        eyebrow={request.requestNumber}
        subtitle="Szczegoly zadania osoby i termin odpowiedzi w aktywnej organizacji."
        title={request.subjectName}
      />

      <ClientDetailGrid>
        <section className="grid gap-4">
          <ClientInfoPanel title="Opis">
            <ClientKeyValue label="Status" value={<ClientStatusBadge status={request.status} tone={toneForDate(request.dueAt)} />} />
            <ClientKeyValue label="Typ" value={requestTypeLabel(request.type)} />
            <ClientKeyValue label="Tresc" value={<span className="whitespace-pre-line">{request.summary ?? "Brak tresci"}</span>} />
            <ClientKeyValue label="Odpowiedz" value={request.responseSummary ?? "Brak wyslanej odpowiedzi"} />
          </ClientInfoPanel>
        </section>

        <aside className="grid content-start gap-4">
          <ClientInfoPanel title="Terminy">
            <ClientKeyValue label="Otrzymano" value={formatDateTime(request.receivedAt)} />
            <ClientKeyValue label="Termin odpowiedzi" value={formatDateTime(request.dueAt)} />
            <ClientKeyValue label="Zweryfikowano" value={formatDateTime(request.verifiedAt)} />
            <ClientKeyValue label="Odpowiedziano" value={formatDateTime(request.respondedAt)} />
            <ClientKeyValue label="Zamknieto" value={formatDateTime(request.closedAt)} />
          </ClientInfoPanel>

          <ClientInfoPanel title="Osoba i obsluga">
            <ClientKeyValue label="Email osoby" value={request.subjectEmail ?? "Brak"} />
            <ClientKeyValue label="Kanal" value={request.channel} />
            <ClientKeyValue label="Przypisane do" value={request.assignedTo?.name ?? request.assignedTo?.email ?? "Nie przypisano"} />
            <ClientKeyValue label="Utworzyl" value={request.createdBy?.name ?? request.createdBy?.email ?? "System"} />
            <ClientKeyValue label="Utworzono" value={formatDateTime(request.createdAt)} />
          </ClientInfoPanel>
        </aside>
      </ClientDetailGrid>
    </ClientPortalShell>
  );
}
