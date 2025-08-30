import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createOrderSchema } from '@/lib/validations'
import { generateShortCode } from '@/lib/utils'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const formData = await request.formData()
    
    // Extract basic fields
    const vin = formData.get('vin') as string
    const email = formData.get('email') as string
    
    // Extract items
    const items: Array<{
      categoryId: string
      quantity: number
      note?: string
      photo: File | null
    }> = []
    let itemIndex = 0
    
    while (formData.has(`items[${itemIndex}].categoryId`)) {
      const categoryId = formData.get(`items[${itemIndex}].categoryId`) as string
      const quantity = parseInt(formData.get(`items[${itemIndex}].quantity`) as string)
      const note = formData.get(`items[${itemIndex}].note`) as string || undefined
      const photo = formData.get(`items[${itemIndex}].photo`) as File | null
      
      items.push({
        categoryId,
        quantity,
        note,
        photo,
      })
      
      itemIndex++
    }
    
    // Validate the data
    const validatedData = createOrderSchema.parse({
      vin,
      email,
      items: items.map(item => ({
        categoryId: item.categoryId,
        quantity: item.quantity,
        note: item.note,
      })),
    })
    
    // Get category paths and validate they exist
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: validatedData.items.map(item => item.categoryId),
        },
      },
    })
    
    // Check if all categories exist
    if (categories.length !== validatedData.items.length) {
      const foundCategoryIds = categories.map(cat => cat.id)
      const missingCategoryIds = validatedData.items
        .map(item => item.categoryId)
        .filter(id => !foundCategoryIds.includes(id))
      
      return NextResponse.json(
        { error: `Invalid categories: ${missingCategoryIds.join(', ')}` },
        { status: 400 }
      )
    }
    
    const categoryMap = new Map(categories.map((cat: { id: string; path: string }) => [cat.id, cat.path]))
    
    // Create order request
    const orderRequest = await prisma.orderRequest.create({
      data: {
        shortCode: generateShortCode(),
        userId: session?.user?.id || null,
        guestEmail: session?.user?.id ? null : validatedData.email,
        vin: validatedData.vin,
        status: 'PENDING',
        items: {
          create: validatedData.items.map((item, index) => {
            const photo = items[index].photo
            let photoData = null
            
            // Handle photo upload
            if (photo && photo.size > 0) {
              try {
                // Upload photo to server
                const uploadFormData = new FormData()
                uploadFormData.append('file', photo)
                
                const uploadResponse = await fetch('/api/v1/upload', {
                  method: 'POST',
                  body: uploadFormData,
                })
                
                if (uploadResponse.ok) {
                  const uploadResult = await uploadResponse.json()
                  photoData = {
                    photoUrl: uploadResult.url,
                    photoWidth: null, // Could be extracted from image metadata
                    photoHeight: null, // Could be extracted from image metadata
                    photoMime: uploadResult.type,
                  }
                } else {
                  console.error('Błąd podczas przesyłania zdjęcia:', await uploadResponse.text())
                  photoData = {
                    photoUrl: null,
                    photoWidth: null,
                    photoHeight: null,
                    photoMime: null,
                  }
                }
              } catch (error) {
                console.error('Błąd podczas przetwarzania obrazu:', error)
                // Continue without photo if processing fails
                photoData = {
                  photoUrl: null,
                  photoWidth: null,
                  photoHeight: null,
                  photoMime: null,
                }
              }
            }
            
            return {
              categoryId: item.categoryId,
              categoryPath: categoryMap.get(item.categoryId) || '',
              quantity: item.quantity,
              note: item.note || undefined,
              state: 'REQUESTED' as const,
              ...photoData,
            }
          }),
        },
      },
      include: {
        items: {
          include: {
            category: true,
          },
        },
      },
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        orderRequestId: orderRequest.id,
        userId: session?.user?.id || null,
        action: 'ORDER_CREATED',
        meta: {
          itemCount: validatedData.items.length,
          hasPhotos: items.some(item => item.photo && item.photo.size > 0),
        },
      },
    })
    
    // Initialize magic link URL variable
    let magicLinkUrl: string | undefined
    
    // Generate magic link for guest users (completely outside email block)
    if (!session?.user) {
      const magicLinkHash = generateShortCode()
      const magicLinkExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      
      await prisma.orderRequest.update({
        where: { id: orderRequest.id },
        data: {
          magicLinkHash,
          magicLinkExpiresAt,
        },
      })
      
      magicLinkUrl = `${process.env.NEXTAUTH_URL}/orders/${orderRequest.id}?token=${magicLinkHash}`
    }
    
    // Send confirmation email (but don't fail if it doesn't work)
    try {
      const { sendOrderConfirmationEmail } = await import('@/lib/email/sender')
      
      const customerEmail = session?.user?.email || validatedData.email
      const customerName = session?.user?.name || undefined
      
      // Try to send email (but don't fail if it doesn't work)
      try {
        await sendOrderConfirmationEmail({
          orderRequestId: orderRequest.id,
          customerEmail,
          customerName,
          orderShortCode: orderRequest.shortCode,
          vin: validatedData.vin,
          itemCount: validatedData.items.length,
          magicLinkUrl,
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't fail the order creation if email fails
      }
    } catch (emailImportError) {
      console.error('Failed to import email sender:', emailImportError)
      // Don't fail the order creation if email import fails
    }
    
    // Create notification for admins
    await prisma.notification.create({
      data: {
        orderRequestId: orderRequest.id,
        audience: 'ADMIN',
        type: 'STATUS_CHANGED',
        title: `New order submitted`,
        body: `Order #${orderRequest.shortCode} with ${validatedData.items.length} items has been submitted for review.`,
      },
    })
    
    return NextResponse.json({
      id: orderRequest.id,
      shortCode: orderRequest.shortCode,
      status: orderRequest.status,
      itemCount: validatedData.items.length,
      magicLinkUrl: magicLinkUrl || undefined, // Include magic link for guest users
    })
    
  } catch (error) {
    console.error('Error creating order:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      )
    }
    
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Get orders for the logged-in user
    const orders = await prisma.orderRequest.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            category: true,
          },
        },
        _count: {
          select: {
            orderComments: {
              where: {
                isInternal: false,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip: offset,
      take: limit,
    })

    // Get total count for pagination
    const totalCount = await prisma.orderRequest.count({
      where: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
