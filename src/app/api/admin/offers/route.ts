import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { orderItemId, manufacturer, unitPrice, quantityAvailable, notes } = body

    // Validate required fields
    if (!orderItemId || !manufacturer || !unitPrice || !quantityAvailable) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if order item exists
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        orderRequest: true
      }
    })

    if (!orderItem) {
      return NextResponse.json(
        { error: 'Order item not found' },
        { status: 404 }
      )
    }

    // Create the offer
    const offer = await prisma.offer.create({
      data: {
        orderItemId,
        manufacturer,
        unitPrice,
        quantityAvailable,
        notes: notes || undefined,
      },
    })

            // Aktualizuj status zamówienia na VALUATED jeśli było PENDING
    if (orderItem.orderRequest.status === 'PENDING') {
      await prisma.orderRequest.update({
        where: { id: orderItem.orderRequest.id },
        data: { status: 'VALUATED' }
      })
    }

    // Update the order item state to VALUATED
    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: { state: 'VALUATED' }
    })

    return NextResponse.json({
      message: 'Offer created successfully',
      offer
    }, { status: 201 })

  } catch (error) {
          console.error('Błąd podczas tworzenia oferty:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { offerId, manufacturer, unitPrice, quantityAvailable, notes } = body

    // Validate required fields
    if (!offerId || !manufacturer || !unitPrice || !quantityAvailable) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if offer exists
    const existingOffer = await prisma.offer.findUnique({
      where: { id: offerId }
    })

    if (!existingOffer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    // Update the offer
    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: {
        manufacturer,
        unitPrice,
        quantityAvailable,
        notes: notes || undefined,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Offer updated successfully',
      offer: updatedOffer
    })

  } catch (error) {
          console.error('Błąd podczas aktualizacji oferty:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { offerId } = body

    if (!offerId) {
      return NextResponse.json(
        { error: 'Offer ID is required' },
        { status: 400 }
      )
    }

    // Check if offer exists
    const existingOffer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        orderItem: {
          include: {
            orderRequest: true
          }
        }
      }
    })

    if (!existingOffer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    // Delete the offer
    await prisma.offer.delete({
      where: { id: offerId }
    })

    // Check if this was the last offer for the order item
    const remainingOffers = await prisma.offer.count({
      where: { orderItemId: existingOffer.orderItem.id }
    })

            // Jeśli nie ma już ofert, zaktualizuj status zamówienia z powrotem na PENDING i stan elementu zamówienia na REQUESTED
    if (remainingOffers === 0) {
      await Promise.all([
        prisma.orderRequest.update({
          where: { id: existingOffer.orderItem.orderRequest.id },
          data: { status: 'PENDING' }
        }),
        prisma.orderItem.update({
          where: { id: existingOffer.orderItem.id },
          data: { state: 'REQUESTED' }
        })
      ])
    }

    return NextResponse.json({
      message: 'Offer deleted successfully'
    })

  } catch (error) {
          console.error('Błąd podczas usuwania oferty:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
