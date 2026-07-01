import * as React from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: React.ReactNode;
  description?: React.ReactNode;
  heading?: React.ReactNode;
}

export function ErrorState({
  action,
  className,
  description = "Nie udalo sie zaladowac danych. Sprobuj ponownie albo sprawdz uprawnienia.",
  heading = "Wystapil problem",
  ...props
}: ErrorStateProps) {
  return (
    <div className={cn("grid min-w-0 gap-3", className)} {...props}>
      <Alert heading={heading} tone="danger">
        {description}
      </Alert>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}

export function ErrorStateAction(props: React.ComponentProps<typeof Button>) {
  return <Button size="sm" variant="outline" {...props} />;
}
