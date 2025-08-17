import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const upsellItemUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  imageUrl: z.string().url('Valid image URL is required').optional(),
  price: z.number().positive('Price must be positive').optional(),
  active: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const upsellItem = await prisma.upsellItem.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            orderAddons: true,
          },
        },
        orderAddons: {
          include: {
            orderRequest: {
              select: {
                shortCode: true,
                status: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    })

    if (!upsellItem) {
      return NextResponse.json(
        { error: 'Upsell item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(upsellItem)

  } catch (error) {
    console.error('Error fetching upsell item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = upsellItemUpdateSchema.parse(body)

    const upsellItem = await prisma.upsellItem.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json(upsellItem)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Upsell item not found' },
        { status: 404 }
      )
    }

    console.error('Error updating upsell item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if item is being used in orders
    const usageCount = await prisma.orderAddon.count({
      where: { upsellItemId: params.id },
    })

    if (usageCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete item. It is used in ${usageCount} order(s).` },
        { status: 409 }
      )
    }

    await prisma.upsellItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Upsell item not found' },
        { status: 404 }
      )
    }

    console.error('Error deleting upsell item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
