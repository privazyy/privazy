import * as React from "react";

import { cn } from "@/lib/utils";

export interface StepperItem {
  description?: React.ReactNode;
  label: React.ReactNode;
  status?: "complete" | "current" | "upcoming" | "error";
}

export interface StepperProps extends React.HTMLAttributes<HTMLOListElement> {
  items: StepperItem[];
}

const stepClasses: Record<NonNullable<StepperItem["status"]>, string> = {
  complete: "border-[var(--success)] bg-[var(--success-soft)] text-[var(--green-600)]",
  current: "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-ink)]",
  upcoming: "border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--text-muted)]",
  error: "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--red-600)]",
};

export function Stepper({ className, items, ...props }: StepperProps) {
  return (
    <ol className={cn("grid min-w-0 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))]", className)} {...props}>
      {items.map((item, index) => {
        const status = item.status ?? "upcoming";

        return (
          <li
            className={cn(
              "flex min-w-0 gap-3 rounded-[var(--radius-lg)] border p-3",
              stepClasses[status],
            )}
            key={index}
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-[var(--radius-pill)] bg-[var(--surface-card)] text-xs font-bold">
              {index + 1}
            </span>
            <span className="min-w-0">
              <span className="block break-words text-sm font-semibold text-[var(--text-strong)]">{item.label}</span>
              {item.description && (
                <span className="mt-1 block break-words text-xs text-[var(--text-muted)]">{item.description}</span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
