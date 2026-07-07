"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { LogIn } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  callbackUrl: string;
  hasError?: boolean;
};

export function LoginForm({ callbackUrl, hasError }: LoginFormProps) {
  const [error, setError] = useState(hasError ? "Nieprawidlowy e-mail lub haslo." : null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      callbackUrl,
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (!result?.ok) {
      setError("Nieprawidlowy e-mail lub haslo.");
      return;
    }

    window.location.assign(result.url ?? callbackUrl);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Haslo</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} />
      </div>
      {error ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </div>
      ) : null}
      <Button type="submit" disabled={isSubmitting} className="h-11">
        <LogIn className="size-4" aria-hidden="true" />
        {isSubmitting ? "Logowanie..." : "Zaloguj"}
      </Button>
    </form>
  );
}
