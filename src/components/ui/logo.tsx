import * as React from "react";

import { cn } from "@/lib/utils";

export interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  showDot?: boolean;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "inverse";
}

const sizeClasses: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
};

export function Logo({ className, showDot = true, size = "md", tone = "default", ...props }: LogoProps) {
  const inverse = tone === "inverse";

  return (
    <span
      className={cn(
        "font-display font-extrabold tracking-normal",
        sizeClasses[size],
        inverse ? "text-white" : "text-[var(--text-strong)]",
        className,
      )}
      {...props}
    >
      privazy{showDot && <span className={inverse ? "text-[var(--blue-300)]" : "text-[var(--brand)]"}>.</span>}
    </span>
  );
}
