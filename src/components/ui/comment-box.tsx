import * as React from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface CommentBoxProps extends React.FormHTMLAttributes<HTMLFormElement> {
  helperText?: React.ReactNode;
  label?: string;
  submitLabel?: string;
}

export function CommentBox({
  className,
  helperText,
  label = "Komentarz",
  submitLabel = "Dodaj komentarz",
  ...props
}: CommentBoxProps) {
  const commentId = React.useId();

  return (
    <form className={cn("grid min-w-0 gap-3", className)} {...props}>
      <label className="text-sm font-semibold text-[var(--text-strong)]" htmlFor={commentId}>
        {label}
      </label>
      <Textarea id={commentId} name="comment" placeholder="Wpisz notatke lub aktualizacje sprawy" />
      {helperText && <p className="break-words text-sm text-[var(--text-muted)]">{helperText}</p>}
      <div className="flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
