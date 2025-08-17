import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const upsellItems = await prisma.upsellItem.findMany({
      where: {
        active: true,
      },
      orderBy: {
        title: 'asc',
      },
    })

    return NextResponse.json(upsellItems)
  } catch (error) {
    console.error('Error fetching upsell items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}







