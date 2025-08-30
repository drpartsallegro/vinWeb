import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // P24 webhook payload typically includes:
    // - merchantId, posId, sessionId
    // - orderId, amount, currency
    // - sign (signature for verification)
    
    const {
      merchantId,
      posId,
      sessionId,
      amount,
      currency,
      orderId,
      sign,
    } = body

    // Verify the webhook signature
    // In a real implementation, you would verify the signature using your P24 credentials
    // const expectedSign = md5(`${sessionId}|${orderId}|${amount}|${currency}|${crc}`)
    // if (sign !== expectedSign) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    // }

    // Find the payment record
    const payment = await prisma.payment.findFirst({
      where: {
        id: sessionId, // Using payment ID as session ID
        provider: 'P24',
        status: 'INIT',
      },
      include: {
        orderRequest: true,
      },
    })

    if (!payment) {
      console.error('Payment not found for session:', sessionId)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Verify amount matches
    const expectedAmount = Math.round(parseFloat(payment.amount.toString()) * 100) // Convert to grosze
    if (amount !== expectedAmount) {
      console.error('Amount mismatch:', { expected: expectedAmount, received: amount })
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCEEDED',
        rawPayload: body,
      },
    })

    // Update order status to PAID
    const updatedOrder = await prisma.orderRequest.update({
      where: { id: payment.orderRequestId },
      data: { status: 'PAID' },
    })

    // Mark selected items as PURCHASED, others as DECLINED
    await prisma.orderItem.updateMany({
      where: {
        orderRequestId: payment.orderRequestId,
        chosenOffer: {
          isNot: null,
        },
      },
      data: { state: 'PURCHASED' },
    })

    await prisma.orderItem.updateMany({
      where: {
        orderRequestId: payment.orderRequestId,
        chosenOffer: null,
        state: 'VALUATED',
      },
      data: { state: 'DECLINED' },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        orderRequestId: payment.orderRequestId,
        userId: payment.orderRequest.userId,
        audience: payment.orderRequest.userId ? 'USER' : 'GUEST',
        type: 'PAYMENT_SUCCEEDED',
        title: 'Payment confirmed',
        body: `Your payment of ${payment.amount} PLN has been processed successfully.`,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        orderRequestId: payment.orderRequestId,
        action: 'PAYMENT_CONFIRMED',
        meta: {
          paymentId: payment.id,
          amount: payment.amount,
          provider: 'P24',
          webhookData: body,
        },
      },
    })

    // TODO: Send confirmation email
    // TODO: Create shipping label if applicable

    console.log(`Payment confirmed for order ${updatedOrder.shortCode}`)

    return NextResponse.json({ status: 'OK' })
  } catch (error) {
    console.error('P24 webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}











