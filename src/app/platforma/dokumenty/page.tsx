import type { Route } from "next";
import Link from "next/link";

import { PortalBadge, PortalCard, statusTone } from "@/components/portal/portal-shell";
import { requireClientPortalActor } from "@/server/portal/client-portal-permissions";
import { listClientDocumentInputs, listClientGeneratedDocuments } from "@/server/portal/client-portal-service";

export default async function ClientDocumentsPage() {
  const actor = await requireClientPortalActor();
  const [inputs, generated] = await Promise.all([
    listClientDocumentInputs(actor, { limit: 100 }),
    listClientGeneratedDocuments(actor, { limit: 100 }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-[var(--text-muted)]">Portal klienta</p>
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">Dokumenty</h1>
      </div>
      <PortalCard>
        <h2 className="font-bold text-[var(--text-strong)]">Formularze</h2>
        <div className="mt-3 grid gap-3">
          {inputs.items.map((input) => (
            <Link className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-4 hover:bg-[var(--surface-sunken)]" href={`/platforma/dokumenty/${input.id}` as Route} key={input.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold">{input.orderItem.name}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{input.orderItem.order.orderNumber} · {input.template?.name ?? input.documentType ?? "Dokument"}</p>
                </div>
                <PortalBadge tone={statusTone(input.status)}>{input.status}</PortalBadge>
              </div>
            </Link>
          ))}
          {inputs.items.length === 0 && <div className="rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] p-4 text-sm text-[var(--text-muted)]">Brak formularzy dokumentow.</div>}
        </div>
      </PortalCard>

      <PortalCard>
        <h2 className="font-bold text-[var(--text-strong)]">Gotowe dokumenty</h2>
        <div className="mt-3 grid gap-3">
          {generated.items.map((document) => (
            <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-4" key={document.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold">{document.template.name}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{document.orderItem?.order.orderNumber ?? document.type}</p>
                </div>
                <PortalBadge tone={statusTone(document.status)}>{document.status}</PortalBadge>
              </div>
              {document.downloads.docx && (
                <Link className="mt-3 inline-flex rounded-[var(--radius-sm)] bg-[var(--brand)] px-3 py-2 text-sm font-bold text-white" href={`/api/portal/documents/generated/${document.id}/download?fileType=docx` as Route}>
                  Pobierz DOCX
                </Link>
              )}
            </div>
          ))}
          {generated.items.length === 0 && <div className="rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] p-4 text-sm text-[var(--text-muted)]">Brak gotowych dokumentow.</div>}
        </div>
      </PortalCard>
    </div>
  );
}
