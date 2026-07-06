"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Loader2, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { privacyPolicyLabels } from "@/lib/document-forms/privacy-policy/labels";
import {
  dataSubjectCategories,
  getDefaultPrivacyPolicyFormData,
  legalBases,
  preferredContactChannels,
  privacyPolicyFormSchema,
  processingPurposes,
  recipientTools,
  websiteTypes,
  type PrivacyPolicyFormData,
} from "@/lib/document-forms/privacy-policy/schema";
import { privacyPolicyLegalDisclaimer } from "@/lib/document-forms/privacy-policy/map-to-template";

type FormState = "idle" | "saving" | "submitting" | "saved" | "submitted" | "error";

export function PrivacyPolicyForm({
  initialData,
  orderItemId,
}: {
  initialData?: Partial<PrivacyPolicyFormData> | null;
  orderItemId: string;
}) {
  const [data, setData] = useState<PrivacyPolicyFormData>(() => mergeDefaults(initialData));
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const summary = useMemo(
    () => [
      ["Administrator", data.controller.name || "brak"],
      ["Kontakt", data.controller.contactEmail || "brak"],
      ["Typ serwisu", data.website.types.map((item) => privacyPolicyLabels.websiteTypes[item]).join(", ") || "brak"],
      ["Cele", data.purposes.map((item) => privacyPolicyLabels.processingPurposes[item]).join(", ") || "brak"],
      ["Cookies", data.cookies.usesCookies ? "tak" : "nie"],
    ],
    [data],
  );

  async function saveDraft() {
    setState("saving");
    setMessage(null);
    setErrors({});
    await sendPayload("/api/documents/input/save", "saved");
  }

  async function submitForGeneration() {
    const parsed = privacyPolicyFormSchema.safeParse(data);
    if (!parsed.success) {
      setErrors(flattenErrors(parsed.error.flatten().fieldErrors));
      setState("error");
      setMessage("Popraw oznaczone pola przed wyslaniem do generowania.");
      return;
    }

    setState("submitting");
    setMessage(null);
    setErrors({});
    await sendPayload("/api/documents/input/submit", "submitted");
  }

  async function sendPayload(url: string, successState: FormState) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderItemId, data }),
    });
    const payload = (await response.json()) as { error?: string; jobId?: string };

    if (!response.ok) {
      setState("error");
      setMessage(payload.error ?? "Operacja nie powiodla sie.");
      return;
    }

    setState(successState);
    setMessage(successState === "submitted" ? `Wyslano do generowania. Job: ${payload.jobId}` : "Zapisano wersje robocza.");
  }

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-5">
        <Card padding="md" variant="flat">
          <div className="mb-5">
            <h1 className="text-2xl font-bold">Polityka prywatnosci RODO</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{privacyPolicyLegalDisclaimer}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField error={errors["controller.name"]} label="Nazwa administratora" value={data.controller.name} onChange={(value) => setController("name", value)} />
            <TextField error={errors["controller.legalForm"]} label="Forma prawna" value={data.controller.legalForm} onChange={(value) => setController("legalForm", value)} />
            <TextField label="NIP / KRS" value={data.controller.taxId} onChange={(value) => setController("taxId", value)} />
            <TextField error={errors["controller.contactEmail"]} label="E-mail kontaktowy" type="email" value={data.controller.contactEmail} onChange={(value) => setController("contactEmail", value)} />
            <TextField label="Telefon" value={data.controller.phone} onChange={(value) => setController("phone", value)} />
            <Field className="sm:col-span-2" error={errors["controller.address"]} label="Adres">
              <Textarea value={data.controller.address} onChange={(event) => setController("address", event.target.value)} />
            </Field>
          </div>
        </Card>

        <Section title="Kontakt RODO">
          <label className="flex items-center gap-3 text-sm font-semibold text-[var(--text-strong)]">
            <input checked={data.dpo.hasDpo} type="checkbox" onChange={(event) => setData((current) => ({ ...current, dpo: { ...current.dpo, hasDpo: event.target.checked } }))} />
            Wyznaczono IOD
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Dane IOD" value={data.dpo.dpoDetails} onChange={(value) => setData((current) => ({ ...current, dpo: { ...current.dpo, dpoDetails: value } }))} />
            <TextField label="Punkt kontaktowy, jesli brak IOD" value={data.dpo.contactPoint} onChange={(value) => setData((current) => ({ ...current, dpo: { ...current.dpo, contactPoint: value } }))} />
          </div>
        </Section>

        <CheckboxSection
          labels={privacyPolicyLabels.websiteTypes}
          title="Charakter strony lub aplikacji"
          values={websiteTypes}
          selected={data.website.types}
          onChange={(selected) => setData((current) => ({ ...current, website: { ...current.website, types: selected } }))}
        />
        <Field label="Inny typ strony lub aplikacji">
          <Textarea value={data.website.otherDescription} onChange={(event) => setData((current) => ({ ...current, website: { ...current.website, otherDescription: event.target.value } }))} />
        </Field>

        <CheckboxSection labels={privacyPolicyLabels.dataSubjectCategories} title="Kategorie osob" values={dataSubjectCategories} selected={data.dataSubjects} onChange={(selected) => setData((current) => ({ ...current, dataSubjects: selected }))} />
        <CheckboxSection labels={privacyPolicyLabels.processingPurposes} title="Cele przetwarzania" values={processingPurposes} selected={data.purposes} onChange={(selected) => setData((current) => ({ ...current, purposes: selected }))} />
        <CheckboxSection labels={privacyPolicyLabels.legalBases} title="Podstawy prawne" values={legalBases} selected={data.legalBases} onChange={(selected) => setData((current) => ({ ...current, legalBases: selected }))} />
        <CheckboxSection labels={privacyPolicyLabels.recipientTools} title="Narzędzia i odbiorcy" values={recipientTools} selected={data.recipients.tools} onChange={(selected) => setData((current) => ({ ...current, recipients: { ...current.recipients, tools: selected } }))} />

        <Section title="Transfery poza EOG">
          <label className="flex items-center gap-3 text-sm font-semibold text-[var(--text-strong)]">
            <input checked={data.transfers.outsideEea} type="checkbox" onChange={(event) => setData((current) => ({ ...current, transfers: { ...current.transfers, outsideEea: event.target.checked } }))} />
            Wystepuja transfery poza EOG
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField label="Dostawcy" value={data.transfers.providers} onChange={(value) => setData((current) => ({ ...current, transfers: { ...current.transfers, providers: value } }))} />
            <TextField label="Podstawa transferu" value={data.transfers.basis} onChange={(value) => setData((current) => ({ ...current, transfers: { ...current.transfers, basis: value } }))} />
            <TextField label="Dodatkowy opis" value={data.transfers.description} onChange={(value) => setData((current) => ({ ...current, transfers: { ...current.transfers, description: value } }))} />
          </div>
        </Section>

        <Section title="Okresy przechowywania">
          <div className="grid gap-4 sm:grid-cols-2">
            {(["contact", "orders", "invoices", "newsletter", "account", "claims", "recruitment"] as const).map((key) => (
              <TextField key={key} label={retentionLabel(key)} value={data.retention[key]} onChange={(value) => setData((current) => ({ ...current, retention: { ...current.retention, [key]: value } }))} />
            ))}
          </div>
        </Section>

        <Section title="Prawa osob i cookies">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField error={errors["rights.requestEmail"]} label="E-mail do zadan" type="email" value={data.rights.requestEmail} onChange={(value) => setData((current) => ({ ...current, rights: { ...current.rights, requestEmail: value } }))} />
            <Field label="Preferowany kanal kontaktu">
              <Select value={data.rights.preferredChannel} onChange={(event) => setData((current) => ({ ...current, rights: { ...current.rights, preferredChannel: event.target.value as PrivacyPolicyFormData["rights"]["preferredChannel"] } }))}>
                {preferredContactChannels.map((channel) => (
                  <option key={channel} value={channel}>{privacyPolicyLabels.preferredContactChannels[channel]}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              ["usesCookies", "Serwis wykorzystuje cookies"],
              ["analytics", "Analityka"],
              ["marketing", "Marketing"],
              ["consentManagement", "Consent management"],
            ] as const).map(([key, label]) => (
              <label className="flex items-center gap-3 text-sm font-semibold text-[var(--text-strong)]" key={key}>
                <input checked={data.cookies[key]} type="checkbox" onChange={(event) => setData((current) => ({ ...current, cookies: { ...current.cookies, [key]: event.target.checked } }))} />
                {label}
              </label>
            ))}
          </div>
          <TextField label="Link do polityki cookies" value={data.cookies.cookiePolicyUrl} onChange={(value) => setData((current) => ({ ...current, cookies: { ...current.cookies, cookiePolicyUrl: value } }))} />
        </Section>

        <Section title="Dodatkowe postanowienia">
          <Field label="Własny tekst dodatkowy">
            <Textarea value={data.additional.customText} onChange={(event) => setData((current) => ({ ...current, additional: { ...current.additional, customText: event.target.value } }))} />
          </Field>
          <TextField error={errors["additional.effectiveDate"]} label="Data wejscia w zycie" type="date" value={data.additional.effectiveDate} onChange={(value) => setData((current) => ({ ...current, additional: { ...current.additional, effectiveDate: value } }))} />
        </Section>
      </div>

      <aside className="min-w-0 space-y-4 xl:sticky xl:top-5 xl:self-start">
        <Card padding="md" variant="flat">
          <h2 className="text-lg font-bold">Podsumowanie</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {summary.map(([label, value]) => (
              <div className="min-w-0" key={label}>
                <dt className="font-semibold text-[var(--text-strong)]">{label}</dt>
                <dd className="break-words text-[var(--text-muted)]">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 grid gap-3">
            <Button disabled={state === "saving" || state === "submitting"} type="button" variant="outline" onClick={saveDraft}>
              {state === "saving" ? <Loader2 className="animate-spin" /> : <Save />}
              Zapisz wersje robocza
            </Button>
            <Button disabled={state === "saving" || state === "submitting"} type="button" onClick={submitForGeneration}>
              {state === "submitting" ? <Loader2 className="animate-spin" /> : <Send />}
              Wyslij do wygenerowania
            </Button>
          </div>
          {message ? (
            <p className="mt-4 flex items-start gap-2 text-sm text-[var(--text-body)]">
              {state === "saved" || state === "submitted" ? <CheckCircle2 className="mt-0.5 size-4 text-[var(--success)]" /> : null}
              <span>{message}</span>
            </p>
          ) : null}
        </Card>
      </aside>
    </div>
  );

  function setController(key: keyof PrivacyPolicyFormData["controller"], value: string) {
    setData((current) => ({ ...current, controller: { ...current.controller, [key]: value } }));
  }
}

function Section({ children, title }: { children: ReactNode; title: string }) {
  return (
    <Card padding="md" variant="flat">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      <div className="grid gap-4">{children}</div>
    </Card>
  );
}

function TextField({ error, label, onChange, type = "text", value }: { error?: string; label: string; onChange: (value: string) => void; type?: string; value: string }) {
  return (
    <Field error={error} label={label}>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </Field>
  );
}

function CheckboxSection<T extends string>({
  labels,
  onChange,
  selected,
  title,
  values,
}: {
  labels: Record<T, string>;
  onChange: (value: T[]) => void;
  selected: T[];
  title: string;
  values: readonly T[];
}) {
  return (
    <Section title={title}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {values.map((value) => (
          <label className="flex min-w-0 items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-3 text-sm font-semibold text-[var(--text-strong)]" key={value}>
            <input
              checked={selected.includes(value)}
              className="mt-1"
              type="checkbox"
              onChange={(event) => {
                onChange(event.target.checked ? [...selected, value] : selected.filter((item) => item !== value));
              }}
            />
            <span className="min-w-0 break-words">{labels[value]}</span>
          </label>
        ))}
      </div>
    </Section>
  );
}

function retentionLabel(key: keyof PrivacyPolicyFormData["retention"]) {
  const labels: Record<keyof PrivacyPolicyFormData["retention"], string> = {
    account: "Konto",
    claims: "Roszczenia",
    contact: "Kontakt",
    invoices: "Faktury",
    newsletter: "Newsletter",
    orders: "Zamowienia",
    recruitment: "Rekrutacja",
  };

  return labels[key];
}

function mergeDefaults(initialData?: Partial<PrivacyPolicyFormData> | null): PrivacyPolicyFormData {
  const defaults = getDefaultPrivacyPolicyFormData();

  if (!initialData) return defaults;

  return {
    ...defaults,
    ...initialData,
    additional: { ...defaults.additional, ...initialData.additional },
    controller: { ...defaults.controller, ...initialData.controller },
    cookies: { ...defaults.cookies, ...initialData.cookies },
    dpo: { ...defaults.dpo, ...initialData.dpo },
    recipients: { ...defaults.recipients, ...initialData.recipients },
    retention: { ...defaults.retention, ...initialData.retention },
    rights: { ...defaults.rights, ...initialData.rights },
    transfers: { ...defaults.transfers, ...initialData.transfers },
    website: { ...defaults.website, ...initialData.website },
  };
}

function flattenErrors(fieldErrors: Record<string, string[] | undefined>) {
  return Object.fromEntries(Object.entries(fieldErrors).map(([key, value]) => [key, value?.[0] ?? "Niepoprawna wartosc."]));
}
