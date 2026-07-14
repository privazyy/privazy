import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { StatusBadge, type StatusKind } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

export interface PriceBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  currency?: string;
  gross: string;
  net?: string;
  vat?: string;
}

export function PriceBlock({ className, currency = "PLN", gross, net, vat, ...props }: PriceBlockProps) {
  return (
    <div className={cn("min-w-0", className)} {...props}>
      <p className="text-xs font-semibold uppercase text-[var(--text-muted)]">{currency}</p>
      <p className="mt-1 break-words text-3xl font-semibold text-[var(--text-strong)]">{gross}</p>
      {(net || vat) && (
        <p className="mt-1 break-words text-sm text-[var(--text-muted)]">
          {net}
          {net && vat ? " | " : ""}
          {vat}
        </p>
      )}
    </div>
  );
}

export interface ProductCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  action?: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  price: React.ReactNode;
  title: React.ReactNode;
}

export function ProductCard({ action, className, description, eyebrow, price, title, ...props }: ProductCardProps) {
  return (
    <Card className={cn("grid h-full gap-4", className)} padding="lg" variant="flat" {...props}>
      <div className="min-w-0">
        {eyebrow && <Badge tone="brand">{eyebrow}</Badge>}
        <h3 className="mt-3 break-words text-xl font-semibold text-[var(--text-strong)]">{title}</h3>
        {description && <p className="mt-2 break-words text-sm leading-relaxed text-[var(--text-muted)]">{description}</p>}
      </div>
      <div className="mt-auto grid gap-4">
        {price}
        {action ?? <Button type="button">Wybierz</Button>}
      </div>
    </Card>
  );
}

export interface CartSummaryItem {
  label: React.ReactNode;
  value: React.ReactNode;
}

export function CartSummary({ items, total }: { items: CartSummaryItem[]; total: React.ReactNode }) {
  return (
    <Card className="grid gap-4" padding="md" variant="flat">
      <h2 className="text-lg font-semibold text-[var(--text-strong)]">Podsumowanie koszyka</h2>
      <dl className="grid gap-3">
        {items.map((item, index) => (
          <div className="flex min-w-0 justify-between gap-4 text-sm" key={index}>
            <dt className="min-w-0 break-words text-[var(--text-muted)]">{item.label}</dt>
            <dd className="shrink-0 font-semibold text-[var(--text-strong)]">{item.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex min-w-0 justify-between gap-4 border-t border-[var(--border-subtle)] pt-4">
        <span className="font-semibold text-[var(--text-strong)]">Razem</span>
        <span className="shrink-0 text-xl font-semibold text-[var(--text-strong)]">{total}</span>
      </div>
    </Card>
  );
}

export function CheckoutLayout({ aside, children, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { aside?: React.ReactNode }) {
  return (
    <div className={cn("grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]", className)} {...props}>
      <div className="min-w-0">{children}</div>
      {aside && <aside className="min-w-0">{aside}</aside>}
    </div>
  );
}

export function CheckoutStepIndicator({ current = 1 }: { current?: number }) {
  return (
    <Stepper
      items={[
        { label: "Koszyk", status: current > 1 ? "complete" : "current" },
        { label: "Dane", status: current === 2 ? "current" : current > 2 ? "complete" : "upcoming" },
        { label: "Platnosc", status: current === 3 ? "current" : current > 3 ? "complete" : "upcoming" },
        { label: "Realizacja", status: current >= 4 ? "current" : "upcoming" },
      ]}
    />
  );
}

export function PaymentStatusCard({ description, status = "pending", title }: { description?: React.ReactNode; status?: StatusKind; title: React.ReactNode }) {
  return (
    <Card className="grid gap-3" padding="md" variant="flat">
      <StatusBadge kind={status}>{status}</StatusBadge>
      <h2 className="break-words text-lg font-semibold text-[var(--text-strong)]">{title}</h2>
      {description && <p className="break-words text-sm text-[var(--text-muted)]">{description}</p>}
    </Card>
  );
}

export const OrderStatusCard = PaymentStatusCard;
