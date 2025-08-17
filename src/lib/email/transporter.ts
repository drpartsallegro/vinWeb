import nodemailer from 'nodemailer'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Email transporter using file transport for development
export const emailTransporter = nodemailer.createTransport({
  streamTransport: true,
  newline: 'unix',
  buffer: true,
})

// File-based email storage for development
export async function saveEmailToFile(emailData: {
  to: string | string[]
  subject: string
  html: string
  text?: string
}) {
  const outboxDir = process.env.EMAIL_OUTBOX_DIR || './emails/outbox'
  
  // Ensure outbox directory exists
  if (!existsSync(outboxDir)) {
    await mkdir(outboxDir, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `${timestamp}-${emailData.subject.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50)}.eml`
  const filepath = join(outboxDir, filename)

  // Create EML format
  const emlContent = [
    `From: ${process.env.EMAIL_FROM || 'PartsFlow <no-reply@example.local>'}`,
    `To: ${Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to}`,
    `Subject: ${emailData.subject}`,
    `Date: ${new Date().toUTCString()}`,
    `Content-Type: text/html; charset=utf-8`,
    '',
    emailData.html,
  ].join('\n')

  await writeFile(filepath, emlContent)
  
  return {
    success: true,
    filepath,
    messageId: `${timestamp}@partsflow.local`,
  }
}

export async function sendEmail(emailData: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  template?: string
  orderRequestId?: string
}) {
  try {
    // In development, save to file
    if (process.env.NODE_ENV === 'development') {
      const result = await saveEmailToFile(emailData)
      
      // Log email to database
      if (emailData.orderRequestId) {
        const { prisma } = await import('@/lib/db')
        await prisma.emailLog.create({
          data: {
            orderRequestId: emailData.orderRequestId,
            to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
            subject: emailData.subject,
            template: emailData.template || 'custom',
            success: true,
          },
        })
      }
      
      console.log(`📧 Email saved to: ${result.filepath}`)
      return result
    }

    // In production, use real SMTP (if configured)
    if (process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      const result = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      })

      // Log email to database
      if (emailData.orderRequestId) {
        const { prisma } = await import('@/lib/db')
        await prisma.emailLog.create({
          data: {
            orderRequestId: emailData.orderRequestId,
            to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
            subject: emailData.subject,
            template: emailData.template || 'custom',
            success: true,
          },
        })
      }

      return {
        success: true,
        messageId: result.messageId,
      }
    }

    // Fallback to file storage
    return await saveEmailToFile(emailData)
  } catch (error) {
    console.error('Email sending failed:', error)
    
    // Log failed email to database
    if (emailData.orderRequestId) {
      try {
        const { prisma } = await import('@/lib/db')
        await prisma.emailLog.create({
          data: {
            orderRequestId: emailData.orderRequestId,
            to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
            subject: emailData.subject,
            template: emailData.template || 'custom',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        })
      } catch (dbError) {
        console.error('Failed to log email error:', dbError)
      }
    }
    
    throw error
  }
}




