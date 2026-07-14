import type * as React from "react";

import { Badge, type BadgeTone } from "@/components/ui/badge";

export type StatusKind =
  | "draft"
  | "new"
  | "pending"
  | "active"
  | "processing"
  | "success"
  | "warning"
  | "danger"
  | "archived";

export interface StatusBadgeProps {
  children: React.ReactNode;
  kind?: StatusKind;
}

const statusTone: Record<StatusKind, BadgeTone> = {
  draft: "neutral",
  new: "brand",
  pending: "warning",
  active: "brand",
  processing: "brand",
  success: "success",
  warning: "warning",
  danger: "danger",
  archived: "outline",
};

export function StatusBadge({ children, kind = "active" }: StatusBadgeProps) {
  return (
    <Badge dot tone={statusTone[kind]}>
      {children}
    </Badge>
  );
}
