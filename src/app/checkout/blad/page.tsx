import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Symulacja płatności nieudana - PRIVAZY",
};

export default function CheckoutErrorPage() {
  return (
    <main className="min-h-screen bg-[var(--surface-page)] px-[var(--gutter)] py-16 text-[var(--text-strong)]">
      <section className="mx-auto grid w-full max-w-[720px] gap-5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-7 text-center shadow-[var(--shadow-sm)]">
        <AlertTriangle className="mx-auto size-12 text-[var(--warning)]" />
        <p className="text-sm font-bold uppercase tracking-[var(--ls-wide)] text-[var(--brand-ink)]">MOCK / SANDBOX</p>
        <h1 className="text-[var(--fs-h1)] font-bold">Symulacja płatności nieudana</h1>
        <p className="text-base leading-7 text-[var(--text-body)]">To był wynik testowy. Nie pobrano żadnych środków ani danych karty.</p>
        <Button asChild className="mx-auto">
          <Link href={"/koszyk" as Route}>Wroc do koszyka</Link>
        </Button>
      </section>
    </main>
  );
}
