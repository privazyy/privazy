import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "privazy. CRM - nowy layout w przygotowaniu",
  description: "Design-system foundation for the new PRIVAZY CRM workspace.",
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[var(--surface-page)] text-[var(--text-body)]">
      <section className="mx-auto flex min-h-screen w-full max-w-[var(--container-wide)] items-center px-[var(--gutter)] py-12 sm:py-16">
        <Card as="section" className="w-full" padding="lg" variant="flat">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl min-w-0">
              <Logo size="lg" />
              <div className="mt-8 flex items-center gap-3 text-sm font-semibold uppercase tracking-[var(--ls-wide)] text-[var(--brand-ink)]">
                <LayoutDashboard aria-hidden="true" className="size-4" />
                CRM
              </div>
              <h1 className="mt-4 text-[length:var(--fs-h1)] leading-[var(--lh-tight)]">
                Nowy layout CRM jest gotowy do wdrozenia.
              </h1>
              <p className="mt-5 max-w-2xl text-[length:var(--fs-lead)] leading-[var(--lh-relaxed)] text-[var(--text-muted)]">
                Poprzedni workspace CRM i dane demo zostaly usuniete. Ten route zostaje jako czysta baza design systemu
                pod nowy panel operacyjny.
              </p>
            </div>
            <Button asChild size="lg" variant="outline">
              <Link href="/">
                <ArrowLeft aria-hidden="true" />
                Wroc na landing
              </Link>
            </Button>
          </div>
        </Card>
      </section>
    </main>
  );
}
