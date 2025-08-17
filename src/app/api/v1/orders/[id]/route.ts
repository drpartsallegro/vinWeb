import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('API: Fetching order with ID:', params.id)
    
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    const orderId = params.id
    console.log('API: User ID:', session?.user?.id || 'Guest', 'Order ID:', orderId, 'Token:', token ? 'Present' : 'None')

    // Get the order
    const order = await prisma.orderRequest.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            category: true,
            offers: {
              orderBy: {
                updatedAt: 'desc',
              },
            },
          },
        },
        addresses: true,
        invoiceDetails: true,
        shipment: true,
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    })

    console.log('API: Order found:', order ? 'Yes' : 'No')

    if (!order) {
      console.log('API: Order not found in database')
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // If user is authenticated, check ownership
    if (session?.user?.id) {
      if (order.userId !== session.user.id) {
        console.log('API: Access denied - order belongs to:', order.userId, 'user is:', session.user.id)
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    } else if (token) {
      // Validate magic link token for guest users
      if (order.magicLinkHash !== token || !order.magicLinkExpiresAt || new Date() > order.magicLinkExpiresAt) {
        console.log('API: Invalid or expired magic link token')
        return NextResponse.json({ error: 'Invalid or expired magic link' }, { status: 401 })
      }
    } else {
      // No session and no token
      console.log('API: No session and no token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('API: Order successfully fetched')
    return NextResponse.json(order)

  } catch (error) {
    console.error('API: Error fetching order:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
