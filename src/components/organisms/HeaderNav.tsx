import * as React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Menu, X, User, LogOut, Settings, Bell, Sun, Moon } from 'lucide-react'
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
    const userMenuRef = React.useRef<HTMLDivElement>(null)

    // Close user menu when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
          setIsUserMenuOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSignOut = () => {
      signOut({ callbackUrl: '/' })
      setIsUserMenuOpen(false)
    }

    const getVariantClasses = () => {
      switch (variant) {
        case 'transparent':
          return 'bg-transparent border-none'
        case 'elevated':
          return 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-lg'
        default:
          return 'bg-background border-b'
      }
    }

    const defaultUserMenuItems = [
      {
        label: 'Profile',
        href: '/profile',
        icon: <User className="w-4 h-4" />,
      },
      {
        label: 'Settings',
        href: '/settings',
        icon: <Settings className="w-4 h-4" />,
      },
      { divider: true },
      {
        label: 'Sign Out',
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-lg">V</span>
                    </div>
                    <span className="text-xl font-bold text-foreground">VinWeb</span>
                  </motion.div>
                </Link>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary relative',
                    item.active ? 'text-primary' : 'text-muted-foreground'
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNotificationClick}
                  className="relative"
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
                      {session.user?.name || 'User'}
                    </span>
                  </Button>

                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-background border rounded-lg shadow-lg py-2 z-50"
                    >
                      {finalUserMenuItems.map((item, index) => (
                        <React.Fragment key={index}>
                          {item.divider ? (
                            <div className="border-t my-1" />
                          ) : item.href ? (
                            <Link
                              href={item.href}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full text-left"
                            >
                              {item.icon}
                              <span>{item.label}</span>
                            </button>
                          )}
                        </React.Fragment>
                      ))}
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
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
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t py-4"
            >
              <nav className="flex flex-col space-y-4">
                {navigationItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      'text-sm font-medium transition-colors px-4 py-2 rounded-lg',
                      item.active
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
        </div>
      </header>
    )
  }
)

HeaderNav.displayName = 'HeaderNav'

export { HeaderNav }
