'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

interface CartItem {
  id: string
  quantity: number
  note?: string
  photoFile?: any
}

interface CartContextType {
  // Wizard selections
  wizardData: any
  setWizardData: (data: any) => void
  
  // Order selections
  selectedOffers: Record<string, { offerId: string | null; include: boolean }>
  setSelectedOffers: (offers: Record<string, { offerId: string | null; include: boolean }>) => void
  
  selectedUpsells: any[]
  setSelectedUpsells: (upsells: any[]) => void
  
  // Form data persistence
  formData: Record<string, any>
  setFormData: (orderId: string, data: any) => void
  
  // Persistence methods
  saveWizardData: (data: any) => void
  loadWizardData: () => any
  
  saveOrderSelections: (orderId: string, offers: Record<string, { offerId: string | null; include: boolean }>, upsells: any[]) => void
  loadOrderSelections: (orderId: string) => { offers: any; upsells: any }
  
  saveFormData: (orderId: string, data: any) => void
  loadFormData: (orderId: string) => any
  
  clearWizardData: () => void
  clearOrderSelections: (orderId: string) => void
  clearFormData: (orderId: string) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [wizardData, setWizardData] = useState<any>(null)
  const [selectedOffers, setSelectedOffers] = useState<Record<string, { offerId: string | null; include: boolean }>>({})
  const [selectedUpsells, setSelectedUpsells] = useState<any[]>([])
  const [formData, setFormDataState] = useState<Record<string, any>>({})

  // Load wizard data from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('wizardData')
    if (stored) {
      try {
        setWizardData(JSON.parse(stored))
      } catch (error) {
        console.error('Error parsing wizard data:', error)
      }
    }
  }, [])

  // Save wizard data to sessionStorage
  const saveWizardData = useCallback((data: any) => {
    if (!data) {
      console.warn('Attempted to save empty wizard data')
      return
    }
    
    try {
      setWizardData(data)
      sessionStorage.setItem('wizardData', JSON.stringify(data))
      console.log('Wizard data saved successfully:', data)
    } catch (error) {
      console.error('Error saving wizard data:', error)
    }
  }, [])

  // Load wizard data from sessionStorage
  const loadWizardData = useCallback(() => {
    try {
      const stored = sessionStorage.getItem('wizardData')
      if (stored) {
        const parsed = JSON.parse(stored)
        console.log('Wizard data loaded successfully:', parsed)
        return parsed
      }
      console.log('No wizard data found in sessionStorage')
      return null
    } catch (error) {
      console.error('Error parsing stored wizard data:', error)
      return null
    }
  }, [])

  // Save order selections to localStorage
  const saveOrderSelections = useCallback((orderId: string, offers: Record<string, { offerId: string | null; include: boolean }>, upsells: any[]) => {
    localStorage.setItem(`selectedOffers_${orderId}`, JSON.stringify(offers))
    localStorage.setItem(`selectedUpsells_${orderId}`, JSON.stringify(upsells))
    
    // Also update state
    setSelectedOffers(offers)
    setSelectedUpsells(upsells)
  }, [])

  // Load order selections from localStorage
  const loadOrderSelections = useCallback((orderId: string) => {
    const offers = localStorage.getItem(`selectedOffers_${orderId}`)
    const upsells = localStorage.getItem(`selectedUpsells_${orderId}`)
    
    let parsedOffers = {}
    let parsedUpsells = []
    
    if (offers) {
      try {
        parsedOffers = JSON.parse(offers)
      } catch (error) {
        console.error('Error parsing stored offers:', error)
      }
    }
    
    if (upsells) {
      try {
        parsedUpsells = JSON.parse(upsells)
      } catch (error) {
        console.error('Error parsing stored upsells:', error)
      }
    }
    
    // Update state
    setSelectedOffers(parsedOffers)
    setSelectedUpsells(parsedUpsells)
    
    return { offers: parsedOffers, upsells: parsedUpsells }
  }, [])

  // Save form data to localStorage
  const saveFormData = useCallback((orderId: string, data: any) => {
    const key = `formData_${orderId}`
    localStorage.setItem(key, JSON.stringify(data))
    setFormDataState(prev => ({ ...prev, [orderId]: data }))
  }, [])

  // Load form data from localStorage
  const loadFormData = useCallback((orderId: string) => {
    const key = `formData_${orderId}`
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setFormDataState(prev => ({ ...prev, [orderId]: parsed }))
        return parsed
      } catch (error) {
        console.error('Error parsing stored form data:', error)
        return null
      }
    }
    return null
  }, [])

  // Set form data (for internal use)
  const setFormData = useCallback((orderId: string, data: any) => {
    setFormDataState(prev => ({ ...prev, [orderId]: data }))
  }, [])

  // Clear wizard data
  const clearWizardData = useCallback(() => {
    console.log('Clearing wizard data')
    setWizardData(null)
    sessionStorage.removeItem('wizardData')
  }, [])

  // Clear order selections
  const clearOrderSelections = useCallback((orderId: string) => {
    localStorage.removeItem(`selectedOffers_${orderId}`)
    localStorage.removeItem(`selectedUpsells_${orderId}`)
    setSelectedOffers({})
    setSelectedUpsells([])
  }, [])

  // Clear form data
  const clearFormData = useCallback((orderId: string) => {
    const key = `formData_${orderId}`
    localStorage.removeItem(key)
    setFormDataState(prev => {
      const newState = { ...prev }
      delete newState[orderId]
      return newState
    })
  }, [])

  const value: CartContextType = {
    wizardData,
    setWizardData,
    selectedOffers,
    setSelectedOffers,
    selectedUpsells,
    setSelectedUpsells,
    formData,
    setFormData,
    saveWizardData,
    loadWizardData,
    saveOrderSelections,
    loadOrderSelections,
    saveFormData,
    loadFormData,
    clearWizardData,
    clearOrderSelections,
    clearFormData,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
