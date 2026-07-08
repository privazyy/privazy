import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getPublicOrderView } from "@/server/shop/checkout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Symulacja płatności zakończona - PRIVAZY",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; token?: string }>;
}) {
  const { order, token } = await searchParams;
  const orderView = order && token ? await getPublicOrderView(order, token) : null;
  const statusHref = order && token ? (`/zamowienie/${order}?token=${encodeURIComponent(token)}` as Route) : ("/sklep" as Route);

  return (
    <main className="min-h-screen bg-[var(--surface-page)] px-[var(--gutter)] py-16 text-[var(--text-strong)]">
      <section className="mx-auto grid w-full max-w-[720px] gap-5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-7 text-center shadow-[var(--shadow-sm)]">
        <CheckCircle2 className="mx-auto size-12 text-[var(--success)]" />
        <p className="text-sm font-bold uppercase tracking-[var(--ls-wide)] text-[var(--brand-ink)]">MOCK / SANDBOX</p>
        <h1 className="text-[var(--fs-h1)] font-bold">Symulacja zakończona sukcesem</h1>
        <p className="text-base leading-7 text-[var(--text-body)]">
          {orderView ? `Testowe zamówienie ${orderView.orderNumber} ma status PAID. Nie pobrano żadnych środków.` : "Zapisano testowy wynik płatności. Nie pobrano żadnych środków."}
        </p>
        <Button asChild className="mx-auto">
          <Link href={statusHref}>Przejdz do statusu zamowienia</Link>
        </Button>
      </section>
    </main>
  );
}
