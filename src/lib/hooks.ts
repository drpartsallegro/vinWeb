import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

// Hook for reduced motion preference
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// Hook for prefetching on hover
export function usePrefetchOnHover<T>(
  prefetchFn: () => Promise<T>,
  delay: number = 100
): [boolean, () => void, () => void] {
  const [isPrefetching, setIsPrefetching] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const prefetchedRef = useRef(false)

  const handleMouseEnter = useCallback(() => {
    if (prefetchedRef.current) return

    timeoutRef.current = setTimeout(async () => {
      setIsPrefetching(true)
      try {
        await prefetchFn()
        prefetchedRef.current = true
      } catch (error) {
        console.warn('Prefetch failed:', error)
      } finally {
        setIsPrefetching(false)
      }
    }, delay)
  }, [prefetchFn, delay])

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      setIsPrefetching(false)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [isPrefetching, handleMouseEnter, handleMouseLeave]
}

// Hook for intersection observer
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<Element>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef<Element>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(element)
    return () => observer.disconnect()
  }, [options])

  return [ref, isIntersecting]
}

// Hook for local storage
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}

// Hook for session storage
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}

// Hook for media queries
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [query])

  return matches
}

// Hook for window size
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

// Hook for scroll position
export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      setScrollPosition({
        x: window.pageXOffset,
        y: window.pageYOffset,
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollPosition
}

// Hook for click outside
export function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

// Hook for focus trap
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    function handleTabKey(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    
    // Focus first element when trap is activated
    firstElement.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [containerRef])
}

// Hook for keyboard shortcuts
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    meta?: boolean
  } = {}
) {
  const { ctrl = false, shift = false, alt = false, meta = false } = options

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrl &&
        event.shiftKey === shift &&
        event.altKey === alt &&
        event.metaKey === meta
      ) {
        event.preventDefault()
        callback()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [key, callback, ctrl, shift, alt, meta])
}

// Hook for async operations
export function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = []
): {
  data: T | null
  loading: boolean
  error: Error | null
  execute: () => Promise<void>
} {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await asyncFn()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'))
    } finally {
      setLoading(false)
    }
  }, [asyncFn])

  useEffect(() => {
    execute()
  }, deps)

  return { data, loading, error, execute }
}

// Hook for debounced value
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook for throttled value
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRun = useRef<number>(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun.current >= delay) {
        setThrottledValue(value)
        lastRun.current = Date.now()
      }
    }, delay - (Date.now() - lastRun.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return throttledValue
}

// Toast hook for managing notifications
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string
    title: string
    description: string
    type: 'success' | 'error' | 'info' | 'warning'
    duration?: number
  }>>([])

  const addToast = useCallback((toast: {
    title: string
    description: string
    type: 'success' | 'error' | 'info' | 'warning'
    duration?: number
  }) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove toast after duration
    const duration = toast.duration || 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return {
    toasts,
    addToast,
    removeToast
  }
}
