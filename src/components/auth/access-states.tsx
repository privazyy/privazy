import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { AlertTriangle, ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type AccessStateProps = {
  description: string;
  title: string;
};

export function ForbiddenState({ description, title }: AccessStateProps) {
  return (
    <AccessState
      actionHref="/login"
      actionLabel="Wroc do logowania"
      description={description}
      icon={<ShieldX className="size-5" aria-hidden="true" />}
      title={title}
    />
  );
}

export function ConfigurationErrorState({ description, title }: AccessStateProps) {
  return (
    <AccessState
      actionHref="/"
      actionLabel="Wroc na strone glowna"
      description={description}
      icon={<AlertTriangle className="size-5" aria-hidden="true" />}
      title={title}
    />
  );
}

function AccessState({
  actionHref,
  actionLabel,
  description,
  icon,
  title,
}: AccessStateProps & {
  actionHref: Route;
  actionLabel: string;
  icon: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[var(--surface-page)] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-xl items-center">
        <Card className="w-full" padding="lg" variant="flat">
          <div className="mb-5 flex size-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-strong)]">
            {icon}
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text-strong)]">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{description}</p>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
