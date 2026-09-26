import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "../../lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { marks?: number[] }
>(({ className, marks, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="wg-slider-track relative h-2 w-full grow overflow-hidden rounded-full bg-[var(--widget-surface-tertiary)]">
      <SliderPrimitive.Range className="absolute h-full bg-[var(--widget-accent)]" />
      {marks?.map((position, index) => <span key={index} className="wg-slider-tick" style={{ left: `${position}%` }} />)}
    </SliderPrimitive.Track>
    {(props.value ?? props.defaultValue ?? [0]).map((_, index) => <SliderPrimitive.Thumb key={index} className="wg-slider-thumb wg-focusable block h-4 w-4 rounded-full border border-[var(--widget-border-default)] bg-[var(--widget-surface)] shadow-sm focus-visible:outline-none" />)}
  </SliderPrimitive.Root>
));
Slider.displayName = "Slider";

export { Slider };
