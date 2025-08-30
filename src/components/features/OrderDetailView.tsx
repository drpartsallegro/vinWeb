'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  CheckCircle, 
  Clock,
  Download,
  Save,
  ShoppingCart,
  ArrowRight,
  User
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusChip } from '@/components/ui/StatusChip'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { HeaderNav } from '@/components/ui/HeaderNav'
import { UpsellCarousel } from '@/components/features/UpsellCarousel'
import { CommentThread } from '@/components/features/CommentThread'
import { DatabaseOfferSelection } from '@/components/features/DatabaseOfferSelection'
import { OrderTimeline } from '@/components/features/OrderTimeline'
import { formatPrice, formatDate } from '@/lib/utils'
import { motionVariants } from '@/lib/motion'
import { useCart } from '@/contexts/CartContext'

interface UpsellItem {
  id: string
  title: string
  description: string
  price: number
  image?: string
  category?: string
  inStock?: boolean
  maxQuantity?: number
}

interface OrderDetailViewProps {
  order: any // TODO: Type this properly
  isGuest: boolean
  isAdmin?: boolean // Add admin prop
  token?: string // Add token prop for magic links
}

export function OrderDetailView({ order, isGuest, isAdmin = false, token }: OrderDetailViewProps) {
  const { 
    selectedOffers, 
    setSelectedOffers, 
    selectedUpsells, 
    setSelectedUpsells,
    saveOrderSelections,
    loadOrderSelections
  } = useCart()
  
  const [upsellItems, setUpsellItems] = useState<UpsellItem[]>([])
  const [upsellLoading, setUpsellLoading] = useState(true)
  const [savingVin, setSavingVin] = useState(false)
  const [vinSaved, setVinSaved] = useState(false)
  const [vinInGarage, setVinInGarage] = useState(false)

  const isValuated = order.status === 'VALUATED'
  const isPaid = order.status === 'PAID'
  const isRemoved = order.status === 'REMOVED'

  // Restore selections from cart context when component mounts
  useEffect(() => {
    if (order?.id) {
      const { offers, upsells } = loadOrderSelections(order.id)
      // Only set offers that actually have valid selections
      const validOffers = Object.entries(offers).reduce((acc, [itemId, selection]) => {
        const typedSelection = selection as { offerId: string | null; include: boolean }
        if (typedSelection.include && typedSelection.offerId) {
          acc[itemId] = typedSelection
        }
        return acc
      }, {} as Record<string, { offerId: string | null; include: boolean }>)
      
      if (Object.keys(validOffers).length > 0) {
        setSelectedOffers(validOffers)
      }
      if (upsells.length > 0) {
        setSelectedUpsells(upsells)
      }
    }
  }, [order?.id, loadOrderSelections, setSelectedOffers, setSelectedUpsells])

  // Save selections to cart context whenever they change
  useEffect(() => {
    if (order?.id && (Object.keys(selectedOffers).length > 0 || selectedUpsells.length > 0)) {
      saveOrderSelections(order.id, selectedOffers, selectedUpsells)
    }
  }, [order?.id, selectedOffers, selectedUpsells, saveOrderSelections])

  // Fetch upsell items when component mounts
  useEffect(() => {
    const fetchUpsells = async () => {
      try {
        setUpsellLoading(true)
        const response = await fetch('/api/v1/upsells')
        if (response.ok) {
          const data = await response.json()
          // Transform the data to match UpsellItem interface
          const transformedUpsells = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            price: parseFloat(item.price),
            image: item.imageUrl,
            category: item.category || '',
            inStock: item.active,
            maxQuantity: 10
          }))
          setUpsellItems(transformedUpsells)
        }
      } catch (error) {
        console.error('Error fetching upsells:', error)
      } finally {
        setUpsellLoading(false)
      }
    }

    fetchUpsells()
  }, [])

  // Check if VIN is already in user's garage
  useEffect(() => {
    const checkVinInGarage = async () => {
      if (!order?.vin || isGuest) return

      try {
        const response = await fetch('/api/v1/garage')
        if (response.ok) {
          const data = await response.json()
          const vinExists = data.garageVins.some((garageVin: any) => garageVin.vin === order.vin)
          setVinInGarage(vinExists)
        }
      } catch (error) {
        console.error('Error checking VIN in garage:', error)
      }
    }

    checkVinInGarage()
  }, [order?.vin, isGuest])

  const handleOfferSelection = (itemId: string, offerId: string | null, include: boolean) => {
    if (offerId === null) {
      // No action selected
      setSelectedOffers((prev: Record<string, { offerId: string | null; include: boolean }>) => ({
        ...prev,
        [itemId]: { offerId: null, include: false }
      }))
    } else {
      // Specific offer selected
      setSelectedOffers((prev: Record<string, { offerId: string | null; include: boolean }>) => ({
        ...prev,
        [itemId]: { offerId, include: true }
      }))
    }
  }

  const handleAddUpsell = (itemId: string, quantity: number) => {
    setSelectedUpsells((prev: any[]) => {
      const existing = prev.find((item: any) => item.id === itemId)
      if (existing) {
        return prev.map((item: any) =>
          item.id === itemId
            ? { ...item, quantity: quantity }
            : item
        )
      }
      // Add new upsell item to cart
      const upsellItem = upsellItems.find((item: any) => item.id === itemId)
      if (upsellItem) {
        return [...prev, { ...upsellItem, quantity }]
      }
      return prev
    })
  }

  const handleSaveVin = async () => {
    if (!order?.vin || isGuest || vinInGarage) return

    try {
      setSavingVin(true)
      const response = await fetch('/api/v1/garage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vin: order.vin,
          label: `Order ${order.shortCode}`,
        }),
      })

      if (response.ok) {
        setVinSaved(true)
        setVinInGarage(true)
        // Auto-hide success message after 5 seconds
        setTimeout(() => setVinSaved(false), 5000)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save VIN to garage')
      }
    } catch (error) {
      console.error('Error saving VIN:', error)
      alert('Failed to save VIN to garage')
    } finally {
      setSavingVin(false)
    }
  }

  const calculateTotal = () => {
    let total = 0
    
    // Add selected offers - use admin offer prices and quantities
    Object.entries(selectedOffers).forEach(([itemId, selection]) => {
      if (selection.include && selection.offerId) {
        const item = order.items.find((i: any) => i.id === itemId)
        const offer = item?.offers?.find((o: any) => o.id === selection.offerId)
        if (offer && offer.unitPrice) {
          // Use admin offer price and quantity available, but don't exceed user request
          const adminQuantity = Math.min(
            parseInt(offer.quantityAvailable.toString()) || 0, 
            parseInt(item.quantity.toString()) || 1
          )
          total += parseFloat(offer.unitPrice.toString()) * adminQuantity
        }
      }
    })
    
    // Add upsells
    selectedUpsells.forEach(item => {
      if (item.price) {
        total += parseFloat(item.price.toString()) * (item.quantity || 1)
      }
    })
    
    return total || 0
  }

  return (
    <div className="min-h-screen bg-bg">
      {!isAdmin && <HeaderNav />}
      
      <div className={`container mx-auto px-4 py-8 max-w-6xl ${isValuated && !isAdmin ? 'pb-32' : ''}`}>
        <motion.div
          variants={motionVariants.page}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div 
            variants={motionVariants.quickIn}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              {!isGuest && (
                <Button variant="ghost-primary" size="sm" className="flex-1 hover:bg-primary/10 hover:text-primary transition-all duration-200" asChild>
                  <Link href="/orders">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Powrót do Zamówień
                  </Link>
                </Button>
              )}
              <div>
                <h1 className="text-3xl font-bold text-text">Order #{order.shortCode}</h1>
                <p className="text-muted">Submitted {formatDate(order.createdAt)}</p>
              </div>
            </div>
            <StatusChip status={order.status} />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status & Timeline */}
              <motion.div variants={motionVariants.quickIn}>
                <Card>
                  <CardHeader>
                    <CardTitle>Status Zamówienia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OrderTimeline 
                      status={order.status}
                      createdAt={order.createdAt}
                      updatedAt={order.updatedAt}
                      orderId={order.id}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Vehicle Information */}
              <motion.div variants={motionVariants.quickIn}>
                <Card>
                  <CardHeader>
                    <CardTitle>Informacje o Pojazdzie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted">Numer VIN</span>
                        <p className="font-mono text-lg text-text">{order.vin}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted">Email Kontaktowy</span>
                        <p className="text-text">{order.guestEmail || order.user?.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Parts Requested */}
              <motion.div variants={motionVariants.quickIn}>
                <Card>
                  <CardHeader>
                    <CardTitle>Zamówione Części ({order.items.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-text">{item.category.name}</h4>
                            <p className="text-sm text-muted">{item.categoryPath}</p>
                            <div className="mt-2 text-sm">
                              <span className="text-muted">Ilość:</span> <span className="text-text">{item.quantity}</span>
                            </div>
                            {item.note && (
                              <div className="mt-2 text-sm">
                                <span className="text-muted">Notatka:</span> <span className="text-text">{item.note}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right space-y-2">
                            {item.photoUrl && (
                              <div className="flex items-center text-sm text-muted">
                                <ImageIcon className="h-4 w-4 mr-1" />
                                <a 
                                  href={item.photoUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:text-primary transition-colors"
                                >
                                  Zobacz Zdjęcie
                                </a>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              {item.state === 'REQUESTED' && (
                                <div className="flex items-center text-sm text-warn">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Awaiting Quote
                                </div>
                              )}
                              {item.state === 'VALUATED' && (
                                <div className="flex items-center text-sm text-success">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Quotes Ready
                                </div>
                              )}
                              {item.state === 'PURCHASED' && (
                                <div className="flex items-center text-sm text-success">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Purchased
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Offers for this item */}
                        {isValuated && item.offers && item.offers.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <DatabaseOfferSelection
                              offers={item.offers}
                              onOfferSelect={(offerId) => 
                                handleOfferSelection(item.id, offerId, offerId !== null)
                              }
                              selectedOfferId={selectedOffers[item.id]?.offerId || undefined}
                              userRequestedQuantity={item.quantity || 1}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Upsell Items (only show if valuated) */}
              {isValuated && (
                <motion.div variants={motionVariants.quickIn}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommended Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <UpsellCarousel 
                        items={upsellItems}
                        onQuantityChange={handleAddUpsell}
                        selectedItems={selectedUpsells.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {})}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Comments */}
              <motion.div variants={motionVariants.quickIn}>
                <Card>
                  <CardHeader>
                    <CardTitle>Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CommentThread 
                      orderId={order.id} 
                      comments={order.comments}
                      canComment={!isRemoved && (!isGuest || isAdmin)}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary - Only show for non-admin users */}
              {isValuated && !isAdmin && (
                <motion.div variants={motionVariants.quickIn}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Selected Offers */}
                        {order.items.map((item: any) => {
                          const selectedOffer = selectedOffers[item.id]
                          const offer = item.offers?.find((o: any) => o.id === selectedOffer?.offerId)
                          
                          if (!selectedOffer?.include || !offer) {
                            return (
                              <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                                <div>
                                  <h4 className="font-medium text-text">{item.category.name}</h4>
                                  <p className="text-sm text-text/70">Qty: {item.quantity}</p>
                                  <p className="text-sm text-text/70">No offer selected</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-text/70">$0.00</span>
                                </div>
                              </div>
                            )
                          }
                          
                          // Calculate admin quantity vs user request
                          const adminQuantity = Math.min(
                            parseInt(offer.quantityAvailable.toString()) || 0, 
                            parseInt(item.quantity.toString()) || 1
                          )
                          const userRequested = parseInt(item.quantity.toString()) || 1
                          const hasQuantityMismatch = adminQuantity < userRequested
                          
                          return (
                            <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                              <div>
                                <h4 className="font-medium text-text">{item.category.name}</h4>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-text/70">Qty: </span>
                                  {hasQuantityMismatch ? (
                                    <span className="text-destructive font-medium">
                                      {adminQuantity}/{userRequested}
                                    </span>
                                  ) : (
                                    <span className="text-text font-medium">
                                      {userRequested}
                                    </span>
                                  )}
                                                                     {hasQuantityMismatch && (
                                     <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded">
                                       Limited stock
                                     </span>
                                   )}
                                </div>
                                <p className="text-sm text-text/70">{offer.manufacturer}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-medium text-text">
                                  {formatPrice(parseFloat(offer.unitPrice.toString()) * adminQuantity)}
                                </span>
                                <div className="text-xs text-text/70">
                                  @ {formatPrice(parseFloat(offer.unitPrice.toString()))} each
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        
                        {/* Selected Upsells */}
                        {selectedUpsells.length > 0 && (
                          <>
                            <div className="pt-2 border-t border-border">
                              <h4 className="font-medium text-text mb-2">Additional Items</h4>
                              {selectedUpsells.map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-2">
                                  <div>
                                    <h5 className="text-sm font-medium text-text">{item.title}</h5>
                                    <p className="text-xs text-text/70">Qty: {item.quantity}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm font-medium text-text">
                                      {formatPrice(item.price * item.quantity)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        
                        <div className="pt-4 border-t border-border">
                          <div className="flex justify-between text-lg font-semibold text-text">
                            <span>Total</span>
                            <span>{formatPrice(calculateTotal())}</span>
                          </div>
                          
                          
                          
                                                     <Button
                             onClick={() => {
                               // Navigate to checkout with token if available
                               const checkoutUrl = token ? `/orders/${order.id}/checkout?token=${token}` : `/orders/${order.id}/checkout`
                               window.location.href = checkoutUrl
                             }}
                             disabled={Object.values(selectedOffers).filter(s => s.include && s.offerId).length === 0}
                             variant="primary-checkout"
                             className="mt-4 w-auto px-6"
                           >
                             Proceed to Checkout
                             <ArrowRight className="ml-2 h-4 w-4" />
                           </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Free Shipping Progress - Only show for non-admin users */}
              {isValuated && !isAdmin && (
                <motion.div variants={motionVariants.quickIn}>
                  <Card>
                    <CardContent className="pt-6">
                      <ProgressBar
                        value={calculateTotal()}
                        max={200} // Free shipping threshold
                        label="Free Shipping Progress"
                        showValue={false}
                        variant="success"
                      />
                      <p className="text-sm text-muted mt-2 text-center">
                        {calculateTotal() >= 200 
                          ? '🎉 You qualify for free shipping!'
                          : `Add ${formatPrice(200 - calculateTotal())} more for free shipping`
                        }
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Order Actions */}
              <motion.div variants={motionVariants.quickIn}>
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Guest user message */}
                    {isGuest && (
                      <div className="text-center py-4 border border-primary/20 rounded-lg bg-primary/5">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <h4 className="font-medium text-text mb-2">Guest User</h4>
                        <p className="text-sm text-muted mb-3">
                          Register or log in to access additional features like saving VINs to your garage, order history, and faster checkout.
                        </p>
                        <div className="flex gap-2 mx-4 my-2">
                          <button 
                            className="flex-1 h-8 px-3 text-sm border-2 border-primary/30 bg-transparent text-primary hover:bg-primary/5 hover:border-primary/50 hover:text-primary/80 transition-all duration-200 rounded-md font-medium"
                          >
                            <Link href="/login" className="block w-full h-full flex items-center justify-center">Log In</Link>
                          </button>
                          <button 
                            className="flex-1 h-8 px-3 text-sm bg-primary text-white shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all duration-200 rounded-md font-medium"
                          >
                            <Link href="/login?mode=signup" className="block w-full h-full flex items-center justify-center">Sign Up</Link>
                          </button>
                        </div>
                      </div>
                    )}

                    {order.status === 'PENDING' && (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-warn/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Clock className="h-6 w-6 text-warn" />
                        </div>
                        <p className="text-sm text-muted">
                          We're reviewing your request and will send quotes within 24 hours.
                        </p>
                      </div>
                    )}
                    
                    {isRemoved && (
                      <div className="space-y-3">
                        <p className="text-sm text-muted text-center">
                          This order has been removed. You can create a new request or duplicate this one.
                        </p>
                                                 <Button variant="outline-primary-full" asChild>
                           <Link href="/wizard">Create New Request</Link>
                         </Button>
                        <Button variant="ghost-duplicate">
                          Duplicate Order
                        </Button>
                      </div>
                    )}

                    {!isGuest && (
                       vinInGarage ? (
                         <div className="flex items-center justify-center gap-2 text-success p-3 border border-success/20 rounded-md bg-success/10">
                           <CheckCircle className="h-4 w-4" />
                           <span className="text-sm font-medium">VIN already in your garage</span>
                         </div>
                       ) : (
                          <Button variant="outline-primary-full" onClick={handleSaveVin} disabled={savingVin}>
                            {savingVin ? (
                              <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            {savingVin ? 'Saving VIN...' : 'Save VIN to My Garage'}
                          </Button>
                        )
                     )}

                     {/* Success message - only show when not already in garage */}
                     {vinSaved && !vinInGarage && (
                       <div className="mt-3 p-2 bg-success/10 border border-success/20 rounded-md text-center text-sm text-success">
                         <CheckCircle className="h-4 w-4 mr-2" />
                         VIN successfully saved to your garage!
                       </div>
                     )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Order Information */}
              <motion.div variants={motionVariants.quickIn}>
                <Card>
                  <CardHeader>
                    <CardTitle>Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Order ID:</span>
                      <span className="font-mono text-text">{order.shortCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Status:</span>
                      <StatusChip status={order.status} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Created:</span>
                      <span className="text-text">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Updated:</span>
                      <span className="text-text">{formatDate(order.updatedAt)}</span>
                    </div>
                    {order.payments.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted">Payment:</span>
                        <span className="capitalize text-text">{order.payments[0].provider}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fixed Bottom Navigation Bar for Checkout - Only show for non-admin users */}
      {isValuated && !isAdmin && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur-sm p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-text/70">
                <ShoppingCart className="h-5 w-5" />
                <span className="text-sm">
                  {Object.values(selectedOffers).filter(s => s.include && s.offerId).length + selectedUpsells.length} {Object.values(selectedOffers).filter(s => s.include && s.offerId).length + selectedUpsells.length === 1 ? "item" : "items"} selected
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs text-text/70">Total</div>
                <div className="text-lg font-bold text-text">
                  {formatPrice(calculateTotal())}
                </div>
              </div>
              
              
            </div>

                         <Button
               onClick={() => {
                 // Navigate to checkout with token if available
                 const checkoutUrl = token ? `/orders/${order.id}/checkout?token=${token}` : `/orders/${order.id}/checkout`
                 window.location.href = checkoutUrl
               }}
               disabled={Object.values(selectedOffers).filter(s => s.include && s.offerId).length === 0}
               variant="primary-checkout"
               className="w-auto px-6"
             >
               Checkout
               <ArrowRight className="h-4 w-4 ml-2" />
             </Button>
          </div>
        </div>
      )}
    </div>
  )
}




