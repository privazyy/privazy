"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NEWSLETTER_CONSENT_TEXT } from "@/lib/newsletter";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function NewsletterSignup({ source = "blog" }: { source?: string }) {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: String(form.get("email") ?? ""),
        source,
        consentMarketing: form.get("consentMarketing") === "on",
        consentTextSnapshot: NEWSLETTER_CONSENT_TEXT,
        website: String(form.get("website") ?? ""),
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setState("error");
      setMessage(payload?.error ?? "Nie udalo sie zapisac zgody.");
      return;
    }

    const payload = (await response.json()) as { message?: string };
    event.currentTarget.reset();
    setState("success");
    setMessage(payload.message ?? "Zgloszenie zostalo przyjete.");
  }

  return (
    <section className="border-y border-[var(--border-subtle)] bg-[var(--surface-brand-soft)]">
      <div className="grid gap-7 py-10 md:grid-cols-[1fr_420px] md:items-start pvz-container">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-normal text-[var(--brand-ink)]">
            <Mail className="size-4" /> Newsletter PRIVAZY
          </span>
          <h2 className="mt-3 text-2xl font-bold leading-tight text-[var(--text-strong)]">
            Otrzymuj praktyczne aktualizacje o RODO i ochronie danych
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-body)]">
            Zapis wymaga jawnej zgody marketingowej. W tym PR nie wysylamy kampanii; zapis tworzy bezpieczna podstawe zgody i wypisu.
          </p>
        </div>
        <form className="grid gap-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white p-4" onSubmit={handleSubmit}>
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <Input name="email" type="email" required placeholder="adres@email.pl" className="h-11" />
          <label className="flex gap-3 text-xs leading-5 text-[var(--text-body)]">
            <input name="consentMarketing" type="checkbox" required className="mt-1 size-4 shrink-0" />
            <span>
              {NEWSLETTER_CONSENT_TEXT}{" "}
              <a className="font-semibold text-[var(--text-link)] underline underline-offset-4" href="/sklep/polityka-prywatnosci">
                Polityka prywatnosci
              </a>
            </span>
          </label>
          <Button type="submit" disabled={state === "submitting"}>
            {state === "success" ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
            {state === "submitting" ? "Zapisywanie..." : "Zapisz sie"}
          </Button>
          {message && (
            <p className={state === "error" ? "text-sm text-[var(--danger)]" : "text-sm text-[var(--success)]"}>
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
