"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export interface ConfirmDialogProps {
  cancelLabel?: string;
  confirmLabel?: string;
  description: React.ReactNode;
  onConfirm: () => void;
  onOpenChange?: (open: boolean) => void;
  open: boolean;
  title: React.ReactNode;
  tone?: "default" | "danger";
}

export function ConfirmDialog({
  cancelLabel = "Anuluj",
  confirmLabel = "Potwierdz",
  description,
  onConfirm,
  onOpenChange,
  open,
  title,
  tone = "default",
}: ConfirmDialogProps) {
  return (
    <Modal
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button onClick={() => onOpenChange?.(false)} type="button" variant="outline">
            {cancelLabel}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange?.(false);
            }}
            type="button"
            variant={tone === "danger" ? "danger" : "default"}
          >
            {confirmLabel}
          </Button>
        </div>
      }
      onOpenChange={onOpenChange}
      open={open}
      title={title}
    >
      <p className="break-words text-sm leading-relaxed text-[var(--text-body)]">{description}</p>
    </Modal>
  );
}
