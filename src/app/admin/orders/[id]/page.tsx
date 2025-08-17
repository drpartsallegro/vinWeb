'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { OrderDetailView } from '@/components/features/OrderDetailView'
import { AdminOfferManager } from '@/components/admin/AdminOfferManager'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface AdminOrderPageProps {
  params: {
    id: string
  }
}

export default function AdminOrderPage({ params }: AdminOrderPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user?.id) {
      router.push('/login')
      return
    }

    if (session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }

    // Fetch order data
    fetchOrder()
  }, [session, status, router])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch order')
      }
      const orderData = await response.json()
      setOrder(orderData)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOfferAdded = () => {
    // Refresh the order data instead of reloading the page
    fetchOrder()
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text">Loading...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text">Order not found</div>
      </div>
    )
  }

  const isPending = order.status === 'PENDING'

  return (
    <div>
      {/* Header with back button */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text">Order Details</h1>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            order.status === 'VALUATED' ? 'bg-blue-100 text-blue-800' :
            order.status === 'PAID' ? 'bg-green-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Admin-specific content for managing offers */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text mb-4">Manage Offers for Parts</h2>
        <div className="space-y-6">
          {order.items.map((item: any) => (
            <AdminOfferManager
              key={item.id}
              orderItem={item}
              onOfferAdded={handleOfferAdded}
            />
          ))}
        </div>
      </div>

      {/* Order details */}
      <OrderDetailView 
        order={order}
        isGuest={false}
        isAdmin={true}
      />
    </div>
  )
}
