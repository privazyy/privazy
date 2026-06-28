import * as React from "react";

import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn("pvz-select", invalid && "border-[var(--danger)]", className)}
        aria-invalid={invalid || undefined}
        {...props}
      />
    );
  },
);
Select.displayName = "Select";
