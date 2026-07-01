"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ModalProps {
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  open: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
}

export function Modal({ children, className, description, footer, onOpenChange, open, title }: ModalProps) {
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-[color-mix(in_srgb,var(--gray-900)_36%,transparent)] p-4" role="presentation">
      <button
        aria-label="Zamknij okno"
        className="absolute inset-0 cursor-default"
        onClick={() => onOpenChange?.(false)}
        type="button"
      />
      <section
        aria-modal="true"
        className={cn(
          "relative flex max-h-[calc(100dvh-2rem)] w-full max-w-lg min-w-0 flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-xl)]",
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
        <div className="min-w-0 overflow-y-auto p-5">{children}</div>
        {footer && <footer className="border-t border-[var(--border-subtle)] p-5">{footer}</footer>}
      </section>
    </div>
  );
}
