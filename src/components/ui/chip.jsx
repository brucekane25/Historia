import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const chipVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-medium ring-offset-background transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white",
        success:
          "border border-purple-500/30 bg-purple-500/15 text-purple-600 dark:text-purple-300 hover:bg-purple-500/25 shadow-sm shadow-purple-500/10",
        destructive:
          "border border-purple-500/30 bg-purple-500/15 text-purple-600 dark:text-purple-300 hover:bg-purple-500/25 shadow-sm shadow-purple-500/10",
        outline:
          "border border-gray-200 dark:border-white/10 bg-transparent text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/5",
      },
      size: {
        default: "h-9 px-3 py-1.5 text-xs",
        sm: "h-7 px-2.5 text-[11px]",
        lg: "h-10 px-4 text-sm",
        icon: "h-9 w-9",
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