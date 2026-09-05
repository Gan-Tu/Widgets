import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const toggleVariants = cva(
  "wg-focusable inline-flex cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=on]:border-[var(--widget-accent)] data-[state=on]:bg-[var(--widget-accent)] data-[state=on]:text-[var(--widget-on-accent)] data-[state=on]:enabled:hover:border-[var(--widget-accent-strong)] data-[state=on]:enabled:hover:bg-[var(--widget-accent-strong)]",
  {
    variants: {
      variant: {
        default: "border border-transparent bg-transparent text-[var(--widget-text-primary)] enabled:hover:bg-[var(--widget-surface-secondary)]",
        outline: "border border-[var(--widget-border-default)] bg-transparent text-[var(--widget-text-primary)] enabled:hover:bg-[var(--widget-surface-secondary)]"
      },
      size: {
        default: "h-9 px-3",
        sm: "h-8 px-2 text-xs",
        lg: "h-10 px-4 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size }), className)}
    {...props}
  />
));
Toggle.displayName = "Toggle";

export { Toggle, toggleVariants };
