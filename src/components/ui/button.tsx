import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-[var(--widget-ring-color)] focus-visible:ring-[var(--widget-ring-color)] focus-visible:ring-[3px] aria-invalid:ring-[var(--widget-danger-soft-border)] aria-invalid:border-[var(--widget-danger)]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--widget-text-emphasis)] text-[var(--widget-surface)] hover:opacity-90",
        destructive:
          "bg-[var(--widget-danger)] text-white hover:opacity-90 focus-visible:ring-[var(--widget-danger-soft-border)]",
        outline:
          "border border-[var(--widget-border-default)] bg-[var(--widget-surface)] shadow-xs hover:bg-[var(--widget-surface-hover)] hover:text-[var(--widget-text-emphasis)]",
        secondary:
          "bg-[var(--widget-surface-tertiary)] text-[var(--widget-text-primary)] hover:bg-[var(--widget-surface-active)]",
        ghost:
          "hover:bg-[var(--widget-surface-hover)] hover:text-[var(--widget-text-emphasis)]",
        link: "text-[var(--widget-text-emphasis)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
