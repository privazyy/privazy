import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Platnosc nieudana - PRIVAZY",
};

export default function CheckoutErrorPage() {
  return (
    <main className="min-h-screen bg-[var(--surface-page)] px-[var(--gutter)] py-16 text-[var(--text-strong)]">
      <section className="mx-auto grid w-full max-w-[720px] gap-5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-white p-7 text-center shadow-[var(--shadow-sm)]">
        <AlertTriangle className="mx-auto size-12 text-[var(--warning)]" />
        <h1 className="text-[var(--fs-h1)] font-bold">Nie potwierdzilismy platnosci</h1>
        <p className="text-base leading-7 text-[var(--text-body)]">Sprobuj ponownie z koszyka albo skontaktuj sie z PRIVAZY, jesli kwota zostala pobrana.</p>
        <Button asChild className="mx-auto">
          <Link href={"/koszyk" as Route}>Wroc do koszyka</Link>
        </Button>
      </section>
    </main>
  );
}
