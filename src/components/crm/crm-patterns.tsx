import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CommentBox } from "@/components/ui/comment-box";
import { DataTable } from "@/components/ui/data-table";
import { Select } from "@/components/ui/select";
import { StatusBadge, type StatusKind } from "@/components/ui/status-badge";
import { Timeline, type TimelineItem } from "@/components/ui/timeline";
import { cn } from "@/lib/utils";

export interface CrmPageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
}

export function CrmPageHeader({ actions, className, description, eyebrow, title, ...props }: CrmPageHeaderProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between", className)} {...props}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase text-[var(--brand-ink)]">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold text-[var(--text-strong)]">{title}</h1>
        {description && <p className="mt-2 max-w-3xl break-words text-sm leading-relaxed text-[var(--text-muted)]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function CrmToolbar({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card className={cn("flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between", className)} padding="sm" variant="flat" {...props}>
      {children}
    </Card>
  );
}

export interface CrmKpiItem {
  label: React.ReactNode;
  value: React.ReactNode;
  helper?: React.ReactNode;
  status?: StatusKind;
}

export interface CrmKpiGridProps extends React.HTMLAttributes<HTMLDivElement> {
  items: CrmKpiItem[];
}

export function CrmKpiGrid({ className, items, ...props }: CrmKpiGridProps) {
  return (
    <div className={cn("grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4", className)} {...props}>
      {items.map((item, index) => (
        <Card className="grid gap-2" key={index} padding="md" variant="flat">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <p className="min-w-0 break-words text-sm font-medium text-[var(--text-muted)]">{item.label}</p>
            {item.status && <StatusBadge kind={item.status}>{item.status}</StatusBadge>}
          </div>
          <p className="min-w-0 break-words text-2xl font-semibold text-[var(--text-strong)]">{item.value}</p>
          {item.helper && <p className="break-words text-xs text-[var(--text-muted)]">{item.helper}</p>}
        </Card>
      ))}
    </div>
  );
}

export function CrmDetailLayout({ aside, children, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { aside?: React.ReactNode }) {
  return (
    <div className={cn("grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]", className)} {...props}>
      <div className="min-w-0">{children}</div>
      {aside && <aside className="min-w-0">{aside}</aside>}
    </div>
  );
}

export function CrmActivityTimeline({ items }: { items: TimelineItem[] }) {
  return <Timeline items={items} />;
}

export interface CrmNotesPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  notes?: React.ReactNode;
}

export function CrmNotesPanel({ className, notes, ...props }: CrmNotesPanelProps) {
  return (
    <Card className={cn("grid gap-4", className)} padding="md" variant="flat" {...props}>
      <h2 className="text-lg font-semibold text-[var(--text-strong)]">Notatki</h2>
      {notes && <div className="grid gap-3">{notes}</div>}
      <CommentBox helperText="Notatka trafi do historii rekordu CRM." />
    </Card>
  );
}

export function CrmStatusSelect(props: React.ComponentProps<typeof Select>) {
  return <Select aria-label="Status CRM" {...props} />;
}

export function CrmAssigneeSelect(props: React.ComponentProps<typeof Select>) {
  return <Select aria-label="Opiekun" {...props} />;
}

export function CrmTableActions({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex min-w-0 flex-wrap justify-end gap-2", className)} {...props}>
      {children ?? (
        <>
          <Button size="sm" type="button" variant="outline">
            Otworz
          </Button>
          <Button size="sm" type="button" variant="ghost">
            Historia
          </Button>
        </>
      )}
    </div>
  );
}

export { DataTable as CrmDataTable };
