import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const notificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  type: z.enum(['STATUS_CHANGED', 'OFFER_ADDED', 'OFFER_UPDATED', 'COMMENT_ADDED', 'PAYMENT_SUCCEEDED', 'PAYMENT_FAILED', 'ORDER_REMOVED', 'ORDER_RESTORED']),
  audience: z.enum(['USER', 'ADMIN', 'STAFF', 'GUEST']),
  orderRequestId: z.string().optional(),
})

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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const audience = searchParams.get('audience')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const offset = (page - 1) * limit

    const where: any = {}

    if (type && type !== 'ALL') {
      where.type = type
    }

    if (audience && audience !== 'ALL') {
      where.audience = audience
    }

    if (unreadOnly) {
      where.isRead = false
    }

    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          orderRequest: {
            select: {
              shortCode: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ])

    // Get notification statistics
    const notificationStats = await prisma.notification.groupBy({
      by: ['type', 'audience'],
      _count: true,
    })

    const stats = notificationStats.reduce((acc: Record<string, Record<string, number>>, stat: any) => {
      if (!acc[stat.type]) acc[stat.type] = {}
      acc[stat.type][stat.audience] = stat._count
      return acc
    }, {} as Record<string, Record<string, number>>)

    return NextResponse.json({
      notifications,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      stats,
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('Database connection successful')
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    const body = await request.json()
    console.log('Creating notification with data:', body)
    
    const validatedData = notificationSchema.parse(body)
    console.log('Validated notification data:', validatedData)

    // Create a single notification
    const notification = await prisma.notification.create({
      data: {
        title: validatedData.title,
        body: validatedData.body,
        type: validatedData.type,
        audience: validatedData.audience,
        orderRequestId: validatedData.orderRequestId || null,
        userId: null, // System notification, not tied to specific user
        isRead: false,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        orderRequest: {
          select: {
            shortCode: true,
            status: true,
          },
        },
      },
    })

    console.log('Notification created successfully:', notification)
    return NextResponse.json(notification, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
