import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    // Get shop config for robots settings
    const shopConfig = await prisma.shopConfig.findUnique({
      where: { id: 'singleton' },
    })

    const robotsPolicy = shopConfig?.seo?.robotsPolicy || 'index,follow'
    const sitemapEnabled = shopConfig?.seo?.sitemapEnabled !== false

    let robots = `User-agent: *\n`

    if (robotsPolicy === 'noindex,nofollow' || process.env.NODE_ENV === 'development') {
      robots += `Disallow: /\n`
    } else {
      // Allow crawling of public pages
      robots += `Allow: /\n`
      robots += `Allow: /wizard\n`
      
      // Disallow private/admin areas
      robots += `Disallow: /admin\n`
      robots += `Disallow: /api\n`
      robots += `Disallow: /orders\n`
      robots += `Disallow: /notifications\n`
      robots += `Disallow: /login\n`
      robots += `Disallow: /_next\n`
      robots += `Disallow: /uploads\n`
    }

    // Add sitemap reference if enabled
    if (sitemapEnabled && robotsPolicy !== 'noindex,nofollow') {
      robots += `\nSitemap: ${baseUrl}/sitemap.xml\n`
    }

    // Add crawl delay for politeness
    robots += `\nCrawl-delay: 1\n`

    return new NextResponse(robots, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error('Robots.txt generation error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}







