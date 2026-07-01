import * as React from "react";

import { cn } from "@/lib/utils";

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  rows?: number;
}

export function LoadingState({ className, label = "Ladowanie danych", rows = 3, ...props }: LoadingStateProps) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn("grid min-w-0 gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4", className)}
      {...props}
    >
      <p className="text-sm font-semibold text-[var(--text-strong)]">{label}</p>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          aria-hidden="true"
          className="h-3 rounded-[var(--radius-pill)] bg-[linear-gradient(90deg,var(--gray-100),var(--blue-50),var(--gray-100))]"
          key={index}
          style={{ width: `${100 - index * 12}%` }}
        />
      ))}
    </div>
  );
}
