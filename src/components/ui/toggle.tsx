import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--widget-ring-color)] disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-[var(--widget-accent-soft)] data-[state=on]:text-[var(--widget-accent)]",
  {
    variants: {
      variant: {
        default: "bg-[var(--widget-surface-tertiary)] text-[var(--widget-text-primary)] hover:bg-[var(--widget-surface-active)]",
        outline: "border border-[var(--widget-border-default)] bg-[var(--widget-surface)] text-[var(--widget-text-primary)] hover:bg-[var(--widget-surface-hover)]"
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
