import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const userUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Valid email is required').optional(),
  role: z.enum(['USER', 'STAFF', 'ADMIN']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orderRequests: true,
            orderComments: true,
            notifications: true,
            garageVins: true,
          },
        },
        orderRequests: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            shortCode: true,
            status: true,
            createdAt: true,
            items: {
              select: {
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)

  } catch (error) {
    console.error('Error fetching user:', error)
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
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // Prevent admin from modifying their own role
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot modify your own role' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = userUpdateSchema.parse(body)

    // Check if email is being changed and if it's already taken
    if (validatedData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          id: { not: params.id },
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email is already taken by another user' },
          { status: 409 }
        )
      }
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'USER_UPDATED',
        meta: {
          targetUserId: params.id,
          updatedBy: session.user.email,
          changes: validatedData,
          timestamp: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json(user)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.error('Error updating user:', error)
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
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // Prevent admin from deleting themselves
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Get user to check role
    const userToDelete = await prisma.user.findUnique({
      where: { id: params.id },
      select: { role: true, email: true },
    })

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent deletion of other admins
    if (userToDelete.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot delete administrator accounts' },
        { status: 403 }
      )
    }

    // Check if user has active orders
    const activeOrders = await prisma.orderRequest.count({
      where: {
        userId: params.id,
        status: { in: ['PENDING', 'VALUATED', 'PAID'] },
      },
    })

    if (activeOrders > 0) {
      return NextResponse.json(
        { error: `Cannot delete user with ${activeOrders} active order(s)` },
        { status: 409 }
      )
    }

    // Delete user and all related data
    await prisma.user.delete({
      where: { id: params.id },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'USER_DELETED',
        meta: {
          deletedUserId: params.id,
          deletedUserEmail: userToDelete.email,
          deletedBy: session.user.email,
          timestamp: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
