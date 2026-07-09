import Link from "next/link";

const navItems = [
  ["Dashboard", "/platforma"],
  ["Zamowienia", "/platforma/zamowienia"],
  ["Dokumenty", "/platforma/dokumenty"],
  ["Pliki", "/platforma/pliki"],
  ["Organizacja", "/platforma/organizacja"],
  ["Ustawienia", "/platforma/ustawienia"],
] as const;

export function PortalShell({
  children,
  userLabel,
}: {
  children: React.ReactNode;
  userLabel: string;
}) {
  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-body)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--surface-card)]">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link className="font-bold text-[var(--text-strong)]" href="/platforma">
            privazy.
          </Link>
          <nav className="hidden min-w-0 flex-1 items-center gap-1 md:flex">
            {navItems.map(([label, href]) => (
              <Link className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-strong)]" href={href} key={href}>
                {label}
              </Link>
            ))}
          </nav>
          <details className="relative ml-auto">
            <summary className="cursor-pointer list-none rounded-[var(--radius-sm)] border border-[var(--border-default)] px-3 py-2 text-sm font-semibold">
              {userLabel}
            </summary>
            <div className="absolute right-0 mt-2 w-56 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-2 shadow-sm">
              <Link className="block rounded-[var(--radius-sm)] px-3 py-2 text-sm hover:bg-[var(--surface-sunken)]" href="/platforma/ustawienia">
                Ustawienia konta
              </Link>
              <Link className="block rounded-[var(--radius-sm)] px-3 py-2 text-sm hover:bg-[var(--surface-sunken)]" href="/">
                Strona glowna
              </Link>
            </div>
          </details>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-[var(--border-subtle)] px-3 py-2 md:hidden" data-responsive-scroll="true">
          {navItems.map(([label, href]) => (
            <Link className="shrink-0 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-semibold text-[var(--text-muted)]" href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
    </div>
  );
}

export function PortalCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 ${className}`}>
      {children}
    </section>
  );
}

export function PortalBadge({ tone = "neutral", children }: { tone?: "neutral" | "success" | "warning" | "danger" | "brand"; children: React.ReactNode }) {
  const classes = {
    brand: "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-ink)]",
    danger: "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]",
    neutral: "border-[var(--border-default)] bg-[var(--surface-sunken)] text-[var(--text-body)]",
    success: "border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]",
    warning: "border-[var(--warning)] bg-[var(--warning-soft)] text-[var(--amber-600)]",
  }[tone];
  return <span className={`inline-flex rounded-[var(--radius-sm)] border px-2.5 py-1 text-xs font-bold ${classes}`}>{children}</span>;
}

export function formatPortalMoney(cents: number, currency = "PLN") {
  return new Intl.NumberFormat("pl-PL", { currency, style: "currency" }).format(cents / 100);
}

export function statusTone(status?: string) {
  if (!status) return "neutral" as const;
  if (["PAID", "GENERATED", "DELIVERED", "COMPLETED"].includes(status)) return "success" as const;
  if (["FAILED", "CANCELLED"].includes(status)) return "danger" as const;
  if (["NEEDS_CORRECTION", "PENDING", "GENERATION_PENDING"].includes(status)) return "warning" as const;
  return "neutral" as const;
}
