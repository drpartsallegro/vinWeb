"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFocusTrap, useClickOutside } from "@/lib/hooks"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ 
    isOpen, 
    onClose, 
    title, 
    description, 
    children, 
    className,
    size = 'md',
    closeOnBackdrop = true,
    closeOnEscape = true,
    showCloseButton = true,
    ...props 
  }, ref) => {
    const modalRef = React.useRef<HTMLDivElement>(null)
    const previousActiveElement = React.useRef<HTMLElement | null>(null)

    // Focus trap
    useFocusTrap(modalRef)

    // Click outside to close
    useClickOutside(modalRef, () => {
      if (closeOnBackdrop) {
        onClose()
      }
    })

    // Escape key to close
    React.useEffect(() => {
      if (!closeOnEscape) return

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }

      if (isOpen) {
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
      }
    }, [isOpen, onClose, closeOnEscape])

    // Manage focus
    React.useEffect(() => {
      if (isOpen) {
        // Store the previously focused element
        previousActiveElement.current = document.activeElement as HTMLElement
        
        // Focus the modal
        if (modalRef.current) {
          modalRef.current.focus()
        }
      } else {
        // Restore focus when modal closes
        if (previousActiveElement.current) {
          previousActiveElement.current.focus()
        }
      }
    }, [isOpen])

    // Prevent body scroll when modal is open
    React.useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
        return () => {
          document.body.style.overflow = 'unset'
        }
      }
    }, [isOpen])

    if (!isOpen) return null

    const modalContent = (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />
        
        {/* Modal */}
        <div
          ref={modalRef}
          className={cn(
            'relative w-full rounded-lg bg-surface border border-border shadow-float',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            sizeClasses[size],
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-description' : undefined}
          tabIndex={-1}
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="flex-1">
                {title && (
                  <h2 
                    id="modal-title" 
                    className="text-lg font-semibold text-text"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p 
                    id="modal-description" 
                    className="mt-1 text-sm text-muted"
                  >
                    {description}
                  </p>
                )}
              </div>
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="ml-4 rounded-md p-1 text-muted hover:text-text hover:bg-surface-2 transition-colors focus-ring"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="px-6 pb-6">
            {children}
          </div>
        </div>
      </div>
    )

    // Render to portal
    if (typeof window !== 'undefined') {
      return createPortal(modalContent, document.body)
    }

    return modalContent
  }
)
Modal.displayName = "Modal"

export { Modal }




