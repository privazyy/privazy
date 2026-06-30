"use client";

import * as Lucide from "lucide-react";
import { useState, type ComponentType, type SVGProps } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import {
  navGroups,
  routeAliases,
  type CrmDatabaseData,
  type CrmListModule,
  type CrmRoute,
  type GenericModule,
  type Kpi,
  type TableRow,
  type Tone,
} from "./crm-data";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const iconMap = Lucide as unknown as Record<string, IconComponent>;
const detailRoutes = new Set<CrmRoute>([
  "lead-detail",
  "client-detail",
  "doc-review",
  "breach-detail",
  "request-detail",
  "outsourcing-detail",
  "product-editor",
  "blog-editor",
]);

const filters = ["Wszystkie", "Aktywne", "Pilne", "Moje", "Do akceptacji"];

function CrmIcon({ className, name }: { className?: string; name: string }) {
  const Icon = iconMap[name] ?? iconMap.Circle;
  return <Icon aria-hidden="true" className={className} />;
}

function initials(value: string) {
  return value
    .split(/\s+|-/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function toneBox(tone: Tone) {
  return {
    brand: "border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand-ink)]",
    danger: "border-[var(--danger)]/20 bg-[var(--danger-soft)] text-[var(--red-600)]",
    neutral: "border-[var(--border-subtle)] bg-[var(--surface-sunken)] text-[var(--text-muted)]",
    outline: "border-[var(--border-default)] bg-transparent text-[var(--text-body)]",
    success: "border-[var(--success)]/20 bg-[var(--success-soft)] text-[var(--green-600)]",
    warning: "border-[var(--warning)]/20 bg-[var(--warning-soft)] text-[var(--amber-600)]",
  }[tone];
}

function ShellButton({
  active,
  children,
  collapsed,
  icon,
  onClick,
  title,
}: {
  active?: boolean;
  children: React.ReactNode;
  collapsed?: boolean;
  icon: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "relative flex h-10 w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 text-left text-sm font-medium transition-colors",
        active
          ? "bg-[color-mix(in_srgb,var(--brand)_16%,transparent)] text-white shadow-[inset_2px_0_0_var(--brand)]"
          : "text-slate-300 hover:bg-white/7 hover:text-white",
        collapsed && "justify-center px-0",
      )}
    >
      <CrmIcon className={cn("size-5 shrink-0", active ? "text-[var(--blue-300)]" : "text-slate-400")} name={icon} />
      {!collapsed && <span className="min-w-0 flex-1 truncate">{children}</span>}
    </button>
  );
}

function Sidebar({
  collapsed,
  onCollapse,
  onRoute,
  route,
}: {
  collapsed: boolean;
  onCollapse: () => void;
  onRoute: (route: CrmRoute) => void;
  route: CrmRoute;
}) {
  const activeRoute = routeAliases[route] ?? route;

  return (
    <aside
      className="flex h-full min-h-0 flex-col bg-[var(--surface-inverse)] text-slate-300"
      style={{ width: collapsed ? 76 : 248 }}
    >
      <div className={cn("flex h-[60px] shrink-0 items-center gap-3 border-b border-white/10 px-4", collapsed && "justify-center px-0")}>
        <span className="grid size-8 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--brand)] text-white shadow-[var(--shadow-brand-sm)]">
          <CrmIcon className="size-5" name="ShieldCheck" />
        </span>
        {!collapsed && (
          <div className="min-w-0 leading-none">
            <Logo className="text-[17px]" size="sm" tone="inverse" />
            <div className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">CRM Operations</div>
          </div>
        )}
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {navGroups.map((group, groupIndex) => (
          <div className="mb-4" key={`${group.label ?? "main"}-${groupIndex}`}>
            {group.label && !collapsed && (
              <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">{group.label}</div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <div className="relative" key={item.route}>
                  <ShellButton
                    active={activeRoute === item.route}
                    collapsed={collapsed}
                    icon={item.icon}
                    onClick={() => onRoute(item.route)}
                    title={item.label}
                  >
                    {item.label}
                  </ShellButton>
                  {item.badge && !collapsed && (
                    <span className="pointer-events-none absolute right-2 top-2 rounded-[var(--radius-pill)] bg-[var(--brand)] px-2 py-0.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <ShellButton collapsed={collapsed} icon={collapsed ? "PanelLeftOpen" : "PanelLeftClose"} onClick={onCollapse} title="Zwiń panel">
          Zwiń panel
        </ShellButton>
      </div>
    </aside>
  );
}

function KpiCard({ kpi, onRoute }: { kpi: Kpi; onRoute?: (route: CrmRoute) => void }) {
  return (
    <button
      type="button"
      onClick={() => kpi.route && onRoute?.(kpi.route)}
      className="pvz-crm-card-hover min-w-0 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 text-left shadow-[var(--shadow-xs)] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)] border", toneBox(kpi.tone))}>
          <CrmIcon className="size-5" name={kpi.icon} />
        </span>
        {kpi.delta && <span className={cn("rounded-[var(--radius-pill)] px-2 py-1 text-xs font-semibold", toneBox(kpi.tone))}>{kpi.delta}</span>}
      </div>
      <div className="mt-4 text-2xl font-bold leading-none text-[var(--text-strong)]">{kpi.value}</div>
      <div className="mt-2 min-h-10 text-sm leading-snug text-[var(--text-muted)]">{kpi.label}</div>
    </button>
  );
}

function KpiGrid({ items, onRoute }: { items: Kpi[]; onRoute?: (route: CrmRoute) => void }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
      {items.map((item) => (
        <KpiCard key={`${item.label}-${item.value}`} kpi={item} onRoute={onRoute} />
      ))}
    </div>
  );
}

function ModuleHeader({
  action,
  icon,
  onBack,
  onPrimary,
  subtitle,
  title,
}: {
  action?: string;
  icon: string;
  onBack?: () => void;
  onPrimary?: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {onBack && (
          <Button className="mb-4" size="sm" type="button" variant="ghost" onClick={onBack}>
            <CrmIcon name="ArrowLeft" />
            Wróć
          </Button>
        )}
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--brand-soft)] text-[var(--brand-ink)]">
            <CrmIcon className="size-5" name={icon} />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold leading-tight text-[var(--text-strong)] sm:text-[26px]">{title}</h1>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[var(--text-muted)]">{subtitle}</p>
          </div>
        </div>
      </div>
      {action && (
        <Button type="button" onClick={onPrimary}>
          <CrmIcon name="Plus" />
          {action}
        </Button>
      )}
    </div>
  );
}

function FilterBar({ labels = filters }: { labels?: string[] }) {
  return (
    <div className="pvz-h-scroll" data-responsive-scroll="true">
      <div className="flex min-w-max gap-2 pb-1">
        {labels.map((label, index) => (
          <button
            className={cn(
              "h-9 rounded-[var(--radius-pill)] border px-4 text-sm font-semibold transition-colors",
              index === 0
                ? "border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand-ink)]"
                : "border-transparent text-[var(--text-muted)] hover:bg-[var(--surface-card)] hover:text-[var(--text-strong)]",
            )}
            key={label}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DataTable({
  columns,
  emptyMessage = "Brak rekordów w bazie danych.",
  onRoute,
  rows,
}: {
  columns: string[];
  emptyMessage?: string;
  onRoute?: (route: CrmRoute, row?: TableRow) => void;
  rows: TableRow[];
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 text-center">
        <span className="mx-auto grid size-11 place-items-center rounded-[var(--radius-md)] bg-[var(--surface-sunken)] text-[var(--text-muted)]">
          <CrmIcon className="size-5" name="Database" />
        </span>
        <h3 className="mt-4 text-base font-bold text-[var(--text-strong)]">Brak danych</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="pvz-h-scroll rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)]" data-responsive-scroll="true">
      <table className="min-w-[920px] w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-sunken)]">
            {columns.map((column) => (
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.06em] text-[var(--text-muted)]" key={column}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              className="pvz-crm-row border-b border-[var(--border-subtle)] last:border-b-0"
              key={`${row.primary}-${rowIndex}`}
            >
              <td className="px-4 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-xs font-bold text-[var(--brand-ink)]">
                    {row.avatar ?? initials(row.primary)}
                  </span>
                  <div className="min-w-0">
                    <button
                      type="button"
                      className={cn(
                        "max-w-[280px] truncate text-left font-semibold text-[var(--text-strong)] hover:text-[var(--brand-ink)]",
                        row.actionRoute && "cursor-pointer",
                      )}
                      onClick={() => row.actionRoute && onRoute?.(row.actionRoute, row)}
                    >
                      {row.primary}
                    </button>
                    {row.secondary && <div className="mt-1 max-w-[300px] truncate text-xs text-[var(--text-muted)]">{row.secondary}</div>}
                  </div>
                </div>
              </td>
              {columns.slice(1).map((column, index) => {
                const cell = row.cells[index] ?? "";
                const isStatus = row.status && cell === row.status.label;
                const isTag = row.tag && cell === row.tag.label;

                return (
                  <td className="px-4 py-4 text-[var(--text-body)]" key={`${row.primary}-${column}`}>
                    {isStatus && row.status ? (
                      <Badge dot tone={row.status.tone}>
                        {row.status.label}
                      </Badge>
                    ) : isTag && row.tag ? (
                      <Badge tone={row.tag.tone}>{row.tag.label}</Badge>
                    ) : column === "" ? (
                      <IconButton label="Więcej" size="sm" variant="ghost">
                        <CrmIcon name="MoreHorizontal" />
                      </IconButton>
                    ) : (
                      <span className="block max-w-[190px] truncate">{cell}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GenericModuleView({ module, onRoute }: { module: GenericModule; onRoute: (route: CrmRoute, row?: TableRow) => void }) {
  return (
    <div className="space-y-5">
      <ModuleHeader action={module.action} icon={module.icon} subtitle={module.subtitle} title={module.title} />
      <KpiGrid items={module.kpis} onRoute={onRoute} />
      <Card padding="md" variant="flat">
        <div className="space-y-4">
          <FilterBar labels={module.filters.map((filter) => filter.label)} />
          <DataTable columns={module.columns} emptyMessage={module.emptyMessage} onRoute={onRoute} rows={module.rows} />
        </div>
      </Card>
    </div>
  );
}

function Dashboard({ data, onRoute }: { data: CrmDatabaseData["dashboard"]; onRoute: (route: CrmRoute) => void }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)]">Poniedziałek, 29 czerwca - Centrum operacyjne</p>
          <h1 className="mt-1 text-2xl font-extrabold text-[var(--text-strong)] sm:text-[26px]">Dzień dobry, Anna</h1>
        </div>
        <FilterBar labels={["Ogólny", "Sprzedaż", "IOD", "Dokumenty", "Księgowość"]} />
      </div>

      <KpiGrid items={data.kpis} onRoute={onRoute} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <Card padding="md" variant="flat">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[var(--text-strong)]">Alerty operacyjne</h2>
            <Badge tone="warning">5 pilnych</Badge>
          </div>
          <div className="space-y-3">
            {data.alerts.length === 0 ? (
              <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-4 text-sm text-[var(--text-muted)]">
                Brak alertów operacyjnych w aktualnym stanie bazy.
              </div>
            ) : data.alerts.map((alert) => (
              <button
                className="pvz-crm-hover flex w-full min-w-0 items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-3 text-left"
                key={alert.title}
                type="button"
                onClick={() => onRoute(alert.route)}
              >
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-[var(--radius-sm)] border", toneBox(alert.tone))}>
                  <CrmIcon className="size-5" name={alert.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-[var(--text-strong)]">{alert.title}</span>
                  <span className="mt-1 block text-sm text-[var(--text-muted)]">{alert.subtitle}</span>
                </span>
                <Badge tone={alert.tone}>{alert.tag}</Badge>
              </button>
            ))}
          </div>
        </Card>

        <Card padding="md" variant="flat">
          <h2 className="text-lg font-bold text-[var(--text-strong)]">Lejek sprzedaży</h2>
          <div className="mt-4 space-y-3">
            {data.funnel.map(([label, value, width]) => (
              <div key={label}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="text-[var(--text-body)]">{label}</span>
                  <span className="font-semibold text-[var(--text-strong)]">{value}</span>
                </div>
                <div className="h-2 rounded-[var(--radius-pill)] bg-[var(--surface-sunken)]">
                  <div className="h-full rounded-[var(--radius-pill)] bg-[var(--brand)]" style={{ width }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-1" padding="md" variant="flat">
          <h2 className="text-lg font-bold text-[var(--text-strong)]">Przychód według usług</h2>
          <div className="mt-4 space-y-3">
            {data.revenueBars.map(([label, width]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between gap-3 text-sm">
                  <span>{label}</span>
                  <span className="font-semibold text-[var(--text-strong)]">{width}</span>
                </div>
                <div className="h-2 rounded-[var(--radius-pill)] bg-[var(--surface-sunken)]">
                  <div className="h-full rounded-[var(--radius-pill)] bg-[var(--brand)]" style={{ width }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md" variant="flat">
          <h2 className="text-lg font-bold text-[var(--text-strong)]">Zadania na dziś</h2>
          <div className="mt-4 space-y-3">
            {data.todos.length === 0 ? (
              <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-4 text-sm text-[var(--text-muted)]">
                Brak pilnych zadań wyliczonych z bazy.
              </div>
            ) : data.todos.map(({ due, tag, title, tone }) => (
              <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-3" key={title}>
                <div className="font-semibold text-[var(--text-strong)]">{title}</div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <Badge tone={tone}>{tag}</Badge>
                  <span className="text-xs font-semibold text-[var(--text-muted)]">{due}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md" variant="flat">
          <h2 className="text-lg font-bold text-[var(--text-strong)]">Aktywność</h2>
          <div className="mt-4 space-y-3">
            {data.activity.length === 0 ? (
              <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-4 text-sm text-[var(--text-muted)]">
                Brak ostatniej aktywności w bazie.
              </div>
            ) : data.activity.map((item) => (
              <div className="flex gap-3" key={`${item.title}-${item.when}`}>
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)] border", toneBox(item.tone))}>
                  <CrmIcon className="size-4" name={item.icon} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-[var(--text-body)]">
                    <span className="font-semibold text-[var(--text-strong)]">{item.title}</span> {item.subtitle}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{item.when}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function LeadModule({
  data,
  leadView,
  onRoute,
  setLeadView,
}: {
  data: CrmListModule;
  leadView: "list" | "kanban";
  onRoute: (route: CrmRoute, row?: TableRow) => void;
  setLeadView: (view: "list" | "kanban") => void;
}) {
  const rows = data.rows;
  const groups = Array.from(new Set(["Nowy", "Do kontaktu", "Skontaktowano", "Zakwalifikowany", "Oferta wysłana", "Decyzja", ...rows.map((row) => row.status?.label ?? "Bez statusu")]));

  return (
    <div className="space-y-5">
      <ModuleHeader action={data.action} icon={data.icon} subtitle={data.subtitle} title={data.title} />
      {data.kpis && <KpiGrid items={data.kpis} />}
      <Card padding="md" variant="flat">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <FilterBar labels={["Wszystkie", "Gorące leady", "Po checkerze", "Z koszyka", "Bez kontaktu >24h", "Moje"]} />
          <div className="grid w-full grid-cols-2 rounded-[var(--radius-md)] bg-[var(--surface-sunken)] p-1 sm:w-[220px]">
            {(["list", "kanban"] as const).map((view) => (
              <button
                className={cn("h-8 rounded-[var(--radius-sm)] text-sm font-semibold", leadView === view ? "bg-[var(--surface-card)] text-[var(--text-strong)] shadow-[var(--shadow-xs)]" : "text-[var(--text-muted)]")}
                key={view}
                type="button"
                onClick={() => setLeadView(view)}
              >
                {view === "list" ? "Lista" : "Kanban"}
              </button>
            ))}
          </div>
        </div>
        {leadView === "list" ? (
          <DataTable columns={data.columns} emptyMessage={data.emptyMessage} onRoute={onRoute} rows={rows} />
        ) : (
          <div className="pvz-h-scroll" data-responsive-scroll="true">
            <div className="grid min-w-[980px] grid-cols-6 gap-3">
              {groups.map((group) => (
                <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-3" key={group}>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-[var(--text-strong)]">{group}</h3>
                    <Badge tone="neutral">{rows.filter((row) => (row.status?.label ?? "Bez statusu") === group).length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {rows
                      .filter((row) => (row.status?.label ?? "Bez statusu") === group)
                      .map((row) => (
                        <button
                          className="w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 text-left shadow-[var(--shadow-xs)]"
                          key={row.primary}
                          type="button"
                          onClick={() => onRoute("lead-detail", row)}
                        >
                          <div className="font-semibold text-[var(--text-strong)]">{row.primary}</div>
                          <div className="mt-1 text-xs text-[var(--text-muted)]">{row.secondary ?? row.cells[0]}</div>
                          <div className="mt-3 flex items-center justify-between gap-2">
                            {row.tag && <Badge tone={row.tag.tone}>{row.tag.label}</Badge>}
                            <span className="text-xs font-semibold text-[var(--text-muted)]">{row.cells[row.cells.length - 2] ?? ""}</span>
                          </div>
                        </button>
                      ))}
                    {rows.filter((row) => (row.status?.label ?? "Bez statusu") === group).length === 0 && (
                      <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-subtle)] p-3 text-center text-xs text-[var(--text-muted)]">
                        Brak rekordów
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function DetailScaffold({
  back,
  children,
  icon,
  subtitle,
  title,
}: {
  back: () => void;
  children: React.ReactNode;
  icon: string;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="space-y-5">
      <ModuleHeader icon={icon} onBack={back} subtitle={subtitle} title={title} />
      {children}
    </div>
  );
}

function MissingRecordDetail({ icon, onBack, title }: { icon: string; onBack: () => void; title: string }) {
  return (
    <DetailScaffold back={onBack} icon={icon} subtitle="Wybierz rekord z tabeli, aby zobaczy? szczeg??y z bazy danych." title={title}>
      <Card padding="md" variant="flat">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-8 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-[var(--radius-md)] bg-[var(--surface-card)] text-[var(--text-muted)]">
            <CrmIcon className="size-5" name="Database" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-[var(--text-strong)]">Brak wybranego rekordu</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
            Ten widok nie pokazuje danych demonstracyjnych. Wr?? do tabeli i otw?rz rekord pobrany z bazy.
          </p>
        </div>
      </Card>
    </DetailScaffold>
  );
}

function RecordDetail({
  backLabel,
  columns,
  icon,
  onBack,
  record,
  title,
}: {
  backLabel: string;
  columns: string[];
  icon: string;
  onBack: () => void;
  record: TableRow;
  title: string;
}) {
  const values = columns.slice(1).map((column, index) => ({
    label: column || "Akcja",
    value: record.cells[index] || "-",
  }));

  return (
    <DetailScaffold back={onBack} icon={icon} subtitle={record.secondary ?? "Rekord z bazy danych"} title={record.primary}>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card padding="md" variant="flat">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[var(--text-strong)]">{title}</h2>
            {record.status && <Badge tone={record.status.tone}>{record.status.label}</Badge>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {values.map(({ label, value }) => (
              <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-4" key={label}>
                <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{label}</div>
                <div className="mt-2 break-words font-semibold text-[var(--text-strong)]">{value}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card padding="md" variant="flat">
          <h2 className="text-lg font-bold text-[var(--text-strong)]">Źródło</h2>
          <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-4 text-sm leading-relaxed text-[var(--text-body)]">
            Ten widok korzysta z rekordu wybranego w tabeli CRM. Dane pochodzą z serwerowego payloadu Prisma pobranego dla route `/admin`.
          </div>
          <Button className="mt-4 w-full" type="button" variant="outline" onClick={onBack}>
            {backLabel}
          </Button>
        </Card>
      </div>
    </DetailScaffold>
  );
}

function SimpleListModule({
  action,
  columns,
  emptyMessage,
  icon,
  kpis,
  onAction,
  onRoute,
  rows,
  subtitle,
  title,
}: {
  action: string;
  columns: string[];
  emptyMessage?: string;
  icon: string;
  kpis?: Kpi[];
  onAction?: () => void;
  onRoute?: (route: CrmRoute, row?: TableRow) => void;
  rows: TableRow[];
  subtitle: string;
  title: string;
}) {
  return (
    <div className="space-y-5">
      <ModuleHeader action={action} icon={icon} onPrimary={onAction} subtitle={subtitle} title={title} />
      {kpis && <KpiGrid items={kpis} />}
      <Card padding="md" variant="flat">
        <div className="space-y-4">
          <FilterBar />
          <DataTable columns={columns} emptyMessage={emptyMessage} onRoute={onRoute} rows={rows} />
        </div>
      </Card>
    </div>
  );
}

function PlatformModule({ data, onPreview }: { data: CrmListModule; onPreview: () => void }) {
  return (
    <SimpleListModule
      action={data.action}
      columns={data.columns}
      emptyMessage={data.emptyMessage}
      icon={data.icon}
      kpis={data.kpis}
      onAction={onPreview}
      rows={data.rows}
      subtitle={data.subtitle}
      title={data.title}
    />
  );
}

export function PrivazyCrm({ data }: { data: CrmDatabaseData }) {
  const [route, setRoute] = useState<CrmRoute>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [showSla, setShowSla] = useState(true);
  const [leadView, setLeadView] = useState<"list" | "kanban">("list");
  const [platformPreview, setPlatformPreview] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);

  const setRouteAndClose = (nextRoute: CrmRoute, row?: TableRow) => {
    setRoute(nextRoute);
    setSelectedRow(row ?? null);
    setMobileOpen(false);
    setAddOpen(false);
    setNotifOpen(false);
    setCmdOpen(false);
  };

  const content = (() => {
    const listRoutes: Partial<Record<CrmRoute, CrmListModule>> = {
      accounting: data.lists.accounting,
      blog: data.lists.blog,
      breaches: data.lists.breaches,
      clients: data.lists.clients,
      documents: data.lists.documents,
      newsletter: data.lists.newsletter,
      outsourcing: data.lists.outsourcing,
      products: data.lists.products,
      requests: data.lists.requests,
    };

    if (route === "dashboard") return <Dashboard data={data.dashboard} onRoute={setRouteAndClose} />;
    if (route === "leads") return <LeadModule data={data.lists.leads} leadView={leadView} onRoute={setRouteAndClose} setLeadView={setLeadView} />;
    if (route === "lead-detail" && selectedRow) return <RecordDetail backLabel="Wróć do leadów" columns={data.lists.leads.columns} icon="UserPlus" onBack={() => setRouteAndClose("leads")} record={selectedRow} title="Szczegóły leada" />;
    if (route === "client-detail" && selectedRow) return <RecordDetail backLabel="Wróć do klientów" columns={data.lists.clients.columns} icon="Building2" onBack={() => setRouteAndClose("clients")} record={selectedRow} title="Szczegóły klienta" />;
    if (route === "doc-review" && selectedRow) return <RecordDetail backLabel="Wróć do dokumentów" columns={data.lists.documents.columns} icon="FileSearch" onBack={() => setRouteAndClose("documents")} record={selectedRow} title="Szczegóły dokumentu" />;
    if (route === "breach-detail" && selectedRow) return <RecordDetail backLabel="Wróć do naruszeń" columns={data.lists.breaches.columns} icon="TriangleAlert" onBack={() => setRouteAndClose("breaches")} record={selectedRow} title="Szczegóły naruszenia" />;
    if (route === "request-detail" && selectedRow) return <RecordDetail backLabel="Wróć do żądań" columns={data.lists.requests.columns} icon="UserCog" onBack={() => setRouteAndClose("requests")} record={selectedRow} title="Szczegóły żądania" />;
    if (route === "outsourcing-detail" && selectedRow) return <RecordDetail backLabel="Wróć do outsourcingu" columns={data.lists.outsourcing.columns} icon="ShieldCheck" onBack={() => setRouteAndClose("outsourcing")} record={selectedRow} title="Szczegóły abonamentu" />;
    if (route === "product-editor" && selectedRow) return <RecordDetail backLabel="Wróć do produktów" columns={data.lists.products.columns} icon="Tag" onBack={() => setRouteAndClose("products")} record={selectedRow} title="Szczegóły produktu" />;
    if (route === "blog-editor" && selectedRow) return <RecordDetail backLabel="Wróć do bloga" columns={data.lists.blog.columns} icon="Newspaper" onBack={() => setRouteAndClose("blog")} record={selectedRow} title="Szczegóły wpisu" />;
    if (route === "lead-detail") return <MissingRecordDetail icon="UserPlus" onBack={() => setRouteAndClose("leads")} title="Szczegóły leada" />;
    if (route === "client-detail") return <MissingRecordDetail icon="Building2" onBack={() => setRouteAndClose("clients")} title="Szczegóły klienta" />;
    if (route === "doc-review") return <MissingRecordDetail icon="FileSearch" onBack={() => setRouteAndClose("documents")} title="Szczegóły dokumentu" />;
    if (route === "breach-detail") return <MissingRecordDetail icon="TriangleAlert" onBack={() => setRouteAndClose("breaches")} title="Szczegóły naruszenia" />;
    if (route === "request-detail") return <MissingRecordDetail icon="UserCog" onBack={() => setRouteAndClose("requests")} title="Szczegóły żądania" />;
    if (route === "outsourcing-detail") return <MissingRecordDetail icon="ShieldCheck" onBack={() => setRouteAndClose("outsourcing")} title="Szczegóły abonamentu" />;
    if (route === "product-editor") return <MissingRecordDetail icon="Tag" onBack={() => setRouteAndClose("products")} title="Szczegóły produktu" />;
    if (route === "blog-editor") return <MissingRecordDetail icon="Newspaper" onBack={() => setRouteAndClose("blog")} title="Szczegóły wpisu" />;
    if (route === "platform") return <PlatformModule data={data.lists.platform} onPreview={() => setPlatformPreview(true)} />;

    const list = listRoutes[route];
    if (list) {
      return (
        <SimpleListModule
          action={list.action}
          columns={list.columns}
          emptyMessage={list.emptyMessage}
          icon={list.icon}
          kpis={list.kpis}
          onRoute={setRouteAndClose}
          rows={list.rows}
          subtitle={list.subtitle}
          title={list.title}
        />
      );
    }

    const crmModule = data.modules[route];
    if (crmModule) return <GenericModuleView module={crmModule} onRoute={setRouteAndClose} />;

    return <Dashboard data={data.dashboard} onRoute={setRouteAndClose} />;
  })();

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-body)]">
      <div className="flex min-h-screen w-full overflow-x-clip">
        <div className="hidden lg:block">
          <Sidebar collapsed={collapsed} onCollapse={() => setCollapsed((value) => !value)} onRoute={setRouteAndClose} route={route} />
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button className="absolute inset-0 bg-[var(--gray-900)]/40" type="button" aria-label="Zamknij menu" onClick={() => setMobileOpen(false)} />
            <div className="relative h-full w-[min(86vw,320px)]">
              <Sidebar collapsed={false} onCollapse={() => setMobileOpen(false)} onRoute={setRouteAndClose} route={route} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex min-h-[60px] items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 lg:px-6">
            <IconButton className="lg:hidden" label="Otwórz menu" onClick={() => setMobileOpen(true)}>
              <CrmIcon name="Menu" />
            </IconButton>
            <button
              className="hidden h-10 min-w-0 max-w-[440px] flex-1 items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] px-3 text-left text-sm text-[var(--text-muted)] sm:flex"
              type="button"
              onClick={() => setCmdOpen(true)}
            >
              <CrmIcon className="size-4" name="Search" />
              <span className="min-w-0 flex-1 truncate">Szukaj klienta, sprawy, dokumentu...</span>
              <span className="rounded-[var(--radius-xs)] border border-[var(--border-default)] px-1.5 py-0.5 text-[11px] font-semibold">Ctrl K</span>
            </button>
            <div className="ml-auto flex items-center gap-2">
              <IconButton label="Paleta poleceń" onClick={() => setCmdOpen(true)}>
                <CrmIcon name="Command" />
              </IconButton>
              <div className="relative">
                <IconButton label="Powiadomienia" onClick={() => { setNotifOpen((value) => !value); setAddOpen(false); }}>
                  <CrmIcon name="Bell" />
                </IconButton>
                <span className="absolute right-2 top-2 size-2 rounded-full bg-[var(--danger)] ring-2 ring-[var(--surface-card)]" />
                {notifOpen && (
                  <Card className="absolute right-0 top-12 z-40 w-[min(92vw,380px)]" padding="sm" variant="raised">
                    <div className="px-2 py-2 text-sm font-bold text-[var(--text-strong)]">Powiadomienia</div>
                    <div className="space-y-2">
                      {data.dashboard.alerts.length === 0 ? (
                        <div className="rounded-[var(--radius-md)] p-3 text-sm text-[var(--text-muted)]">
                          Brak alertów z bazy danych.
                        </div>
                      ) : data.dashboard.alerts.slice(0, 4).map((alert) => (
                        <button className="flex w-full gap-3 rounded-[var(--radius-md)] p-2 text-left hover:bg-[var(--surface-sunken)]" key={alert.title} type="button" onClick={() => setRouteAndClose(alert.route)}>
                          <span className={cn("grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)] border", toneBox(alert.tone))}>
                            <CrmIcon className="size-4" name={alert.icon} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-[var(--text-strong)]">{alert.title}</span>
                            <span className="block truncate text-xs text-[var(--text-muted)]">{alert.subtitle}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
              <div className="relative">
                <Button type="button" onClick={() => { setAddOpen((value) => !value); setNotifOpen(false); }}>
                  <CrmIcon name="Plus" />
                  <span className="hidden sm:inline">Dodaj</span>
                </Button>
                {addOpen && (
                  <Card className="absolute right-0 top-12 z-40 w-[min(92vw,280px)]" padding="sm" variant="raised">
                    {[
                      ["Dodaj klienta", "clients"],
                      ["Dodaj lead", "leads"],
                      ["Utwórz zadanie", "tasks"],
                      ["Dodaj dokument", "documents"],
                      ["Dodaj incydent", "breaches"],
                      ["Wyślij wiadomość", "inbox"],
                    ].map(([label, target]) => (
                      <button className="flex h-10 w-full items-center gap-3 rounded-[var(--radius-sm)] px-2 text-sm font-semibold text-[var(--text-body)] hover:bg-[var(--surface-sunken)]" key={label} type="button" onClick={() => setRouteAndClose(target as CrmRoute)}>
                        <CrmIcon className="size-4 text-[var(--brand-ink)]" name="Plus" />
                        {label}
                      </button>
                    ))}
                  </Card>
                )}
              </div>
              <div className="hidden items-center gap-2 rounded-[var(--radius-md)] p-1 hover:bg-[var(--surface-sunken)] md:flex">
                <span className="grid size-8 place-items-center rounded-full bg-[var(--brand)] text-xs font-bold text-white">AK</span>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-[var(--text-strong)]">Anna Kowalczyk</div>
                  <div className="text-xs text-[var(--text-muted)]">Operations Manager</div>
                </div>
                <CrmIcon className="size-4 text-[var(--text-faint)]" name="ChevronDown" />
              </div>
            </div>
          </header>

          {showSla && data.dashboard.alerts.length > 0 && !detailRoutes.has(route) && (
            <div className="flex items-center gap-3 border-b border-[var(--warning)]/20 bg-[var(--warning-soft)] px-4 py-2 text-sm text-[var(--amber-600)] lg:px-6">
              <CrmIcon className="size-4 shrink-0" name="AlarmClock" />
              <span className="min-w-0 flex-1">
                <strong>{data.dashboard.alerts[0].title}</strong> {data.dashboard.alerts[0].subtitle}
              </span>
              <button className="hidden font-semibold underline sm:inline" type="button" onClick={() => setRouteAndClose("breaches")}>
                Otwórz
              </button>
              <IconButton label="Zamknij alert" size="sm" variant="ghost" onClick={() => setShowSla(false)}>
                <CrmIcon name="X" />
              </IconButton>
            </div>
          )}

          <main className="min-w-0 flex-1 px-4 py-5 sm:px-5 lg:px-7 lg:py-7">
            <div className="mx-auto w-full max-w-[var(--container-wide)]">{content}</div>
          </main>
        </div>
      </div>

      {cmdOpen && (
        <div className="fixed inset-0 z-50 grid place-items-start bg-[var(--gray-900)]/40 px-4 py-[10vh]" onClick={() => setCmdOpen(false)}>
          <Card className="mx-auto w-full max-w-xl" padding="sm" variant="raised" onClick={(event) => event.stopPropagation()}>
            <Input autoFocus placeholder="Szukaj klienta, sprawy, dokumentu..." />
            <div className="mt-3 space-y-2">
              {[
                ["Dodaj lead", "Nowy potencjalny klient", "leads", "UserPlus"],
                ["Dodaj naruszenie", "Rejestruj incydent - timer 72h", "breaches", "TriangleAlert"],
                ["Klienci", "Wszystkie organizacje", "clients", "Building2"],
                ["Skrzynka", "9 nieprzeczytanych", "inbox", "Inbox"],
                ["Produkty / sklep", "Ceny i widoczność", "products", "Tag"],
              ].map(([label, subtitle, target, icon]) => (
                <button className="flex w-full items-center gap-3 rounded-[var(--radius-md)] p-3 text-left hover:bg-[var(--surface-sunken)]" key={label} type="button" onClick={() => setRouteAndClose(target as CrmRoute)}>
                  <span className="grid size-10 place-items-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand-ink)]">
                    <CrmIcon className="size-5" name={icon} />
                  </span>
                  <span>
                    <span className="block font-semibold text-[var(--text-strong)]">{label}</span>
                    <span className="text-sm text-[var(--text-muted)]">{subtitle}</span>
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {platformPreview && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--gray-900)]/40 p-4" onClick={() => setPlatformPreview(false)}>
          <Card className="w-full max-w-4xl" padding="md" variant="raised" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-[var(--text-strong)]">Podgląd platformy klienta</h2>
              <IconButton label="Zamknij" onClick={() => setPlatformPreview(false)}>
                <CrmIcon name="X" />
              </IconButton>
            </div>
            <div className="grid min-h-[420px] gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-page)] p-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="rounded-[var(--radius-md)] bg-[var(--surface-inverse)] p-4 text-white">
                <Logo tone="inverse" />
                <div className="mt-6 space-y-2 text-sm text-slate-300">
                  {["Dashboard", "Zgłoś naruszenie", "Dokumenty", "Kontakt z IOD", "Zadania"].map((item) => (
                    <div className="rounded-[var(--radius-sm)] px-3 py-2 first:bg-white/10" key={item}>{item}</div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-[var(--text-muted)]">{data.lists.platform.rows[0]?.primary ?? "Brak organizacji w bazie"}</div>
                  <h3 className="text-2xl font-bold text-[var(--text-strong)]">Panel klienta</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    `Profile: ${data.lists.platform.rows[0]?.cells[0] ?? "0"}`,
                    `Formularze: ${data.lists.platform.rows[0]?.cells[1] ?? "0"}`,
                    `Dokumenty: ${data.lists.platform.rows[0]?.cells[2] ?? "0"}`,
                    `Joby: ${data.lists.platform.rows[0]?.cells[3] ?? "0"}`,
                  ].map((item) => (
                    <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 font-semibold text-[var(--text-strong)]" key={item}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

