import * as React from "react";

import { cn } from "@/lib/utils";

export type IconButtonSize = "sm" | "md" | "lg";
export type IconButtonVariant = "ghost" | "solid" | "outline";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "size-9",
  md: "size-11",
  lg: "size-12",
};

const variantClasses: Record<IconButtonVariant, string> = {
  ghost: "text-[var(--text-body)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-ink)]",
  solid: "bg-[var(--brand)] text-[var(--text-on-brand)] shadow-[var(--shadow-brand-sm)] hover:bg-[var(--brand-hover)]",
  outline:
    "border border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--text-body)] hover:border-[var(--brand-border)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-ink)]",
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, className, label, size = "md", variant = "outline", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(
          "grid place-items-center rounded-[var(--radius-md)] transition-[background-color,border-color,color,box-shadow,transform] duration-[var(--dur-fast)] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:size-5",
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
IconButton.displayName = "IconButton";
