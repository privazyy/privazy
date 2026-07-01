"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const leadFormSchema = z.object({
  name: z.string().trim().min(2, "Podaj imię i nazwisko.").max(120),
  email: z.email("Podaj poprawny adres e-mail.").max(180),
  phone: z.string().trim().max(48).optional(),
  company: z.string().trim().min(2, "Podaj nazwę firmy.").max(160),
  nip: z.string().trim().max(24).optional(),
  message: z.string().trim().max(1200).optional(),
  consent: z.boolean().refine((value) => value, "Zgoda na kontakt jest wymagana."),
});

type LeadFormFields = z.infer<typeof leadFormSchema>;

export type LeadCaptureCheckerContext = {
  answers?: Record<string, string>;
  resultTitle?: string;
  resultStatus?: string;
  resultTrigger?: string;
  scale?: string;
  complianceResult?: unknown;
};

type LeadCaptureFormProps = {
  className?: string;
  compact?: boolean;
  industrySlug?: string;
  messagePlaceholder?: string;
  placement: string;
  serviceSlug?: string;
  subject: string;
  checker?: LeadCaptureCheckerContext;
};

type FieldErrors = Partial<Record<keyof LeadFormFields, string>>;

const trackedParamNames = new Set(["gclid", "fbclid", "msclkid"]);

export function LeadCaptureForm({
  checker,
  className,
  compact,
  industrySlug,
  messagePlaceholder = "Krótko opisz sytuację, usługę albo termin rozmowy.",
  placement,
  serviceSlug,
  subject,
}: LeadCaptureFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const formId = useMemo(() => `lead-${placement.replace(/[^a-z0-9-]/gi, "-").toLowerCase()}`, [placement]);

  async function submitLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    setServerMessage(null);

    const formData = new FormData(event.currentTarget);
    const input = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: cleanOptional(formData.get("phone")),
      company: String(formData.get("company") ?? ""),
      nip: cleanOptional(formData.get("nip")),
      message: cleanOptional(formData.get("message")),
      consent: formData.get("consent") === "on",
    };

    const parsed = leadFormSchema.safeParse(input);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        company: fieldErrors.company?.[0],
        consent: fieldErrors.consent?.[0],
        email: fieldErrors.email?.[0],
        message: fieldErrors.message?.[0],
        name: fieldErrors.name?.[0],
        nip: fieldErrors.nip?.[0],
        phone: fieldErrors.phone?.[0],
      });
      setStatus("error");
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const response = await fetch("/api/leads/public", {
        body: JSON.stringify({
          checker,
          contact: {
            company: parsed.data.company,
            consent: parsed.data.consent,
            email: parsed.data.email,
            name: parsed.data.name,
            nip: parsed.data.nip,
            phone: parsed.data.phone,
          },
          message: parsed.data.message,
          source: {
            industrySlug,
            page: window.location.pathname,
            placement,
            serviceSlug,
            subject,
            utm: readUtmParams(),
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Nie udało się zapisać zgłoszenia.");
      }

      event.currentTarget.reset();
      setStatus("success");
      setServerMessage("Dziękujemy. Zgłoszenie zostało zapisane, a zespół PRIVAZY wróci z odpowiedzią.");
    } catch (error) {
      setStatus("error");
      setServerMessage(error instanceof Error ? error.message : "Nie udało się zapisać zgłoszenia.");
    }
  }

  return (
    <form
      id={formId}
      className={cn(
        "grid min-w-0 gap-4 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-sm)]",
        !compact && "md:p-7",
        className,
      )}
      onSubmit={submitLead}
    >
      <div className="min-w-0">
        <div className="font-display text-lg font-bold text-[var(--text-strong)]">{subject}</div>
        <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
          Zostaw dane kontaktowe. Formularz zapisuje źródło zgłoszenia i parametry UTM, aby rozmowa zaczęła się od właściwego kontekstu.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={errors.name} htmlFor={`${formId}-name`} label="Imię i nazwisko" required>
          <Input id={`${formId}-name`} name="name" autoComplete="name" placeholder="Jan Kowalski" />
        </Field>
        <Field error={errors.email} htmlFor={`${formId}-email`} label="E-mail" required>
          <Input id={`${formId}-email`} name="email" type="email" autoComplete="email" placeholder="jan@firma.pl" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={errors.phone} htmlFor={`${formId}-phone`} label="Telefon" hint="Opcjonalnie">
          <Input id={`${formId}-phone`} name="phone" type="tel" autoComplete="tel" placeholder="+48 600 000 000" />
        </Field>
        <Field error={errors.company} htmlFor={`${formId}-company`} label="Firma" required>
          <Input id={`${formId}-company`} name="company" autoComplete="organization" placeholder="Nazwa firmy" />
        </Field>
      </div>

      <Field error={errors.nip} htmlFor={`${formId}-nip`} label="NIP" hint="Opcjonalnie">
        <Input id={`${formId}-nip`} name="nip" inputMode="numeric" placeholder="0000000000" />
      </Field>

      {!compact && (
        <Field error={errors.message} htmlFor={`${formId}-message`} label="Wiadomość" hint="Opcjonalnie">
          <Textarea id={`${formId}-message`} name="message" placeholder={messagePlaceholder} />
        </Field>
      )}

      <label className="flex min-w-0 items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-page)] p-3 text-sm leading-6 text-[var(--text-body)]">
        <input
          className="mt-1 size-4 shrink-0 accent-[var(--brand)]"
          name="consent"
          type="checkbox"
        />
        <span className="min-w-0">
          Wyrażam zgodę na kontakt w sprawie zgłoszenia. Wiem, że treści formularza mają charakter ogólny i nie stanowią porady prawnej.
          {errors.consent && <span className="mt-1 block text-[var(--red-600)]">{errors.consent}</span>}
        </span>
      </label>

      <Button type="submit" size={compact ? "default" : "lg"} disabled={status === "submitting"} className="w-full">
        {status === "submitting" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Wyślij zgłoszenie
      </Button>

      {serverMessage && (
        <div
          className={cn(
            "flex min-w-0 gap-2 rounded-[var(--radius-md)] border p-3 text-sm leading-6",
            status === "success"
              ? "border-[var(--success)]/20 bg-[var(--success-soft)] text-[var(--green-600)]"
              : "border-[var(--danger)]/20 bg-[var(--danger-soft)] text-[var(--red-600)]",
          )}
          role="status"
        >
          {status === "success" && <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}
          <span className="min-w-0">{serverMessage}</span>
        </div>
      )}
    </form>
  );
}

function cleanOptional(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}

function readUtmParams() {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};

  params.forEach((value, key) => {
    if (key.startsWith("utm_") || trackedParamNames.has(key)) {
      utm[key] = value.slice(0, 240);
    }
  });

  return utm;
}
