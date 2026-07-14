import * as React from "react";

import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Stepper, type StepperItem } from "@/components/ui/stepper";
import { cn } from "@/lib/utils";

export interface FormSectionProps extends React.HTMLAttributes<HTMLElement> {
  description?: React.ReactNode;
  heading: React.ReactNode;
}

export function FormSection({ children, className, description, heading, ...props }: FormSectionProps) {
  return (
    <section className={cn("grid min-w-0 gap-5", className)} {...props}>
      <div className="min-w-0">
        <h2 className="text-xl font-semibold text-[var(--text-strong)]">{heading}</h2>
        {description && <p className="mt-2 break-words text-sm leading-relaxed text-[var(--text-muted)]">{description}</p>}
      </div>
      <Card className="grid gap-5" padding="lg" variant="flat">
        {children}
      </Card>
    </section>
  );
}

export function FieldGroup({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("grid min-w-0 gap-4 md:grid-cols-2", className)} {...props}>
      {children}
    </div>
  );
}

export function FormActions({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col-reverse gap-3 border-t border-[var(--border-subtle)] pt-5 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface FormSummaryItem {
  label: React.ReactNode;
  value: React.ReactNode;
}

export interface FormSummaryProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  items: FormSummaryItem[];
  title?: React.ReactNode;
}

export function FormSummary({ className, items, title = "Podsumowanie", ...props }: FormSummaryProps) {
  return (
    <Card className={cn("grid gap-3", className)} padding="md" variant="soft" {...props}>
      <h3 className="text-base font-semibold text-[var(--text-strong)]">{title}</h3>
      <dl className="grid gap-3">
        {items.map((item, index) => (
          <div className="grid min-w-0 gap-1 sm:grid-cols-[180px_minmax(0,1fr)]" key={index}>
            <dt className="text-sm font-medium text-[var(--text-muted)]">{item.label}</dt>
            <dd className="min-w-0 break-words text-sm text-[var(--text-strong)]">{item.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export function ConsentCheckbox({ helperText, label, ...props }: React.ComponentProps<typeof Checkbox>) {
  return (
    <Checkbox
      helperText={helperText ?? "Zgoda jest zapisywana razem ze zrodlem, data i zakresem formularza."}
      label={label}
      {...props}
    />
  );
}

export interface LegalDisclaimerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function LegalDisclaimer({ children, ...props }: LegalDisclaimerProps) {
  return (
    <Alert heading="Informacja prawna" tone="info" {...props}>
      {children ??
        "Material ma charakter ogolny i nie stanowi porady prawnej dla konkretnej sprawy. Ostateczna decyzja wymaga weryfikacji danych organizacji."}
    </Alert>
  );
}

export interface MultiStepFormShellProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  aside?: React.ReactNode;
  steps: StepperItem[];
  title: React.ReactNode;
  description?: React.ReactNode;
}

export function MultiStepFormShell({
  aside,
  children,
  className,
  description,
  steps,
  title,
  ...props
}: MultiStepFormShellProps) {
  return (
    <div className={cn("grid min-w-0 gap-6", className)} {...props}>
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-[var(--text-strong)]">{title}</h1>
        {description && <p className="mt-2 max-w-3xl break-words text-sm leading-relaxed text-[var(--text-muted)]">{description}</p>}
      </div>
      <Stepper items={steps} />
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">{children}</div>
        {aside && <aside className="min-w-0">{aside}</aside>}
      </div>
    </div>
  );
}
