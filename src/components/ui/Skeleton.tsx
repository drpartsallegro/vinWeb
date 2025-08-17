import * as React from "react"
import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  size?: 'sm' | 'md' | 'lg'
  lines?: number
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'rectangular', size = 'md', lines = 1, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4',
      md: 'h-6',
      lg: 'h-8',
    }

    const variantClasses = {
      text: 'rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-md',
    }

    if (variant === 'text' && lines > 1) {
      return (
        <div className="space-y-2" ref={ref} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'animate-pulse bg-surface-2',
                sizeClasses[size],
                variantClasses[variant],
                index === lines - 1 ? 'w-3/4' : 'w-full',
                className
              )}
            />
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse bg-surface-2',
          variant === 'circular' ? 'aspect-square' : sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

export { Skeleton }




