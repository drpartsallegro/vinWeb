import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export const metadata: Metadata = {
  title: 'Panel Administracyjny',
}

async function getDashboardStats() {
  try {
    const [
      totalOrders,
      pendingOrders,
      valuatedOrders,
      paidOrders,
      removedOrders,
      totalUsers,
      recentOrders,
      recentComments,
    ] = await Promise.all([
      // Order counts
      prisma.orderRequest.count(),
      prisma.orderRequest.count({ where: { status: 'PENDING' } }),
      prisma.orderRequest.count({ where: { status: 'VALUATED' } }),
      prisma.orderRequest.count({ where: { status: 'PAID' } }),
      prisma.orderRequest.count({ where: { status: 'REMOVED' } }),
      
      // User count
      prisma.user.count(),
      
      // Recent orders
      prisma.orderRequest.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
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
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
      
      // Recent comments
      prisma.orderComment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          orderRequest: {
            select: {
              shortCode: true,
              status: true,
            },
          },
          author: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ])

    return {
      stats: {
        totalOrders,
        pendingOrders,
        valuatedOrders,
        paidOrders,
        removedOrders,
        totalUsers,
      },
      recentOrders,
      recentComments,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    // Return default data on error
    return {
      stats: {
        totalOrders: 0,
        pendingOrders: 0,
        valuatedOrders: 0,
        paidOrders: 0,
        removedOrders: 0,
        totalUsers: 0,
      },
      recentOrders: [],
      recentComments: [],
    }
  }
}

export default async function AdminPage() {
  const dashboardData = await getDashboardStats()

  return <AdminDashboard data={dashboardData} />
}






