import type { Metadata } from "next";
import Link from "next/link";

import {
  ClientDownloadLinks,
  ClientEmptyState,
  ClientPageHeader,
  ClientPortalAccessDenied,
  ClientPortalNoOrganization,
  ClientPortalShell,
  ClientRecordCard,
  ClientStatusBadge,
  withOrg,
} from "@/components/client/client-portal";
import { Button } from "@/components/ui/button";
import { formatDate, getClientDocuments } from "@/server/platform/data";
import { resolvePlatformContext, type PlatformSearchParams } from "../platform-page";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Dokumenty - Platforma PRIVAZY",
  robots: { follow: false, index: false },
};

export default async function ClientDocumentsPage({ searchParams }: { searchParams: PlatformSearchParams }) {
  const context = await resolvePlatformContext(searchParams);
  if (!context) return <ClientPortalAccessDenied />;
  if (!context.activeAccess) return <ClientPortalNoOrganization context={context} />;

  const organizationId = context.activeAccess.organization.id;
  const data = await getClientDocuments(organizationId);

  return (
    <ClientPortalShell activePath="/platforma/dokumenty" context={context}>
      <ClientPageHeader
        eyebrow="Dokumenty"
        subtitle="Gotowe pliki i formularze danych do dokumentow sa widoczne tylko w ramach aktywnej organizacji."
        title="Dokumenty i formularze"
      />

      <section className="grid gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">Formularze do uzupelnienia</h2>
          <p className="text-sm text-[var(--text-muted)]">Dane z formularza trafiaja do audytu i osi zdarzen organizacji.</p>
        </div>
        {data.formItems.length === 0 ? (
          <ClientEmptyState title="Brak formularzy do uzupelnienia">
            Nie ma teraz pozycji zamowienia, ktore wymagaja danych do dokumentu.
          </ClientEmptyState>
        ) : (
          data.formItems.map((item) => (
            <ClientRecordCard
              action={
                <Button asChild size="sm">
                  <Link href={withOrg(`/platforma/dokumenty/${item.id}/formularz`, organizationId)}>Uzupelnij</Link>
                </Button>
              }
              key={item.id}
              meta={
                <>
                  <span>Zamowienie {item.order.orderNumber}</span>
                  <span>Aktualizacja: {formatDate(item.updatedAt)}</span>
                  {item.latestSubmission && <span>Ostatni formularz: {formatDate(item.latestSubmission.createdAt)}</span>}
                </>
              }
              status={<ClientStatusBadge status={item.status} />}
              title={item.productName}
            />
          ))
        )}
      </section>

      <section className="grid gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">Wydane dokumenty</h2>
          <p className="text-sm text-[var(--text-muted)]">Pobieranie odbywa sie przez krotko wazny link podpisany, bez ujawniania klucza pliku.</p>
        </div>
        {data.documents.length === 0 ? (
          <ClientEmptyState title="Brak wydanych dokumentow">Dokumenty pojawia sie tutaj po wygenerowaniu przez zespol PRIVAZY.</ClientEmptyState>
        ) : (
          data.documents.map((document) => (
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
                  <span>Pobrania: {document.downloadsCount}</span>
                </>
              }
              status={<ClientStatusBadge status={document.status} />}
              title={document.label}
            />
          ))
        )}
      </section>
    </ClientPortalShell>
  );
}
