import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Decimal } from "decimal.js"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate short code for orders
export function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Currency formatting utility with Decimal support
export function currencyFormat(
  amount: Decimal | number,
  currency: string = 'PLN',
  locale: string = 'pl-PL'
): string {
  const numAmount = amount instanceof Decimal ? amount.toNumber() : amount
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount)
}

// Price formatting without currency symbol (for Decimal support)
export function priceFormat(
  amount: Decimal | number,
  locale: string = 'pl-PL'
): string {
  const numAmount = amount instanceof Decimal ? amount.toNumber() : amount
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount)
}

// Format price with currency symbol (alias for currencyFormat)
export function formatPrice(
  amount: Decimal | number,
  currency: string = 'PLN',
  locale: string = 'pl-PL'
): string {
  return currencyFormat(amount, currency, locale)
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Format date
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }
  
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj)
}

// Format relative time
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
  
  return `${Math.floor(diffInSeconds / 31536000)}y ago`
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Generate random ID
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Check if value is empty
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Convert to title case
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

// Slugify string
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Truncate text
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) return str
  return str.substring(0, length - suffix.length) + suffix
}

// Check if device is mobile
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Check if device is touch
export function isTouch(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// Get viewport dimensions
export function getViewportDimensions() {
  if (typeof window === 'undefined') return { width: 0, height: 0 }
  return {
    width: window.innerWidth,
    height: window.innerHeight
  }
}

// Check if element is in viewport
export function isInViewport(element: Element): boolean {
  if (typeof window === 'undefined') return false
  
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  )
}

// Focus trap for modals
export function createFocusTrap(container: HTMLElement) {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
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
  
  return () => {
    container.removeEventListener('keydown', handleTabKey)
  }
}

// Validation functions
export function validateVIN(vin: string): boolean {
  if (!vin || vin.length !== 17) return false
  
  // VIN validation logic
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/
  return vinRegex.test(vin.toUpperCase())
}

export function validateNIP(nip: string): boolean {
  if (!nip || nip.length !== 10) return false
  
  // NIP validation logic for Polish tax numbers
  const nipRegex = /^\d{10}$/
  if (!nipRegex.test(nip)) return false
  
  // Check digit validation
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7]
  let sum = 0
  
  for (let i = 0; i < 9; i++) {
    sum += parseInt(nip[i]) * weights[i]
  }
  
  const checkDigit = sum % 11
  return checkDigit === parseInt(nip[9])
}

export function validatePolishPostalCode(postalCode: string): boolean {
  if (!postalCode) return false
  
  // Polish postal code format: XX-XXX
  const postalCodeRegex = /^\d{2}-\d{3}$/
  return postalCodeRegex.test(postalCode)
}

