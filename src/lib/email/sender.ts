import { sendEmail } from './transporter'
import {
  generateOrderConfirmationEmail,
  generateOrderValuatedEmail,
  generatePaymentConfirmedEmail,
  generateCommentNotificationEmail,
  generateMagicLinkEmail,
} from './templates'

export async function sendOrderConfirmationEmail(data: {
  orderRequestId: string
  customerEmail: string
  customerName?: string
  orderShortCode: string
  vin: string
  itemCount: number
  magicLinkUrl?: string
}) {
  const html = generateOrderConfirmationEmail({
    customerName: data.customerName,
    orderShortCode: data.orderShortCode,
    vin: data.vin,
    itemCount: data.itemCount,
    magicLinkUrl: data.magicLinkUrl,
  })

  return await sendEmail({
    to: data.customerEmail,
    subject: `Order Confirmation #${data.orderShortCode} - PartsFlow`,
    html,
    template: 'order_confirmation',
    orderRequestId: data.orderRequestId,
  })
}

export async function sendOrderValuatedEmail(data: {
  orderRequestId: string
  customerEmail: string
  customerName?: string
  orderShortCode: string
  vin: string
  itemCount: number
  totalOffers: number
  viewOrderUrl: string
}) {
  const html = generateOrderValuatedEmail({
    customerName: data.customerName,
    orderShortCode: data.orderShortCode,
    vin: data.vin,
    itemCount: data.itemCount,
    totalOffers: data.totalOffers,
    viewOrderUrl: data.viewOrderUrl,
  })

  return await sendEmail({
    to: data.customerEmail,
    subject: `Your Quotes Are Ready #${data.orderShortCode} - PartsFlow`,
    html,
    template: 'order_valuated',
    orderRequestId: data.orderRequestId,
  })
}

export async function sendPaymentConfirmedEmail(data: {
  orderRequestId: string
  customerEmail: string
  customerName?: string
  orderShortCode: string
  vin: string
  totalAmount: number
  paymentMethod: string
  viewOrderUrl: string
}) {
  const html = generatePaymentConfirmedEmail({
    customerName: data.customerName,
    orderShortCode: data.orderShortCode,
    vin: data.vin,
    totalAmount: data.totalAmount,
    paymentMethod: data.paymentMethod,
    viewOrderUrl: data.viewOrderUrl,
  })

  return await sendEmail({
    to: data.customerEmail,
    subject: `Payment Confirmed #${data.orderShortCode} - PartsFlow`,
    html,
    template: 'payment_confirmed',
    orderRequestId: data.orderRequestId,
  })
}

export async function sendCommentNotificationEmail(data: {
  orderRequestId: string
  customerEmail: string
  customerName?: string
  orderShortCode: string
  vin: string
  commentAuthor: string
  commentBody: string
  viewOrderUrl: string
}) {
  const html = generateCommentNotificationEmail({
    customerName: data.customerName,
    orderShortCode: data.orderShortCode,
    vin: data.vin,
    commentAuthor: data.commentAuthor,
    commentBody: data.commentBody,
    viewOrderUrl: data.viewOrderUrl,
  })

  return await sendEmail({
    to: data.customerEmail,
    subject: `New Message on Order #${data.orderShortCode} - PartsFlow`,
    html,
    template: 'comment_notification',
    orderRequestId: data.orderRequestId,
  })
}

export async function sendMagicLinkEmail(data: {
  orderRequestId: string
  customerEmail: string
  orderShortCode: string
  vin: string
  magicLinkUrl: string
  expiresAt: Date
}) {
  const html = generateMagicLinkEmail({
    orderShortCode: data.orderShortCode,
    vin: data.vin,
    magicLinkUrl: data.magicLinkUrl,
    expiresAt: data.expiresAt,
  })

  return await sendEmail({
    to: data.customerEmail,
    subject: `Access Your Order #${data.orderShortCode} - PartsFlow`,
    html,
    template: 'magic_link',
    orderRequestId: data.orderRequestId,
  })
}




