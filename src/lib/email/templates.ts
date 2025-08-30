import { formatPrice, formatDate } from '@/lib/utils'

interface BaseEmailData {
  customerName?: string
  orderShortCode: string
  vin: string
}

interface OrderConfirmationData extends BaseEmailData {
  itemCount: number
  magicLinkUrl?: string
}

interface OrderValuatedData extends BaseEmailData {
  itemCount: number
  totalOffers: number
  viewOrderUrl: string
}

interface PaymentConfirmedData extends BaseEmailData {
  totalAmount: number
  paymentMethod: string
  viewOrderUrl: string
}

interface CommentNotificationData extends BaseEmailData {
  commentAuthor: string
  commentBody: string
  viewOrderUrl: string
}

const baseStyles = `
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #0B0D10; color: #E6EDF3; }
    .container { max-width: 600px; margin: 0 auto; background-color: #11161C; }
    .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .card { background-color: #151C24; border: 1px solid #22303B; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { background-color: #151C24; padding: 20px; text-align: center; color: #9AA4B2; font-size: 14px; }
    .status-chip { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-pending { background-color: rgba(245, 158, 11, 0.1); color: #F59E0B; }
    .status-valuated { background-color: rgba(59, 130, 246, 0.1); color: #3B82F6; }
    .status-paid { background-color: rgba(16, 185, 129, 0.1); color: #10B981; }
    h2 { color: #E6EDF3; margin-top: 0; }
    p { line-height: 1.6; color: #9AA4B2; }
    .highlight { color: #3B82F6; font-weight: 600; }
    .vin { font-family: monospace; background-color: #1C2630; padding: 4px 8px; border-radius: 4px; }
  </style>
`

export function generateOrderConfirmationEmail(data: OrderConfirmationData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - PartsFlow</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚗 PartsFlow</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Premium Auto Parts</p>
        </div>
        
        <div class="content">
          <h2>Order Confirmation</h2>
          <p>Hi ${data.customerName || 'there'},</p>
          <p>Thank you for submitting your parts request! We've received your order and our team is already working on finding the best parts for your vehicle.</p>
          
          <div class="card">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> <span class="highlight">#${data.orderShortCode}</span></p>
            <p><strong>Vehicle VIN:</strong> <span class="vin">${data.vin}</span></p>
            <p><strong>Części Zamówione:</strong> ${data.itemCount} ${data.itemCount !== 1 ? 'części' : 'część'}</p>
                          <p><strong>Status:</strong> <span class="status-chip status-pending">⏳ Oczekuje na Przegląd</span></p>
          </div>
          
          <h3>What happens next?</h3>
          <div class="card">
            <ol style="color: #E6EDF3; padding-left: 20px;">
              <li style="margin-bottom: 10px;"><strong>Review & Search</strong> - Our experts will review your request and search for the best matching parts from multiple suppliers.</li>
              <li style="margin-bottom: 10px;"><strong>Competitive Quotes</strong> - You'll receive quotes from different suppliers within 24 hours, allowing you to choose the best option.</li>
              <li style="margin-bottom: 10px;"><strong>Secure Checkout</strong> - Select your preferred parts and complete payment through our secure checkout process.</li>
              <li><strong>Fast Delivery</strong> - Your parts will be shipped directly to your address with tracking information.</li>
            </ol>
          </div>
          
          ${data.magicLinkUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.magicLinkUrl}" class="button">Track Your Order</a>
              <p style="font-size: 14px; color: #9AA4B2; margin-top: 10px;">
                This link is valid for 30 days and allows you to track your order without creating an account.
              </p>
            </div>
          ` : ''}
          
          <div class="card">
            <h3>Need Help?</h3>
            <p>If you have any questions about your order, feel free to reply to this email or contact our support team.</p>
            <p>We're here to help you find the right parts for your vehicle! 🔧</p>
          </div>
        </div>
        
        <div class="footer">
          <p>&copy; 2024 PartsFlow. All rights reserved.</p>
          <p>This email was sent regarding order #${data.orderShortCode}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateOrderValuatedEmail(data: OrderValuatedData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Quotes Are Ready - PartsFlow</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Quotes Ready!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">PartsFlow</p>
        </div>
        
        <div class="content">
          <h2>Your Parts Quotes Are Ready</h2>
          <p>Hi ${data.customerName || 'there'},</p>
          <p>Great news! We've received competitive quotes for your parts request. You can now review and select the parts you want to purchase.</p>
          
          <div class="card">
            <h3>Order Summary</h3>
            <p><strong>Order Number:</strong> <span class="highlight">#${data.orderShortCode}</span></p>
            <p><strong>Vehicle VIN:</strong> <span class="vin">${data.vin}</span></p>
            <p><strong>Items Quoted:</strong> ${data.itemCount} item${data.itemCount !== 1 ? 's' : ''}</p>
            <p><strong>Total Quotes:</strong> ${data.totalOffers} offer${data.totalOffers !== 1 ? 's' : ''} available</p>
            <p><strong>Status:</strong> <span class="status-chip status-valuated">💰 Ready to Order</span></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.viewOrderUrl}" class="button">Review Your Quotes</a>
          </div>
          
          <div class="card">
            <h3>How It Works</h3>
            <ul style="color: #E6EDF3; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Compare prices and quality from multiple suppliers</li>
              <li style="margin-bottom: 8px;">Choose which parts you want to include in your purchase</li>
              <li style="margin-bottom: 8px;">Add recommended accessories and upgrades</li>
              <li style="margin-bottom: 8px;">Complete secure checkout with your preferred payment method</li>
            </ul>
          </div>
          
          <div class="card" style="background-color: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.3);">
            <h3 style="color: #3B82F6;">⚡ Quick Reminder</h3>
            <p>Quotes are typically valid for 24 hours. Review and purchase soon to secure your preferred parts at these prices.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>&copy; 2024 PartsFlow. All rights reserved.</p>
          <p>This email was sent regarding order #${data.orderShortCode}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generatePaymentConfirmedEmail(data: PaymentConfirmedData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Confirmed - PartsFlow</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Payment Confirmed</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">PartsFlow</p>
        </div>
        
        <div class="content">
          <h2>Thank You for Your Purchase!</h2>
          <p>Hi ${data.customerName || 'there'},</p>
          <p>Your payment has been successfully processed and your order is now confirmed. We're preparing your parts for shipment!</p>
          
          <div class="card">
            <h3>Payment Details</h3>
            <p><strong>Order Number:</strong> <span class="highlight">#${data.orderShortCode}</span></p>
            <p><strong>Vehicle VIN:</strong> <span class="vin">${data.vin}</span></p>
            <p><strong>Total Amount:</strong> <span class="highlight">${formatPrice(data.totalAmount)}</span></p>
            <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
            <p><strong>Status:</strong> <span class="status-chip status-paid">✅ Paid</span></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.viewOrderUrl}" class="button">View Order Details</a>
          </div>
          
          <div class="card">
            <h3>What's Next?</h3>
            <ol style="color: #E6EDF3; padding-left: 20px;">
              <li style="margin-bottom: 10px;"><strong>Order Processing</strong> - We're preparing your parts for shipment (1-2 business days)</li>
              <li style="margin-bottom: 10px;"><strong>Shipping Notification</strong> - You'll receive tracking information once your package ships</li>
              <li style="margin-bottom: 10px;"><strong>Delivery</strong> - Your parts will arrive at your specified address</li>
              <li><strong>Installation Support</strong> - Contact us if you need help with installation or have any questions</li>
            </ol>
          </div>
          
          <div class="card" style="background-color: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3);">
            <h3 style="color: #10B981;">📧 Keep This Email</h3>
            <p>This serves as your receipt. Keep it for warranty claims and future reference.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>&copy; 2024 PartsFlow. All rights reserved.</p>
          <p>This email was sent regarding order #${data.orderShortCode}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateCommentNotificationEmail(data: CommentNotificationData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Message on Your Order - PartsFlow</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💬 New Message</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">PartsFlow</p>
        </div>
        
        <div class="content">
          <h2>New Message on Your Order</h2>
          <p>Hi ${data.customerName || 'there'},</p>
          <p>You have received a new message regarding your order <strong>#${data.orderShortCode}</strong>.</p>
          
          <div class="card">
            <h3>Message Details</h3>
            <p><strong>From:</strong> ${data.commentAuthor}</p>
            <p><strong>Order:</strong> <span class="highlight">#${data.orderShortCode}</span></p>
            <p><strong>Vehicle VIN:</strong> <span class="vin">${data.vin}</span></p>
          </div>
          
          <div class="card" style="background-color: #1C2630; border-left: 4px solid #3B82F6;">
            <h4 style="margin-top: 0; color: #3B82F6;">Message:</h4>
            <p style="color: #E6EDF3; font-style: italic;">"${data.commentBody}"</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.viewOrderUrl}" class="button">View & Reply</a>
          </div>
          
          <div class="card">
            <h3>Stay Connected</h3>
            <p>Keep the conversation going! Reply to messages directly from your order page to get quick answers from our support team.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>&copy; 2024 PartsFlow. All rights reserved.</p>
          <p>This email was sent regarding order #${data.orderShortCode}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Magic link email for guest users
export function generateMagicLinkEmail(data: {
  orderShortCode: string
  vin: string
  magicLinkUrl: string
  expiresAt: Date
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Access Your Order - PartsFlow</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔑 Order Access Link</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">PartsFlow</p>
        </div>
        
        <div class="content">
          <h2>Access Your Order</h2>
          <p>Use this secure link to access your order without creating an account:</p>
          
          <div class="card">
            <p><strong>Order Number:</strong> <span class="highlight">#${data.orderShortCode}</span></p>
            <p><strong>Vehicle VIN:</strong> <span class="vin">${data.vin}</span></p>
            <p><strong>Link Expires:</strong> ${formatDate(data.expiresAt)}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.magicLinkUrl}" class="button">Access Your Order</a>
          </div>
          
          <div class="card" style="background-color: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.3);">
            <h3 style="color: #F59E0B;">🔒 Security Notice</h3>
            <p>This link is unique to your order and expires in 30 days. Don't share it with others.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>&copy; 2024 PartsFlow. All rights reserved.</p>
          <p>This email was sent regarding order #${data.orderShortCode}</p>
        </div>
      </div>
    </body>
    </html>
  `
}




