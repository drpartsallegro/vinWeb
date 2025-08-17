"use client"

import * as React from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  description?: string
  duration?: number
  onClose: (id: string) => void
  className?: string
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, type, title, description, duration = 5000, onClose, className, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)

    React.useEffect(() => {
      // Animate in
      const timer = setTimeout(() => setIsVisible(true), 100)
      return () => clearTimeout(timer)
    }, [])

    React.useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          setTimeout(() => onClose(id), 300) // Wait for exit animation
        }, duration)
        return () => clearTimeout(timer)
      }
    }, [duration, id, onClose])

    const handleClose = () => {
      setIsVisible(false)
      setTimeout(() => onClose(id), 300)
    }

    const typeConfig = {
      success: {
        icon: CheckCircle,
        color: 'border-success/20 bg-success/10 text-success',
        iconColor: 'text-success',
      },
      error: {
        icon: AlertCircle,
        color: 'border-danger/20 bg-danger/10 text-danger',
        iconColor: 'text-danger',
      },
      info: {
        icon: Info,
        color: 'border-primary/20 bg-primary/10 text-primary',
        iconColor: 'text-primary',
      },
      warning: {
        icon: AlertTriangle,
        color: 'border-warn/20 bg-warn/10 text-warn',
        iconColor: 'text-warn',
      },
    }

    const config = typeConfig[type]
    const Icon = config.icon

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full max-w-sm rounded-lg border p-4 shadow-float transition-all duration-300',
          'animate-in slide-in-from-right-full',
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
          config.color,
          className
        )}
        role="alert"
        aria-live="assertive"
        {...props}
      >
        <div className="flex items-start gap-3">
          <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconColor)} />
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium">{title}</h4>
            {description && (
              <p className="mt-1 text-sm opacity-90">{description}</p>
            )}
          </div>

          <button
            onClick={handleClose}
            className="flex-shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity focus-ring"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-b-lg">
            <div
              className="h-full bg-current transition-all duration-300 ease-linear"
              style={{
                width: isVisible ? '0%' : '100%',
                transitionDuration: `${duration}ms`,
              }}
            />
          </div>
        )}
      </div>
    )
  }
)
Toast.displayName = "Toast"

export { Toast }

// Toast Context and Provider
interface ToastContextType {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id, onClose: (id: string) => removeToast(id) }
    setToasts(prev => [...prev, newToast])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const value = React.useMemo(() => ({
    toasts,
    addToast,
    removeToast,
  }), [toasts, addToast, removeToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toaster Component
export function Toaster() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>
  )
}




