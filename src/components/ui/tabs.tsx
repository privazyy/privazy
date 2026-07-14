"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface TabsItem {
  content: React.ReactNode;
  disabled?: boolean;
  label: React.ReactNode;
  value: string;
}

export interface TabsProps {
  className?: string;
  defaultValue?: string;
  items: TabsItem[];
}

export function Tabs({ className, defaultValue, items }: TabsProps) {
  const firstEnabled = items.find((item) => !item.disabled)?.value ?? items[0]?.value;
  const [active, setActive] = React.useState(defaultValue ?? firstEnabled);
  const activeItem = items.find((item) => item.value === active) ?? items[0];

  return (
    <div className={cn("grid min-w-0 gap-4", className)}>
      <div
        className="pvz-h-scroll flex gap-2 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-1"
        data-responsive-scroll="true"
        role="tablist"
      >
        {items.map((item) => (
          <button
            aria-selected={active === item.value}
            className={cn(
              "min-h-10 shrink-0 rounded-[var(--radius-md)] px-4 text-sm font-semibold text-[var(--text-body)] transition-colors focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50",
              active === item.value && "bg-[var(--brand-soft)] text-[var(--brand-ink)]",
            )}
            disabled={item.disabled}
            key={item.value}
            onClick={() => setActive(item.value)}
            role="tab"
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="min-w-0" role="tabpanel">
        {activeItem?.content}
      </div>
    </div>
  );
}
