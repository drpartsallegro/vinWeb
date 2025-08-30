import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const statusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'VALUATED', 'PAID', 'REMOVED']),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Check admin/staff permissions
    if (!session?.user || !['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const orderId = params.id
    const body = await request.json()
    const { status } = statusUpdateSchema.parse(body)

    // Get current order
    const currentOrder = await prisma.orderRequest.findUnique({
      where: { id: orderId },
      select: { status: true, userId: true, guestEmail: true },
    })

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ['VALUATED', 'REMOVED'],
      VALUATED: ['PAID', 'REMOVED'],
      PAID: ['REMOVED'], // Can only remove paid orders
      REMOVED: ['PENDING'], // Can restore to pending
    }

    const allowedNextStatuses = validTransitions[currentOrder.status] || []
    if (!allowedNextStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${currentOrder.status} to ${status}` },
        { status: 409 }
      )
    }

    // Update order status
    const updatedOrder = await prisma.orderRequest.update({
      where: { id: orderId },
      data: { status },
    })

    // Handle status-specific actions
    if (status === 'PAID') {
      // Mark included items as PURCHASED, others as DECLINED
      await prisma.orderItem.updateMany({
        where: {
          orderRequestId: orderId,
          chosenOffer: {
            isNot: null,
          },
        },
        data: { state: 'PURCHASED' },
      })

      await prisma.orderItem.updateMany({
        where: {
          orderRequestId: orderId,
          chosenOffer: null,
          state: 'VALUATED',
        },
        data: { state: 'DECLINED' },
      })
    }

    // Create notification
    await prisma.notification.create({
      data: {
        orderRequestId: orderId,
        userId: currentOrder.userId,
        audience: currentOrder.userId ? 'USER' : 'GUEST',
        type: status === 'REMOVED' ? 'ORDER_REMOVED' : 'STATUS_CHANGED',
        title: `Order status updated`,
        body: `Your order status has been changed to ${status.toLowerCase()}`,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        orderRequestId: orderId,
        userId: session.user.id,
        action: 'STATUS_CHANGED',
        meta: {
          from: currentOrder.status,
          to: status,
          adminAction: true,
        },
      },
    })

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    })
  } catch (error) {
    console.error('Error updating order status:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}











