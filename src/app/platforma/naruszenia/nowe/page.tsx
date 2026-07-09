import { redirect } from "next/navigation";

import { BreachCard } from "@/components/breach/breach-ui";
import { requireClientBreachActor } from "@/server/breach/breach-permissions";
import { createBreachIncidentSchema } from "@/server/breach/breach-schemas";
import { createClientBreachIncident } from "@/server/breach/breach-service";

export default function NewClientBreachPage() {
  async function createIncident(formData: FormData) {
    "use server";

    const actor = await requireClientBreachActor();
    const input = createBreachIncidentSchema.parse({
      title: formData.get("title"),
      description: formData.get("description"),
      occurredAt: formData.get("occurredAt") || null,
      discoveredAt: formData.get("discoveredAt"),
      affectedDataCategories: splitList(formData.get("affectedDataCategories")),
      affectedDataSubjectCategories: splitList(formData.get("affectedDataSubjectCategories")),
      approximateAffectedSubjects: numberOrNull(formData.get("approximateAffectedSubjects")),
      consequences: formData.get("consequences") || null,
      measuresTaken: formData.get("measuresTaken") || null,
      measuresPlanned: formData.get("measuresPlanned") || null,
      contactName: formData.get("contactName") || undefined,
      contactEmail: formData.get("contactEmail") || undefined,
      contactPhone: formData.get("contactPhone") || undefined,
    });
    const incident = await createClientBreachIncident(actor, input);
    redirect(`/platforma/naruszenia/${incident.id}`);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-[var(--text-muted)]">Naruszenia</p>
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">Nowe zgloszenie naruszenia</h1>
      </div>
      <BreachCard>
        <form action={createIncident} className="grid gap-4">
          <Field label="Tytul" name="title" required />
          <Field label="Kiedy wykryto" name="discoveredAt" required type="datetime-local" />
          <Field label="Kiedy wystapilo, jesli wiadomo" name="occurredAt" type="datetime-local" />
          <Textarea label="Opis naruszenia" name="description" required />
          <Field label="Kategorie danych, po przecinku" name="affectedDataCategories" placeholder="np. dane kontaktowe, dane zdrowotne" />
          <Field label="Kategorie osob, po przecinku" name="affectedDataSubjectCategories" placeholder="np. klienci, pracownicy" />
          <Field label="Przyblizona liczba osob" name="approximateAffectedSubjects" type="number" />
          <Textarea label="Skutki" name="consequences" />
          <Textarea label="Dzialania podjete" name="measuresTaken" />
          <Textarea label="Dzialania planowane" name="measuresPlanned" />
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Kontakt" name="contactName" />
            <Field label="E-mail kontaktowy" name="contactEmail" type="email" />
            <Field label="Telefon" name="contactPhone" />
          </div>
          <button className="w-fit rounded-[var(--radius-sm)] bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white" type="submit">
            Zapisz szkic
          </button>
        </form>
      </BreachCard>
    </div>
  );
}

function Field({ label, name, placeholder, required, type = "text" }: { label: string; name: string; placeholder?: string; required?: boolean; type?: string }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-[var(--text-strong)]">
      {label}
      <input className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white px-3 py-2 text-sm" name={name} placeholder={placeholder} required={required} type={type} />
    </label>
  );
}

function Textarea({ label, name, required }: { label: string; name: string; required?: boolean }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-[var(--text-strong)]">
      {label}
      <textarea className="min-h-28 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white px-3 py-2 text-sm" name={name} required={required} />
    </label>
  );
}

function splitList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function numberOrNull(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  return raw ? Number(raw) : null;
}
