import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { commentSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const orderId = params.id

    // Get order to check access permissions
    const order = await prisma.orderRequest.findUnique({
      where: { id: orderId },
      select: {
        userId: true,
        guestEmail: true,
        magicLinkHash: true,
        magicLinkExpiresAt: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check access permissions
    const token = request.nextUrl.searchParams.get('token')
    const hasAccess = 
      (session?.user?.id && order.userId === session.user.id) ||
      (token && order.magicLinkHash === token && order.magicLinkExpiresAt && order.magicLinkExpiresAt > new Date())

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get comments - filter internal ones for non-staff users
    const comments = await prisma.orderComment.findMany({
      where: {
        orderRequestId: orderId,
        ...(session?.user?.role && ['ADMIN', 'STAFF'].includes(session.user.role)
          ? {} // Staff can see all comments
          : { isInternal: false } // Others can only see public comments
        ),
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const orderId = params.id
    const body = await request.json()

    // Validate comment data
    const validatedData = commentSchema.parse(body)

    // Get order to check access permissions
    const order = await prisma.orderRequest.findUnique({
      where: { id: orderId },
      select: {
        userId: true,
        guestEmail: true,
        magicLinkHash: true,
        magicLinkExpiresAt: true,
        status: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if order allows comments (not removed)
    if (order.status === 'REMOVED') {
      return NextResponse.json(
        { error: 'Comments are not allowed on removed orders' },
        { status: 400 }
      )
    }

    // Check access permissions
    const token = request.nextUrl.searchParams.get('token')
    const hasAccess = 
      (session?.user?.id && order.userId === session.user.id) ||
      (token && order.magicLinkHash === token && order.magicLinkExpiresAt && order.magicLinkExpiresAt > new Date())

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Determine author role
    let authorRole = 'GUEST'
    if (session?.user?.role) {
      authorRole = session.user.role
    } else if (session?.user) {
      authorRole = 'USER'
    }

    // Only staff can create internal comments
    const isInternal = validatedData.isInternal && ['ADMIN', 'STAFF'].includes(authorRole)

    // Create comment
    const comment = await prisma.orderComment.create({
      data: {
        orderRequestId: orderId,
        authorUserId: session?.user?.id || null,
        authorRole: authorRole as any,
        body: validatedData.body,
        isInternal,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Create notification for the opposite party
    if (!isInternal) {
      const isFromCustomer = !['ADMIN', 'STAFF'].includes(authorRole)
      
      await prisma.notification.create({
        data: {
          orderRequestId: orderId,
          userId: isFromCustomer ? null : order.userId, // Notify customer if comment from staff
          audience: isFromCustomer ? 'ADMIN' : (order.userId ? 'USER' : 'GUEST'),
          type: 'COMMENT_ADDED',
          title: `New message on order #${order.id?.slice(-8)}`,
          body: validatedData.body.length > 100 
            ? `${validatedData.body.slice(0, 100)}...` 
            : validatedData.body,
        },
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        orderRequestId: orderId,
        userId: session?.user?.id || null,
        action: 'COMMENT_ADDED',
        meta: {
          isInternal,
          commentLength: validatedData.body.length,
        },
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}







