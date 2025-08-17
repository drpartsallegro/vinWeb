import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  description?: string
  error?: string
  size?: 'sm' | 'md' | 'lg'
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, error, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-5 w-9',
      md: 'h-6 w-11',
      lg: 'h-7 w-14'
    }

    const thumbSizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    }

    const labelSizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    }

    return (
      <div className="flex items-start space-x-3">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            role="switch"
            className={cn(
              "peer sr-only",
              className
            )}
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              "relative inline-flex cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
              "peer-checked:bg-primary peer-checked:border-primary",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              "bg-surface-2 border-border",
              error && "border-danger peer-focus-visible:ring-danger",
              sizeClasses[size]
            )}
          >
            <div
              className={cn(
                "pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition-all duration-200 ease-in-out",
                "peer-checked:translate-x-full",
                "translate-x-0",
                thumbSizeClasses[size]
              )}
            />
          </div>
        </div>
        
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label
                htmlFor={props.id}
                className={cn(
                  "font-medium text-text cursor-pointer select-none",
                  labelSizeClasses[size],
                  props.disabled && "cursor-not-allowed opacity-50"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className={cn(
                "text-sm text-muted mt-1",
                size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
              )}>
                {description}
              </p>
            )}
            {error && (
              <p className="text-sm text-danger mt-1">{error}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
