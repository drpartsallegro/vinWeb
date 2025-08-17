import * as React from "react"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"

export interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  onClick?: () => void
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, fallback, size = 'md', className, onClick, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false)
    
    const sizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    }

    const textSizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    }

    const showImage = src && !imageError
    const showFallback = !showImage && fallback
    const showIcon = !showImage && !showFallback

    const handleImageError = () => {
      setImageError(true)
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full bg-surface-2 text-muted overflow-hidden',
          sizeClasses[size],
          onClick && 'cursor-pointer hover:bg-surface-3 transition-colors',
          className
        )}
        onClick={onClick}
        {...props}
      >
        {showImage && (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="h-full w-full object-cover"
            onError={handleImageError}
          />
        )}
        
        {showFallback && (
          <span className={cn('font-medium', textSizes[size])}>
            {fallback.slice(0, 2).toUpperCase()}
          </span>
        )}
        
        {showIcon && (
          <User className={cn('h-1/2 w-1/2', textSizes[size])} />
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar }
