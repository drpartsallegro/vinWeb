import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  success?: string
  leftIcon?: React.ReactNode
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, success, leftIcon, placeholder, value, onChange, ...props }, ref) => {
    const id = React.useId()
    const [isFocused, setIsFocused] = React.useState(false)
    
    // Determine if textarea has value - this is the key fix
    const hasValue = value !== undefined && value !== null && String(value).trim().length > 0
    const isActive = isFocused || hasValue

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false)
      props.onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e)
    }

    return (
      <div className="relative">
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-3 text-muted z-10">
              {leftIcon}
            </div>
          )}

          {/* Textarea Field */}
          <textarea
            className={cn(
              "w-full min-h-[80px] px-3 py-4 text-sm bg-surface border rounded-lg transition-all duration-200 resize-vertical",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-10",
              error ? "border-danger focus:border-danger focus:ring-danger/20" : 
              success ? "border-success focus:border-success focus:ring-success/20" : 
              "border-border focus:border-primary",
              className
            )}
            ref={ref}
            id={id}
            value={value}
            onChange={handleChange}
            placeholder={isActive ? undefined : placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {/* Floating Label */}
          {label && (
            <label
              htmlFor={id}
              className={cn(
                "absolute pointer-events-none transition-all duration-200",
                leftIcon && "left-10",
                isActive 
                  ? "top-1 left-3 text-xs text-primary font-medium" 
                  : "top-3 left-3 text-sm text-muted",
                error && "text-danger",
                success && "text-success"
              )}
            >
              {label}
            </label>
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
Textarea.displayName = "Textarea"

export { Textarea }
