"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DropdownMenuItem {
  disabled?: boolean;
  label: React.ReactNode;
  onSelect?: () => void;
  tone?: "default" | "danger";
}

export interface DropdownMenuProps {
  align?: "left" | "right";
  className?: string;
  items: DropdownMenuItem[];
  label?: string;
  trigger: React.ReactNode;
}

export function DropdownMenu({ align = "right", className, items, label = "Otworz menu", trigger }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("relative inline-block text-left", className)}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        className="focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {trigger}
      </button>
      {open && (
        <div
          className={cn(
            "absolute z-30 mt-2 w-56 min-w-0 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-1 shadow-[var(--shadow-lg)]",
            align === "right" ? "right-0" : "left-0",
          )}
          role="menu"
        >
          {items.map((item, index) => (
            <Button
              className={cn("w-full justify-start shadow-none", item.tone === "danger" && "text-[var(--red-600)]")}
              disabled={item.disabled}
              key={index}
              onClick={() => {
                item.onSelect?.();
                setOpen(false);
              }}
              role="menuitem"
              size="sm"
              type="button"
              variant="ghost"
            >
              {item.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
