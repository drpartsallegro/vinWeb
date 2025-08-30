import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, Clock, DollarSign, XCircle } from "lucide-react"

export type StatusType = 'PENDING' | 'VALUATED' | 'PAID' | 'REMOVED'

export interface StatusChipProps {
  status: StatusType
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig = {
  PENDING: {
    label: 'Oczekujące',
    color: 'bg-warn/10 text-warn border-warn/20',
    icon: Clock,
  },
  VALUATED: {
    label: 'Wycena',
    color: 'bg-success/10 text-success border-success/20',
    icon: CheckCircle,
  },
  PAID: {
    label: 'Opłacone',
    color: 'bg-primary/10 text-primary border-primary/20',
    icon: DollarSign,
  },
  REMOVED: {
    label: 'Usunięte',
    color: 'bg-danger/10 text-danger border-danger/20',
    icon: XCircle,
  },
}

const sizeConfig = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
}

const StatusChip = React.forwardRef<HTMLDivElement, StatusChipProps>(
  ({ status, className, showIcon = true, size = 'md', ...props }, ref) => {
    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border font-medium transition-colors',
          sizeConfig[size],
          config.color,
          className
        )}
        {...props}
      >
        {showIcon && <Icon className="h-3 w-3" />}
        <span>{config.label}</span>
      </div>
    )
  }
)
StatusChip.displayName = "StatusChip"

export { StatusChip }




