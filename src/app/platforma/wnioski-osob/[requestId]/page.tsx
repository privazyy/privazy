import type { Metadata } from "next";
import { revalidatePath } from "next/cache";

import { DsrPageHeader, DsrStatusBadge, dsrTypeLabels, formatDate, formatDateTime } from "@/components/dsr/dsr-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requirePortalDsrActor } from "@/server/dsr/access";
import { portalDsrDraftUpdateSchema, portalDsrSubmitSchema } from "@/server/dsr/schemas";
import { getPortalDsrRequest, submitPortalDsrRequest, updatePortalDsrDraft } from "@/server/dsr/service";

type PageProps = { params: Promise<{ requestId: string }> };

export const metadata: Metadata = {
  title: "Wniosek DSR - privazy.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function updateDraft(formData: FormData) {
  "use server";

  const actor = await requirePortalDsrActor();
  const requestId = String(formData.get("requestId"));
  const input = portalDsrDraftUpdateSchema.parse({
    requesterName: formData.get("requesterName"),
    requesterEmail: formData.get("requesterEmail"),
    requesterPhone: formData.get("requesterPhone") || undefined,
    relationship: formData.get("relationship") || undefined,
    type: formData.get("type"),
    priority: formData.get("priority"),
    requestDescription: formData.get("requestDescription"),
    additionalInformation: formData.get("additionalInformation") || undefined,
  });
  await updatePortalDsrDraft(requestId, input, actor);
  revalidatePath(`/platforma/wnioski-osob/${requestId}`);
}

async function submitDsr(formData: FormData) {
  "use server";

  const actor = await requirePortalDsrActor();
  portalDsrSubmitSchema.parse({});
  const requestId = String(formData.get("requestId"));
  await submitPortalDsrRequest(requestId, actor);
  revalidatePath(`/platforma/wnioski-osob/${requestId}`);
}

export default async function PortalDsrDetailPage({ params }: PageProps) {
  const actor = await requirePortalDsrActor();
  const { requestId } = await params;
  const request = await getPortalDsrRequest(requestId, actor);
  const editable = request.status === "DRAFT";

  return (
    <div className="space-y-5">
      <DsrPageHeader eyebrow="Platforma klienta" title={`Wniosek ${request.id}`} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card padding="md" variant="flat">
          <form action={updateDraft} className="grid gap-4">
            <input name="requestId" type="hidden" value={request.id} />
            <div className="flex flex-wrap items-center gap-2">
              <DsrStatusBadge status={request.status} />
              <span className="text-sm font-semibold text-[var(--text-muted)]">{dsrTypeLabels[request.type] ?? request.type}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[var(--text-body)]">
                Imie i nazwisko
                <Input defaultValue={request.requesterName} disabled={!editable} name="requesterName" required />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[var(--text-body)]">
                E-mail
                <Input defaultValue={request.requesterEmail} disabled={!editable} name="requesterEmail" required type="email" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[var(--text-body)]">
                Telefon
                <Input defaultValue={request.requesterPhone ?? ""} disabled={!editable} name="requesterPhone" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[var(--text-body)]">
                Relacja
                <Input defaultValue={request.relationship ?? ""} disabled={!editable} name="relationship" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[var(--text-body)]">
                Typ
                <Select defaultValue={request.type} disabled={!editable} name="type">
                  {Object.entries(dsrTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[var(--text-body)]">
                Priorytet
                <Select defaultValue={request.priority} disabled={!editable} name="priority">
                  <option value="LOW">Niski</option>
                  <option value="NORMAL">Normalny</option>
                  <option value="HIGH">Wysoki</option>
                  <option value="URGENT">Pilny</option>
                </Select>
              </label>
            </div>
            <label className="grid gap-2 text-sm font-semibold text-[var(--text-body)]">
              Tresc wniosku
              <Textarea defaultValue={request.requestDescription} disabled={!editable} name="requestDescription" required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[var(--text-body)]">
              Dodatkowe informacje
              <Textarea defaultValue={request.additionalInformation ?? ""} disabled={!editable} name="additionalInformation" />
            </label>
            {editable && (
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button type="submit" variant="outline">Zapisz szkic</Button>
              </div>
            )}
          </form>
        </Card>
        <div className="space-y-5">
          <Card padding="md" variant="flat">
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="font-semibold text-[var(--text-muted)]">Termin</dt>
                <dd className="text-[var(--text-strong)]">{formatDate(request.dueAt)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[var(--text-muted)]">Weryfikacja</dt>
                <dd className="text-[var(--text-strong)]">{request.verificationStatus}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[var(--text-muted)]">Utworzono</dt>
                <dd className="text-[var(--text-strong)]">{formatDateTime(request.createdAt)}</dd>
              </div>
            </dl>
            {editable && (
              <form action={submitDsr} className="mt-4">
                <input name="requestId" type="hidden" value={request.id} />
                <Button className="w-full" type="submit">Wyslij do obslugi</Button>
              </form>
            )}
          </Card>
          <Card padding="md" variant="flat">
            <h2 className="text-base font-bold text-[var(--text-strong)]">Historia</h2>
            <div className="mt-3 space-y-3">
              {request.activities.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">Brak wpisow.</p>
              ) : request.activities.map((activity) => (
                <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-3 text-sm" key={activity.id}>
                  <div className="font-semibold text-[var(--text-strong)]">{activity.title}</div>
                  {activity.note && <div className="mt-1 text-[var(--text-muted)]">{activity.note}</div>}
                  <div className="mt-2 text-xs text-[var(--text-muted)]">{formatDateTime(activity.createdAt)}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
