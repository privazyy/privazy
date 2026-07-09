import type { Route } from "next";
import Link from "next/link";

import { PortalBadge, PortalCard, statusTone } from "@/components/portal/portal-shell";
import { requireClientPortalActor } from "@/server/portal/client-portal-permissions";
import { listClientGeneratedDocuments } from "@/server/portal/client-portal-service";

export default async function ClientFilesPage() {
  const actor = await requireClientPortalActor();
  const documents = await listClientGeneratedDocuments(actor, { limit: 100 });

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-[var(--text-muted)]">Portal klienta</p>
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">Pliki do pobrania</h1>
      </div>
      <PortalCard>
        <div className="grid gap-3">
          {documents.items.map((document) => (
            <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-4" key={document.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold">{document.template.name}</h2>
                  <p className="text-sm text-[var(--text-muted)]">{document.orderItem?.order.orderNumber ?? document.type}</p>
                </div>
                <PortalBadge tone={statusTone(document.status)}>{document.status}</PortalBadge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {document.downloads.docx && <DownloadLink documentId={document.id} fileType="docx" label="DOCX" />}
                {document.downloads.pdf && <DownloadLink documentId={document.id} fileType="pdf" label="PDF" />}
                {document.downloads.zip && <DownloadLink documentId={document.id} fileType="zip" label="ZIP" />}
              </div>
            </div>
          ))}
          {documents.items.length === 0 && <div className="rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] p-4 text-sm text-[var(--text-muted)]">Brak plikow do pobrania.</div>}
        </div>
      </PortalCard>
    </div>
  );
}

function DownloadLink({ documentId, fileType, label }: { documentId: string; fileType: string; label: string }) {
  return (
    <Link className="rounded-[var(--radius-sm)] bg-[var(--brand)] px-3 py-2 text-sm font-bold text-white" href={`/api/portal/documents/generated/${documentId}/download?fileType=${fileType}` as Route}>
      Pobierz {label}
    </Link>
  );
}
