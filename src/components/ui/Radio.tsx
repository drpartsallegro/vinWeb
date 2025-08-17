import * as React from "react"
import { cn } from "@/lib/utils"

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  description?: string
  error?: string
  size?: 'sm' | 'md' | 'lg'
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, error, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
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
            type="radio"
            className={cn(
              "peer sr-only",
              className
            )}
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              "flex items-center justify-center rounded-full border-2 border-border bg-surface transition-all duration-200",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
              "peer-checked:border-primary",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              error && "border-danger peer-focus-visible:ring-danger",
              sizeClasses[size]
            )}
          >
            <div
              className={cn(
                "rounded-full bg-primary transition-all duration-200",
                "peer-checked:scale-100 peer-checked:opacity-100",
                "scale-0 opacity-0",
                size === 'sm' ? 'h-2 w-2' : size === 'lg' ? 'h-3 w-3' : 'h-2.5 w-2.5'
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
Radio.displayName = "Radio"

export { Radio }
