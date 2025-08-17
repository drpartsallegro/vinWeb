import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!session?.user?.id && !token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderId = params.id
    const body = await request.json()

    // Validate required fields
    const {
      shippingAddress,
      invoiceDetails,
      shippingMethod,
      paymentMethod,
      agreements,
      selectedOffers
    } = body

    if (!shippingAddress || !agreements.terms || !agreements.privacy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the order and verify access
    const order = await prisma.orderRequest.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            offers: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // If user is authenticated, check ownership
    if (session?.user?.id) {
      if (order.userId !== session.user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    } else if (token) {
      // Validate magic link token for guest users
      if (order.magicLinkHash !== token || !order.magicLinkExpiresAt || new Date() > order.magicLinkExpiresAt) {
        return NextResponse.json({ error: 'Invalid or expired magic link' }, { status: 401 })
      }
    }

    if (order.status !== 'VALUATED') {
      return NextResponse.json(
        { error: 'Order is not ready for checkout' },
        { status: 400 }
      )
    }

    // Update order with checkout information
    const updatedOrder = await prisma.orderRequest.update({
      where: { id: orderId },
      data: {
        status: 'CHECKOUT',
        addresses: {
          create: {
            kind: 'SHIPPING',
            firstName: shippingAddress.firstName,
            lastName: shippingAddress.lastName,
            phone: shippingAddress.phone,
            email: shippingAddress.email,
            line1: shippingAddress.line1,
            line2: shippingAddress.line2,
            city: shippingAddress.city,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
          }
        },
        invoiceDetails: invoiceDetails.required ? {
          create: {
            required: true,
            companyName: invoiceDetails.companyName,
            nip: invoiceDetails.nip,
          }
        } : undefined,
        shipment: {
          create: {
            method: shippingMethod.toUpperCase(),
            price: shippingMethod === 'express' ? 25 : 15,
          }
        }
      },
      include: {
        addresses: true,
        invoiceDetails: true,
        shipment: true,
        items: {
          include: {
            offers: true
          }
        }
      }
    })

    // Create chosen offers for selected items
    if (selectedOffers) {
      for (const [itemId, selection] of Object.entries(selectedOffers)) {
        if (selection.include) {
          await prisma.chosenOffer.upsert({
            where: {
              orderItemId: itemId,
            },
            update: {
              offerId: selection.offerId,
              confirmedAt: new Date(),
            },
            create: {
              orderItemId: itemId,
              offerId: selection.offerId,
              confirmedAt: new Date(),
            },
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Checkout completed successfully'
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}





