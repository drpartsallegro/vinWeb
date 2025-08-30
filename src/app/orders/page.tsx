import { Metadata } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { OrdersListView } from '@/components/features/OrdersListView'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Moje Zamówienia',
  description: 'Przeglądaj i śledź swoje zamówienia części samochodowych',
}

async function getUserOrders(userId: string) {
  const orders = await prisma.orderRequest.findMany({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          category: true,
        },
      },
      payments: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
      _count: {
        select: {
          comments: {
            where: {
              isInternal: false,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return orders
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login?callbackUrl=/orders')
  }

  const orders = await getUserOrders(session.user.id)

  return (
    <div className="min-h-screen bg-bg">
      <OrdersListView orders={orders} />
    </div>
  )
}
