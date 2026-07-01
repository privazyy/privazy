import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Landmark,
  ListChecks,
  MessageCircle,
  Scale,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import type { PublicFaq, PublicIndustry, PublicLink, PublicProcessStep, PublicService } from "@/lib/public-site";
import { publicIndustries, publicServices } from "@/lib/public-site";
import { cn } from "@/lib/utils";

type Cta = {
  href: string;
  label: string;
};

export function PublicPageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen overflow-x-clip bg-[var(--surface-page)] text-[var(--text-body)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--glass-bg)] backdrop-blur-[var(--blur-md)]">
        <div className="pvz-container flex min-h-[72px] items-center gap-5 py-3">
          <Link href="/" aria-label="privazy. strona główna" className="shrink-0">
            <Logo />
          </Link>
          <nav className="hidden flex-1 items-center gap-5 text-sm font-medium text-[var(--text-body)] lg:flex">
            <Link href="/#checker" className="hover:text-[var(--brand-ink)]">
              Checker IOD
            </Link>
            <Link href="/uslugi/wdrozenie-rodo" className="hover:text-[var(--brand-ink)]">
              Usługi
            </Link>
            <Link href="/branze/ecommerce" className="hover:text-[var(--brand-ink)]">
              Branże
            </Link>
            <Link href="/blog" className="hover:text-[var(--brand-ink)]">
              Blog
            </Link>
            <Link href="/sklep/polityka-prywatnosci" className="hover:text-[var(--brand-ink)]">
              Dokumenty
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link href="/blog">Baza wiedzy</Link>
            </Button>
            <Button asChild>
              <Link href="/#checker">
                Sprawdź IOD <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>
      {children}
      <PublicFooter />
    </main>
  );
}

export function PublicHero({
  badge,
  description,
  eyebrow,
  primaryCta,
  secondaryCta,
  title,
}: {
  badge?: string;
  description: string;
  eyebrow: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  title: string;
}) {
  return (
    <section className="relative overflow-hidden bg-[var(--white)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_480px_at_82%_-10%,var(--blue-50),transparent_60%),radial-gradient(680px_420px_at_-5%_100%,var(--blue-50),transparent_55%)]"
      />
      <div className="pvz-container relative grid gap-10 py-[clamp(52px,8vw,108px)] lg:grid-cols-[1.02fr_.78fr] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="brand">{eyebrow}</Badge>
            {badge && <Badge tone="outline">{badge}</Badge>}
          </div>
          <h1 className="mt-5 max-w-4xl text-[length:var(--fs-display)] leading-[1.05]">{title}</h1>
          <p className="mt-5 max-w-2xl text-[length:var(--fs-lead)] leading-8 text-[var(--text-body)]">
            {description}
          </p>
          {(primaryCta || secondaryCta) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {primaryCta && (
                <Button asChild size="lg">
                  <Link href={primaryCta.href as Route}>
                    {primaryCta.label} <ArrowRight className="size-5" />
                  </Link>
                </Button>
              )}
              {secondaryCta && (
                <Button asChild size="lg" variant="outline">
                  <Link href={secondaryCta.href as Route}>{secondaryCta.label}</Link>
                </Button>
              )}
            </div>
          )}
        </div>
        <Card className="lg:ml-auto" padding="lg" variant="raised">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--brand-soft)] text-[var(--brand)]">
              <ShieldCheck className="size-6" />
            </span>
            <div className="min-w-0">
              <div className="font-display text-xl font-bold text-[var(--text-strong)]">Praktyczny zakres RODO</div>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                Łączymy dokumenty, decyzje prawne i operacyjne procedury, aby zgodność była możliwa do utrzymania po wdrożeniu.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {["art. 37 RODO i obowiązek IOD", "dokumentacja i dowody decyzji", "incydenty, żądania osób i dostawcy"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--surface-page)] p-3 text-sm font-medium text-[var(--text-body)]">
                <CheckCircle2 className="size-4 shrink-0 text-[var(--success)]" />
                <span className="min-w-0">{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

export function PublicSection({
  children,
  className,
  description,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  description?: string;
  eyebrow?: string;
  title?: string;
}) {
  return (
    <section className={cn("pvz-section", className)}>
      <div className="pvz-container">
        {(eyebrow || title || description) && (
          <div className="mb-10 max-w-3xl">
            {eyebrow && <Badge tone="brand">{eyebrow}</Badge>}
            {title && <h2 className="mt-3 text-[length:var(--fs-h2)]">{title}</h2>}
            {description && <p className="mt-3 text-[length:var(--fs-lead)] leading-8 text-[var(--text-body)]">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function BulletCard({ children, tone = "plain" }: { children: React.ReactNode; tone?: "plain" | "brand" }) {
  return (
    <Card className={tone === "brand" ? "border-[var(--brand-border)] bg-[var(--brand-soft)]" : undefined} padding="md">
      <div className="flex min-w-0 gap-3 text-sm leading-6 text-[var(--text-body)]">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
        <span className="min-w-0">{children}</span>
      </div>
    </Card>
  );
}

export function ServiceCard({ service }: { service: PublicService }) {
  return (
    <Link href={service.path as Route} className="group block min-w-0">
      <Card interactive padding="lg" className="h-full">
        <Badge tone="brand">{service.badge}</Badge>
        <h3 className="mt-4 text-xl font-bold text-[var(--text-strong)]">{service.shortTitle}</h3>
        <p className="mt-2 line-clamp-4 text-sm leading-6 text-[var(--text-muted)]">{service.metaDescription}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-ink)]">
          Zobacz usługę <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </span>
      </Card>
    </Link>
  );
}

export function IndustryCard({ industry }: { industry: PublicIndustry }) {
  return (
    <Link href={industry.path as Route} className="group block min-w-0">
      <Card interactive padding="lg" className="h-full">
        <Badge tone="outline">{industry.badge}</Badge>
        <h3 className="mt-4 text-xl font-bold text-[var(--text-strong)]">{industry.shortTitle}</h3>
        <p className="mt-2 line-clamp-4 text-sm leading-6 text-[var(--text-muted)]">{industry.description}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-ink)]">
          Zobacz branżę <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </span>
      </Card>
    </Link>
  );
}

export function ProcessSteps({ steps }: { steps: PublicProcessStep[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <Card key={step.title} padding="md" className="relative overflow-hidden">
          <span className="absolute right-4 top-3 font-display text-5xl font-extrabold text-[var(--blue-100)]">
            {index + 1}
          </span>
          <div className="relative">
            <h3 className="pr-12 text-lg font-bold text-[var(--text-strong)]">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{step.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function FaqSection({ items }: { items: PublicFaq[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <details key={item.question} className="group rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-xs)]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-bold text-[var(--text-strong)]">
            {item.question}
            <ArrowRight className="size-4 shrink-0 text-[var(--brand)] transition group-open:rotate-90" />
          </summary>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function TrustSection() {
  const items = [
    { icon: Scale, title: "Prawo", text: "Dokumenty i rekomendacje oparte o RODO, praktykę UODO i polskie procesy firm." },
    { icon: ListChecks, title: "Operacje", text: "Procedury pisane tak, aby pracownicy wiedzieli, co zrobić w konkretnej sytuacji." },
    { icon: MessageCircle, title: "Stały kontakt", text: "Możesz zacząć od dokumentów, audytu albo checkera, a potem przejść do stałej obsługi." },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title} padding="lg">
            <span className="grid size-11 place-items-center rounded-[var(--radius-md)] bg-[var(--brand-soft)] text-[var(--brand)]">
              <Icon className="size-5" />
            </span>
            <h3 className="mt-4 text-xl font-bold text-[var(--text-strong)]">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{item.text}</p>
          </Card>
        );
      })}
    </div>
  );
}

export function CtaBand({
  description,
  primaryCta,
  secondaryCta,
  title,
}: {
  description: string;
  primaryCta: Cta;
  secondaryCta?: Cta;
  title: string;
}) {
  return (
    <section className="bg-[var(--brand)] py-12 text-[var(--text-on-brand)] lg:py-16">
      <div className="pvz-container flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-extrabold leading-tight text-white lg:text-4xl">{title}</h2>
          <p className="mt-3 text-base leading-7 text-white/85">{description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Button asChild size="lg" variant="soft">
            <Link href={primaryCta.href as Route}>{primaryCta.label}</Link>
          </Button>
          {secondaryCta && (
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/15 hover:text-white">
              <Link href={secondaryCta.href as Route}>{secondaryCta.label}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

export function LegalDisclaimer() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-4 text-sm leading-6 text-[var(--text-body)]">
      <strong className="text-[var(--text-strong)]">Informacja prawna: </strong>
      treści na stronie mają charakter ogólny i nie stanowią porady prawnej dla konkretnej sprawy. Ostateczna ocena zależy od procesów, danych, ról i skali działalności organizacji.
    </div>
  );
}

export function RelatedLinks({ links, title = "Powiązane materiały" }: { links: PublicLink[]; title?: string }) {
  if (links.length === 0) return null;

  return (
    <Card padding="lg" className="bg-[var(--surface-card)]">
      <h2 className="text-xl font-bold text-[var(--text-strong)]">{title}</h2>
      <div className="mt-5 grid gap-3">
        {links.map((link) => (
          <Link key={link.href} href={link.href as Route} className="group flex min-w-0 items-start justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-4 hover:border-[var(--brand-border)] hover:bg-[var(--brand-soft)]">
            <span className="min-w-0">
              <span className="block font-semibold text-[var(--text-strong)]">{link.label}</span>
              {link.description && <span className="mt-1 block text-sm leading-6 text-[var(--text-muted)]">{link.description}</span>}
            </span>
            <ArrowRight className="mt-1 size-4 shrink-0 text-[var(--brand)] transition group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </Card>
  );
}

export function Breadcrumbs({ items }: { items: PublicLink[] }) {
  return (
    <nav aria-label="Okruszki" className="bg-[var(--white)]">
      <ol className="pvz-container flex flex-wrap gap-2 py-4 text-sm text-[var(--text-muted)]">
        <li>
          <Link href="/" className="font-medium hover:text-[var(--brand-ink)]">
            Strona główna
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={`${item.href}-${index}`} className="flex min-w-0 items-center gap-2">
            <span>/</span>
            <Link href={item.href as Route} className="font-medium hover:text-[var(--brand-ink)]">
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PublicCatalogTeaser() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <RelatedLinks
        title="Najważniejsze usługi"
        links={publicServices.slice(0, 4).map((service) => ({
          label: service.shortTitle,
          href: service.path,
          description: service.metaDescription,
        }))}
      />
      <RelatedLinks
        title="Branże"
        links={publicIndustries.slice(0, 4).map((industry) => ({
          label: industry.shortTitle,
          href: industry.path,
          description: industry.metaDescription,
        }))}
      />
    </div>
  );
}

function PublicFooter() {
  const columns = [
    {
      title: "Usługi",
      icon: FileText,
      links: publicServices.map((service) => ({ label: service.shortTitle, href: service.path })),
    },
    {
      title: "Branże",
      icon: Landmark,
      links: publicIndustries.map((industry) => ({ label: industry.shortTitle, href: industry.path })),
    },
    {
      title: "Baza",
      icon: BookOpen,
      links: [
        { label: "Checker IOD", href: "/#checker" },
        { label: "Blog", href: "/blog" },
        { label: "Dokumenty", href: "/sklep/polityka-prywatnosci" },
        { label: "Kontakt", href: "mailto:kontakt@privazy.pl" },
      ],
    },
  ];

  return (
    <footer className="bg-[var(--gray-900)] text-white/70">
      <div className="pvz-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo tone="inverse" />
          <p className="mt-4 max-w-xs text-sm leading-6">
            RODO dla firm bez chaosu: checker IOD, dokumentacja, audyty, outsourcing i obsługa incydentów.
          </p>
          <Link href="/#checker" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-200 hover:text-white">
            Sprawdź obowiązek IOD <ArrowRight className="size-4" />
          </Link>
        </div>
        {columns.map((column) => {
          const Icon = column.icon;
          return (
            <div key={column.title}>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase text-white">
                <Icon className="size-4" />
                {column.title}
              </h3>
              <ul className="space-y-3 text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("mailto:") ? (
                      <a href={link.href} className="hover:text-white">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href as Route} className="hover:text-white">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="border-t border-white/10">
        <div className="pvz-container flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 PRIVAZY. Wszelkie prawa zastrzeżone.</span>
          <span>Treści mają charakter ogólny i nie stanowią porady prawnej.</span>
        </div>
      </div>
    </footer>
  );
}
