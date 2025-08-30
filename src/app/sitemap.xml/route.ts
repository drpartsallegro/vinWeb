import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    // Get shop config for sitemap settings
    const shopConfig = await prisma.shopConfig.findUnique({
      where: { id: 'singleton' },
    })

    if (!shopConfig?.seo?.sitemapEnabled) {
      return new NextResponse('Sitemap disabled', { status: 404 })
    }

    // Static pages
    const staticPages = [
      '',
      '/wizard',
      '/wizard/identify',
      '/wizard/parts',
      '/wizard/review',
      '/orders',
      '/login',
      '/notifications',
    ]

    // Get some recent orders for dynamic content (public orders only)
    const recentOrders = await prisma.orderRequest.findMany({
      where: {
        status: { in: ['PAID'] }, // Only include completed orders
      },
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 100, // Limit to prevent huge sitemaps
    })

    const currentDate = new Date().toISOString()

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page === '' ? 'daily' : page.includes('wizard') ? 'weekly' : 'monthly'}</changefreq>
    <priority>${page === '' ? '1.0' : page.includes('wizard') ? '0.8' : '0.6'}</priority>
  </url>`).join('\n')}
${recentOrders.map(order => `  <url>
    <loc>${baseUrl}/orders/${order.id}</loc>
    <lastmod>${order.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>`).join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}











