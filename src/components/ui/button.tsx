import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] px-4 py-2 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-[var(--dur-fast)] ease-[var(--ease-standard)] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[var(--brand)] text-[var(--text-on-brand)] shadow-[var(--shadow-brand-sm)] hover:bg-[var(--brand-hover)]",
        outline: "border border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--text-body)] hover:border-[var(--border-brand)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-ink)]",
        ghost: "text-[var(--text-body)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-ink)]",
        soft: "bg-[var(--brand-soft)] text-[var(--brand-ink)] hover:bg-[var(--brand-soft-2)]",
        danger: "bg-[var(--danger)] text-[var(--text-on-brand)] shadow-[var(--shadow-sm)] hover:bg-[var(--red-600)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-[var(--radius-md)] px-3",
        lg: "h-11 rounded-[var(--radius-md)] px-8",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
