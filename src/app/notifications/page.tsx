import { Metadata } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { NotificationsView } from '@/components/features/NotificationsView'

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'View your notifications and updates',
}

async function getUserNotifications(userId: string, userRole: string) {
  const notifications = await prisma.notification.findMany({
    where: {
      OR: [
        { userId },
        { audience: 'USER' },
        ...(userRole === 'ADMIN' || userRole === 'STAFF' 
          ? [{ audience: 'ADMIN' }, { audience: 'STAFF' }] 
          : []
        ),
      ],
    },
    include: {
      orderRequest: {
        select: {
          shortCode: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  return {
    notifications,
    unreadCount,
  }
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login?callbackUrl=/notifications')
  }

  const data = await getUserNotifications(session.user.id, session.user.role)

  return (
    <div className="min-h-screen bg-bg">
      <NotificationsView data={data} />
    </div>
  )
}











