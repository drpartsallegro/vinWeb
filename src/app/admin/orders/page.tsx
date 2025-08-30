import { Metadata } from 'next'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { AdminOrdersList } from '@/components/admin/AdminOrdersList'

export const metadata: Metadata = {
  title: 'Zarządzanie Zamówieniami',
}

interface AdminOrdersPageProps {
  searchParams: {
    status?: string
    search?: string
    page?: string
  }
}

async function getOrders(filters: {
  status?: string
  search?: string
  page: number
  limit: number
}) {
  const { status, search, page, limit } = filters
  const offset = (page - 1) * limit

  const where: any = {}

  // Status filter
  if (status && status !== 'ALL') {
    where.status = status
  }

  // Search filter
  if (search) {
    where.OR = [
      { shortCode: { contains: search, mode: 'insensitive' } },
      { vin: { contains: search, mode: 'insensitive' } },
      { guestEmail: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }

  console.log('🔍 Admin fetching orders with filters:', { status, search, page, limit })
  console.log('🔍 Admin where clause:', where)

  const [orders, totalCount] = await Promise.all([
    prisma.orderRequest.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            category: true,
            offers: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
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
      orderBy: { updatedAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.orderRequest.count({ where }),
  ])

  console.log('🔍 Admin found orders:', orders.length)
  console.log('🔍 Admin total count:', totalCount)

  return {
    orders,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  }
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  // Check if user is authenticated and is admin
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  console.log('🔍 Admin page - User session:', {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role
  })

  if (session.user.role !== 'ADMIN') {
    console.log('❌ User is not admin, redirecting')
    redirect('/')
  }

  const page = parseInt(searchParams.page || '1')
  const limit = 20

  const ordersData = await getOrders({
    status: searchParams.status,
    search: searchParams.search,
    page,
    limit,
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text">Zarządzanie Zamówieniami</h1>
        <p className="text-muted mt-1">
          Zarządzaj i śledź wszystkie zamówienia klientów ({ordersData.totalCount} łącznie)
        </p>
      </div>

      <AdminOrdersList data={ordersData} />
    </div>
  )
}





