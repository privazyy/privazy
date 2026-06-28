import * as React from "react";

import { cn } from "@/lib/utils";

export type CardVariant = "default" | "flat" | "raised" | "soft";
export type CardPadding = "sm" | "md" | "lg";

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: "article" | "div" | "section";
  interactive?: boolean;
  padding?: CardPadding;
  variant?: CardVariant;
}

const variantClasses: Record<CardVariant, string> = {
  default: "border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]",
  flat: "border-[var(--border-subtle)] bg-[var(--surface-card)]",
  raised: "border-transparent bg-[var(--surface-card)] shadow-[var(--shadow-lg)]",
  soft: "border-[var(--brand-border)] bg-[var(--brand-soft)]",
};

const paddingClasses: Record<CardPadding, string> = {
  sm: "p-4",
  md: "p-5",
  lg: "p-7",
};

export function Card({
  as = "div",
  children,
  className,
  interactive,
  padding = "md",
  variant = "default",
  ...props
}: CardProps) {
  const Comp = as;

  return (
    <Comp
      className={cn(
        "min-w-0 rounded-[var(--radius-xl)] border",
        variantClasses[variant],
        paddingClasses[padding],
        interactive && "transition-[box-shadow,transform] duration-[var(--dur-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
