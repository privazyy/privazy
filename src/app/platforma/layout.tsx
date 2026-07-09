import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Logo } from "@/components/ui/logo";
import { auth } from "@/server/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user?.id || !role) {
    redirect("/login");
  }

  if (role !== "CLIENT") {
    redirect("/crm" as Route);
  }

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-body)]">
      <header className="border-b border-[var(--border-subtle)] bg-[var(--surface-card)]">
        <div className="mx-auto flex min-h-16 max-w-[var(--container-wide)] items-center justify-between gap-4 px-4 sm:px-6">
          <Link className="shrink-0" href={"/client" as Route}>
            <Logo size="sm" />
          </Link>
          <nav aria-label="Portal klienta" className="flex flex-wrap items-center justify-end gap-1 text-sm font-semibold text-[var(--text-muted)]">
            <Link className="rounded-[var(--radius-sm)] px-3 py-2 hover:bg-[var(--brand-soft)] hover:text-[var(--brand-ink)]" href={"/platforma/dokumenty" as Route}>
              Dokumenty
            </Link>
            <Link className="rounded-[var(--radius-sm)] px-3 py-2 hover:bg-[var(--brand-soft)] hover:text-[var(--brand-ink)]" href={"/platforma/naruszenia" as Route}>
              Naruszenia
            </Link>
            <Link className="rounded-[var(--radius-sm)] px-3 py-2 hover:bg-[var(--brand-soft)] hover:text-[var(--brand-ink)]" href={"/platforma/wnioski-osob" as Route}>
              Żądania osób
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
