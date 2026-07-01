import * as React from "react";

import { cn } from "@/lib/utils";

export interface RadioGroupOption {
  disabled?: boolean;
  helperText?: React.ReactNode;
  label: React.ReactNode;
  value: string;
}

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  name: string;
  onValueChange?: (value: string) => void;
  options: RadioGroupOption[];
  value?: string;
}

export function RadioGroup({
  className,
  name,
  onValueChange,
  options,
  value,
  ...props
}: RadioGroupProps) {
  return (
    <div className={cn("grid min-w-0 gap-3", className)} role="radiogroup" {...props}>
      {options.map((option) => (
        <label
          className={cn(
            "flex min-w-0 gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 text-sm text-[var(--text-body)]",
            option.disabled && "opacity-60",
          )}
          key={option.value}
        >
          <input
            checked={value === option.value}
            className="mt-0.5 size-4 shrink-0 accent-[var(--brand)] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            disabled={option.disabled}
            name={name}
            onChange={(event) => onValueChange?.(event.currentTarget.value)}
            type="radio"
            value={option.value}
          />
          <span className="min-w-0">
            <span className="block font-semibold text-[var(--text-strong)]">{option.label}</span>
            {option.helperText && (
              <span className="mt-1 block break-words text-[var(--text-muted)]">{option.helperText}</span>
            )}
          </span>
        </label>
      ))}
    </div>
  );
}
