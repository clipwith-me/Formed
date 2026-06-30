import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-[#1F5E4A] text-white",
        outline:
          "border border-[#1F5E4A] text-[#1F5E4A] bg-transparent",
        gold:
          "bg-[#D4A72C] text-white",
        success:
          "bg-emerald-100 text-emerald-700 border border-emerald-200",
        muted:
          "bg-gray-100 text-gray-500 border border-gray-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
