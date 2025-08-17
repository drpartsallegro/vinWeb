import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateVinSchema = z.object({
  label: z.string().min(1, 'Label is required').max(100, 'Label must be less than 100 characters'),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateVinSchema.parse(body)

    // Check if the garage VIN belongs to the user
    const existingVin = await prisma.garageVin.findUnique({
      where: { id: params.id },
    })

    if (!existingVin) {
      return NextResponse.json(
        { error: 'VIN not found' },
        { status: 404 }
      )
    }

    if (existingVin.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only edit your own VINs' },
        { status: 403 }
      )
    }

    // Update the VIN label
    const updatedVin = await prisma.garageVin.update({
      where: { id: params.id },
      data: {
        label: validatedData.label,
      },
    })

    return NextResponse.json({
      message: 'VIN updated successfully',
      garageVin: updatedVin,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating VIN:', error)
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
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if the garage VIN belongs to the user
    const existingVin = await prisma.garageVin.findUnique({
      where: { id: params.id },
    })

    if (!existingVin) {
      return NextResponse.json(
        { error: 'VIN not found' },
        { status: 404 }
      )
    }

    if (existingVin.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only delete your own VINs' },
        { status: 403 }
      )
    }

    // Delete the VIN
    await prisma.garageVin.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'VIN deleted successfully',
    })

  } catch (error) {
    console.error('Error deleting VIN:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
