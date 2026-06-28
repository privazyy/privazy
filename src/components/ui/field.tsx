import * as React from "react";

import { cn } from "@/lib/utils";

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: string;
  hint?: string;
  htmlFor?: string;
  label: string;
  required?: boolean;
}

export function Field({
  children,
  className,
  error,
  hint,
  htmlFor,
  label,
  required,
  ...props
}: FieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)} {...props}>
      <label className="text-sm font-semibold text-[var(--text-strong)]" htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-0.5 text-[var(--danger)]">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-[var(--red-600)]">{error}</p>
      ) : hint ? (
        <p className="text-sm text-[var(--text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
