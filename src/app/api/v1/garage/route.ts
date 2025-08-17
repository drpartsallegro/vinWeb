import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const saveVinSchema = z.object({
  vin: z.string().min(17, 'VIN must be at least 17 characters').max(17, 'VIN must be exactly 17 characters'),
  label: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to save VINs to your garage' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = saveVinSchema.parse(body)

    // Check if VIN already exists in user's garage
    const existingVin = await prisma.garageVin.findUnique({
      where: {
        userId_vin: {
          userId: session.user.id,
          vin: validatedData.vin,
        },
      },
    })

    if (existingVin) {
      return NextResponse.json(
        { error: 'This VIN is already in your garage' },
        { status: 400 }
      )
    }

    // Count existing VINs to generate sequential label
    const vinCount = await prisma.garageVin.count({
      where: {
        userId: session.user.id,
      },
    })

    // Generate label: Car 1, Car 2, Car 3, etc.
    const carNumber = vinCount + 1
    const label = validatedData.label || `Car ${carNumber}`

    // Save VIN to garage
    const garageVin = await prisma.garageVin.create({
      data: {
        userId: session.user.id,
        vin: validatedData.vin,
        label: label,
      },
    })

    return NextResponse.json({
      message: 'VIN saved to garage successfully',
      garageVin,
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error saving VIN to garage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all VINs in user's garage
    const garageVins = await prisma.garageVin.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      garageVins,
    })

  } catch (error) {
    console.error('Error fetching garage VINs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
