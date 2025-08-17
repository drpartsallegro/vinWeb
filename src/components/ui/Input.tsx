import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, success, leftIcon, rightIcon, placeholder, value, onChange, ...props }, ref) => {
    const id = React.useId()
    const [isFocused, setIsFocused] = React.useState(false)
    
    // Simple value detection - no complex logic
    const hasValue = value !== undefined && value !== null && String(value).trim().length > 0
    const isActive = isFocused || hasValue

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      props.onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
    }

    return (
      <div className="relative">
        {/* Label above input - no more overlapping */}
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "block text-sm font-medium text-text mb-2",
              error && "text-danger",
              success && "text-success"
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted z-10">
              {leftIcon}
            </div>
          )}
          
          {/* Input Field */}
          <input
            type={type}
            className={cn(
              "w-full h-12 px-3 py-4 text-sm bg-surface border rounded-lg transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error ? "border-danger focus:border-danger focus:ring-danger/20" : 
              success ? "border-success focus:border-success focus:ring-success/20" : 
              "border-border focus:border-primary",
              className
            )}
            ref={ref}
            id={id}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-2 text-xs text-danger">
            {error}
          </p>
        )}

        {/* Success Message */}
        {success && !error && (
          <p className="mt-2 text-xs text-success">
            {success}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
