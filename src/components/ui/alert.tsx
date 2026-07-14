import * as React from "react";

import { cn } from "@/lib/utils";

export type AlertTone = "info" | "success" | "warning" | "danger" | "neutral";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: React.ReactNode;
  tone?: AlertTone;
}

const toneClasses: Record<AlertTone, string> = {
  info: "border-[var(--brand-border)] bg-[var(--info-soft)] text-[var(--brand-ink)]",
  success: "border-[var(--success)]/20 bg-[var(--success-soft)] text-[var(--green-600)]",
  warning: "border-[var(--warning)]/20 bg-[var(--warning-soft)] text-[var(--amber-600)]",
  danger: "border-[var(--danger)]/20 bg-[var(--danger-soft)] text-[var(--red-600)]",
  neutral: "border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-body)]",
};

export function Alert({ children, className, heading, tone = "info", ...props }: AlertProps) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-[var(--radius-lg)] border p-4 text-sm shadow-[var(--shadow-xs)]",
        toneClasses[tone],
        className,
      )}
      role={tone === "danger" ? "alert" : "status"}
      {...props}
    >
      {heading && <p className="mb-1 font-semibold text-[var(--text-strong)]">{heading}</p>}
      <div className="min-w-0 break-words leading-relaxed">{children}</div>
    </div>
  );
}
