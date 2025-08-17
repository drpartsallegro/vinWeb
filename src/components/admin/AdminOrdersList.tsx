'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { StatusChip } from '@/components/ui/StatusChip'
import { useToast } from '@/components/ui/Toast'
import { formatDate, formatPrice } from '@/lib/utils'
import {
  Eye,
  Pencil,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MessageCircle,
  DollarSign,
  ShoppingBag,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface AdminOrdersListProps {
  data: {
    orders: any[]
    totalCount: number
    totalPages: number
    currentPage: number
  }
}

export function AdminOrdersList({ data }: AdminOrdersListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { orders, totalCount, totalPages, currentPage } = data

  const statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'PENDING', label: 'Pending Review' },
    { value: 'VALUATED', label: 'Quoted' },
    { value: 'PAID', label: 'Paid' },
    { value: 'REMOVED', label: 'Removed' },
  ]

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery) {
      params.set('search', searchQuery)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`/admin/orders?${params.toString()}`)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    const params = new URLSearchParams(searchParams.toString())
    if (status !== 'ALL') {
      params.set('status', status)
    } else {
      params.delete('status')
    }
    params.set('page', '1')
    router.push(`/admin/orders?${params.toString()}`)
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setActionLoading(orderId)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      addToast({
        type: 'success',
        title: 'Status Updated',
        description: `Order status changed to ${newStatus.toLowerCase()}`,
      })

      router.refresh()
    } catch (error) {
      console.error('Error updating status:', error)
      addToast({
        type: 'error',
        title: 'Update Failed',
        description: 'Could not update order status',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRestore = async (orderId: string) => {
    await handleStatusChange(orderId, 'PENDING')
  }

  const handleRemove = async (orderId: string) => {
    if (confirm('Are you sure you want to remove this order?')) {
      await handleStatusChange(orderId, 'REMOVED')
    }
  }

  const getOrderTotal = (order: any) => {
    if (order.payments.length > 0) {
      return parseFloat(order.payments[0].amount)
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>
            <div className="lg:w-48">
              <Select onValueChange={handleStatusFilter} defaultValue={statusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Orders ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text/70">No orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const total = getOrderTotal(order)
                const customerName = order.user?.name || order.user?.email || order.guestEmail
                
                return (
                  <div key={order.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-lg font-semibold text-text">
                            #{order.shortCode}
                          </h3>
                          <StatusChip status={order.status} />
                          {order._count.comments > 0 && (
                            <div className="flex items-center text-sm text-text/70">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {order._count.comments}
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-sm text-text/70">Customer</span>
                            <p className="text-sm font-medium">{customerName}</p>
                          </div>
                          <div>
                            <span className="text-sm text-text/70">VIN</span>
                            <p className="text-sm font-mono">{order.vin}</p>
                          </div>
                          <div>
                            <span className="text-sm text-text/70">Items</span>
                            <p className="text-sm">{order.items.length} parts</p>
                          </div>
                          <div>
                            <span className="text-sm text-text/70">Created</span>
                            <p className="text-sm">{formatDate(order.createdAt)}</p>
                          </div>
                        </div>

                        {/* Parts Summary */}
                        <div className="flex flex-wrap gap-2">
                          {order.items.slice(0, 3).map((item: any) => (
                            <span 
                              key={item.id}
                              className="px-2 py-1 text-xs bg-chip text-text rounded-full"
                            >
                              {item.category.name} ({item.quantity})
                            </span>
                          ))}
                          {order.items.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-chip text-text/70 rounded-full">
                              +{order.items.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-end gap-3">
                        {total && (
                          <div className="text-right">
                            <span className="text-sm text-text/70">Total</span>
                            <p className="text-lg font-semibold text-text">
                              {formatPrice(total)}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>

                          {order.status === 'REMOVED' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRestore(order.id)}
                              disabled={actionLoading === order.id}
                              loading={actionLoading === order.id}
                            >
                              <ChevronUp className="h-4 w-4 mr-1" />
                              Restore
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemove(order.id)}
                              disabled={actionLoading === order.id}
                              loading={actionLoading === order.id}
                              className="text-danger hover:text-danger"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>

                        {/* Quick Status Actions */}
                        {order.status === 'PENDING' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(order.id, 'VALUATED')}
                              disabled={actionLoading === order.id}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Quoted
                            </Button>
                          </div>
                        )}

                        {order.status === 'VALUATED' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(order.id, 'PAID')}
                              disabled={actionLoading === order.id}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Paid
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                params.set('page', page.toString())
                router.push(`/admin/orders?${params.toString()}`)
              }}
            >
              {page}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}





