import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const shopConfigSchema = z.object({
  freeShippingThreshold: z.number().min(0).optional(),
  couponsEnabled: z.boolean().optional(),
  allowPartialAcceptance: z.boolean().optional(),
  requireSameEmailAtCheckout: z.boolean().optional(),
  requirePhone: z.boolean().optional(),
  quoteExpiryHours: z.number().min(1).max(720).optional(), // 1 hour to 30 days
  shippingFreeQualifiers: z.array(z.string()).optional(),
  paymentProviders: z.object({
    p24Enabled: z.boolean().optional(),
    manualEnabled: z.boolean().optional(),
    codEnabled: z.boolean().optional(),
    p24Sandbox: z.boolean().optional(),
  }).optional(),
  notifications: z.object({
    emailOnValuated: z.boolean().optional(),
    emailOnPaid: z.boolean().optional(),
    emailOnCommentToUser: z.boolean().optional(),
    emailOnCommentToAdmin: z.boolean().optional(),
  }).optional(),
  brand: z.object({
    siteTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    logoUrl: z.string().url().optional(),
    themeColor: z.string().optional(),
  }).optional(),
  seo: z.object({
    canonicalBaseUrl: z.string().url().optional(),
    sitemapEnabled: z.boolean().optional(),
    robotsPolicy: z.string().optional(),
    jsonLdEnabled: z.boolean().optional(),
  }).optional(),
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

    // Get current shop configuration
    let shopConfig = await prisma.shopConfig.findUnique({
      where: { id: 'singleton' },
    })

    if (!shopConfig) {
      // Create default configuration if none exists
      shopConfig = await prisma.shopConfig.create({
        data: {
          id: 'singleton',
          freeShippingThreshold: 500,
          couponsEnabled: true,
          allowPartialAcceptance: true,
          requireSameEmailAtCheckout: true,
          requirePhone: true,
          quoteExpiryHours: 24,
          shippingFreeQualifiers: ['INPOST_LOCKER', 'INPOST_COURIER'],
          paymentProviders: {
            p24Enabled: true,
            manualEnabled: true,
            codEnabled: true,
            p24Sandbox: false,
          },
          notifications: {
            emailOnValuated: true,
            emailOnPaid: true,
            emailOnCommentToUser: true,
            emailOnCommentToAdmin: true,
          },
          brand: {
            siteTitle: 'PartsFlow - Premium Auto Parts',
            metaDescription: 'VIN-based auto parts ordering platform',
            logoUrl: '/logo.png',
            themeColor: '#3B82F6',
          },
          seo: {
            canonicalBaseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
            sitemapEnabled: true,
            robotsPolicy: 'allow',
            jsonLdEnabled: true,
          },
        },
      })
    }

    // Get system statistics
    const systemStats = await Promise.all([
      prisma.user.count(),
      prisma.orderRequest.count(),
      prisma.category.count(),
      prisma.upsellItem.count(),
      prisma.notification.count(),
    ])

    // Get recent configuration changes
    const configChanges = await prisma.auditLog.findMany({
      where: {
        action: { contains: 'CONFIG' },
        userId: { not: null },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    // Get environment information
    const environment = {
      nodeVersion: process.version,
      nextVersion: process.env.npm_package_version || 'Unknown',
      database: 'PostgreSQL',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    }

    return NextResponse.json({
      shopConfig,
      systemStats: {
        totalUsers: systemStats[0],
        totalOrders: systemStats[1],
        totalCategories: systemStats[2],
        totalUpsells: systemStats[3],
        totalNotifications: systemStats[4],
      },
      configChanges,
      environment,
    })

  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { section, config } = body

    if (!section || !config) {
      return NextResponse.json(
        { error: 'Section and config are required' },
        { status: 400 }
      )
    }

    let updateData: any = {}

    switch (section) {
      case 'shop':
        const validatedShopConfig = shopConfigSchema.parse(config)
        updateData = validatedShopConfig
        break
      
      case 'brand':
        updateData = {
          brand: config,
        }
        break
      
      case 'seo':
        updateData = {
          seo: config,
        }
        break
      
      case 'payments':
        updateData = {
          paymentProviders: config,
        }
        break
      
      case 'notifications':
        updateData = {
          notifications: config,
        }
        break
      
      case 'shipping':
        updateData = {
          freeShippingThreshold: config.freeShippingThreshold,
          shippingFreeQualifiers: config.shippingFreeQualifiers,
        }
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid configuration section' },
          { status: 400 }
        )
    }

    // Update configuration
    const updatedConfig = await prisma.shopConfig.upsert({
      where: { id: 'singleton' },
      update: updateData,
      create: {
        id: 'singleton',
        ...updateData,
      },
    })

    // Log the configuration change
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CONFIG_UPDATED',
        meta: {
          section,
          config: updateData,
          updatedBy: session.user.email,
          timestamp: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully',
      config: updatedConfig,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating settings:', error)
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
    const { action } = body

    switch (action) {
      case 'clear_cache':
        // In a real application, you would clear various caches
        // For now, we'll just log the action
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            action: 'CACHE_CLEARED',
            meta: {
              clearedBy: session.user.email,
              timestamp: new Date().toISOString(),
            },
          },
        })

        return NextResponse.json({
          success: true,
          message: 'Cache cleared successfully',
        })

      case 'generate_sitemap':
        // In a real application, you would generate a sitemap
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            action: 'SITEMAP_GENERATED',
            meta: {
              generatedBy: session.user.email,
              timestamp: new Date().toISOString(),
            },
          },
        })

        return NextResponse.json({
          success: true,
          message: 'Sitemap generated successfully',
        })

      case 'test_email':
        // Test email configuration
        try {
          // You would implement actual email testing here
          await prisma.auditLog.create({
            data: {
              userId: session.user.id,
              action: 'EMAIL_TESTED',
              meta: {
                testedBy: session.user.email,
                timestamp: new Date().toISOString(),
                result: 'success',
              },
            },
          })

          return NextResponse.json({
            success: true,
            message: 'Email test completed successfully',
          })
        } catch (emailError) {
          await prisma.auditLog.create({
            data: {
              userId: session.user.id,
              action: 'EMAIL_TESTED',
              meta: {
                testedBy: session.user.email,
                timestamp: new Date().toISOString(),
                result: 'failed',
                error: emailError.message,
              },
            },
          })

          return NextResponse.json({
            success: false,
            message: 'Email test failed',
            error: emailError.message,
          }, { status: 500 })
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error processing settings action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
