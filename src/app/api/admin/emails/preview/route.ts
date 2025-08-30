import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import {
  generateOrderConfirmationEmail,
  generateOrderValuatedEmail,
  generatePaymentConfirmedEmail,
  generateCommentNotificationEmail,
  generateMagicLinkEmail,
} from '@/lib/email/templates'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check admin permissions
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const template = searchParams.get('template')

    if (!template) {
      return NextResponse.json(
        { error: 'Template parameter required' },
        { status: 400 }
      )
    }

    // Sample data for previews
    const sampleData = {
      customerName: 'John Doe',
      orderShortCode: 'ABC12345',
      vin: 'WVWZZZ1JZXW386752',
      itemCount: 3,
      totalOffers: 5,
      totalAmount: 1250.50,
      paymentMethod: 'Credit Card',
      commentAuthor: 'PartsFlow Support',
      commentBody: 'Your parts have been located and are ready for shipping. The estimated delivery time is 2-3 business days.',
      viewOrderUrl: 'https://partsflow.example.com/orders/sample-order-id',
      magicLinkUrl: 'https://partsflow.example.com/orders/sample-order-id?token=sample-token',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    }

    let html: string

    switch (template) {
      case 'order_confirmation':
        html = generateOrderConfirmationEmail({
          customerName: sampleData.customerName,
          orderShortCode: sampleData.orderShortCode,
          vin: sampleData.vin,
          itemCount: sampleData.itemCount,
          magicLinkUrl: sampleData.magicLinkUrl,
        })
        break

      case 'order_valuated':
        html = generateOrderValuatedEmail({
          customerName: sampleData.customerName,
          orderShortCode: sampleData.orderShortCode,
          vin: sampleData.vin,
          itemCount: sampleData.itemCount,
          totalOffers: sampleData.totalOffers,
          viewOrderUrl: sampleData.viewOrderUrl,
        })
        break

      case 'payment_confirmed':
        html = generatePaymentConfirmedEmail({
          customerName: sampleData.customerName,
          orderShortCode: sampleData.orderShortCode,
          vin: sampleData.vin,
          totalAmount: sampleData.totalAmount,
          paymentMethod: sampleData.paymentMethod,
          viewOrderUrl: sampleData.viewOrderUrl,
        })
        break

      case 'comment_notification':
        html = generateCommentNotificationEmail({
          customerName: sampleData.customerName,
          orderShortCode: sampleData.orderShortCode,
          vin: sampleData.vin,
          commentAuthor: sampleData.commentAuthor,
          commentBody: sampleData.commentBody,
          viewOrderUrl: sampleData.viewOrderUrl,
        })
        break

      case 'magic_link':
        html = generateMagicLinkEmail({
          orderShortCode: sampleData.orderShortCode,
          vin: sampleData.vin,
          magicLinkUrl: sampleData.magicLinkUrl,
          expiresAt: sampleData.expiresAt,
        })
        break

      default:
        return NextResponse.json(
          { error: 'Unknown template' },
          { status: 400 }
        )
    }

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Email preview error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}











