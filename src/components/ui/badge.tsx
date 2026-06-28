import * as React from "react";

import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  dot?: boolean;
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-[var(--border-subtle)] bg-[var(--surface-sunken)] text-[var(--text-body)]",
  brand: "border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand-ink)]",
  success: "border-[var(--success)]/20 bg-[var(--success-soft)] text-[var(--green-600)]",
  warning: "border-[var(--warning)]/20 bg-[var(--warning-soft)] text-[var(--amber-600)]",
  danger: "border-[var(--danger)]/20 bg-[var(--danger-soft)] text-[var(--red-600)]",
  outline: "border-[var(--border-default)] bg-transparent text-[var(--text-body)]",
};

const dotClasses: Record<BadgeTone, string> = {
  neutral: "bg-[var(--text-faint)]",
  brand: "bg-[var(--brand)]",
  success: "bg-[var(--success)]",
  warning: "bg-[var(--warning)]",
  danger: "bg-[var(--danger)]",
  outline: "bg-[var(--text-faint)]",
};

export function Badge({ children, className, dot, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 py-1 text-xs font-semibold",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn("size-1.5 rounded-full", dotClasses[tone])} />}
      {children}
    </span>
  );
}
