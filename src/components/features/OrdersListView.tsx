'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  MessageCircle,
  Truck,
  Calendar,
  Eye,
  CreditCard
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { StatusChip } from '@/components/ui/StatusChip'
import { HeaderNav } from '@/components/ui/HeaderNav'
import { formatDate, formatPrice } from '@/lib/utils'
import { motionVariants } from '@/lib/motion'

interface OrdersListViewProps {
  orders: any[]
}

export function OrdersListView({ orders }: OrdersListViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const statusOptions = [
    { value: 'ALL', label: 'Wszystkie Zamówienia' },
    { value: 'PENDING', label: 'Oczekujące' },
    { value: 'VALUATED', label: 'Wycena' },
    { value: 'PAID', label: 'Opłacone' },
    { value: 'REMOVED', label: 'Usunięte' },
  ]

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item: any) => 
        item.category.name.toLowerCase().includes(searchQuery.toLowerCase())
      )

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getOrderTotal = (order: any) => {
    // For paid orders, get the payment amount
    if (order.status === 'PAID' && order.payments.length > 0) {
      return parseFloat(order.payments[0].amount)
    }
    
    // For other orders, we don't have pricing yet
    return null
  }

  return (
    <div className="min-h-screen bg-bg">
      <HeaderNav />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          variants={motionVariants.page}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div 
            variants={motionVariants.quickIn}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-text">Moje Zamówienia</h1>
              <p className="text-muted mt-1">Śledź i zarządzaj swoimi zgłoszeniami części</p>
            </div>
            <Button asChild>
              <Link href="/wizard">
                <Plus className="h-4 w-4 mr-2" />
                Nowe Zamówienie
              </Link>
            </Button>
          </motion.div>

          {/* Filters */}
          <motion.div variants={motionVariants.quickIn} className="mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Szukaj po numerze zamówienia, VIN lub kategorii części..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="sm:w-48">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filtruj według statusu" />
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
          </motion.div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <motion.div variants={motionVariants.quickIn}>
              <Card>
                <CardContent className="text-center py-12">
                  {orders.length === 0 ? (
                    <div>
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Truck className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium text-text mb-2">Brak zamówień</h3>
                      <p className="text-muted mb-6">
                        Gotowy, aby znaleźć części do swojego pojazdu? Zacznij od złożenia pierwszego zgłoszenia.
                      </p>
                      <Button asChild>
                        <Link href="/wizard">
                          <Plus className="h-4 w-4 mr-2" />
                          Utwórz Pierwsze Zamówienie
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-muted" />
                      </div>
                      <h3 className="text-lg font-medium text-text mb-2">Nie znaleziono zamówień</h3>
                      <p className="text-muted">
                        Spróbuj dostosować wyszukiwanie lub kryteria filtrowania.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div variants={motionVariants.quickIn} className="space-y-4">
              {filteredOrders.map((order, index) => {
                const total = getOrderTotal(order)
                const hasUnreadComments = order._count.comments > 0 // Simplified - would need to track read status
                
                return (
                  <motion.div
                    key={order.id}
                    variants={motionVariants.quickIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-200 hover:border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Order Header */}
                            <div className="flex items-center gap-4 mb-3">
                              <h3 className="text-lg font-semibold text-text">
                                Zamówienie #{order.shortCode}
                              </h3>
                              <StatusChip status={order.status} />
                              {hasUnreadComments && (
                                <div className="flex items-center text-sm text-primary">
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  {order._count.comments}
                                </div>
                              )}
                            </div>

                            {/* Order Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <span className="text-sm text-muted">VIN</span>
                                <p className="font-mono text-sm text-text">{order.vin}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted">Elementy</span>
                                <p className="text-sm text-text">{order.items.length} część{order.items.length !== 1 ? 'i' : ''}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted">Złożone</span>
                                <div className="flex items-center text-sm text-text">
                                  <Calendar className="h-4 w-4 mr-1 text-muted" />
                                  {formatDate(order.createdAt)}
                                </div>
                              </div>
                            </div>

                            {/* Parts Summary */}
                            <div className="mb-4">
                              <span className="text-sm text-muted">Zamówione części:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {order.items.slice(0, 3).map((item: any) => (
                                  <span 
                                    key={item.id}
                                    className="px-2 py-1 text-xs bg-chip text-text rounded-full"
                                  >
                                    {item.category.name} ({item.quantity})
                                  </span>
                                ))}
                                {order.items.length > 3 && (
                                  <span className="px-2 py-1 text-xs bg-chip text-muted rounded-full">
                                    +{order.items.length - 3} więcej
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Side - Total & Actions */}
                          <div className="text-right space-y-3">
                            {total && (
                              <div>
                                <span className="text-sm text-muted">Suma</span>
                                <p className="text-lg font-semibold text-text">
                                  {formatPrice(total)}
                                </p>
                              </div>
                            )}
                            
                            <div className="flex flex-col gap-2">
                              <Button asChild size="sm">
                                <Link href={`/orders/${order.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Zobacz Szczegóły
                                </Link>
                              </Button>
                              
                              {order.status === 'VALUATED' && (
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/orders/${order.id}/checkout`}>
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Finalizuj
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status-specific messages */}
                        <div className="mt-4 pt-4 border-t border-border">
                          {order.status === 'PENDING' && (
                            <p className="text-sm text-muted">
                              ⏳ Przeglądamy Twoje zgłoszenie i wyślemy wyceny w ciągu 24 godzin.
                            </p>
                          )}
                          {order.status === 'VALUATED' && (
                            <p className="text-sm text-primary">
                              💰 Wyceny są gotowe! Przejrzyj i wybierz części, które chcesz kupić.
                            </p>
                          )}
                          {order.status === 'PAID' && (
                            <p className="text-sm text-success">
                              ✅ Płatność potwierdzona. Twoje części są przygotowywane do wysyłki.
                            </p>
                          )}
                          {order.status === 'REMOVED' && (
                            <p className="text-sm text-muted">
                              🗑️ To zamówienie zostało usunięte. Możesz utworzyć nowe zgłoszenie, jeśli potrzebujesz.
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* Stats Summary */}
          {orders.length > 0 && (
            <motion.div variants={motionVariants.quickIn} className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Podsumowanie Zamówień</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-text">{orders.length}</p>
                      <p className="text-sm text-muted">Wszystkie Zamówienia</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-warn">
                        {orders.filter(o => o.status === 'PENDING').length}
                      </p>
                      <p className="text-sm text-muted">Oczekujące</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {orders.filter(o => o.status === 'VALUATED').length}
                      </p>
                      <p className="text-sm text-muted">Gotowe do Zamówienia</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-success">
                        {orders.filter(o => o.status === 'PAID').length}
                      </p>
                      <p className="text-sm text-muted">Zakończone</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}




