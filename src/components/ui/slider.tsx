import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "../../lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-[var(--widget-surface-tertiary)]">
      <SliderPrimitive.Range className="absolute h-full bg-[var(--widget-accent)]" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-[var(--widget-border-default)] bg-[var(--widget-surface)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--widget-ring-color)]" />
  </SliderPrimitive.Root>
));
Slider.displayName = "Slider";

export { Slider };
