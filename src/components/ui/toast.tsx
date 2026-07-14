import * as React from "react";

import { Alert, type AlertTone } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: React.ReactNode;
  tone?: AlertTone;
}

export function Toast({ children, className, heading, tone = "info", ...props }: ToastProps) {
  return (
    <Alert className={cn("max-w-md shadow-[var(--shadow-lg)]", className)} heading={heading} tone={tone} {...props}>
      {children}
    </Alert>
  );
}

export const Notification = Toast;
