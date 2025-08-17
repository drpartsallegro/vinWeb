import * as React from "react"
import { cn } from "@/lib/utils"

export interface SegmentedControlOption {
  value: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[]
  value: string
  onChange: (value: string) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled'
  disabled?: boolean
  className?: string
}

const SegmentedControl = React.forwardRef<HTMLDivElement, SegmentedControlProps>(
  ({ 
    options, 
    value, 
    onChange, 
    size = 'md', 
    variant = 'default',
    disabled = false,
    className 
  }, ref) => {
    const sizeClasses = {
      sm: 'h-8 text-xs',
      md: 'h-10 text-sm',
      lg: 'h-12 text-base'
    }

    const paddingClasses = {
      sm: 'px-2',
      md: 'px-3',
      lg: 'px-4'
    }

    const variantClasses = {
      default: 'bg-surface-2 border border-border',
      filled: 'bg-surface-3'
    }

    const selectedClasses = {
      default: 'bg-surface text-text shadow-sm',
      filled: 'bg-primary text-white'
    }

    const handleOptionClick = (optionValue: string) => {
      if (disabled) return
      onChange(optionValue)
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex rounded-lg p-1 transition-colors duration-200",
          variantClasses[variant],
          sizeClasses[size],
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        role="tablist"
        aria-label="Segmented control"
      >
        {options.map((option) => {
          const isSelected = value === option.value
          const isDisabled = disabled || option.disabled

          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              onClick={() => handleOptionClick(option.value)}
              className={cn(
                "relative flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "hover:enabled:bg-surface-3/50",
                paddingClasses[size],
                isSelected && selectedClasses[variant],
                !isSelected && "text-muted hover:enabled:text-text",
                isDisabled && "cursor-not-allowed opacity-50"
              )}
            >
              {option.icon && (
                <span className="flex-shrink-0">
                  {option.icon}
                </span>
              )}
              <span className="truncate">{option.label}</span>
            </button>
          )
        })}
      </div>
    )
  }
)
SegmentedControl.displayName = "SegmentedControl"

export { SegmentedControl }
