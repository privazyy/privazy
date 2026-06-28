import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "privazy. - nowy landing w przygotowaniu",
  description: "Design-system foundation for the new PRIVAZY landing page.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--surface-page)] text-[var(--text-body)]">
      <section className="pvz-container flex min-h-screen items-center py-12 sm:py-16">
        <Card as="section" className="w-full" padding="lg" variant="flat">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl min-w-0">
              <Logo size="lg" />
              <p className="mt-8 text-sm font-semibold uppercase tracking-[var(--ls-wide)] text-[var(--brand-ink)]">
                Landing page
              </p>
              <h1 className="mt-4 text-[length:var(--fs-h1)] leading-[var(--lh-tight)]">
                Nowy layout landing page jest gotowy do wdrozenia.
              </h1>
              <p className="mt-5 max-w-2xl text-[length:var(--fs-lead)] leading-[var(--lh-relaxed)] text-[var(--text-muted)]">
                Poprzedni landing zostal usuniety z produkcyjnych komponentow. Zostaje czysty fundament oparty o tokeny,
                komponenty UI i zasady responsywnosci PRIVAZY.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild size="lg">
                <Link href="/admin">
                  Przejdz do CRM
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sklep/polityka-prywatnosci">Otworz sklep</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
