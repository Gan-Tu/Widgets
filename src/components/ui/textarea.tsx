import * as React from "react";

import { cn } from "../../lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-[var(--widget-border-default)] bg-[var(--widget-surface)] px-3 py-2 text-sm text-[var(--widget-text-primary)] placeholder:text-[var(--widget-text-tertiary)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--widget-ring-color)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
