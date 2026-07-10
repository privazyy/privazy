"use client";

import { useState, type FormEvent } from "react";
import { Check, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function UnsubscribeForm({ initialToken = "" }: { initialToken?: string }) {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/newsletter/unsubscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: String(form.get("token") ?? "") }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setState("error");
      setMessage(payload?.error ?? "Nie udalo sie przetworzyc wypisu.");
      return;
    }

    const payload = (await response.json()) as { message?: string };
    setState("success");
    setMessage(payload.message ?? "Zgloszenie zostalo przyjete.");
  }

  return (
    <form className="grid gap-4 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white p-5" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-semibold text-[var(--text-strong)]">
        Token wypisu
        <Input name="token" required defaultValue={initialToken} placeholder="token z linku wypisu" />
      </label>
      <Button type="submit" disabled={state === "submitting"}>
        {state === "success" ? <Check className="size-4" /> : <LogOut className="size-4" />}
        {state === "submitting" ? "Przetwarzanie..." : "Wypisz"}
      </Button>
      {message && (
        <p className={state === "error" ? "text-sm text-[var(--danger)]" : "text-sm text-[var(--success)]"}>
          {message}
        </p>
      )}
    </form>
  );
}
