'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { 
  Bell,
  UserCircle,
  Settings,
  LogOut,
  Search,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from 'next-themes'

interface AdminHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    role: string
  }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <header className="bg-surface/50 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search orders, users, or settings..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 p-0"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {/* Orange dot for unread notifications */}
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-warning rounded-full border-2 border-surface"></span>
          </Button>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2"
            >
              <UserCircle className="h-5 w-5" />
              <span className="hidden sm:block text-sm">
                {user.name || user.email}
              </span>
            </Button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-text">
                    {user.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-muted">{user.email}</p>
                  <p className="text-xs text-muted mt-1">
                    Role: {user.role}
                  </p>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center px-4 py-2 text-sm text-muted hover:text-text hover:bg-surface2 transition-colors"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}





