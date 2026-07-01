import Link from "next/link";
import type { Route } from "next";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Inbox,
  LayoutDashboard,
  ListTodo,
  MessageSquareText,
  Plus,
  Settings,
  ShieldCheck,
  ShoppingBag,
  UserRoundCheck,
} from "lucide-react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import type { ClientTimelineEventType } from "@prisma/client";
import type { UrlObject } from "url";

import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import type { PlatformOrganizationAccess } from "@/server/platform/permissions";
import {
  formatDateTime,
  statusLabel,
  timelineTypeLabel,
  toneForStatus,
  type PlatformTone,
} from "@/server/platform/data";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;
type ClientHref = Route | UrlObject;

type ClientPortalContext = {
  activeAccess: PlatformOrganizationAccess | null;
  actor: {
    email: string;
    name: string | null;
    role: string;
  };
  organizations: PlatformOrganizationAccess[];
};

type NavItem = {
  href: string;
  icon: IconComponent;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/platforma", icon: LayoutDashboard, label: "Start" },
  { href: "/platforma/dokumenty", icon: FileText, label: "Dokumenty" },
  { href: "/platforma/zamowienia", icon: ShoppingBag, label: "Zamowienia" },
  { href: "/platforma/naruszenia", icon: AlertTriangle, label: "Naruszenia" },
  { href: "/platforma/zadania-osob", icon: UserRoundCheck, label: "Zadania osob" },
  { href: "/platforma/wiadomosci", icon: MessageSquareText, label: "Wiadomosci" },
  { href: "/platforma/zadania", icon: ClipboardCheck, label: "Zadania" },
  { href: "/platforma/ustawienia", icon: Settings, label: "Ustawienia" },
];

const toneClass: Record<PlatformTone, string> = {
  brand: "border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand-ink)]",
  danger: "border-[var(--danger)]/20 bg-[var(--danger-soft)] text-[var(--red-600)]",
  neutral: "border-[var(--border-subtle)] bg-[var(--surface-sunken)] text-[var(--text-muted)]",
  outline: "border-[var(--border-default)] bg-transparent text-[var(--text-body)]",
  success: "border-[var(--success)]/20 bg-[var(--success-soft)] text-[var(--green-600)]",
  warning: "border-[var(--warning)]/20 bg-[var(--warning-soft)] text-[var(--amber-600)]",
};

const badgeTone: Record<PlatformTone, BadgeTone> = {
  brand: "brand",
  danger: "danger",
  neutral: "neutral",
  outline: "outline",
  success: "success",
  warning: "warning",
};

export function withOrg(href: string, organizationId?: string | null) {
  const [pathname, queryString] = href.split("?");
  const query = Object.fromEntries(new URLSearchParams(queryString ?? ""));
  if (organizationId) query.org = organizationId;

  return { pathname, query } satisfies UrlObject;
}

export function ClientPortalShell({
  activePath,
  children,
  context,
}: {
  activePath: string;
  children: ReactNode;
  context: ClientPortalContext;
}) {
  const activeOrganization = context.activeAccess?.organization;
  const activeOrganizationId = activeOrganization?.id;

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-strong)]">
      <header className="border-b border-[var(--border-subtle)] bg-[var(--surface-card)]">
        <div className="mx-auto flex w-full max-w-[var(--container-wide)] flex-col gap-4 px-[var(--gutter)] py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--brand)] text-white shadow-[var(--shadow-brand-sm)]">
              <ShieldCheck aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0">
              <Logo className="block text-[22px]" size="sm" />
              <p className="truncate text-sm text-[var(--text-muted)]">Platforma klienta</p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-3 lg:items-end">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Badge tone={context.activeAccess?.isInternal ? "brand" : "neutral"}>{context.activeAccess?.role ?? context.actor.role}</Badge>
              <span className="min-w-0 truncate text-sm font-medium text-[var(--text-body)]">{context.actor.name ?? context.actor.email}</span>
            </div>
            {activeOrganization && (
              <div className="flex min-w-0 items-center gap-2 text-sm text-[var(--text-muted)]">
                <Building2 aria-hidden="true" className="size-4 shrink-0 text-[var(--brand)]" />
                <span className="min-w-0 truncate">{activeOrganization.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[var(--container-wide)] px-[var(--gutter)] pb-4">
          <nav aria-label="Nawigacja platformy" className="pvz-h-scroll" data-responsive-scroll="true">
            <div className="flex min-w-max gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activePath === item.href || (item.href !== "/platforma" && activePath.startsWith(item.href));

                return (
                  <Link
                    className={cn(
                      "inline-flex h-10 items-center gap-2 rounded-[var(--radius-md)] border px-3 text-sm font-semibold transition-colors",
                      active
                        ? "border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand-ink)]"
                        : "border-transparent text-[var(--text-body)] hover:border-[var(--border-subtle)] hover:bg-[var(--surface-sunken)]",
                    )}
                    href={withOrg(item.href, activeOrganizationId)}
                    key={item.href}
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      {context.organizations.length > 1 && (
        <section className="border-b border-[var(--border-subtle)] bg-[var(--surface-card)]">
          <div className="mx-auto w-full max-w-[var(--container-wide)] px-[var(--gutter)] py-3">
            <div className="pvz-h-scroll" data-responsive-scroll="true">
              <div className="flex min-w-max items-center gap-2">
                <span className="pr-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Organizacja</span>
                {context.organizations.map((access) => {
                  const active = access.organization.id === activeOrganizationId;
                  return (
                    <Link
                      className={cn(
                        "inline-flex h-9 items-center gap-2 rounded-[var(--radius-pill)] border px-3 text-sm font-semibold",
                        active
                          ? "border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand-ink)]"
                          : "border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-body)] hover:bg-[var(--surface-sunken)]",
                      )}
                      href={withOrg("/platforma", access.organization.id)}
                      key={access.organization.id}
                    >
                      {access.organization.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <main className="mx-auto flex w-full max-w-[var(--container-wide)] flex-col gap-6 px-[var(--gutter)] py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}

export function ClientPortalAccessDenied() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--surface-page)] px-[var(--gutter)] py-12 text-[var(--text-strong)]">
      <Card className="w-full max-w-[520px] text-center" padding="lg">
        <div className="mx-auto mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-[var(--fs-h2)] font-bold">Platforma wymaga logowania</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
          Zaloguj sie kontem klienta albo kontem zespolu PRIVAZY z dostepem do organizacji. Dane organizacji nie sa pobierane bez sesji.
        </p>
        <Button asChild className="mt-6">
          <Link href={{ pathname: "/api/auth/signin", query: { callbackUrl: "/platforma" } }} prefetch={false}>
            <ShieldCheck aria-hidden="true" />
            Zaloguj sie
          </Link>
        </Button>
      </Card>
    </main>
  );
}

export function ClientPortalNoOrganization({ context }: { context: ClientPortalContext }) {
  return (
    <ClientPortalShell activePath="/platforma" context={context}>
      <ClientEmptyState
        actionHref="/"
        actionLabel="Wroc na strone glowna"
        icon={Building2}
        title="Brak przypisanej organizacji"
      >
        Konto jest zalogowane, ale nie ma profilu klienta ani wewnetrznego dostepu do organizacji. Dodaj profil klienta w CRM albo wybierz konto
        z uprawnieniami.
      </ClientEmptyState>
    </ClientPortalShell>
  );
}

export function ClientPageHeader({
  action,
  eyebrow,
  subtitle,
  title,
}: {
  action?: ReactNode;
  eyebrow?: string;
  subtitle?: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--brand)]">{eyebrow}</p>}
        <h1 className="text-[var(--fs-h2)] font-bold">{title}</h1>
        {subtitle && <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
    </div>
  );
}

export function ClientBackLink({ href }: { href: ClientHref }) {
  return (
    <Button asChild size="sm" variant="ghost">
      <Link href={href}>
        <ArrowLeft aria-hidden="true" />
        Wroc
      </Link>
    </Button>
  );
}

export function ClientMetricGrid({
  items,
  organizationId,
}: {
  items: Array<{ href: string; label: string; tone: PlatformTone; value: number | string }>;
  organizationId?: string | null;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
      {items.map((item) => (
        <Link
          className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-xs)] transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          href={withOrg(item.href, organizationId)}
          key={item.label}
        >
          <div className={cn("mb-4 inline-flex size-9 items-center justify-center rounded-[var(--radius-sm)] border", toneClass[item.tone])}>
            <ListTodo aria-hidden="true" className="size-5" />
          </div>
          <div className="text-2xl font-bold leading-none text-[var(--text-strong)]">{item.value}</div>
          <div className="mt-2 min-h-10 text-sm leading-snug text-[var(--text-muted)]">{item.label}</div>
        </Link>
      ))}
    </div>
  );
}

export function ClientStatusBadge({ status, tone }: { status: string; tone?: PlatformTone }) {
  const resolvedTone = tone ?? toneForStatus(status);
  return (
    <Badge dot tone={badgeTone[resolvedTone]}>
      {statusLabel(status)}
    </Badge>
  );
}

export function ClientEmptyState({
  actionHref,
  actionLabel,
  children,
  icon: Icon = Inbox,
  title,
}: {
  actionHref?: ClientHref;
  actionLabel?: string;
  children: ReactNode;
  icon?: IconComponent;
  title: string;
}) {
  return (
    <Card className="text-center" padding="lg" variant="flat">
      <div className="mx-auto grid size-12 place-items-center rounded-[var(--radius-lg)] border border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand-ink)]">
        <Icon aria-hidden="true" className="size-6" />
      </div>
      <h2 className="mt-4 text-xl font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">{children}</p>
      {actionHref && actionLabel && (
        <Button asChild className="mt-5" variant="soft">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </Card>
  );
}

export function ClientRecordList({
  children,
  empty,
}: {
  children: ReactNode;
  empty: ReactNode;
}) {
  return <div className="grid gap-3">{children || empty}</div>;
}

export function ClientRecordCard({
  action,
  children,
  href,
  meta,
  status,
  title,
}: {
  action?: ReactNode;
  children?: ReactNode;
  href?: ClientHref;
  meta?: ReactNode;
  status?: ReactNode;
  title: ReactNode;
}) {
  const body = (
    <Card as="article" className="min-w-0" padding="md" variant="flat">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-bold leading-snug text-[var(--text-strong)]">{title}</h2>
          {meta && <div className="mt-2 flex flex-wrap gap-2 text-sm text-[var(--text-muted)]">{meta}</div>}
        </div>
        {(status || action) && (
          <div className="flex shrink-0 flex-wrap gap-2">
            {status}
            {action}
          </div>
        )}
      </div>
      {children && <div className="mt-4 text-sm leading-6 text-[var(--text-body)]">{children}</div>}
    </Card>
  );

  if (!href) return body;

  return (
    <Link className="block rounded-[var(--radius-lg)] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]" href={href}>
      {body}
    </Link>
  );
}

export function ClientDetailGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">{children}</div>;
}

export function ClientInfoPanel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <Card padding="md" variant="flat">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-4 grid gap-3">{children}</div>
    </Card>
  );
}

export function ClientKeyValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-[var(--border-subtle)] pb-3 last:border-b-0 last:pb-0">
      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{label}</dt>
      <dd className="min-w-0 text-sm font-medium text-[var(--text-strong)]">{value}</dd>
    </div>
  );
}

export function ClientTimeline({
  events,
}: {
  events: Array<{
    actor?: { email: string; name: string | null } | null;
    body?: string | null;
    createdAt: Date;
    id: string;
    title: string;
    type: ClientTimelineEventType;
  }>;
}) {
  if (events.length === 0) {
    return <ClientEmptyState title="Brak zdarzen">Zdarzenia pojawia sie po wyslaniu formularza, pobraniu dokumentu albo kontakcie z zespolem.</ClientEmptyState>;
  }

  return (
    <div className="grid gap-3">
      {events.map((event) => (
        <Card as="article" key={event.id} padding="sm" variant="flat">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand-ink)]">
              <CheckCircle2 aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="outline">{timelineTypeLabel(event.type)}</Badge>
                <span className="text-xs font-medium text-[var(--text-muted)]">{formatDateTime(event.createdAt)}</span>
              </div>
              <h3 className="mt-2 text-sm font-bold text-[var(--text-strong)]">{event.title}</h3>
              {event.body && <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{event.body}</p>}
              {event.actor && <p className="mt-2 text-xs text-[var(--text-faint)]">{event.actor.name ?? event.actor.email}</p>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ClientDownloadLinks({ formats }: { formats: Array<{ available: boolean; href: string; label: string }> }) {
  const available = formats.filter((format) => format.available);

  if (available.length === 0) {
    return <Badge tone="warning">Brak pliku</Badge>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {available.map((format) => (
        <Button asChild key={format.label} size="sm" variant="outline">
          <Link href={withOrg(format.href)}>
            <FileText aria-hidden="true" />
            {format.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}

export function ClientPrimaryAction({
  href,
  label,
}: {
  href: ClientHref;
  label: string;
}) {
  return (
    <Button asChild>
      <Link href={href}>
        <Plus aria-hidden="true" />
        {label}
      </Link>
    </Button>
  );
}
