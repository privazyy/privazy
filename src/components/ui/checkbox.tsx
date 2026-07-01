import * as React from "react";

import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, helperText, label, ...props }, ref) => {
    const input = (
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          "mt-0.5 size-4 shrink-0 rounded-[var(--radius-xs)] border border-[var(--border-default)] accent-[var(--brand)] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );

    if (!label) return input;

    return (
      <label className="flex min-w-0 gap-3 text-sm text-[var(--text-body)]">
        {input}
        <span className="min-w-0">
          <span className="block font-medium text-[var(--text-strong)]">{label}</span>
          {helperText && <span className="mt-1 block break-words text-[var(--text-muted)]">{helperText}</span>}
        </span>
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";
