'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  ShoppingBag,
  BarChart3,
  Users,
  Bell,
  FileText,
  Shield,
  Settings,
  LogOut,
} from 'lucide-react'

interface AdminSidebarProps {
  userRole: string
}

const navigation = [
  { name: 'Panel Główny', href: '/admin', icon: Home, roles: ['ADMIN', 'STAFF'] },
  { name: 'Zamówienia', href: '/admin/orders', icon: ShoppingBag, roles: ['ADMIN', 'STAFF'] },
  { name: 'Upselle', href: '/admin/upsells', icon: ShoppingBag, roles: ['ADMIN', 'STAFF'] },
  { name: 'Analizy', href: '/admin/analytics', icon: BarChart3, roles: ['ADMIN'] },
  { name: 'Użytkownicy', href: '/admin/users', icon: Users, roles: ['ADMIN'] },
  { name: 'Powiadomienia', href: '/admin/notifications', icon: Bell, roles: ['ADMIN', 'STAFF'] },
  { name: 'Raporty', href: '/admin/reports', icon: FileText, roles: ['ADMIN'] },
  { name: 'Bezpieczeństwo', href: '/admin/security', icon: Shield, roles: ['ADMIN'] },
  { name: 'Ustawienia', href: '/admin/settings', icon: Settings, roles: ['ADMIN'] },
]

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname()

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  )

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary"></div>
            <div>
              <h1 className="text-lg font-bold text-gradient">Kup Tanie Części</h1>
              <p className="text-xs text-muted">Panel Admin</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href as any}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-muted hover:text-text hover:bg-surface2'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-white' : 'text-muted group-hover:text-text'
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="text-xs text-muted">
            <p>Rola: <span className="font-medium text-text">{userRole}</span></p>
            <p className="mt-1">Kup Tanie Części Admin v1.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}





