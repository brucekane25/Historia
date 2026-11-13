import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const chipVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[3px] font-mono text-[10px] font-medium uppercase tracking-[0.14em] transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "border border-hairline bg-transparent text-dim hover:border-hairline-strong hover:text-parchment",
        success:
          "border border-verdigris/45 bg-verdigris/12 text-verdigris hover:bg-verdigris/20",
        destructive:
          "border border-cinnabar/45 bg-cinnabar/12 text-cinnabar hover:bg-cinnabar/20",
        outline:
          "border border-hairline bg-transparent text-dim hover:text-parchment",
      },
      size: {
        default: "h-8 px-3 py-1.5",
        sm: "h-7 px-2.5",
        lg: "h-9 px-4",
        icon: "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Chip({
  className,
  variant,
  size,
  ...props
}) {
  return (
    (<div
      className={cn(chipVariants({ variant, size, className }))}
      {...props} />)
  );
}

export { Chip, chipVariants }
