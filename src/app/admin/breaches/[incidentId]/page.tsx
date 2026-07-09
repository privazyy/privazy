import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { BreachBadge, BreachCard, formatDateTime, riskTone, statusLabel, statusTone } from "@/components/breach/breach-ui";
import { requireStaffBreachRead } from "@/server/breach/breach-permissions";
import { breachNoteCreateSchema, breachRiskAssessmentSchema, breachStatusChangeSchema } from "@/server/breach/breach-schemas";
import {
  addCrmBreachNote,
  changeCrmBreachStatus,
  getCrmBreachIncident,
  updateCrmBreachRiskAssessment,
} from "@/server/breach/breach-service";

type PageProps = { params: Promise<{ incidentId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function CrmBreachDetailPage({ params }: PageProps) {
  const actor = await requireStaffBreachRead();
  const { incidentId } = await params;
  const incident = await getCrmBreachIncident(actor, incidentId);
  const canMutate = actor.role !== "READ_ONLY";
  const canAssessRisk = actor.role === "LAWYER" || actor.role === "ADMIN";

  async function changeStatus(formData: FormData) {
    "use server";
    const nextActor = await requireStaffBreachRead();
    const input = breachStatusChangeSchema.parse({
      status: formData.get("status"),
      rationale: formData.get("rationale") || undefined,
    });
    await changeCrmBreachStatus(nextActor, incidentId, input);
    revalidatePath(`/admin/breaches/${incidentId}`);
    redirect(`/admin/breaches/${incidentId}`);
  }

  async function saveRisk(formData: FormData) {
    "use server";
    const nextActor = await requireStaffBreachRead();
    const input = breachRiskAssessmentSchema.parse({
      severity: formData.get("severity"),
      riskLevel: formData.get("riskLevel"),
      specialCategoryData: formData.has("specialCategoryData"),
      childrenData: formData.has("childrenData"),
      largeScale: formData.has("largeScale"),
      identityTheftRisk: formData.has("identityTheftRisk"),
      encryptedData: formData.has("encryptedData"),
      accessRecovered: formData.has("accessRecovered"),
      mitigationMeasuresApplied: formData.has("mitigationMeasuresApplied"),
      authorityNotificationRequired: formData.get("authorityNotificationRequired") === "true",
      dataSubjectsNotificationRequired: formData.get("dataSubjectsNotificationRequired") === "true",
      decisionRationale: formData.get("decisionRationale"),
    });
    await updateCrmBreachRiskAssessment(nextActor, incidentId, input);
    revalidatePath(`/admin/breaches/${incidentId}`);
    redirect(`/admin/breaches/${incidentId}`);
  }

  async function addNote(formData: FormData) {
    "use server";
    const nextActor = await requireStaffBreachRead();
    const input = breachNoteCreateSchema.parse({
      body: formData.get("body"),
      visibility: formData.get("visibility") || "INTERNAL",
    });
    await addCrmBreachNote(nextActor, incidentId, input);
    revalidatePath(`/admin/breaches/${incidentId}`);
    redirect(`/admin/breaches/${incidentId}`);
  }

  return (
    <main className="min-h-screen bg-[var(--surface-page)] px-4 py-6 text-[var(--text-body)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[var(--container-wide)] space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--text-muted)]">{incident.organization.name}</p>
            <h1 className="text-2xl font-bold text-[var(--text-strong)]">{incident.title}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <BreachBadge tone={statusTone(incident.status)}>{statusLabel(incident.status)}</BreachBadge>
            <BreachBadge tone={riskTone(incident.severity)}>{incident.severity}</BreachBadge>
            <BreachBadge tone={riskTone(incident.riskLevel)}>{incident.riskLevel}</BreachBadge>
            {incident.deadline.isOverdue && <BreachBadge tone="danger">overdue</BreachBadge>}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <Metric label="Deadline 72h" value={incident.deadline.label} detail={formatDateTime(incident.authorityNotificationDeadlineAt)} />
          <Metric label="Wykryto" value={formatDateTime(incident.discoveredAt)} />
          <Metric label="Zgloszono" value={formatDateTime(incident.reportedAt)} />
          <Metric label="Opiekun" value={incident.assignedTo?.name ?? incident.assignedTo?.email ?? "-"} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <BreachCard>
            <h2 className="font-bold text-[var(--text-strong)]">Dane incydentu</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm">{incident.description}</p>
            <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <Item label="Kategorie danych" value={incident.affectedDataCategories.join(", ") || "-"} />
              <Item label="Kategorie osob" value={incident.affectedDataSubjectCategories.join(", ") || "-"} />
              <Item label="Liczba osob" value={String(incident.approximateAffectedSubjects ?? "Nieznana")} />
              <Item label="Skutki" value={incident.consequences ?? "-"} />
              <Item label="Srodki podjete" value={incident.measuresTaken ?? "-"} />
              <Item label="Srodki planowane" value={incident.measuresPlanned ?? "-"} />
            </dl>
          </BreachCard>

          <BreachCard>
            <h2 className="font-bold text-[var(--text-strong)]">Dane do zgloszenia PUODO</h2>
            <dl className="mt-3 grid gap-2 text-sm">
              <Item label="Administrator" value={incident.puodoDraftData.administrator} />
              <Item label="Kontakt" value={incident.puodoDraftData.contact ?? "-"} />
              <Item label="Termin" value={formatDateTime(incident.puodoDraftData.deadlineAt)} />
              <Item label="Decyzja" value={String(incident.authorityNotificationRequired ?? "brak decyzji")} />
              <Item label="Rationale" value={incident.decisionRationale ?? "-"} />
            </dl>
          </BreachCard>
        </div>

        {canMutate && (
          <div className="grid gap-4 xl:grid-cols-3">
            <BreachCard>
              <h2 className="font-bold text-[var(--text-strong)]">Status</h2>
              <form action={changeStatus} className="mt-3 grid gap-3">
                <select className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white px-3 py-2 text-sm" name="status" defaultValue={incident.status}>
                  {["TRIAGE", "RISK_ASSESSMENT", "NOTIFICATION_REQUIRED", "NOTIFICATION_NOT_REQUIRED", "NOTIFIED_AUTHORITY", "NOTIFIED_DATA_SUBJECTS", "CLOSED", "CANCELLED"].map((status) => (
                    <option key={status} value={status}>{statusLabel(status)}</option>
                  ))}
                </select>
                <textarea className="min-h-24 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white px-3 py-2 text-sm" name="rationale" placeholder="Uzasadnienie zmiany" />
                <button className="rounded-[var(--radius-sm)] bg-[var(--brand)] px-3 py-2 text-sm font-bold text-white" type="submit">Zapisz status</button>
              </form>
            </BreachCard>

            <BreachCard className="xl:col-span-2">
              <h2 className="font-bold text-[var(--text-strong)]">Ocena ryzyka</h2>
              {!canAssessRisk && <p className="mt-2 text-sm text-[var(--text-muted)]">Ocene ryzyka zatwierdza LAWYER albo ADMIN.</p>}
              {canAssessRisk && (
                <form action={saveRisk} className="mt-3 grid gap-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Select label="Severity" name="severity" value={incident.severity} options={["LOW", "MEDIUM", "HIGH", "CRITICAL"]} />
                    <Select label="Risk level" name="riskLevel" value={incident.riskLevel} options={["LOW", "MEDIUM", "HIGH", "UNKNOWN"]} />
                  </div>
                  <div className="grid gap-2 text-sm md:grid-cols-2">
                    {[
                      ["specialCategoryData", "Dane szczegolnej kategorii"],
                      ["childrenData", "Dane dzieci"],
                      ["largeScale", "Duza skala"],
                      ["identityTheftRisk", "Ryzyko kradziezy tozsamosci"],
                      ["encryptedData", "Dane zaszyfrowane"],
                      ["accessRecovered", "Dostep odzyskany"],
                      ["mitigationMeasuresApplied", "Srodki ograniczajace podjete"],
                    ].map(([name, label]) => (
                      <label className="flex items-center gap-2" key={name}>
                        <input name={name} type="checkbox" defaultChecked={Boolean(incident.riskAssessment[name as keyof typeof incident.riskAssessment])} />
                        {label}
                      </label>
                    ))}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Select label="Zgloszenie do organu" name="authorityNotificationRequired" value={String(Boolean(incident.authorityNotificationRequired))} options={["true", "false"]} />
                    <Select label="Zawiadomienie osob" name="dataSubjectsNotificationRequired" value={String(Boolean(incident.dataSubjectsNotificationRequired))} options={["true", "false"]} />
                  </div>
                  <textarea className="min-h-24 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white px-3 py-2 text-sm" name="decisionRationale" required defaultValue={incident.decisionRationale ?? ""} />
                  <button className="w-fit rounded-[var(--radius-sm)] bg-[var(--brand)] px-3 py-2 text-sm font-bold text-white" type="submit">Zapisz ocene</button>
                </form>
              )}
            </BreachCard>
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-2">
          <BreachCard>
            <h2 className="font-bold text-[var(--text-strong)]">Notatki i timeline</h2>
            {canMutate && (
              <form action={addNote} className="mt-3 grid gap-3">
                <textarea className="min-h-24 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white px-3 py-2 text-sm" name="body" required placeholder="Notatka CRM" />
                <select className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white px-3 py-2 text-sm" name="visibility" defaultValue="INTERNAL">
                  <option value="INTERNAL">Internal CRM note</option>
                  <option value="PUBLIC">Publiczna dla klienta</option>
                </select>
                <button className="w-fit rounded-[var(--radius-sm)] bg-[var(--brand)] px-3 py-2 text-sm font-bold text-white" type="submit">Dodaj notatke</button>
              </form>
            )}
            <div className="mt-4 grid gap-3">
              {incident.timeline.map((event) => (
                <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-3" key={event.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{event.title}</p>
                    <BreachBadge tone={event.visibility === "PUBLIC" ? "brand" : "neutral"}>{event.visibility}</BreachBadge>
                  </div>
                  {event.body && <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--text-muted)]">{event.body}</p>}
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{formatDateTime(event.createdAt)}</p>
                </div>
              ))}
            </div>
          </BreachCard>

          <BreachCard>
            <h2 className="font-bold text-[var(--text-strong)]">Zadania</h2>
            <div className="mt-3 grid gap-3">
              {incident.tasks.map((task) => (
                <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-3" key={task.id}>
                  <p className="font-semibold">{task.title}</p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{task.description ?? "-"}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{task.status} - deadline {formatDateTime(task.dueAt)}</p>
                </div>
              ))}
              {incident.tasks.length === 0 && <p className="text-sm text-[var(--text-muted)]">Brak zadan powiazanych z incydentem.</p>}
            </div>
          </BreachCard>
        </div>
      </div>
    </main>
  );
}

function Metric({ detail, label, value }: { detail?: string; label: string; value: string }) {
  return (
    <BreachCard>
      <p className="text-sm font-semibold text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-lg font-bold text-[var(--text-strong)]">{value}</p>
      {detail && <p className="mt-1 text-sm text-[var(--text-muted)]">{detail}</p>}
    </BreachCard>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-[var(--text-muted)]">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

function Select({ label, name, options, value }: { label: string; name: string; options: string[]; value: string }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-[var(--text-strong)]">
      {label}
      <select className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white px-3 py-2 text-sm" name={name} defaultValue={value}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
