'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import {
  Plus,
  Pencil,
  Trash2,
  Bell,
  Clock,
  User,
  Users,
  Shield,
  Search,
  Filter,
  Calendar,
  Send,
} from 'lucide-react'

interface Notification {
  id: string
  title: string
  body: string
  type: 'STATUS_CHANGED' | 'OFFER_ADDED' | 'OFFER_UPDATED' | 'COMMENT_ADDED' | 'PAYMENT_SUCCEEDED' | 'PAYMENT_FAILED' | 'ORDER_REMOVED' | 'ORDER_RESTORED'
  audience: 'USER' | 'ADMIN' | 'STAFF' | 'GUEST'
  orderRequestId?: string
  createdAt: string
  user?: {
    name: string
    email: string
  }
  orderRequest?: {
    shortCode: string
    status: string
  }
}

interface NotificationFormData {
  title: string
  body: string
  type: 'STATUS_CHANGED' | 'OFFER_ADDED' | 'OFFER_UPDATED' | 'COMMENT_ADDED' | 'PAYMENT_SUCCEEDED' | 'PAYMENT_FAILED' | 'ORDER_REMOVED' | 'ORDER_RESTORED'
  audience: 'USER' | 'ADMIN' | 'STAFF' | 'GUEST'
  orderRequestId?: string
}

interface NotificationStats {
  [key: string]: {
    [key: string]: number
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [audienceFilter, setAudienceFilter] = useState('ALL')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null)
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    body: '',
    type: 'STATUS_CHANGED',
    audience: 'USER',
    orderRequestId: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState<NotificationStats>({})

  useEffect(() => {
    fetchNotifications()
  }, [currentPage, searchTerm, typeFilter, audienceFilter, unreadOnly])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (typeFilter !== 'ALL') params.append('type', typeFilter)
      if (audienceFilter !== 'ALL') params.append('audience', audienceFilter)
      if (unreadOnly) params.append('unreadOnly', 'true')

      const response = await fetch(`/api/admin/notifications?${params}`)
      if (!response.ok) throw new Error('Failed to fetch notifications')
      
      const data = await response.json()
      setNotifications(data.notifications)
      setTotalPages(data.totalPages)
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Notification creation failed:', errorData)
        throw new Error(errorData.error || `Failed to create notification: ${response.status} ${response.statusText}`)
      }

      await fetchNotifications()
      resetForm()
      setShowForm(false)
    } catch (error) {
      console.error('Error creating notification:', error)
      alert(error instanceof Error ? error.message : 'Failed to create notification')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return

    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to delete notification')
        return
      }

      await fetchNotifications()
    } catch (error) {
      console.error('Error deleting notification:', error)
      alert('Failed to delete notification')
    }
  }

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification)
    setFormData({
      title: notification.title,
      body: notification.body,
      type: notification.type,
      audience: notification.audience,
      orderRequestId: notification.orderRequestId || '',
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      body: '',
      type: 'STATUS_CHANGED',
      audience: 'USER',
      orderRequestId: '',
    })
    setEditingNotification(null)
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'STATUS_CHANGED': return 'default'
      case 'COMMENT_ADDED': return 'secondary'
      case 'OFFER_ADDED': return 'outline'
      case 'OFFER_UPDATED': return 'outline'
      case 'PAYMENT_SUCCEEDED': return 'default'
      case 'PAYMENT_FAILED': return 'destructive'
      case 'ORDER_REMOVED': return 'destructive'
      case 'ORDER_RESTORED': return 'success'
      default: return 'secondary'
    }
  }

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'ADMIN': return <Shield className="h-4 w-4" />
      case 'STAFF': return <User className="h-4 w-4" />
      case 'USER': return <Users className="h-4 w-4" />
      case 'GUEST': return <User className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const getAudienceBadgeVariant = (audience: string) => {
    switch (audience) {
      case 'ADMIN': return 'destructive'
      case 'STAFF': return 'default'
      case 'USER': return 'secondary'
      case 'GUEST': return 'outline'
      default: return 'secondary'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (typeFilter !== 'ALL' && notification.type !== typeFilter) return false
    if (audienceFilter !== 'ALL' && notification.audience !== audienceFilter) return false
    return true
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">Notifications</h1>
            <p className="text-text/70 mt-1">Manage system notifications and alerts</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Notifications</h1>
          <p className="text-text/70 mt-1">Manage system notifications and alerts</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Notification
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(stats).map(([type, audienceCounts]) => (
          <Card key={type}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text/70 capitalize">
                    {type.replace('_', ' ').toLowerCase()}
                  </p>
                  <p className="text-2xl font-bold text-text">
                    {Object.values(audienceCounts).reduce((sum, count) => sum + count, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text/50" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="STATUS_CHANGED">Status Changed</SelectItem>
            <SelectItem value="COMMENT_ADDED">Comment Added</SelectItem>
            <SelectItem value="OFFER_ADDED">Offer Added</SelectItem>
            <SelectItem value="OFFER_UPDATED">Offer Updated</SelectItem>
            <SelectItem value="PAYMENT_SUCCEEDED">Payment Succeeded</SelectItem>
            <SelectItem value="PAYMENT_FAILED">Payment Failed</SelectItem>
            <SelectItem value="ORDER_REMOVED">Order Removed</SelectItem>
            <SelectItem value="ORDER_RESTORED">Order Restored</SelectItem>
          </SelectContent>
        </Select>
        <Select value={audienceFilter} onValueChange={setAudienceFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Audiences</SelectItem>
            <SelectItem value="USER">Users</SelectItem>
            <SelectItem value="ADMIN">Admins</SelectItem>
            <SelectItem value="STAFF">Staff</SelectItem>
            <SelectItem value="GUEST">Guests</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="unreadOnly"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="h-4 w-4 text-primary rounded border-2 border-border focus:ring-2 focus:ring-primary focus:ring-offset-2"
          />
          <label htmlFor="unreadOnly" className="text-sm font-medium text-text">
            Unread only
          </label>
        </div>
      </div>

      {/* Notification Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingNotification ? 'Edit Notification' : 'Create New Notification'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Notification title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Type *</label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STATUS_CHANGED">Status Changed</SelectItem>
                      <SelectItem value="COMMENT_ADDED">Comment Added</SelectItem>
                      <SelectItem value="OFFER_ADDED">Offer Added</SelectItem>
                      <SelectItem value="OFFER_UPDATED">Offer Updated</SelectItem>
                      <SelectItem value="PAYMENT_SUCCEEDED">Payment Succeeded</SelectItem>
                      <SelectItem value="PAYMENT_FAILED">Payment Failed</SelectItem>
                      <SelectItem value="ORDER_REMOVED">Order Removed</SelectItem>
                      <SelectItem value="ORDER_RESTORED">Order Restored</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Audience *</label>
                  <Select value={formData.audience} onValueChange={(value: any) => setFormData(prev => ({ ...prev, audience: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Users</SelectItem>
                      <SelectItem value="ADMIN">Admins</SelectItem>
                      <SelectItem value="STAFF">Staff</SelectItem>
                      <SelectItem value="GUEST">Guests</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Order ID (Optional)</label>
                  <Input
                    value={formData.orderRequestId}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderRequestId: e.target.value }))}
                    placeholder="Order short code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Message *</label>
                <Textarea
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  required
                  rows={4}
                  placeholder="Notification message content"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingNotification ? 'Update Notification' : 'Send Notification'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Notifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotifications.map((notification) => (
          <Card key={notification.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {getAudienceIcon(notification.audience)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text line-clamp-2">{notification.title}</h3>
                    <p className="text-sm text-text/70">{notification.body}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant={getTypeBadgeVariant(notification.type)}>
                    {notification.type.replace('_', ' ')}
                  </Badge>
                  <Badge variant={getAudienceBadgeVariant(notification.audience)}>
                    {notification.audience}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                {notification.orderRequest && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text/70">Order:</span>
                    <span className="font-medium text-text">{notification.orderRequest.shortCode}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text/70">Created:</span>
                  <span className="font-medium text-text">{formatDate(notification.createdAt)}</span>
                </div>
                {notification.user && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text/70">By:</span>
                    <span className="font-medium text-text">{notification.user.name || notification.user.email}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(notification)}
                  className="flex-1"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(notification.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-text/70">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredNotifications.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-text/50 mb-4">
              <Bell className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">No notifications found</h3>
            <p className="text-text/70 mb-4">
              {searchTerm || typeFilter !== 'ALL' || audienceFilter !== 'ALL' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first notification'
              }
            </p>
            {!searchTerm && typeFilter === 'ALL' && audienceFilter === 'ALL' && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Create First Notification
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
