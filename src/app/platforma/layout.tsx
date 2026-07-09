import type { Route } from "next";
import Link from "next/link";

import { Logo } from "@/components/ui/logo";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-body)]">
      <header className="border-b border-[var(--border-subtle)] bg-[var(--surface-card)]">
        <div className="mx-auto flex min-h-16 max-w-[var(--container-wide)] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href={"/platforma/wnioski-osob" as Route} className="shrink-0">
            <Logo size="sm" />
          </Link>
          <nav className="flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)]">
            <Link className="rounded-[var(--radius-sm)] px-3 py-2 hover:bg-[var(--brand-soft)] hover:text-[var(--brand-ink)]" href={"/platforma/wnioski-osob" as Route}>
              Wnioski osob
            </Link>
            <Link className="rounded-[var(--radius-sm)] px-3 py-2 hover:bg-[var(--brand-soft)] hover:text-[var(--brand-ink)]" href={"/client" as Route}>
              Konto
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[var(--container-wide)] px-4 py-6 sm:px-6 lg:py-8">{children}</main>
    </div>
  );
}
