import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ 
    value, 
    max = 100, 
    label, 
    showValue = false, 
    showLabel = true,
    size = 'md',
    variant = 'default',
    className,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const sizeClasses = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
    }

    const variantClasses = {
      default: 'bg-primary',
      primary: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warn',
      danger: 'bg-danger',
    }

    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
        {...props}
      >
        {/* Label and value */}
        {(label || showValue) && (
          <div className="flex items-center justify-between mb-2">
            {label && (
              <span className="text-sm font-medium text-text">
                {label}
              </span>
            )}
            {showValue && (
              <span className="text-sm text-muted">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div
          className={cn(
            'w-full rounded-full bg-surface-2 overflow-hidden',
            sizeClasses[size]
          )}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-out',
              variantClasses[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)
ProgressBar.displayName = "ProgressBar"

export { ProgressBar }




