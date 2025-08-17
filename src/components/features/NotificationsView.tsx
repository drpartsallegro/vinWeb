'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/ui/Toast'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import {
  Bell,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MessageCircle,
  User,
  Users,
  Shield,
  ArrowLeft,
  Check,
  Filter,
  Eye,
  EyeOff,
} from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
  orderRequest?: {
    shortCode: string
    status: string
  }
}

interface NotificationsViewProps {
  data: {
    notifications: Notification[]
    unreadCount: number
  }
}

export function NotificationsView({ data }: NotificationsViewProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [notifications, setNotifications] = useState(data.notifications)
  const [unreadCount, setUnreadCount] = useState(data.unreadCount)
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(false)

  const filterOptions = [
    { value: 'ALL', label: 'All Notifications' },
    { value: 'UNREAD', label: 'Unread Only' },
    { value: 'STATUS_CHANGED', label: 'Status Updates' },
    { value: 'COMMENT_ADDED', label: 'New Messages' },
    { value: 'PAYMENT_SUCCEEDED', label: 'Payment Confirmations' },
  ]

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'ALL') return true
    if (filter === 'UNREAD') return !notification.isRead
    return notification.type === filter
  })

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/v1/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: notificationIds }),
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            notificationIds.includes(n.id) ? { ...n, isRead: true } : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
        
        addToast({
          type: 'success',
          title: 'Marked as read',
          description: `${notificationIds.length} notification${notificationIds.length > 1 ? 's' : ''} marked as read`,
        })
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Could not update notifications',
      })
    }
  }

  const markAllAsRead = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/v1/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAllAsRead: true }),
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
        
        addToast({
          type: 'success',
          title: 'All notifications marked as read',
          description: 'Your notification list has been cleared',
        })
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Could not update notifications',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead([notification.id])
    }
    
    if (notification.orderRequest) {
      router.push(`/orders/${notification.orderRequest.shortCode}`)
    }
  }

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      STATUS_CHANGED: '📋',
      OFFER_ADDED: '💰',
      OFFER_UPDATED: '🔄',
      COMMENT_ADDED: '💬',
      PAYMENT_SUCCEEDED: '✅',
      PAYMENT_FAILED: '❌',
      ORDER_REMOVED: '🗑️',
      ORDER_RESTORED: '🔄',
    }
    return iconMap[type] || '📢'
  }

  const getTypeLabel = (type: string) => {
    const labelMap: Record<string, string> = {
      STATUS_CHANGED: 'Status Update',
      OFFER_ADDED: 'New Quote',
      OFFER_UPDATED: 'Quote Updated',
      COMMENT_ADDED: 'New Message',
      PAYMENT_SUCCEEDED: 'Payment Confirmed',
      PAYMENT_FAILED: 'Payment Failed',
      ORDER_REMOVED: 'Order Removed',
      ORDER_RESTORED: 'Order Restored',
    }
    return labelMap[type] || type.replace('_', ' ')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted">
              {unreadCount > 0 
                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All caught up!'
              }
            </p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            disabled={loading}
            loading={loading}
          >
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-muted" />
            <Select
              options={filterOptions}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-48"
            />
            <span className="text-sm text-muted">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text mb-2">
              {filter === 'UNREAD' ? 'No unread notifications' : 'No notifications'}
            </h3>
            <p className="text-muted">
              {filter === 'UNREAD' 
                ? 'All your notifications have been read!'
                : 'New notifications will appear here when you have activity on your orders.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`cursor-pointer hover:shadow-lg transition-all ${
                !notification.isRead ? 'ring-2 ring-primary/20 bg-primary/5' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className={`font-medium ${
                          !notification.isRead ? 'text-text' : 'text-muted'
                        }`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-muted bg-chip px-2 py-1 rounded-full">
                          {getTypeLabel(notification.type)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!notification.isRead ? (
                          <EyeOff className="h-4 w-4 text-primary" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted" />
                        )}
                        <span className="h-2 w-2 bg-warning rounded-full" style={{
                          opacity: notification.isRead ? 0 : 1
                        }} />
                      </div>
                    </div>
                    
                    <p className="text-sm text-text mb-3">
                      {notification.body}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted">
                      <div className="flex items-center gap-4">
                        {notification.orderRequest && (
                          <span className="text-primary font-medium">
                            Order #{notification.orderRequest.shortCode}
                          </span>
                        )}
                        <span>
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      
                      <span>
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {notifications.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Notification Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-text">{notifications.length}</p>
                <p className="text-sm text-muted">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">{unreadCount}</p>
                <p className="text-sm text-muted">Unread</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {notifications.filter(n => n.type === 'STATUS_CHANGED').length}
                </p>
                <p className="text-sm text-muted">Status Updates</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">
                  {notifications.filter(n => n.type === 'PAYMENT_SUCCEEDED').length}
                </p>
                <p className="text-sm text-muted">Payments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}





