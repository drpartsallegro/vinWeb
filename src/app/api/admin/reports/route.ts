import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'orders'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const format = searchParams.get('format') || 'json'

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1)
    const end = endDate ? new Date(endDate) : new Date()

    let reportData: any = {}

    switch (reportType) {
      case 'orders':
        reportData = await generateOrdersReport(start, end)
        break
      case 'revenue':
        reportData = await generateRevenueReport(start, end)
        break
      case 'users':
        reportData = await generateUsersReport(start, end)
        break
      case 'categories':
        reportData = await generateCategoriesReport(start, end)
        break
      case 'upsells':
        reportData = await generateUpsellsReport(start, end)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        )
    }

    // Add metadata
    reportData.metadata = {
      reportType,
      generatedAt: new Date().toISOString(),
      dateRange: { start: start.toISOString(), end: end.toISOString() },
      generatedBy: session.user.email,
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(reportData)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}_report_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    return NextResponse.json(reportData)

  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateOrdersReport(startDate: Date, endDate: Date) {
  const orders = await prisma.orderRequest.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { category: true } },
      payments: { where: { status: 'SUCCEEDED' } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const orderStats = await prisma.orderRequest.groupBy({
    by: ['status'],
    where: { createdAt: { gte: startDate, lte: endDate } },
    _count: true,
  })

  const statusBreakdown = orderStats.reduce((acc, stat) => {
    acc[stat.status] = stat._count
    return acc
  }, {} as Record<string, number>)

  return {
    totalOrders: orders.length,
    statusBreakdown,
    orders: orders.map(order => ({
      id: order.id,
      shortCode: order.shortCode,
      status: order.status,
      vin: order.vin,
      customer: order.user ? { name: order.user.name, email: order.user.email } : { email: order.guestEmail },
      itemCount: order.items.length,
      totalValue: order.payments.reduce((sum, payment) => sum + Number(payment.amount), 0),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    })),
  }
}

async function generateRevenueReport(startDate: Date, endDate: Date) {
  const payments = await prisma.payment.findMany({
    where: {
      status: 'SUCCEEDED',
      createdAt: { gte: startDate, lte: endDate },
    },
    include: {
      orderRequest: { select: { shortCode: true, vin: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const dailyRevenue = await prisma.payment.groupBy({
    by: ['createdAt'],
    where: {
      status: 'SUCCEEDED',
      createdAt: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
  })

  const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
  const averageOrderValue = payments.length > 0 ? totalRevenue / payments.length : 0

  return {
    totalRevenue,
    transactionCount: payments.length,
    averageOrderValue,
    dailyRevenue: dailyRevenue.map(day => ({
      date: day.createdAt,
      revenue: Number(day._sum.amount),
    })),
    payments: payments.map(payment => ({
      id: payment.id,
      amount: Number(payment.amount),
      provider: payment.provider,
      orderShortCode: payment.orderRequest.shortCode,
      vin: payment.orderRequest.vin,
      createdAt: payment.createdAt,
    })),
  }
}

async function generateUsersReport(startDate: Date, endDate: Date) {
  const users = await prisma.user.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
    include: {
      _count: {
        select: {
          orderRequests: true,
          orderComments: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const userStats = await prisma.user.groupBy({
    by: ['role'],
    where: { createdAt: { gte: startDate, lte: endDate } },
    _count: true,
  })

  const roleBreakdown = userStats.reduce((acc, stat) => {
    acc[stat.role] = stat._count
    return acc
  }, {} as Record<string, number>)

  return {
    totalUsers: users.length,
    roleBreakdown,
    users: users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      orderCount: user._count.orderRequests,
      commentCount: user._count.orderComments,
      createdAt: user.createdAt,
    })),
  }
}

async function generateCategoriesReport(startDate: Date, endDate: Date) {
  const categoryStats = await prisma.orderItem.groupBy({
    by: ['categoryId'],
    where: {
      orderRequest: {
        createdAt: { gte: startDate, lte: endDate },
      },
    },
    _count: true,
    _sum: { quantity: true },
  })

  const categoryIds = categoryStats.map(stat => stat.categoryId)
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, path: true },
  })

  const categoryMap = new Map(categories.map(cat => [cat.id, cat]))

  return {
    totalCategories: categories.length,
    categories: categoryStats.map(stat => {
      const category = categoryMap.get(stat.categoryId)
      return {
        categoryId: stat.categoryId,
        categoryName: category?.name || 'Unknown',
        categoryPath: category?.path || '',
        orderCount: stat._count,
        totalQuantity: stat._sum.quantity || 0,
      }
    }).sort((a, b) => b.orderCount - a.orderCount),
  }
}

async function generateUpsellsReport(startDate: Date, endDate: Date) {
  const upsellStats = await prisma.orderAddon.groupBy({
    by: ['upsellItemId'],
    where: {
      orderRequest: {
        createdAt: { gte: startDate, lte: endDate },
      },
    },
    _count: true,
    _sum: { quantity: true },
  })

  const upsellIds = upsellStats.map(stat => stat.upsellItemId)
  const upsellItems = await prisma.upsellItem.findMany({
    where: { id: { in: upsellIds } },
    select: { id: true, title: true, price: true, active: true },
  })

  const upsellMap = new Map(upsellItems.map(item => [item.id, item]))

  return {
    totalUpsells: upsellItems.length,
    upsells: upsellStats.map(stat => {
      const item = upsellMap.get(stat.upsellItemId)
      return {
        upsellId: stat.upsellItemId,
        title: item?.title || 'Unknown',
        price: Number(item?.price || 0),
        active: item?.active || false,
        orderCount: stat._count,
        totalQuantity: stat._sum.quantity || 0,
        totalRevenue: Number(item?.price || 0) * (stat._sum.quantity || 0),
      }
    }).sort((a, b) => b.totalRevenue - a.totalRevenue),
  }
}

function convertToCSV(data: any): string {
  // Simple CSV conversion - you might want to use a proper CSV library
  const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
    const flattened: Record<string, any> = {}
    
    for (const key in obj) {
      if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], `${prefix}${key}_`))
      } else if (Array.isArray(obj[key])) {
        // Handle arrays by creating multiple rows
        if (obj[key].length > 0 && typeof obj[key][0] === 'object') {
          obj[key].forEach((item: any, index: number) => {
            Object.assign(flattened, flattenObject(item, `${prefix}${key}_${index}_`))
          })
        } else {
          flattened[`${prefix}${key}`] = obj[key].join(', ')
        }
      } else {
        flattened[`${prefix}${key}`] = obj[key]
      }
    }
    
    return flattened
  }

  const flattened = flattenObject(data)
  const headers = Object.keys(flattened)
  const values = Object.values(flattened)
  
  return [headers.join(','), values.join(',')].join('\n')
}
