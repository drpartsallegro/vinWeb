import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { OrderDetailView } from '@/components/features/OrderDetailView'

export const metadata: Metadata = {
  title: 'Order Details',
  description: 'View your order details and status',
}

interface OrderPageProps {
  params: {
    id: string
  }
  searchParams: {
    token?: string
  }
}

async function getOrderData(id: string, userId?: string, guestToken?: string) {
  const order = await prisma.orderRequest.findUnique({
    where: { id },
    include: {
      user: true,
      items: {
        include: {
          category: true,
          offers: {
            orderBy: { updatedAt: 'desc' }
          },
          chosenOffer: {
            include: {
              offer: true
            }
          }
        }
      },
      addons: {
        include: {
          upsellItem: true
        }
      },
      addresses: true,
      invoiceDetails: {
        include: {
          address: true
        }
      },
      shipment: true,
      payments: {
        orderBy: { createdAt: 'desc' }
      },
      comments: {
        include: {
          author: true
        },
        orderBy: { createdAt: 'asc' }
      },
      notifications: {
        where: {
          OR: [
            { userId },
            { audience: 'GUEST' }
          ]
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!order) {
    return null
  }

  // Check access permissions
  const hasAccess = 
    (userId && order.userId === userId) || // User owns the order
    (guestToken && order.magicLinkHash === guestToken && order.magicLinkExpiresAt && order.magicLinkExpiresAt > new Date()) // Valid guest token

  if (!hasAccess) {
    return null
  }

  return order
}

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const session = await getServerSession(authOptions)
  const order = await getOrderData(params.id, session?.user?.id, searchParams.token)

  if (!order) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-bg">
      <OrderDetailView order={order} isGuest={!session?.user} token={searchParams.token} />
    </div>
  )
}
