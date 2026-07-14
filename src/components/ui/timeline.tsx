import * as React from "react";

import { StatusBadge, type StatusKind } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  description?: React.ReactNode;
  meta?: React.ReactNode;
  status?: StatusKind;
  title: React.ReactNode;
}

export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  items: TimelineItem[];
}

export function Timeline({ className, items, ...props }: TimelineProps) {
  return (
    <ol className={cn("grid min-w-0 gap-4", className)} {...props}>
      {items.map((item, index) => (
        <li className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-3" key={index}>
          <span aria-hidden="true" className="mt-1 size-3 rounded-full bg-[var(--brand)] shadow-[0_0_0_4px_var(--brand-soft)]" />
          <div className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="min-w-0 break-words text-sm font-semibold text-[var(--text-strong)]">{item.title}</p>
              {item.status && <StatusBadge kind={item.status}>{item.status}</StatusBadge>}
            </div>
            {item.description && (
              <p className="mt-2 break-words text-sm leading-relaxed text-[var(--text-body)]">{item.description}</p>
            )}
            {item.meta && <p className="mt-2 break-words text-xs text-[var(--text-muted)]">{item.meta}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
