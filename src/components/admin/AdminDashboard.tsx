import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusChip } from '@/components/ui/StatusChip'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import {
  BarChart3,
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  ArrowRight,
  Clock,
  CheckCircle,
  Trash2,
  MessageCircle,
  Settings,
} from 'lucide-react'

interface AdminDashboardProps {
  data: {
    stats: {
      totalOrders: number
      pendingOrders: number
      valuatedOrders: number
      paidOrders: number
      removedOrders: number
      totalUsers: number
    }
    recentOrders: any[]
    recentComments: any[]
  }
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  const { stats, recentOrders, recentComments } = data

  const statCards = [
    {
      title: 'Wszystkie Zamówienia',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'text-text',
      bgColor: 'bg-surface2',
    },
    {
      title: 'Oczekujące na Przegląd',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Gotowe do Zamówienia',
      value: stats.valuatedOrders,
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Zakończone',
      value: stats.paidOrders,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Usunięte',
      value: stats.removedOrders,
      icon: Trash2,
      color: 'text-muted',
      bgColor: 'bg-muted/10',
    },
    {
      title: 'Wszyscy Użytkownicy',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text">Panel Administracyjny</h1>
        <p className="text-muted mt-1">
          Przegląd panelu administracyjnego Kup Tanie Części
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">{stat.title}</p>
                  <p className="text-3xl font-bold text-text mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ostatnie Zamówienia</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders">
                Zobacz Wszystkie
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-center text-muted py-8">Brak zamówień</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-surface2/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-text hover:text-primary transition-colors"
                      >
                        #{order.shortCode}
                      </Link>
                      <StatusChip status={order.status} />
                      {order._count.comments > 0 && (
                        <div className="flex items-center text-xs text-muted">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {order._count.comments}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted mt-1">
                      {order.user?.name || order.guestEmail} • {order.items.length} elementów
                    </p>
                    <p className="text-xs text-muted">
                      VIN: {order.vin}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted">
                      {formatRelativeTime(order.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Comments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ostatnie Komentarze</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/notifications">
                Zobacz Wszystkie
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentComments.length === 0 ? (
              <p className="text-center text-muted py-8">Brak komentarzy</p>
            ) : (
              recentComments.map((comment) => (
                <div key={comment.id} className="p-3 bg-surface2/50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text">
                        {comment.author?.name || 'Gość'}
                      </span>
                      <span className="text-xs text-muted">
                        {comment.authorRole.toLowerCase()}
                      </span>
                      {comment.isInternal && (
                        <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded">
                          Wewnętrzny
                        </span>
                      )}
                    </div>
                    <Link 
                      href={`/admin/orders/${comment.orderRequest.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      #{comment.orderRequest.shortCode}
                    </Link>
                  </div>
                  <p className="text-sm text-text line-clamp-2">
                    {comment.body}
                  </p>
                  <p className="text-xs text-muted mt-2">
                    {formatRelativeTime(comment.createdAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Szybkie Akcje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4" asChild>
              <Link href="/admin/orders?status=PENDING">
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-warning" />
                  <p className="font-medium">Przejrzyj Oczekujące</p>
                  <p className="text-sm text-muted">{stats.pendingOrders} zamówień</p>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-4" asChild>
              <Link href="/admin/orders?status=VALUATED">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Zarządzaj Wycenami</p>
                  <p className="text-sm text-muted">{stats.valuatedOrders} zamówień</p>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-4" asChild>
              <Link href="/admin/upsells">
                <div className="text-center">
                  <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-accent" />
                  <p className="font-medium">Zarządzaj Upsellami</p>
                  <p className="text-sm text-muted">Katalog produktów</p>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-4" asChild>
              <Link href="/admin/settings">
                <div className="text-center">
                  <Settings className="h-8 w-8 mx-auto mb-2 text-muted" />
                  <p className="font-medium">Ustawienia</p>
                  <p className="text-sm text-muted">Konfiguruj system</p>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
