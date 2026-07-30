import * as React from "react";

import { cn } from "../../lib/utils";

type SpinnerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: "xs" | "sm" | "md" | "lg";
};

const sizeMap: Record<NonNullable<SpinnerProps["size"]>, string> = {
  xs: "h-3 w-3 border-[1.5px]",
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-6 w-6 border-[2.5px]"
};

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-block animate-spin rounded-full border-[var(--widget-border-default)] border-t-[var(--widget-text-primary)]",
        sizeMap[size],
        className
      )}
      {...props}
    />
  )
);
Spinner.displayName = "Spinner";

export { Spinner };
