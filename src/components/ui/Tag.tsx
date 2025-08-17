import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  removable?: boolean
  onRemove?: () => void
  disabled?: boolean
}

const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    removable = false, 
    onRemove, 
    disabled = false,
    children, 
    ...props 
  }, ref) => {
    const variantClasses = {
      default: 'bg-surface-2 text-text border-border',
      primary: 'bg-primary/10 text-primary border-primary/20',
      secondary: 'bg-secondary/10 text-secondary border-secondary/20',
      success: 'bg-success/10 text-success border-success/20',
      warning: 'bg-warning/10 text-warning border-warning/20',
      danger: 'bg-danger/10 text-danger border-danger/20',
      info: 'bg-info/10 text-info border-info/20'
    }

    const sizeClasses = {
      sm: 'px-2 py-1 text-xs gap-1',
      md: 'px-3 py-1.5 text-sm gap-1.5',
      lg: 'px-4 py-2 text-base gap-2'
    }

    const removeButtonSizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-lg border font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          variantClasses[variant],
          sizeClasses[size],
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <span className="truncate">{children}</span>
        
        {removable && onRemove && !disabled && (
          <button
            type="button"
            onClick={onRemove}
            className={cn(
              "flex-shrink-0 rounded-full p-0.5 transition-all duration-200",
              "hover:bg-black/10 focus-visible:bg-black/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              removeButtonSizeClasses[size]
            )}
            aria-label="Remove tag"
          >
                            <X className="h-full w-full" />
          </button>
        )}
      </div>
    )
  }
)
Tag.displayName = "Tag"

export { Tag }
