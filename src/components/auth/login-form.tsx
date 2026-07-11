"use client";

import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      callbackUrl,
      email: String(form.get("email") ?? "").trim().toLowerCase(),
      password: String(form.get("password") ?? ""),
      redirect: false,
    });

    if (!result?.ok) {
      setError("Nieprawidlowy e-mail albo haslo.");
      setPending(false);
      return;
    }

    window.location.assign(result.url ?? callbackUrl);
  }

  return (
    <Card className="w-full max-w-md" padding="md" variant="raised">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">PRIVAZY CRM</p>
        <h1 className="mt-2 text-2xl font-extrabold text-[var(--text-strong)]">Logowanie do panelu</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
          Uzyj konta z rola ADMIN, LAWYER, OPERATOR albo READ_ONLY.
        </p>
      </div>
      <form className="space-y-4" onSubmit={submit}>
        <label className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input autoComplete="email" id="email" name="email" required type="email" />
        </label>
        <label className="space-y-2">
          <Label htmlFor="password">Haslo</Label>
          <Input autoComplete="current-password" id="password" name="password" required type="password" />
        </label>
        {error && <p className="rounded-[var(--radius-md)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{error}</p>}
        <Button className="w-full" disabled={pending} type="submit">
          {pending ? "Logowanie..." : "Zaloguj"}
        </Button>
      </form>
    </Card>
  );
}
