"use client";

import { useMemo, useState, useTransition } from "react";

type FormData = Record<string, unknown>;

const fieldGroups = [
  {
    title: "Dane administratora",
    fields: [
      ["administrator.name", "Nazwa firmy / administratora", "text"],
      ["administrator.legalForm", "Forma prawna", "text"],
      ["administrator.address", "Adres", "text"],
      ["administrator.taxId", "NIP / KRS", "text"],
      ["administrator.contactEmail", "E-mail kontaktowy", "email"],
      ["administrator.phone", "Telefon", "text"],
    ],
  },
  {
    title: "Kontakt RODO",
    fields: [
      ["dataProtectionContact.privacyEmail", "E-mail do spraw danych", "email"],
      ["dataProtectionContact.hasDpo", "IOD powołany", "checkbox"],
      ["dataProtectionContact.dpoName", "Dane IOD", "text"],
      ["dataProtectionContact.dpoEmail", "E-mail IOD", "email"],
    ],
  },
  {
    title: "Strona / aplikacja",
    fields: [
      ["website.domain", "Domena strony", "text"],
      ["website.serviceName", "Nazwa serwisu", "text"],
      ["website.businessType", "Typ działalności", "text"],
      ["website.hasShop", "Sklep", "checkbox"],
      ["website.hasNewsletter", "Newsletter", "checkbox"],
      ["website.hasContactForms", "Formularze kontaktowe", "checkbox"],
      ["website.hasUserAccounts", "Konta użytkowników", "checkbox"],
    ],
  },
  {
    title: "Kategorie osób i cele",
    fields: [
      ["peopleCategories.customers", "Klienci", "checkbox"],
      ["peopleCategories.websiteUsers", "Użytkownicy strony", "checkbox"],
      ["peopleCategories.newsletterSubscribers", "Subskrybenci newslettera", "checkbox"],
      ["peopleCategories.contractors", "Kontrahenci", "checkbox"],
      ["peopleCategories.jobCandidates", "Kandydaci do pracy", "checkbox"],
      ["peopleCategories.other", "Inne kategorie", "textarea"],
      ["processingPurposes.inquiries", "Obsługa zapytań", "checkbox"],
      ["processingPurposes.orders", "Realizacja zamówień", "checkbox"],
      ["processingPurposes.userAccount", "Konto użytkownika", "checkbox"],
      ["processingPurposes.marketing", "Marketing", "checkbox"],
      ["processingPurposes.newsletter", "Newsletter", "checkbox"],
      ["processingPurposes.analytics", "Analityka", "checkbox"],
      ["processingPurposes.complaints", "Reklamacje", "checkbox"],
      ["processingPurposes.legalObligations", "Obowiązki prawne", "checkbox"],
      ["processingPurposes.claims", "Dochodzenie roszczeń", "checkbox"],
    ],
  },
  {
    title: "Podstawy, odbiorcy, transfer",
    fields: [
      ["legalBases.contract", "Umowa", "checkbox"],
      ["legalBases.legalObligation", "Obowiązek prawny", "checkbox"],
      ["legalBases.legitimateInterest", "Uzasadniony interes", "checkbox"],
      ["legalBases.consent", "Zgoda", "checkbox"],
      ["legalBases.other", "Inne podstawy", "textarea"],
      ["recipients.hosting", "Hosting", "checkbox"],
      ["recipients.emailProvider", "Poczta e-mail", "checkbox"],
      ["recipients.accounting", "Księgowość", "checkbox"],
      ["recipients.payments", "Płatności", "checkbox"],
      ["recipients.couriers", "Kurierzy", "checkbox"],
      ["recipients.itSupport", "IT", "checkbox"],
      ["recipients.crm", "CRM", "checkbox"],
      ["recipients.lawFirm", "Kancelaria", "checkbox"],
      ["recipients.other", "Inni odbiorcy", "textarea"],
      ["transfersOutsideEea.enabled", "Transfer poza EOG", "checkbox"],
      ["transfersOutsideEea.tools", "Narzędzia transferu", "textarea"],
      ["transfersOutsideEea.country", "Kraj", "text"],
      ["transfersOutsideEea.safeguards", "Zabezpieczenia", "textarea"],
    ],
  },
  {
    title: "Retencja, prawa, cookies, uwagi",
    fields: [
      ["retention.inquiries", "Okres zapytań", "text"],
      ["retention.orders", "Okres zamówień", "text"],
      ["retention.invoices", "Okres faktur", "text"],
      ["retention.newsletter", "Okres newslettera", "text"],
      ["retention.accounts", "Okres konta", "text"],
      ["retention.complaints", "Okres reklamacji", "text"],
      ["dataSubjectRights.requestEmail", "E-mail do żądań", "email"],
      ["dataSubjectRights.customNotes", "Uwagi o prawach osób", "textarea"],
      ["cookies.usesCookies", "Używa cookies", "checkbox"],
      ["cookies.analytics", "Analityczne", "checkbox"],
      ["cookies.marketing", "Marketingowe", "checkbox"],
      ["cookies.functional", "Funkcjonalne", "checkbox"],
      ["cookies.hasCookieBanner", "Cookie banner", "checkbox"],
      ["cookies.tools", "Narzędzia cookies", "textarea"],
      ["additionalNotes.customNotes", "Własne uwagi", "textarea"],
      ["additionalNotes.industryDetails", "Szczegóły branżowe", "textarea"],
      ["additionalNotes.additionalSystems", "Dodatkowe systemy", "textarea"],
    ],
  },
] as const;

export function PrivacyPolicyInputForm({
  initialData,
  inputId,
  status,
}: {
  initialData: FormData;
  inputId: string;
  status: string;
}) {
  const [data, setData] = useState<FormData>(initialData ?? {});
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);
  const [acceptDocumentDisclaimer, setAcceptDocumentDisclaimer] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const completedFields = useMemo(() => countCompletedFields(data), [data]);
  const locked = ["SUBMITTED", "LOCKED", "GENERATION_PENDING", "GENERATED"].includes(status);

  const submitRequest = (mode: "draft" | "submit") => {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const response = await fetch(`/api/documents/inputs/${inputId}/${mode === "draft" ? "draft" : "submit"}`, {
        method: mode === "draft" ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          mode === "draft"
            ? { data }
            : { data, confirmAccuracy, acceptDocumentDisclaimer },
        ),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error ?? "Nie udało się zapisać formularza.");
        return;
      }
      setMessage(mode === "draft" ? "Draft zapisany." : "Dane wysłane. Dokument oczekuje na wygenerowanie.");
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--text-muted)]">Postęp formularza</p>
            <h2 className="text-xl font-bold text-[var(--text-strong)]">{completedFields} pól uzupełnionych</h2>
          </div>
          <span className="rounded-[var(--radius-sm)] border border-[var(--border-default)] px-3 py-1 text-sm font-semibold text-[var(--text-body)]">
            {status}
          </span>
        </div>
      </div>

      {error && <div className="rounded-[var(--radius-md)] border border-[var(--danger)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{error}</div>}
      {message && <div className="rounded-[var(--radius-md)] border border-[var(--success)] bg-[var(--success-soft)] p-3 text-sm text-[var(--success)]">{message}</div>}

      {fieldGroups.map((group) => (
        <section className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4" key={group.title}>
          <h3 className="text-base font-bold text-[var(--text-strong)]">{group.title}</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {group.fields.map(([path, label, type]) => (
              <label className={type === "textarea" ? "md:col-span-2" : ""} key={path}>
                <span className="mb-1 block text-sm font-semibold text-[var(--text-body)]">{label}</span>
                {type === "checkbox" ? (
                  <input
                    checked={Boolean(getPath(data, path))}
                    className="size-5 accent-[var(--brand)]"
                    disabled={locked || isPending}
                    type="checkbox"
                    onChange={(event) => setPathValue(setData, path, event.target.checked)}
                  />
                ) : type === "textarea" ? (
                  <textarea
                    className="min-h-24 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-card)] px-3 py-2 text-sm"
                    disabled={locked || isPending}
                    value={String(getPath(data, path) ?? "")}
                    onChange={(event) => setPathValue(setData, path, event.target.value)}
                  />
                ) : (
                  <input
                    className="h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-card)] px-3 text-sm"
                    disabled={locked || isPending}
                    type={type}
                    value={String(getPath(data, path) ?? "")}
                    onChange={(event) => setPathValue(setData, path, event.target.value)}
                  />
                )}
              </label>
            ))}
          </div>
        </section>
      ))}

      <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
        <label className="flex gap-3 text-sm font-semibold text-[var(--text-body)]">
          <input checked={confirmAccuracy} disabled={locked || isPending} type="checkbox" onChange={(event) => setConfirmAccuracy(event.target.checked)} />
          Potwierdzam poprawność danych.
        </label>
        <label className="mt-3 flex gap-3 text-sm font-semibold text-[var(--text-body)]">
          <input checked={acceptDocumentDisclaimer} disabled={locked || isPending} type="checkbox" onChange={(event) => setAcceptDocumentDisclaimer(event.target.checked)} />
          Akceptuję disclaimer generatora dokumentu.
        </label>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="rounded-[var(--radius-sm)] border border-[var(--border-default)] px-4 py-2 text-sm font-bold disabled:opacity-50" disabled={locked || isPending} type="button" onClick={() => submitRequest("draft")}>
            Zapisz draft
          </button>
          <button className="rounded-[var(--radius-sm)] bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50" disabled={locked || isPending || !confirmAccuracy || !acceptDocumentDisclaimer} type="button" onClick={() => submitRequest("submit")}>
            Wyślij finalnie
          </button>
        </div>
      </div>
    </div>
  );
}

function getPath(data: FormData, path: string) {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as FormData)[key];
  }, data);
}

function setPathValue(setData: (updater: (data: FormData) => FormData) => void, path: string, value: unknown) {
  setData((current) => {
    const copy = structuredClone(current);
    let cursor = copy;
    const parts = path.split(".");
    parts.slice(0, -1).forEach((part) => {
      if (!cursor[part] || typeof cursor[part] !== "object") cursor[part] = {};
      cursor = cursor[part] as FormData;
    });
    cursor[parts.at(-1) ?? path] = value;
    return copy;
  });
}

function countCompletedFields(data: FormData) {
  let count = 0;
  const walk = (value: unknown) => {
    if (value && typeof value === "object") {
      Object.values(value).forEach(walk);
      return;
    }
    if (value === true || (typeof value === "string" && value.trim().length > 0)) count += 1;
  };
  walk(data);
  return count;
}
