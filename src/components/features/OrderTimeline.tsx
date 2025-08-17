"use client"

import * as React from "react"
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/utils"

export interface TimelineEvent {
  id: string
  type: "success" | "pending" | "error" | "info"
  title: string
  description?: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface OrderTimelineProps {
  status: string
  createdAt: string | Date
  updatedAt: string | Date
  orderId?: string // Add orderId prop
  className?: string
  showTimestamps?: boolean
}

export const OrderTimeline = React.forwardRef<HTMLDivElement, OrderTimelineProps>(
  ({ status, createdAt, updatedAt, orderId, className, showTimestamps = true }, ref) => {
    // Generate timeline events based on order status and dates
    const events: TimelineEvent[] = React.useMemo(() => {
      const events: TimelineEvent[] = []
      
      // Order created
      events.push({
        id: 'created',
        type: 'success',
        title: 'Order Created',
        description: 'Your parts request has been submitted successfully',
        timestamp: new Date(createdAt).toISOString(),
        metadata: {
          'Order ID': orderId || 'Unknown',
          'Status': 'Pending Review'
        }
      })

      // Status-based events
      if (status === 'PENDING') {
        events.push({
          id: 'pending',
          type: 'pending',
          title: 'Under Review',
          description: 'Our team is reviewing your request and searching for parts',
          timestamp: new Date(updatedAt).toISOString(),
          metadata: {
            'Estimated Time': '24 hours',
            'Next Step': 'Receive Quotes'
          }
        })
      } else if (status === 'VALUATED') {
        events.push({
          id: 'valuated',
          type: 'success',
          title: 'Quotes Ready',
          description: 'Your quotes are ready! Review and select your preferred parts',
          timestamp: new Date(updatedAt).toISOString(),
          metadata: {
            'Action Required': 'Select Offers',
            'Next Step': 'Make Purchase'
          }
        })
      } else if (status === 'PAID') {
        events.push({
          id: 'paid',
          type: 'success',
          title: 'Payment Confirmed',
          description: 'Your order has been paid and is being processed',
          timestamp: new Date(updatedAt).toISOString(),
          metadata: {
            'Status': 'Processing',
            'Next Step': 'Shipping'
          }
        })
      } else if (status === 'REMOVED') {
        events.push({
          id: 'removed',
          type: 'error',
          title: 'Order Removed',
          description: 'This order has been removed from the system',
          timestamp: new Date(updatedAt).toISOString(),
          metadata: {
            'Reason': 'User Request',
            'Action': 'Create New Order'
          }
        })
      }

      return events
    }, [status, createdAt, updatedAt, orderId])

    const getEventIcon = (type: TimelineEvent["type"]) => {
      switch (type) {
        case "success":
          return <CheckCircle className="h-4 w-4 text-success" />
        case "pending":
          return <Clock className="h-4 w-4 text-warning" />
        case "error":
          return <XCircle className="h-4 w-4 text-danger" />
        case "info":
          return <AlertCircle className="h-4 w-4 text-primary" />
        default:
          return <Clock className="h-4 w-4 text-muted" />
      }
    }

    const getEventColor = (type: TimelineEvent["type"]) => {
      switch (type) {
        case "success":
          return "border-success/30 bg-success/10"
        case "pending":
          return "border-warning/30 bg-warning/10"
        case "error":
          return "border-danger/30 bg-danger/10"
        case "info":
          return "border-primary/30 bg-primary/10"
        default:
          return "border-border bg-surface-2"
      }
    }

    if (events.length === 0) {
      return (
        <div className="text-center py-8 text-muted">
          <Clock className="mx-auto h-8 w-8 mb-2" />
          <p>No timeline events yet</p>
        </div>
      )
    }

    return (
      <div ref={ref} className={cn("w-full max-w-4xl mx-auto", className)}>
        <div className="space-y-1">
          {events.map((event, index) => (
            <div key={event.id} className="flex gap-6">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    getEventColor(event.type)
                  )}
                >
                  {getEventIcon(event.type)}
                </div>
                {index < events.length - 1 && (
                  <div className="w-0.5 h-32 bg-border mt-2" />
                )}
              </div>

              {/* Event Content */}
              <div className="flex-1 pb-1">
                <div className="space-y-2">
                  <h4 className="font-medium text-text text-lg">{event.title}</h4>
                  {event.description && (
                    <p className="text-muted">{event.description}</p>
                  )}
                  {showTimestamps && event.timestamp && (
                    <p className="text-xs text-muted">{formatRelativeTime(event.timestamp)}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
)
OrderTimeline.displayName = "OrderTimeline"

