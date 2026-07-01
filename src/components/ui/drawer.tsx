"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DrawerProps {
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  open: boolean;
  side?: "left" | "right";
  title: React.ReactNode;
  description?: React.ReactNode;
}

export function Drawer({
  children,
  className,
  description,
  footer,
  onOpenChange,
  open,
  side = "right",
  title,
}: DrawerProps) {
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange?.(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--gray-900)_34%,transparent)]" role="presentation">
      <button
        aria-label="Zamknij panel"
        className="absolute inset-0 cursor-default"
        onClick={() => onOpenChange?.(false)}
        type="button"
      />
      <aside
        aria-modal="true"
        className={cn(
          "absolute top-0 flex h-dvh w-full max-w-xl min-w-0 flex-col overflow-hidden border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-xl)]",
          side === "right" ? "right-0 border-l" : "left-0 border-r",
          className,
        )}
        role="dialog"
      >
        <header className="flex min-w-0 items-start justify-between gap-4 border-b border-[var(--border-subtle)] p-5">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[var(--text-strong)]">{title}</h2>
            {description && <p className="mt-1 break-words text-sm text-[var(--text-muted)]">{description}</p>}
          </div>
          <Button onClick={() => onOpenChange?.(false)} size="sm" type="button" variant="ghost">
            Zamknij
          </Button>
        </header>
        <div className="min-w-0 flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <footer className="border-t border-[var(--border-subtle)] p-5">{footer}</footer>}
      </aside>
    </div>
  );
}
