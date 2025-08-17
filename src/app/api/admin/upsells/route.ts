import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const upsellItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  imageUrl: z.string().url('Valid image URL is required'),
  price: z.number().positive('Price must be positive'),
  active: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
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
    const search = searchParams.get('search')
    const active = searchParams.get('active')
    const offset = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ]
    }

    if (active !== null && active !== undefined) {
      where.active = active === 'true'
    }

    const [upsellItems, totalCount] = await Promise.all([
      prisma.upsellItem.findMany({
        where,
        include: {
          _count: {
            select: {
              orderAddons: true,
            },
          },
        },
        orderBy: { title: 'asc' },
        skip: offset,
        take: limit,
      }),
      prisma.upsellItem.count({ where }),
    ])

    // Get usage statistics
    const usageStats = await prisma.orderAddon.groupBy({
      by: ['upsellItemId'],
      _count: {
        orderRequestId: true,
      },
      _sum: {
        quantity: true,
      },
    })

    const itemsWithStats = upsellItems.map(item => {
      const stats = usageStats.find(s => s.upsellItemId === item.id)
      return {
        ...item,
        totalOrders: stats?._count.orderRequestId || 0,
        totalQuantity: stats?._sum.quantity || 0,
      }
    })

    return NextResponse.json({
      items: itemsWithStats,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    })

  } catch (error) {
    console.error('Error fetching upsell items:', error)
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

    const body = await request.json()
    const validatedData = upsellItemSchema.parse(body)

    const upsellItem = await prisma.upsellItem.create({
      data: {
        title: validatedData.title,
        imageUrl: validatedData.imageUrl,
        price: validatedData.price,
        active: validatedData.active,
        tags: validatedData.tags,
      },
    })

    return NextResponse.json(upsellItem, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating upsell item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
