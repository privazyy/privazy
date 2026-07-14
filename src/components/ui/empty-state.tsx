import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: React.ReactNode;
  description?: React.ReactNode;
  heading: React.ReactNode;
}

export function EmptyState({ action, className, description, heading, ...props }: EmptyStateProps) {
  return (
    <Card
      className={cn("grid min-w-0 place-items-center px-5 py-10 text-center", className)}
      padding="sm"
      variant="flat"
      {...props}
    >
      <div className="mx-auto flex max-w-md min-w-0 flex-col items-center gap-3">
        <div aria-hidden="true" className="size-10 rounded-[var(--radius-lg)] bg-[var(--brand-soft)]" />
        <h3 className="text-lg font-semibold text-[var(--text-strong)]">{heading}</h3>
        {description && <p className="break-words text-sm leading-relaxed text-[var(--text-muted)]">{description}</p>}
        {action && <div className="mt-2 flex max-w-full flex-wrap justify-center gap-2">{action}</div>}
      </div>
    </Card>
  );
}

export function EmptyStateAction(props: React.ComponentProps<typeof Button>) {
  return <Button size="sm" {...props} />;
}
