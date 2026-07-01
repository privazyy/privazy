import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ClientBackLink,
  ClientDetailGrid,
  ClientDownloadLinks,
  ClientInfoPanel,
  ClientKeyValue,
  ClientPageHeader,
  ClientPortalAccessDenied,
  ClientPortalNoOrganization,
  ClientPortalShell,
  ClientStatusBadge,
  withOrg,
} from "@/components/client/client-portal";
import {
  documentTypeLabel,
  formatDate,
  formatDateTime,
  getClientDocumentDetail,
  statusLabel,
} from "@/server/platform/data";
import { resolvePlatformContext, type PlatformSearchParams } from "../../platform-page";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Dokument - Platforma PRIVAZY",
  robots: { follow: false, index: false },
};

export default async function ClientDocumentDetailPage({
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
  const document = await getClientDocumentDetail(organizationId, id);
  if (!document) notFound();

  return (
    <ClientPortalShell activePath="/platforma/dokumenty" context={context}>
      <ClientBackLink href={withOrg("/platforma/dokumenty", organizationId)} />
      <ClientPageHeader
        action={<ClientDownloadLinks formats={document.downloads} />}
        eyebrow="Dokument"
        subtitle="Szczegoly wydanego dokumentu oraz rejestr ostatnich pobran w aktywnej organizacji."
        title={document.label}
      />

      <ClientDetailGrid>
        <section className="grid gap-4">
          <ClientInfoPanel title="Metryka dokumentu">
            <ClientKeyValue label="Typ" value={documentTypeLabel(document.type)} />
            <ClientKeyValue label="Status" value={<ClientStatusBadge status={document.status} />} />
            <ClientKeyValue label="Wersja szablonu" value={document.templateVersion} />
            <ClientKeyValue label="Utworzono" value={formatDateTime(document.createdAt)} />
            <ClientKeyValue label="Aktualizacja" value={formatDateTime(document.updatedAt)} />
            <ClientKeyValue label="Liczba pobran" value={document.downloadsCount} />
          </ClientInfoPanel>

          <ClientInfoPanel title="Zadanie generowania">
            <ClientKeyValue label="Status joba" value={statusLabel(document.job.status)} />
            <ClientKeyValue label="Start" value={formatDateTime(document.job.createdAt)} />
            <ClientKeyValue label="Zakonczenie" value={formatDateTime(document.job.completedAt)} />
            <ClientKeyValue label="Blad" value={document.job.errorMessage ?? "Brak"} />
          </ClientInfoPanel>
        </section>

        <aside className="grid gap-4">
          <ClientInfoPanel title="Szablon">
            <ClientKeyValue label="Nazwa" value={document.template?.name ?? document.label} />
            <ClientKeyValue label="Typ" value={document.template ? documentTypeLabel(document.template.type) : documentTypeLabel(document.type)} />
            <ClientKeyValue label="Wersja" value={document.template?.version ?? document.templateVersion} />
          </ClientInfoPanel>

          <ClientInfoPanel title="Ostatnie pobrania">
            {document.recentDownloads.length === 0 ? (
              <p className="text-sm leading-6 text-[var(--text-muted)]">Ten dokument nie byl jeszcze pobierany z platformy.</p>
            ) : (
              document.recentDownloads.map((download) => (
                <ClientKeyValue
                  key={download.id}
                  label={`${download.fileType.toUpperCase()} - ${formatDate(download.createdAt)}`}
                  value={download.user?.name ?? download.user?.email ?? "Uzytkownik platformy"}
                />
              ))
            )}
          </ClientInfoPanel>
        </aside>
      </ClientDetailGrid>
    </ClientPortalShell>
  );
}
