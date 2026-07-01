import * as React from "react";

import { cn } from "@/lib/utils";

export interface FileUploadProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  helperText?: React.ReactNode;
  label: React.ReactNode;
}

export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({ className, helperText, label, ...props }, ref) => {
    return (
      <label
        className={cn(
          "flex min-w-0 cursor-pointer flex-col gap-2 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-card)] p-5 text-sm transition-colors hover:border-[var(--brand-border)] hover:bg-[var(--brand-soft)]",
          className,
        )}
      >
        <span className="font-semibold text-[var(--text-strong)]">{label}</span>
        {helperText && <span className="break-words text-[var(--text-muted)]">{helperText}</span>}
        <input
          ref={ref}
          className="mt-2 block w-full min-w-0 text-sm text-[var(--text-body)] file:mr-3 file:rounded-[var(--radius-md)] file:border-0 file:bg-[var(--brand)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--text-on-brand)]"
          type="file"
          {...props}
        />
      </label>
    );
  },
);
FileUpload.displayName = "FileUpload";
