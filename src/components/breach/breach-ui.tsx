import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function BreachCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5", className)}>{children}</section>;
}

export function BreachBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "brand" | "success" | "warning" | "danger" }) {
  const className = {
    brand: "border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand-ink)]",
    danger: "border-[var(--danger)]/20 bg-[var(--danger-soft)] text-[var(--red-600)]",
    neutral: "border-[var(--border-subtle)] bg-[var(--surface-sunken)] text-[var(--text-muted)]",
    success: "border-[var(--success)]/20 bg-[var(--success-soft)] text-[var(--green-600)]",
    warning: "border-[var(--warning)]/20 bg-[var(--warning-soft)] text-[var(--amber-600)]",
  }[tone];

  return <span className={cn("inline-flex rounded-[var(--radius-pill)] border px-2.5 py-1 text-xs font-bold", className)}>{children}</span>;
}

export function BreachLink({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <Link className="inline-flex rounded-[var(--radius-sm)] bg-[var(--brand)] px-3 py-2 text-sm font-bold text-white" href={href as Route}>
      {children}
    </Link>
  );
}

export function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export function riskTone(value: string | null | undefined): "neutral" | "brand" | "success" | "warning" | "danger" {
  if (value === "CRITICAL" || value === "HIGH") return "danger";
  if (value === "MEDIUM") return "warning";
  if (value === "LOW") return "success";
  return "neutral";
}

export function statusTone(status: string): "neutral" | "brand" | "success" | "warning" | "danger" {
  if (["CLOSED", "NOTIFICATION_NOT_REQUIRED"].includes(status)) return "success";
  if (["NOTIFICATION_REQUIRED", "NOTIFIED_AUTHORITY", "NOTIFIED_DATA_SUBJECTS"].includes(status)) return "danger";
  if (["TRIAGE", "RISK_ASSESSMENT", "REPORTED"].includes(status)) return "warning";
  if (status === "CANCELLED") return "neutral";
  return "brand";
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });
}
