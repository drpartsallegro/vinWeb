import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get guest token for guest notifications
    const guestToken = searchParams.get('token')

    let where: any = {}

    if (session?.user) {
      // For authenticated users
      where = {
        OR: [
          { userId: session.user.id },
          { audience: 'USER' },
          ...(session.user.role === 'ADMIN' || session.user.role === 'STAFF' 
            ? [{ audience: 'ADMIN' }, { audience: 'STAFF' }] 
            : []
          ),
        ],
      }
    } else if (guestToken) {
      // For guest users with magic link
      const order = await prisma.orderRequest.findFirst({
        where: {
          magicLinkHash: guestToken,
          magicLinkExpiresAt: {
            gt: new Date(),
          },
        },
      })

      if (order) {
        where = {
          OR: [
            { orderRequestId: order.id, audience: 'GUEST' },
          ],
        }
      } else {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 403 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (unreadOnly) {
      where.isRead = false
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          orderRequest: {
            select: {
              shortCode: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.notification.count({
        where: {
          ...where,
          isRead: false,
        },
      }),
    ])

    return NextResponse.json({
      notifications,
      unreadCount,
      hasMore: notifications.length === limit,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { ids, markAllAsRead } = body

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (markAllAsRead) {
      // Mark all notifications as read for the user
      await prisma.notification.updateMany({
        where: {
          OR: [
            { userId: session.user.id },
            { audience: 'USER' },
            ...(session.user.role === 'ADMIN' || session.user.role === 'STAFF' 
              ? [{ audience: 'ADMIN' }, { audience: 'STAFF' }] 
              : []
            ),
          ],
          isRead: false,
        },
        data: {
          isRead: true,
        },
      })
    } else if (ids && Array.isArray(ids)) {
      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: {
          id: {
            in: ids,
          },
          OR: [
            { userId: session.user.id },
            { audience: 'USER' },
            ...(session.user.role === 'ADMIN' || session.user.role === 'STAFF' 
              ? [{ audience: 'ADMIN' }, { audience: 'STAFF' }] 
              : []
            ),
          ],
        },
        data: {
          isRead: true,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}







