import * as React from "react";

import { cn } from "../../lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        data-slot="input"
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-[var(--widget-border-default)] bg-[var(--widget-surface)] px-3 py-2 text-sm text-[var(--widget-text-primary)] placeholder:text-[var(--widget-text-tertiary)] shadow-sm focus-visible:outline-none focus-visible:border-[var(--widget-border-strong)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
