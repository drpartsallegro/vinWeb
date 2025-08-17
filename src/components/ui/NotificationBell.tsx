"use client"

import * as React from "react"
import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"

export interface NotificationBellProps {
  count?: number
  hasUnread?: boolean
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const NotificationBell = React.forwardRef<HTMLButtonElement, NotificationBellProps>(
  ({ count = 0, hasUnread = false, onClick, className, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
    }

    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    }

    const showCount = count > 0
    const showDot = hasUnread && count === 0

    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          'relative inline-flex items-center justify-center rounded-md text-muted hover:text-text hover:bg-surface-2 transition-colors focus-ring',
          sizeClasses[size],
          className
        )}
        aria-label={`Notifications${showCount ? ` (${count} unread)` : ''}`}
        {...props}
      >
        <Bell className={iconSizes[size]} />
        
        {/* Notification count badge */}
        {showCount && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs font-medium text-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
        
        {/* Unread indicator dot */}
        {showDot && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-warn" />
        )}
      </button>
    )
  }
)
NotificationBell.displayName = "NotificationBell"

export { NotificationBell }




