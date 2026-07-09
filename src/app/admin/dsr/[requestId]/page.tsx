import type { Metadata } from "next";
import { revalidatePath } from "next/cache";

import { DsrPageHeader, DsrStatusBadge, dsrTypeLabels, formatDate, formatDateTime } from "@/components/dsr/dsr-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { canMutateCrm } from "@/server/crm/access";
import { requireDsrCrmRead, requireDsrCrmWrite } from "@/server/dsr/access";
import { crmDsrIdentitySchema, crmDsrNoteSchema, crmDsrPrepareResponseSchema, crmDsrStatusSchema, crmDsrUpdateSchema } from "@/server/dsr/schemas";
import { addCrmDsrNote, changeCrmDsrStatus, getCrmDsrRequest, prepareCrmDsrResponse, updateCrmDsrIdentity, updateCrmDsrRequest } from "@/server/dsr/service";

type PageProps = { params: Promise<{ requestId: string }> };

export const metadata: Metadata = {
  title: "DSR CRM - privazy.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function updateOperations(formData: FormData) {
  "use server";

  const actor = await requireDsrCrmWrite();
  const requestId = String(formData.get("requestId"));
  const extensionUntil = formData.get("extensionUntil") || null;
  const input = crmDsrUpdateSchema.parse({
    assignedToId: formData.get("assignedToId") || null,
    priority: formData.get("priority") || undefined,
    additionalInformation: formData.get("additionalInformation") || null,
    extensionUntil,
    extensionReason: formData.get("extensionReason") || null,
  });
  await updateCrmDsrRequest(requestId, input, actor);
  revalidatePath(`/admin/dsr/${requestId}`);
}

async function changeStatus(formData: FormData) {
  "use server";

  const actor = await requireDsrCrmWrite();
  const requestId = String(formData.get("requestId"));
  const input = crmDsrStatusSchema.parse({
    status: formData.get("status"),
    note: formData.get("note") || undefined,
  });
  await changeCrmDsrStatus(requestId, input, actor);
  revalidatePath(`/admin/dsr/${requestId}`);
}

async function verifyIdentity(formData: FormData) {
  "use server";

  const actor = await requireDsrCrmWrite();
  const requestId = String(formData.get("requestId"));
  const input = crmDsrIdentitySchema.parse({
    verificationStatus: formData.get("verificationStatus"),
    verificationMethod: formData.get("verificationMethod") || null,
    verificationNote: formData.get("verificationNote") || null,
  });
  await updateCrmDsrIdentity(requestId, input, actor);
  revalidatePath(`/admin/dsr/${requestId}`);
}

async function prepareResponse(formData: FormData) {
  "use server";

  const actor = await requireDsrCrmWrite();
  const requestId = String(formData.get("requestId"));
  const input = crmDsrPrepareResponseSchema.parse({
    responseSummary: formData.get("responseSummary"),
    responseDraft: formData.get("responseDraft"),
    responseDecision: formData.get("responseDecision"),
    decisionRationale: formData.get("decisionRationale") || undefined,
  });
  await prepareCrmDsrResponse(requestId, input, actor);
  revalidatePath(`/admin/dsr/${requestId}`);
}

async function addNote(formData: FormData) {
  "use server";

  const actor = await requireDsrCrmWrite();
  const requestId = String(formData.get("requestId"));
  const input = crmDsrNoteSchema.parse({
    note: formData.get("note"),
    visibility: formData.get("visibility") || "INTERNAL",
  });
  await addCrmDsrNote(requestId, input, actor);
  revalidatePath(`/admin/dsr/${requestId}`);
}

export default async function CrmDsrDetailPage({ params }: PageProps) {
  const actor = await requireDsrCrmRead();
  const { requestId } = await params;
  const request = await getCrmDsrRequest(requestId);
  const canMutate = canMutateCrm(actor.role);
  const canPrepareResponse = actor.role === "ADMIN" || actor.role === "LAWYER";

  return (
    <main className="min-h-screen bg-[var(--surface-page)] px-4 py-6 text-[var(--text-body)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[var(--container-wide)] space-y-5">
        <DsrPageHeader eyebrow="CRM" title={`Wniosek ${request.id}`} />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-5">
            <Card padding="md" variant="flat">
              <div className="flex flex-wrap items-center gap-2">
                <DsrStatusBadge status={request.status} />
                <span className="text-sm font-semibold text-[var(--text-muted)]">{dsrTypeLabels[request.type] ?? request.type}</span>
              </div>
              <dl className="mt-4 grid gap-4 md:grid-cols-2">
                <Info label="Organizacja" value={request.organization.name} />
                <Info label="Osoba" value={`${request.requesterName} · ${request.requesterEmail}`} />
                <Info label="Termin" value={formatDate(request.dueAt)} />
                <Info label="Weryfikacja" value={request.verificationStatus} />
              </dl>
              <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-4">
                <h2 className="text-sm font-bold text-[var(--text-strong)]">Tresc wniosku</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-body)]">{request.requestDescription}</p>
              </div>
            </Card>

            {canMutate && (
              <Card padding="md" variant="flat">
                <h2 className="text-base font-bold text-[var(--text-strong)]">Dane operacyjne</h2>
                <form action={updateOperations} className="mt-4 grid gap-4">
                  <input name="requestId" type="hidden" value={request.id} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold">
                      Priorytet
                      <Select defaultValue={request.priority} name="priority">
                        <option value="LOW">LOW</option>
                        <option value="NORMAL">NORMAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="URGENT">URGENT</option>
                      </Select>
                    </label>
                    <label className="grid gap-2 text-sm font-semibold">
                      Assigned user ID
                      <Input defaultValue={request.assignedTo?.id ?? ""} name="assignedToId" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold">
                      Extension until
                      <Input defaultValue={request.extensionUntil ? new Date(request.extensionUntil).toISOString().slice(0, 10) : ""} name="extensionUntil" type="date" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold">
                      Extension reason
                      <Input defaultValue={request.extensionReason ?? ""} name="extensionReason" />
                    </label>
                  </div>
                  <label className="grid gap-2 text-sm font-semibold">
                    Additional information
                    <Textarea defaultValue={request.additionalInformation ?? ""} name="additionalInformation" />
                  </label>
                  <Button type="submit">Zapisz</Button>
                </form>
              </Card>
            )}

            {canMutate && (
              <Card padding="md" variant="flat">
                <h2 className="text-base font-bold text-[var(--text-strong)]">Status i weryfikacja</h2>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <form action={changeStatus} className="grid gap-3">
                    <input name="requestId" type="hidden" value={request.id} />
                    <Select defaultValue={request.status} name="status">
                      {["RECEIVED", "IDENTITY_VERIFICATION", "IN_PROGRESS", "WAITING_FOR_INFORMATION", "RESPONSE_PREPARED", "RESPONDED", "REJECTED", "CLOSED", "CANCELLED"].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </Select>
                    <Textarea name="note" placeholder="Notatka publiczna do zmiany statusu" />
                    <Button type="submit" variant="outline">Zmien status</Button>
                  </form>
                  <form action={verifyIdentity} className="grid gap-3">
                    <input name="requestId" type="hidden" value={request.id} />
                    <Select defaultValue={request.verificationStatus} name="verificationStatus">
                      {["NOT_STARTED", "PENDING", "VERIFIED", "FAILED", "NOT_REQUIRED"].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </Select>
                    <Input defaultValue={request.verificationMethod ?? ""} name="verificationMethod" placeholder="Metoda" />
                    <Textarea defaultValue={request.verificationNote ?? ""} name="verificationNote" placeholder="Notatka wewnetrzna" />
                    <Button type="submit" variant="outline">Zapisz weryfikacje</Button>
                  </form>
                </div>
              </Card>
            )}

            {canPrepareResponse && (
              <Card padding="md" variant="flat">
                <h2 className="text-base font-bold text-[var(--text-strong)]">Projekt odpowiedzi</h2>
                <form action={prepareResponse} className="mt-4 grid gap-4">
                  <input name="requestId" type="hidden" value={request.id} />
                  <Input defaultValue={request.responseDecision ?? ""} name="responseDecision" placeholder="Decyzja" required />
                  <Textarea defaultValue={request.responseSummary ?? ""} name="responseSummary" placeholder="Podsumowanie" required />
                  <Textarea defaultValue={request.responseDraft ?? ""} name="responseDraft" placeholder="Projekt odpowiedzi" required />
                  <Textarea defaultValue={request.decisionRationale ?? ""} name="decisionRationale" placeholder="Uzasadnienie wewnetrzne" />
                  <Button type="submit">Przygotuj odpowiedz</Button>
                </form>
              </Card>
            )}
          </div>

          <div className="space-y-5">
            {canMutate && (
              <Card padding="md" variant="flat">
                <h2 className="text-base font-bold text-[var(--text-strong)]">Notatka</h2>
                <form action={addNote} className="mt-4 grid gap-3">
                  <input name="requestId" type="hidden" value={request.id} />
                  <Select defaultValue="INTERNAL" name="visibility">
                    <option value="INTERNAL">INTERNAL</option>
                    <option value="PUBLIC">PUBLIC</option>
                  </Select>
                  <Textarea name="note" required />
                  <Button type="submit" variant="outline">Dodaj notatke</Button>
                </form>
              </Card>
            )}
            <Card padding="md" variant="flat">
              <h2 className="text-base font-bold text-[var(--text-strong)]">Timeline</h2>
              <div className="mt-3 space-y-3">
                {request.activities.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">Brak wpisow.</p>
                ) : request.activities.map((activity) => (
                  <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-3 text-sm" key={activity.id}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-[var(--text-strong)]">{activity.title}</div>
                      <span className="text-xs text-[var(--text-muted)]">{activity.visibility}</span>
                    </div>
                    {activity.note && <div className="mt-1 whitespace-pre-wrap text-[var(--text-muted)]">{activity.note}</div>}
                    <div className="mt-2 text-xs text-[var(--text-muted)]">{formatDateTime(activity.createdAt)}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-[var(--text-muted)]">{label}</dt>
      <dd className="mt-1 text-sm font-bold text-[var(--text-strong)]">{value}</dd>
    </div>
  );
}
