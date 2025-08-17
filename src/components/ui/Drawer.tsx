import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./Button"

export interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  title?: string
  description?: string
  side?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({ 
    open, 
    onOpenChange, 
    children, 
    title, 
    description,
    side = 'right',
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    className,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: side === 'left' || side === 'right' ? 'w-80' : 'h-80',
      md: side === 'left' || side === 'right' ? 'w-96' : 'h-96',
      lg: side === 'left' || side === 'right' ? 'w-[32rem]' : 'h-[32rem]',
      xl: side === 'left' || side === 'right' ? 'w-[40rem]' : 'h-[40rem]',
      full: side === 'left' || side === 'right' ? 'w-full' : 'h-full'
    }

    const sideClasses = {
      left: 'left-0 top-0 h-full',
      right: 'right-0 top-0 h-full',
      top: 'top-0 left-0 w-full',
      bottom: 'bottom-0 left-0 w-full'
    }

    const transformClasses = {
      left: open ? 'translate-x-0' : '-translate-x-full',
      right: open ? 'translate-x-0' : 'translate-x-full',
      top: open ? 'translate-y-0' : '-translate-y-full',
      bottom: open ? 'translate-y-0' : 'translate-y-full'
    }

    React.useEffect(() => {
      if (!closeOnEscape) return

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && open) {
          onOpenChange(false)
        }
      }

      if (open) {
        document.addEventListener('keydown', handleEscape)
        document.body.style.overflow = 'hidden'
      }

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = 'unset'
      }
    }, [open, onOpenChange, closeOnEscape])

    if (!open) return null

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={closeOnOverlayClick ? () => onOpenChange(false) : undefined}
        />
        
        {/* Drawer */}
        <div
          ref={ref}
          className={cn(
            "fixed z-50 bg-surface border-border shadow-float transition-transform duration-300 ease-out",
            sideClasses[side],
            sizeClasses[size],
            transformClasses[side],
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'drawer-title' : undefined}
          aria-describedby={description ? 'drawer-description' : undefined}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex-1">
                {title && (
                  <h2 id="drawer-title" className="text-lg font-semibold text-text">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="drawer-description" className="text-sm text-muted mt-1">
                    {description}
                  </p>
                )}
              </div>
              
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="ml-4"
                  aria-label="Close drawer"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {children}
          </div>
        </div>
      </>
    )
  }
)
Drawer.displayName = "Drawer"

export { Drawer }
