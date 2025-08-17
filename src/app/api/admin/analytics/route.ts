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
    const period = searchParams.get('period') || '30' // days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // Revenue metrics
    const revenueData = await prisma.payment.aggregate({
      where: {
        status: 'SUCCEEDED',
        createdAt: { gte: startDate },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    })

    // Order metrics
    const orderMetrics = await prisma.orderRequest.aggregate({
      where: {
        createdAt: { gte: startDate },
      },
      _count: true,
    })

    const orderStatusCounts = await prisma.orderRequest.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: true,
    })

    // Category performance
    const topCategories = await prisma.orderItem.groupBy({
      by: ['categoryId'],
      where: {
        orderRequest: {
          createdAt: { gte: startDate },
        },
      },
      _count: true,
      _sum: {
        quantity: true,
      },
    })

    // Get category names
    const categoryIds = topCategories.map(cat => cat.categoryId)
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, path: true },
    })

    const categoryMap = new Map(categories.map(cat => [cat.id, cat]))
    const topCategoriesWithNames = topCategories
      .map(cat => ({
        categoryId: cat.categoryId,
        categoryName: categoryMap.get(cat.categoryId)?.name || 'Unknown',
        categoryPath: categoryMap.get(cat.categoryId)?.path || '',
        orderCount: cat._count,
        totalQuantity: cat._sum.quantity || 0,
      }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 10)

    // Monthly revenue trends (last 12 months)
    const monthlyRevenue = await prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        status: 'SUCCEEDED',
        createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) }, // Start of current year
      },
      _sum: {
        amount: true,
      },
    })

    // Group by month
    const monthlyRevenueMap = new Map()
    monthlyRevenue.forEach(item => {
      const month = item.createdAt.getMonth()
      const currentAmount = monthlyRevenueMap.get(month) || 0
      monthlyRevenueMap.set(month, currentAmount + Number(item._sum.amount))
    })

    const monthlyRevenueData = Array.from({ length: 12 }, (_, i) => ({
      month: i,
      monthName: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
      revenue: monthlyRevenueMap.get(i) || 0,
    }))

    // User growth
    const userGrowth = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: true,
    })

    // Group by week
    const weeklyUserGrowth = new Map()
    userGrowth.forEach(item => {
      const week = Math.floor((Date.now() - item.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000))
      const currentCount = weeklyUserGrowth.get(week) || 0
      weeklyUserGrowth.set(week, currentCount + item._count)
    })

    const weeklyUserGrowthData = Array.from(weeklyUserGrowth.entries())
      .sort(([a], [b]) => a - b)
      .map(([week, count]) => ({
        week: `Week ${week}`,
        newUsers: count,
      }))

    // Top performing products (upsells)
    const topUpsells = await prisma.orderAddon.groupBy({
      by: ['upsellItemId'],
      where: {
        orderRequest: {
          createdAt: { gte: startDate },
        },
      },
      _count: true,
      _sum: {
        quantity: true,
      },
    })

    // Get upsell item details
    const upsellIds = topUpsells.map(upsell => upsell.upsellItemId)
    const upsellItems = await prisma.upsellItem.findMany({
      where: { id: { in: upsellIds } },
      select: { id: true, title: true, price: true },
    })

    const upsellMap = new Map(upsellItems.map(item => [item.id, item]))
    const topUpsellsWithDetails = topUpsells
      .map(upsell => {
        const item = upsellMap.get(upsell.upsellItemId)
        return {
          id: upsell.upsellItemId,
          title: item?.title || 'Unknown',
          price: item?.price || 0,
          orderCount: upsell._count,
          totalQuantity: upsell._sum.quantity || 0,
          totalRevenue: Number(item?.price || 0) * (upsell._sum.quantity || 0),
        }
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)

    return NextResponse.json({
      revenue: {
        total: Number(revenueData._sum.amount) || 0,
        transactionCount: revenueData._count || 0,
        averageOrderValue: revenueData._count > 0 ? Number(revenueData._sum.amount) / revenueData._count : 0,
      },
      orders: {
        total: orderMetrics._count || 0,
        statusBreakdown: orderStatusCounts.reduce((acc, item) => {
          acc[item.status] = item._count
          return acc
        }, {} as Record<string, number>),
      },
      topCategories: topCategoriesWithNames,
      monthlyRevenue: monthlyRevenueData,
      userGrowth: weeklyUserGrowthData,
      topUpsells: topUpsellsWithDetails,
      period: parseInt(period),
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
