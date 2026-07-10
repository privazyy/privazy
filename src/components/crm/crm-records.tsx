"use client";

import { useEffect, useState, type ComponentProps, type FormEvent, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Assignee = { id: string; name: string | null; email: string; role: string };
type Note = { id: string; body: string; createdAt: string; author: { name: string | null; email: string } };
type Contact = { id: string; fullName: string; email: string | null; phone: string | null; role: string | null };
type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority?: string;
  dueAt: string | null;
  assignedTo?: { name: string | null; email: string } | null;
};

type LeadDetail = {
  id: string;
  companyName: string;
  fullName: string;
  email: string;
  phone: string | null;
  nip: string | null;
  industry: string | null;
  companySize: string | null;
  estimatedValue: number | null;
  source: string;
  status: string;
  priority: string;
  assignedToId: string | null;
  organization: { id: string; name: string } | null;
  formSubmission: { id: string; formType: string; status: string; createdAt: string } | null;
  contactPersons: Contact[];
  notes: Note[];
  tasks: Task[];
};

type OrganizationDetail = {
  id: string;
  name: string;
  legalName: string | null;
  nip: string | null;
  email: string | null;
  phone: string | null;
  industry: string | null;
  size: string | null;
  status: string;
  ownerId: string | null;
  contactPersons: Contact[];
  crmNotes: Note[];
  crmTasks: Task[];
  leads: Array<{ id: string; companyName: string; fullName: string; status: string }>;
};

type ApiError = { error?: string; code?: string; details?: { matches?: Array<{ id: string; name: string; nip: string | null }> } };

const selectClass =
  "h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)] px-3 text-sm text-[var(--text-strong)] outline-none focus-visible:border-[var(--brand)] focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]";

export function CrmCreateDialog({
  mode,
  onClose,
}: {
  mode: "lead" | "organization";
  onClose: () => void;
}) {
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(undefined);
    const form = new FormData(event.currentTarget);
    const body =
      mode === "lead"
        ? {
            source: "MANUAL",
            companyName: form.get("companyName"),
            fullName: form.get("fullName"),
            email: form.get("email"),
            phone: form.get("phone") || undefined,
            nip: form.get("nip") || undefined,
            industry: form.get("industry") || undefined,
            companySize: form.get("companySize") || undefined,
            priority: form.get("priority"),
            estimatedValue: form.get("estimatedValue") ? Number(form.get("estimatedValue")) : undefined,
            consentPrivacy: form.get("consentPrivacy") === "on",
            consentContact: form.get("consentPrivacy") === "on",
            consentMarketing: form.get("consentMarketing") === "on",
          }
        : {
            name: form.get("name"),
            legalName: form.get("legalName") || undefined,
            nip: form.get("nip") || undefined,
            email: form.get("email") || undefined,
            phone: form.get("phone") || undefined,
            industry: form.get("industry") || undefined,
            size: form.get("size") || undefined,
            status: form.get("status"),
          };
    const response = await fetch(mode === "lead" ? "/api/crm/leads" : "/api/crm/organizations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json()) as ApiError;
    if (!response.ok) {
      setError(payload.error ?? "Nie udało się zapisać rekordu.");
      setSaving(false);
      return;
    }
    window.location.reload();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--gray-900)]/45 p-4" onClick={onClose}>
      <Card aria-labelledby="crm-create-title" aria-modal="true" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto" padding="md" role="dialog" variant="raised" onClick={(event) => event.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-strong)]" id="crm-create-title">{mode === "lead" ? "Nowy lead" : "Nowa organizacja"}</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Dane zostaną zapisane w CRM i objęte audytem.</p>
          </div>
          <Button type="button" variant="ghost" onClick={onClose}>Zamknij</Button>
        </div>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          {mode === "lead" ? (
            <>
              <Field label="Firma" name="companyName" required />
              <Field label="Osoba kontaktowa" name="fullName" required />
              <Field label="E-mail" name="email" required type="email" />
              <Field label="Telefon" name="phone" />
              <Field label="NIP" name="nip" />
              <Field label="Branża" name="industry" />
              <Field label="Wielkość firmy" name="companySize" />
              <Field label="Szacowana wartość" min="0" name="estimatedValue" type="number" />
              <label className="space-y-2">
                <Label htmlFor="priority">Priorytet</Label>
                <select className={selectClass} defaultValue="NORMAL" id="priority" name="priority">
                  <option value="LOW">Niski</option>
                  <option value="NORMAL">Standard</option>
                  <option value="HIGH">Wysoki</option>
                  <option value="URGENT">Pilny</option>
                </select>
              </label>
              <div className="space-y-3 self-end pb-2 text-sm text-[var(--text-body)]">
                <label className="flex items-center gap-2"><input name="consentPrivacy" type="checkbox" /> Zgoda privacy odnotowana</label>
                <label className="flex items-center gap-2"><input name="consentMarketing" type="checkbox" /> Zgoda marketingowa</label>
              </div>
            </>
          ) : (
            <>
              <Field label="Nazwa" name="name" required />
              <Field label="Pełna nazwa prawna" name="legalName" />
              <Field label="NIP" name="nip" />
              <Field label="E-mail" name="email" type="email" />
              <Field label="Telefon" name="phone" />
              <Field label="Branża" name="industry" />
              <Field label="Wielkość" name="size" />
              <label className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select className={selectClass} defaultValue="PROSPECT" id="status" name="status">
                  <option value="PROSPECT">Prospekt</option>
                  <option value="ACTIVE">Aktywna</option>
                  <option value="INACTIVE">Nieaktywna</option>
                  <option value="ARCHIVED">Archiwalna</option>
                </select>
              </label>
            </>
          )}
          {error && <p className="sm:col-span-2 rounded-[var(--radius-md)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{error}</p>}
          <div className="flex justify-end gap-3 sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>Anuluj</Button>
            <Button disabled={saving} type="submit">{saving ? "Zapisywanie…" : "Zapisz"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export function CrmRecordDetail({
  canMutate,
  id,
  kind,
  onBack,
}: {
  canMutate: boolean;
  id: string;
  kind: "lead" | "organization";
  onBack: () => void;
}) {
  const [record, setRecord] = useState<LeadDetail | OrganizationDetail>();
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [conversionMatches, setConversionMatches] = useState<Array<{ id: string; name: string; nip: string | null }>>([]);

  const endpoint = kind === "lead" ? `/api/crm/leads/${id}` : `/api/crm/organizations/${id}`;

  useEffect(() => {
    let active = true;
    Promise.all([fetch(endpoint), fetch("/api/crm/users")])
      .then(async ([recordResponse, usersResponse]) => {
        const payload = await recordResponse.json();
        const usersPayload = await usersResponse.json();
        if (!recordResponse.ok) throw new Error(payload.error ?? "Nie udało się pobrać rekordu.");
        if (active) {
          setRecord(payload);
          setAssignees(usersResponse.ok ? usersPayload.items : []);
        }
      })
      .catch((cause: Error) => active && setError(cause.message));
    return () => {
      active = false;
    };
  }, [endpoint]);

  async function patch(body: Record<string, unknown>) {
    setError(undefined);
    setNotice(undefined);
    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Nie udało się zapisać zmian.");
      return;
    }
    setRecord(payload);
    setNotice("Zmiany zapisane.");
  }

  async function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(
      kind === "lead" ? `/api/crm/leads/${id}/notes` : `/api/crm/organizations/${id}/notes`,
      {
      method: "POST",
      headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: form.get("body") }),
      },
    );
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Nie udało się dodać notatki.");
      return;
    }
    event.currentTarget.reset();
    const refreshed = await fetch(endpoint);
    setRecord(await refreshed.json());
    setNotice("Notatka dodana.");
  }

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(
      kind === "lead" ? `/api/crm/leads/${id}/tasks` : `/api/crm/organizations/${id}/tasks`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description") || null,
          priority: form.get("priority"),
          dueAt: form.get("dueAt") || null,
          assignedToId: form.get("assignedToId") || null,
        }),
      },
    );
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Nie udalo sie utworzyc zadania.");
      return;
    }
    event.currentTarget.reset();
    const refreshed = await fetch(endpoint);
    setRecord(await refreshed.json());
    setNotice("Zadanie utworzone.");
  }

  async function convertLead(organizationId?: string) {
    const prompt = organizationId
      ? "Połączyć lead ze wskazaną, zweryfikowaną organizacją?"
      : "Przekonwertować lead do nowej organizacji? Operacja utworzy powiązany kontakt i zostanie zapisana w audycie.";
    if (!window.confirm(prompt)) {
      return;
    }
    const response = await fetch(`/api/crm/leads/${id}/convert`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(organizationId ? { organizationId } : {}),
    });
    const payload = (await response.json()) as ApiError & { lead?: LeadDetail };
    if (!response.ok) {
      const matches = payload.details?.matches?.map((match) => `${match.name}${match.nip ? ` (NIP ${match.nip})` : ""}`).join(", ");
      setConversionMatches(payload.details?.matches ?? []);
      setError(`${payload.error ?? "Konwersja nie powiodła się."}${matches ? ` Kandydaci: ${matches}.` : ""}`);
      return;
    }
    setConversionMatches([]);
    if (payload.lead) setRecord(payload.lead);
    setNotice("Lead został przekonwertowany do organizacji.");
  }

  if (error && !record) return <DetailState message={error} onBack={onBack} />;
  if (!record) return <DetailState message="Ładowanie rekordu…" onBack={onBack} />;

  const lead = kind === "lead" ? (record as LeadDetail) : null;
  const organization = kind === "organization" ? (record as OrganizationDetail) : null;
  const notes = lead?.notes ?? organization?.crmNotes ?? [];
  const contacts = lead?.contactPersons ?? organization?.contactPersons ?? [];
  const tasks = lead?.tasks ?? organization?.crmTasks ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button type="button" variant="ghost" onClick={onBack}>← Wróć do listy</Button>
          <h1 className="mt-2 text-2xl font-bold text-[var(--text-strong)]">{lead?.companyName ?? organization?.name}</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{lead ? `${lead.fullName} · ${lead.email}` : organization?.legalName ?? "Organizacja CRM"}</p>
        </div>
        {lead?.organization ? <Badge tone="success">Organizacja: {lead.organization.name}</Badge> : <Badge tone="neutral">{lead?.status ?? organization?.status}</Badge>}
      </div>

      {notice && <p className="rounded-[var(--radius-md)] bg-[var(--success-soft)] p-3 text-sm text-[var(--success)]">{notice}</p>}
      {error && <p className="rounded-[var(--radius-md)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{error}</p>}
      {conversionMatches.length > 0 && canMutate && (
        <Card padding="sm" variant="flat">
          <p className="text-sm font-semibold text-[var(--text-strong)]">Wybierz organizację dopiero po weryfikacji:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {conversionMatches.map((match) => (
              <Button key={match.id} size="sm" type="button" variant="outline" onClick={() => void convertLead(match.id)}>
                {match.name}{match.nip ? ` · NIP ${match.nip}` : ""}
              </Button>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card padding="md" variant="flat">
          <h2 className="text-lg font-bold text-[var(--text-strong)]">Dane i prowadzenie</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ReadField label="NIP" value={lead?.nip ?? organization?.nip} />
            <ReadField label="Telefon" value={lead?.phone ?? organization?.phone} />
            <ReadField label="Branża" value={lead?.industry ?? organization?.industry} />
            <ReadField label="Wielkość" value={lead?.companySize ?? organization?.size} />
            {lead && <ReadField label="Źródło" value={lead.source} />}
            {lead && <ReadField label="Wartość" value={lead.estimatedValue === null ? null : `${lead.estimatedValue} PLN`} />}
          </div>
          {canMutate ? (
            <div className="mt-6 grid gap-3 border-t border-[var(--border-subtle)] pt-5 sm:grid-cols-3">
              <select className={selectClass} defaultValue={lead?.status ?? organization?.status} id="record-status">
                {(lead
                  ? ["NEW", "TO_CONTACT", "CONTACTED", "QUALIFIED", "UNQUALIFIED", "PROPOSAL_SENT", "WON", "LOST", "ARCHIVED", ...(lead.status === "CONVERTED" ? ["CONVERTED"] : [])]
                  : ["PROSPECT", "ACTIVE", "INACTIVE", "ARCHIVED"]
                ).map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
              {lead && (
                <select className={selectClass} defaultValue={lead.priority} id="record-priority">
                  {["LOW", "NORMAL", "HIGH", "URGENT"].map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              )}
              <select className={selectClass} defaultValue={lead?.assignedToId ?? organization?.ownerId ?? ""} id="record-owner">
                <option value="">Nieprzypisany</option>
                {assignees.map((assignee) => <option key={assignee.id} value={assignee.id}>{assignee.name ?? assignee.email}</option>)}
              </select>
              <div className="sm:col-span-3 flex flex-wrap gap-3">
                <Button type="button" onClick={() => {
                  const status = (document.getElementById("record-status") as HTMLSelectElement).value;
                  const ownerId = (document.getElementById("record-owner") as HTMLSelectElement).value || null;
                  const priority = lead ? (document.getElementById("record-priority") as HTMLSelectElement).value : undefined;
                  void patch(lead ? { status, priority, assignedToId: ownerId } : { status, ownerId });
                }}>Zapisz prowadzenie</Button>
                {lead && !lead.organization && <Button type="button" variant="outline" onClick={() => void convertLead()}>Przekonwertuj do organizacji</Button>}
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-[var(--radius-md)] bg-[var(--surface-sunken)] p-3 text-sm text-[var(--text-muted)]">Tryb tylko do odczytu — akcje mutujące są wyłączone.</p>
          )}
        </Card>

        <Card padding="md" variant="flat">
          <h2 className="text-lg font-bold text-[var(--text-strong)]">Notatki wewnętrzne</h2>
          {canMutate && (
            <form className="mt-4 space-y-3" onSubmit={addNote}>
              <Textarea name="body" placeholder="Dodaj kontekst dla zespołu…" required />
              <Button type="submit">Dodaj notatkę</Button>
            </form>
          )}
          <div className="mt-4 space-y-3">
            {notes.map((note) => (
              <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-3" key={note.id}>
                <p className="whitespace-pre-wrap text-sm text-[var(--text-body)]">{note.body}</p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">{note.author.name ?? note.author.email} · {new Date(note.createdAt).toLocaleString("pl-PL")}</p>
              </div>
            ))}
            {notes.length === 0 && <p className="text-sm text-[var(--text-muted)]">Brak notatek.</p>}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <RelationCard title="Kontakty" empty="Brak osób kontaktowych.">
          {contacts.map((contact) => <p className="text-sm" key={contact.id}><strong>{contact.fullName}</strong><br />{contact.role ?? contact.email ?? contact.phone ?? "—"}</p>)}
        </RelationCard>
        <RelationCard title="Zadania" empty="Brak zadań.">
          {canMutate && (
            <form className="space-y-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-3" onSubmit={addTask}>
              <Field label="Nowe zadanie" name="title" required />
              <Textarea name="description" placeholder="Opis lub kontekst zadania" />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2">
                  <Label htmlFor="task-priority">Priorytet</Label>
                  <select className={selectClass} defaultValue="NORMAL" id="task-priority" name="priority">
                    <option value="LOW">Niski</option>
                    <option value="NORMAL">Standard</option>
                    <option value="HIGH">Wysoki</option>
                    <option value="URGENT">Pilny</option>
                  </select>
                </label>
                <Field label="Termin" name="dueAt" type="datetime-local" />
              </div>
              <label className="space-y-2">
                <Label htmlFor="task-assignedToId">Przypisz do</Label>
                <select className={selectClass} defaultValue="" id="task-assignedToId" name="assignedToId">
                  <option value="">Nieprzypisane</option>
                  {assignees.map((assignee) => <option key={assignee.id} value={assignee.id}>{assignee.name ?? assignee.email}</option>)}
                </select>
              </label>
              <Button size="sm" type="submit">Utworz zadanie</Button>
            </form>
          )}
          {tasks.map((task) => (
            <p className="text-sm" key={task.id}>
              <strong>{task.title}</strong><br />
              {task.status}{task.priority ? ` · ${task.priority}` : ""}{task.dueAt ? ` · ${new Date(task.dueAt).toLocaleDateString("pl-PL")}` : ""}
              {task.assignedTo ? <><br />{task.assignedTo.name ?? task.assignedTo.email}</> : null}
            </p>
          ))}
        </RelationCard>
        <RelationCard title={lead ? "Źródło" : "Powiązane leady"} empty={lead ? "Lead ręczny bez formularza." : "Brak powiązanych leadów."}>
          {lead?.formSubmission && <p className="text-sm"><strong>{lead.formSubmission.formType}</strong><br />{lead.formSubmission.status} · {new Date(lead.formSubmission.createdAt).toLocaleString("pl-PL")}</p>}
          {organization?.leads.map((item) => <p className="text-sm" key={item.id}><strong>{item.companyName}</strong><br />{item.fullName} · {item.status}</p>)}
        </RelationCard>
      </div>
    </div>
  );
}

function Field({ label, name, ...props }: { label: string; name: string } & ComponentProps<typeof Input>) {
  return <label className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} {...props} /></label>;
}

function ReadField({ label, value }: { label: string; value: string | null | undefined }) {
  return <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-3"><p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{label}</p><p className="mt-2 font-semibold text-[var(--text-strong)]">{value || "—"}</p></div>;
}

function RelationCard({ children, empty, title }: { children: ReactNode; empty: string; title: string }) {
  const items = Array.isArray(children) ? children : [children];
  const visible = items.filter(Boolean);
  return <Card padding="md" variant="flat"><h2 className="text-lg font-bold text-[var(--text-strong)]">{title}</h2><div className="mt-4 space-y-3 text-[var(--text-body)]">{visible.length > 0 ? visible : <p className="text-sm text-[var(--text-muted)]">{empty}</p>}</div></Card>;
}

function DetailState({ message, onBack }: { message: string; onBack: () => void }) {
  return <Card padding="md" variant="flat"><Button type="button" variant="ghost" onClick={onBack}>← Wróć</Button><p className="mt-5 text-sm text-[var(--text-muted)]">{message}</p></Card>;
}
