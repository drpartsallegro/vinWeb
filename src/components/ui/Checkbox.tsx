import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  description?: string
  error?: string
  size?: 'sm' | 'md' | 'lg'
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, size = 'md', onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(e.target.checked)
      }
    }

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
            type="checkbox"
            className={cn(
              "peer sr-only",
              className
            )}
            ref={ref}
            {...props}
            onChange={handleChange}
          />
          <div
            className={cn(
              "flex items-center justify-center rounded-lg border-2 border-border bg-surface transition-all duration-200",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
              "peer-checked:border-primary peer-checked:bg-primary",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              error && "border-danger peer-focus-visible:ring-danger",
              sizeClasses[size]
            )}
          >
            <Check 
              className={cn(
                "text-white transition-all duration-200",
                "peer-checked:scale-100 peer-checked:opacity-100",
                "scale-0 opacity-0",
                size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'
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
Checkbox.displayName = "Checkbox"

export { Checkbox }
