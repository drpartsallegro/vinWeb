import { Metadata } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | Admin | PartsFlow',
  },
  description: 'PartsFlow admin dashboard for managing orders, settings, and users',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'STAFF'].includes(session.user.role)) {
    redirect('/login?callbackUrl=/admin')
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar userRole={session.user.role} />
        
        {/* Main Content */}
        <div className="flex-1 lg:pl-64">
          <AdminHeader user={session.user} />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}







