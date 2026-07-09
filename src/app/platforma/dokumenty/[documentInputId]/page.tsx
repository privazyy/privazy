import Link from "next/link";

import { PortalBadge, PortalCard, statusTone } from "@/components/portal/portal-shell";
import { requireClientPortalActor } from "@/server/portal/client-portal-permissions";
import { getClientDocumentInput } from "@/server/portal/client-portal-service";

export default async function ClientDocumentInputDetailPage({ params }: { params: Promise<{ documentInputId: string }> }) {
  const actor = await requireClientPortalActor();
  const { documentInputId } = await params;
  const input = await getClientDocumentInput(actor, documentInputId);

  return (
    <div className="space-y-5">
      <Link className="text-sm font-semibold text-[var(--brand-ink)]" href="/platforma/dokumenty">Wroc do dokumentow</Link>
      <PortalCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--text-muted)]">{input.orderItem.order.orderNumber}</p>
            <h1 className="text-2xl font-bold text-[var(--text-strong)]">{input.orderItem.name}</h1>
          </div>
          <PortalBadge tone={statusTone(input.status)}>{input.status}</PortalBadge>
        </div>
        <dl className="mt-5 grid gap-3 md:grid-cols-2">
          <Info label="Szablon" value={input.template?.name ?? "-"} />
          <Info label="Typ" value={input.documentType ?? "-"} />
          <Info label="Status pozycji" value={input.orderItem.fulfillmentStatus} />
          <Info label="Aktualizacja" value={new Date(input.updatedAt).toLocaleString("pl-PL")} />
        </dl>
        <p className="mt-5 text-sm text-[var(--text-muted)]">
          Edycja formularza dokumentu jest zaleznoscia kolejnej warstwy document-input. Ten widok bezpiecznie pokazuje status i powiazanie bez ujawniania danych innych organizacji.
        </p>
      </PortalCard>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-[var(--text-muted)]">{label}</dt>
      <dd className="mt-1 font-semibold text-[var(--text-strong)]">{value}</dd>
    </div>
  );
}
