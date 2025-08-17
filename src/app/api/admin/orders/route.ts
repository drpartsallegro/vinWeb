import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
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

    return NextResponse.json({
      orders,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    })

  } catch (error) {
    console.error('Error fetching admin orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
