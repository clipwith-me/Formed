import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-[#222222]",
          "placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-[#1F5E4A]/20 focus:border-[#1F5E4A]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200",
          "shadow-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
