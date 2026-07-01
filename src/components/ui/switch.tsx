"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  label?: React.ReactNode;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({ checked = false, className, label, onCheckedChange, ...props }: SwitchProps) {
  return (
    <button
      aria-checked={checked}
      className={cn(
        "inline-flex min-w-0 items-center gap-3 text-left text-sm font-medium text-[var(--text-strong)] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
        className,
      )}
      onClick={() => onCheckedChange?.(!checked)}
      role="switch"
      type="button"
      {...props}
    >
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-[var(--radius-pill)] border transition-colors duration-[var(--dur-fast)]",
          checked
            ? "border-[var(--brand)] bg-[var(--brand)]"
            : "border-[var(--border-default)] bg-[var(--surface-sunken)]",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-[var(--surface-card)] shadow-[var(--shadow-sm)] transition-transform duration-[var(--dur-fast)]",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </span>
      {label && <span className="min-w-0 break-words">{label}</span>}
    </button>
  );
}
