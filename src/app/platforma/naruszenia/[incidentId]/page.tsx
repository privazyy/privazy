import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { BreachBadge, BreachCard, formatDateTime, riskTone, statusLabel, statusTone } from "@/components/breach/breach-ui";
import { requireClientBreachActor } from "@/server/breach/breach-permissions";
import { getClientBreachIncident, submitClientBreachIncident } from "@/server/breach/breach-service";

type PageProps = { params: Promise<{ incidentId: string }> };

export default async function ClientBreachDetailPage({ params }: PageProps) {
  const actor = await requireClientBreachActor();
  const { incidentId } = await params;
  const incident = await getClientBreachIncident(actor, incidentId);

  async function submitIncident() {
    "use server";
    const nextActor = await requireClientBreachActor();
    await submitClientBreachIncident(nextActor, incidentId);
    revalidatePath(`/platforma/naruszenia/${incidentId}`);
    redirect(`/platforma/naruszenia/${incidentId}`);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--text-muted)]">{incident.organization.name}</p>
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">{incident.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <BreachBadge tone={statusTone(incident.status)}>{statusLabel(incident.status)}</BreachBadge>
          <BreachBadge tone={riskTone(incident.riskLevel)}>{incident.riskLevel}</BreachBadge>
          {incident.deadline.isOverdue && <BreachBadge tone="danger">overdue</BreachBadge>}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <BreachCard>
          <p className="text-sm font-semibold text-[var(--text-muted)]">Termin 72h</p>
          <p className="mt-2 text-xl font-bold text-[var(--text-strong)]">{incident.deadline.label}</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{formatDateTime(incident.authorityNotificationDeadlineAt)}</p>
        </BreachCard>
        <BreachCard>
          <p className="text-sm font-semibold text-[var(--text-muted)]">Wykryto</p>
          <p className="mt-2 text-lg font-bold text-[var(--text-strong)]">{formatDateTime(incident.discoveredAt)}</p>
        </BreachCard>
        <BreachCard>
          <p className="text-sm font-semibold text-[var(--text-muted)]">Liczba osob</p>
          <p className="mt-2 text-lg font-bold text-[var(--text-strong)]">{incident.approximateAffectedSubjects ?? "Nieznana"}</p>
        </BreachCard>
      </div>

      {incident.status === "DRAFT" && (
        <BreachCard>
          <form action={submitIncident}>
            <p className="mb-3 text-sm text-[var(--text-muted)]">Po wyslaniu staff rozpocznie triage i formalna ocene ryzyka.</p>
            <button className="rounded-[var(--radius-sm)] bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white" type="submit">
              Wyslij zgloszenie
            </button>
          </form>
        </BreachCard>
      )}

      <BreachCard>
        <h2 className="font-bold text-[var(--text-strong)]">Opis i skutki</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--text-body)]">{incident.description}</p>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <Item label="Kategorie danych" value={incident.affectedDataCategories.join(", ") || "-"} />
          <Item label="Kategorie osob" value={incident.affectedDataSubjectCategories.join(", ") || "-"} />
          <Item label="Skutki" value={incident.consequences ?? "-"} />
          <Item label="Dzialania podjete" value={incident.measuresTaken ?? "-"} />
        </dl>
      </BreachCard>

      <BreachCard>
        <h2 className="font-bold text-[var(--text-strong)]">Historia publiczna</h2>
        <div className="mt-3 grid gap-3">
          {incident.timeline.map((event) => (
            <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-3" key={event.id}>
              <p className="font-semibold">{event.title}</p>
              {event.body && <p className="mt-1 text-sm text-[var(--text-muted)]">{event.body}</p>}
              <p className="mt-1 text-xs text-[var(--text-muted)]">{formatDateTime(event.createdAt)}</p>
            </div>
          ))}
        </div>
      </BreachCard>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-[var(--text-muted)]">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-[var(--text-body)]">{value}</dd>
    </div>
  );
}
