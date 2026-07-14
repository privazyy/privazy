import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge, type StatusKind } from "@/components/ui/status-badge";
import { Timeline, type TimelineItem } from "@/components/ui/timeline";
import { cn } from "@/lib/utils";

export function ClientPortalShell({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <main className={cn("min-h-dvh bg-[var(--surface-page)]", className)} {...props}>
      <div className="pvz-container py-6 md:py-10">
        <div className="grid min-w-0 gap-6">{children}</div>
      </div>
    </main>
  );
}

export interface ClientDashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: React.ReactNode;
  label: React.ReactNode;
  value: React.ReactNode;
  helper?: React.ReactNode;
}

export function ClientDashboardCard({ action, className, helper, label, value, ...props }: ClientDashboardCardProps) {
  return (
    <Card className={cn("grid gap-3", className)} padding="md" variant="flat" {...props}>
      <p className="text-sm font-medium text-[var(--text-muted)]">{label}</p>
      <p className="break-words text-2xl font-semibold text-[var(--text-strong)]">{value}</p>
      {helper && <p className="break-words text-sm text-[var(--text-muted)]">{helper}</p>}
      {action && <div className="pt-2">{action}</div>}
    </Card>
  );
}

export interface ClientDocumentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: React.ReactNode;
  status?: StatusKind;
  meta?: React.ReactNode;
}

export function ClientDocumentCard({ className, meta, name, status = "active", ...props }: ClientDocumentCardProps) {
  return (
    <Card className={cn("flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)} padding="md" variant="flat" {...props}>
      <div className="min-w-0">
        <p className="break-words font-semibold text-[var(--text-strong)]">{name}</p>
        {meta && <p className="mt-1 break-words text-sm text-[var(--text-muted)]">{meta}</p>}
      </div>
      <StatusBadge kind={status}>{status}</StatusBadge>
    </Card>
  );
}

export interface ClientTaskCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  dueLabel?: React.ReactNode;
  status?: StatusKind;
  title: React.ReactNode;
}

export function ClientTaskCard({ className, dueLabel, status = "pending", title, ...props }: ClientTaskCardProps) {
  return (
    <Card className={cn("grid gap-3", className)} padding="md" variant="flat" {...props}>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <StatusBadge kind={status}>{status}</StatusBadge>
        {dueLabel && <Badge tone="outline">{dueLabel}</Badge>}
      </div>
      <p className="break-words font-semibold text-[var(--text-strong)]">{title}</p>
      <Button size="sm" type="button" variant="outline">
        Otworz zadanie
      </Button>
    </Card>
  );
}

export interface ClientMessage {
  author: React.ReactNode;
  body: React.ReactNode;
  meta?: React.ReactNode;
}

export function ClientMessageThread({ messages }: { messages: ClientMessage[] }) {
  return (
    <Card className="grid gap-4" padding="md" variant="flat">
      {messages.map((message, index) => (
        <article className="min-w-0 rounded-[var(--radius-lg)] bg-[var(--surface-sunken)] p-4" key={index}>
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-[var(--text-strong)]">{message.author}</p>
            {message.meta && <p className="text-xs text-[var(--text-muted)]">{message.meta}</p>}
          </div>
          <p className="mt-2 break-words text-sm leading-relaxed text-[var(--text-body)]">{message.body}</p>
        </article>
      ))}
    </Card>
  );
}

export function ClientStatusTimeline({ items }: { items: TimelineItem[] }) {
  return <Timeline items={items} />;
}
