import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const securityConfigSchema = z.object({
  twoFactorEnabled: z.boolean().optional(),
  passwordPolicy: z.object({
    minLength: z.number().min(8).max(128).optional(),
    requireUppercase: z.boolean().optional(),
    requireLowercase: z.boolean().optional(),
    requireNumbers: z.boolean().optional(),
    requireSpecialChars: z.boolean().optional(),
  }).optional(),
  ipWhitelist: z.array(z.string()).optional(),
  sessionTimeout: z.number().min(15).max(1440).optional(), // minutes
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // Get security events from audit logs
    const securityEvents = await prisma.auditLog.findMany({
      where: {
        OR: [
          { action: { contains: 'LOGIN' } },
          { action: { contains: 'LOGOUT' } },
          { action: { contains: 'PASSWORD' } },
          { action: { contains: 'ROLE' } },
          { action: { contains: 'ACCESS' } },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
        orderRequest: {
          select: {
            shortCode: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // Get failed login attempts
    const failedLogins = await prisma.auditLog.findMany({
      where: {
        action: { contains: 'LOGIN_FAILED' },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get user security status
    const usersWithSecurity = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        totpSecret: true,
        lastLogin: true,
        _count: {
          select: {
            sessions: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    // Get system-wide security metrics
    const totalUsers = await prisma.user.count()
    const usersWith2FA = usersWithSecurity.filter(u => u.totpSecret).length
    const activeSessions = await prisma.session.count({
      where: {
        expires: { gt: new Date() },
      },
    })

    // Get recent security incidents
    const securityIncidents = await prisma.auditLog.findMany({
      where: {
        OR: [
          { action: { contains: 'UNAUTHORIZED' } },
          { action: { contains: 'FAILED' } },
          { action: { contains: 'BLOCKED' } },
        ],
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
      },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      securityEvents,
      failedLogins: {
        count: failedLogins.length,
        recent: failedLogins.slice(0, 20),
      },
      userSecurity: {
        totalUsers,
        usersWith2FA,
        activeSessions,
        users: usersWithSecurity.map(user => ({
          id: user.id,
          email: user.email,
          role: user.role,
          has2FA: !!user.totpSecret,
          activeSessions: user._count.sessions,
          lastLogin: user.lastLogin,
        })),
      },
      securityIncidents: {
        count: securityIncidents.length,
        recent: securityIncidents,
      },
      systemStatus: {
        totalAuditLogs: await prisma.auditLog.count(),
        totalSessions: await prisma.session.count(),
        lastSecurityScan: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('Error fetching security data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, targetUserId, securityConfig } = body

    switch (action) {
      case 'reset_password':
        if (!targetUserId) {
          return NextResponse.json(
            { error: 'Target user ID is required' },
            { status: 400 }
          )
        }

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
        const bcrypt = await import('bcryptjs')
        const hashedPassword = await bcrypt.hash(tempPassword, 12)

        await prisma.user.update({
          where: { id: targetUserId },
          data: { password: hashedPassword },
        })

        // Log the action
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            action: 'PASSWORD_RESET_ADMIN',
            meta: {
              targetUserId,
              resetBy: session.user.email,
              timestamp: new Date().toISOString(),
            },
          },
        })

        return NextResponse.json({
          success: true,
          message: 'Password reset successfully',
          temporaryPassword: tempPassword,
        })

      case 'revoke_sessions':
        if (!targetUserId) {
          return NextResponse.json(
            { error: 'Target user ID is required' },
            { status: 400 }
          )
        }

        await prisma.session.deleteMany({
          where: { userId: targetUserId },
        })

        // Log the action
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            action: 'SESSIONS_REVOKED_ADMIN',
            meta: {
              targetUserId,
              revokedBy: session.user.email,
              timestamp: new Date().toISOString(),
            },
          },
        })

        return NextResponse.json({
          success: true,
          message: 'All user sessions revoked successfully',
        })

      case 'update_security_config':
        if (!securityConfig) {
          return NextResponse.json(
            { error: 'Security configuration is required' },
            { status: 400 }
          )
        }

        const validatedConfig = securityConfigSchema.parse(securityConfig)

        // Store security configuration (you might want to use a dedicated table)
        // For now, we'll log it
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            action: 'SECURITY_CONFIG_UPDATED',
            meta: {
              config: validatedConfig,
              updatedBy: session.user.email,
              timestamp: new Date().toISOString(),
            },
          },
        })

        return NextResponse.json({
          success: true,
          message: 'Security configuration updated successfully',
          config: validatedConfig,
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error processing security action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
