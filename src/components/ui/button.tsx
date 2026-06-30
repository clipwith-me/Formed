"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#1F5E4A] text-white shadow-[0_2px_8px_rgba(31,94,74,0.25)] hover:bg-[#2d7a61] hover:shadow-[0_4px_16px_rgba(31,94,74,0.35)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-[#1F5E4A]",
        secondary:
          "bg-transparent text-[#1F5E4A] border-2 border-[#1F5E4A] hover:bg-[#e8f4ef] hover:-translate-y-0.5 focus-visible:ring-[#1F5E4A]",
        outline:
          "bg-transparent text-[#1F5E4A] border-2 border-[#1F5E4A] hover:bg-[#e8f4ef] hover:-translate-y-0.5 focus-visible:ring-[#1F5E4A]",
        ghost:
          "bg-transparent text-[#1F5E4A] hover:bg-[#e8f4ef] focus-visible:ring-[#1F5E4A]",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:-translate-y-0.5 focus-visible:ring-red-600",
        gold:
          "bg-[#D4A72C] text-white shadow-[0_2px_8px_rgba(212,167,44,0.25)] hover:bg-[#e8c24a] hover:shadow-[0_4px_16px_rgba(212,167,44,0.35)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-[#D4A72C]",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 px-3 py-1.5 text-xs rounded-lg",
        lg: "h-12 px-8 py-3 text-base rounded-xl",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
