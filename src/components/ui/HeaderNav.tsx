'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut, Settings, Bell, Sun, Moon, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useTheme } from 'next-themes'

export interface HeaderNavProps {
  className?: string
  variant?: 'default' | 'transparent' | 'elevated'
  showNotifications?: boolean
  notificationCount?: number
  onNotificationClick?: () => void
  logo?: React.ReactNode
  navigationItems?: Array<{
    label: string
    href: string
    active?: boolean
    badge?: string | number
  }>
  userMenuItems?: Array<{
    label: string
    href?: string
    onClick?: () => void
    icon?: React.ReactNode
    divider?: boolean
  }>
}

const HeaderNav = React.forwardRef<HTMLElement, HeaderNavProps>(
  (
    {
      className,
      variant = 'default',
      showNotifications = true,
      notificationCount = 0,
      onNotificationClick,
      logo,
      navigationItems = [],
      userMenuItems = [],
      ...props
    },
    ref
  ) => {
    const { data: session } = useSession()
    const { theme, setTheme } = useTheme()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = React.useState(false)
    const userMenuRef = React.useRef<HTMLDivElement>(null)
    const notificationRef = React.useRef<HTMLDivElement>(null)

    // Close user menu when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
          setIsUserMenuOpen(false)
        }
        if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
          setIsNotificationOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSignOut = () => {
      signOut({ callbackUrl: '/' })
      setIsUserMenuOpen(false)
    }

    const handleNotificationClick = () => {
      if (onNotificationClick) {
        onNotificationClick()
      } else {
        setIsNotificationOpen(!isNotificationOpen)
      }
    }

    const getVariantClasses = () => {
      switch (variant) {
        case 'transparent':
          return 'bg-transparent border-none'
        case 'elevated':
          return 'glass-dark dark:glass-dark light:glass-light border-b shadow-lg'
        default:
          return 'glass-dark dark:glass-dark light:glass-light border-b'
      }
    }

    const defaultUserMenuItems = [
      {
        label: 'Moje Zamówienia',
        href: '/orders',
        icon: <Package className="w-4 h-4" />,
      },
      {
        label: 'Mój Garaż',
        href: '/garage',
        icon: <Package className="w-4 h-4" />,
      },
      {
        label: 'Profil',
        href: '/profile',
        icon: <User className="w-4 h-4" />,
      },
      {
        label: 'Ustawienia',
        href: '/settings',
        icon: <Settings className="w-4 h-4" />,
      },
      { divider: true },
      {
        label: 'Wyloguj Się',
        onClick: handleSignOut,
        icon: <LogOut className="w-4 h-4" />,
      },
    ]

    const finalUserMenuItems = userMenuItems.length > 0 ? userMenuItems : defaultUserMenuItems

    return (
      <header
        ref={ref}
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-200',
          getVariantClasses(),
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              {logo || (
                <Link href="/" className="flex items-center space-x-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-2 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">K</span>
                    </div>
                    <span className="text-xl font-bold text-text">Kup Tanie Części</span>
                  </motion.div>
                </Link>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href as any}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary relative',
                    item.active ? 'text-primary' : 'text-muted hover:text-text'
                  )}
                >
                  {item.label}
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      size="sm"
                      className="ml-2"
                    >
                      {item.badge}
                    </Badge>
                  )}
                  {item.active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary rounded-full"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-10 h-10 p-0"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>

              {/* Notifications */}
              {showNotifications && (
                <div className="relative" ref={notificationRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNotificationClick}
                    className="relative w-10 h-10 p-0"
                  >
                    <Bell className="w-5 h-5" />
                    {notificationCount > 0 && (
                      <Badge
                        variant="destructive"
                        size="sm"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </Badge>
                    )}
                  </Button>

                  {/* Notification Dropdown */}
                  <AnimatePresence>
                    {isNotificationOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-float py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-border">
                          <h3 className="text-sm font-medium text-text">Powiadomienia</h3>
                        </div>
                        <div className="px-4 py-6 text-center">
                          <Bell className="w-8 h-8 text-muted mx-auto mb-2" />
                          <p className="text-sm text-muted">Brak nowych powiadomień</p>
                          <p className="text-xs text-muted mt-1">Powiadomimy Cię, gdy będą aktualizacje</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* User menu */}
              {session ? (
                <div className="relative" ref={userMenuRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium">
                      {session.user?.name || 'Użytkownik'}
                    </span>
                  </Button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-float py-2 z-50"
                      >
                        {finalUserMenuItems.map((item, index) => (
                          <React.Fragment key={index}>
                            {item.divider ? (
                              <div className="border-t border-border my-1" />
                            ) : item.href ? (
                              <Link
                                href={item.href as any}
                                className="flex items-center space-x-3 px-4 py-2 text-sm text-muted hover:text-text hover:bg-surface-2 transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                {item.icon}
                                <span>{item.label}</span>
                              </Link>
                            ) : (
                              <button
                                onClick={() => {
                                  item.onClick?.()
                                  setIsUserMenuOpen(false)
                                }}
                                className="flex items-center space-x-3 px-4 py-2 text-sm text-muted hover:text-text hover:bg-surface-2 transition-colors w-full text-left"
                              >
                                {item.icon}
                                <span>{item.label}</span>
                              </button>
                            )}
                          </React.Fragment>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Zaloguj Się
                    </Button>
                  </Link>
                  <Link href="/wizard">
                    <Button size="sm">
                      Rozpocznij
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden w-10 h-10 p-0"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden border-t border-border py-4"
              >
                <nav className="flex flex-col space-y-4">
                  {navigationItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href as any}
                      className={cn(
                        'text-sm font-medium transition-colors px-4 py-2 rounded-lg',
                        item.active
                          ? 'text-primary bg-primary/10'
                          : 'text-muted hover:text-text hover:bg-surface-2'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          size="sm"
                          className="ml-2"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    )
  }
)

HeaderNav.displayName = 'HeaderNav'

export { HeaderNav }
