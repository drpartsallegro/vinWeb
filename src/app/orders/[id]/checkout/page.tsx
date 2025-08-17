'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  ArrowRight,
  Truck, 
  CreditCard, 
  Shield,
  MapPin,
  FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { HeaderNav } from '@/components/ui/HeaderNav'
import { formatPrice } from '@/lib/utils'
import { motionVariants } from '@/lib/motion'
import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'

interface CheckoutPageProps {
  params: { id: string }
}

interface ShippingAddress {
  firstName: string
  lastName: string
  phone: string
  email: string
  line1: string
  line2?: string
  city: string
  postalCode: string
  country: string
}

interface InvoiceDetails {
  companyName?: string
  nip?: string
  required: boolean
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const { selectedOffers, selectedUpsells, loadOrderSelections, loadFormData } = useCart()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentToken, setCurrentToken] = useState<string | null>(null)
  
  // Form states
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '', lastName: '', phone: '', email: '', line1: '', line2: '',
    city: '', postalCode: '', country: 'Poland'
  })
  
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>({
    required: false, companyName: '', nip: ''
  })
  
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [agreements, setAgreements] = useState({
    terms: false, privacy: false, marketing: false
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  // IMMEDIATE: Check for token right away if available
  const immediateToken = searchParams.get('token')
  if (immediateToken && !currentToken) {
    setCurrentToken(immediateToken)
    setLoading(false)
  }

  // Extract token from URL
  const extractToken = () => {
    // Get token from Next.js searchParams (preserved during navigation)
    const tokenFromParams = searchParams.get('token')
    if (tokenFromParams) {
      return tokenFromParams
    }
    
    // Fallback to window.location if searchParams doesn't have it
    if (typeof window !== 'undefined') {
      try {
        const url = window.location.href
        if (url.includes('token=')) {
          const match = url.match(/[?&]token=([^&]+)/)
          if (match && match[1]) {
            return match[1]
          }
        }
      } catch (error) {
        console.error('Error in fallback token extraction:', error)
      }
    }
    
    return null
  }

  // SIMPLE: Fetch order data
  const fetchOrder = async () => {
    try {
      const token = currentToken || extractToken()
      const url = token ? `/api/v1/orders/${params.id}?token=${token}` : `/api/v1/orders/${params.id}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.status}`)
      }
      
      const orderData = await response.json()
      setOrder(orderData)
      
      // Pre-fill shipping address
      if (session?.user) {
        setShippingAddress(prev => ({
          ...prev,
          firstName: session.user.name?.split(' ')[0] || '',
          lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
          email: session.user.email || ''
        }))
      } else if (orderData.guestEmail) {
        setShippingAddress(prev => ({ ...prev, email: orderData.guestEmail }))
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      alert('Failed to fetch order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle token detection and authentication
  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      return
    }

    // Check for token first
    const token = extractToken()
    
    if (token) {
      setCurrentToken(token)
      setLoading(false)
      fetchOrder()
      return
    }

    // No token, check authentication
    if (status !== 'loading') {
      if (!session?.user?.id) {
        router.push('/login')
      } else {
        fetchOrder()
      }
    }
  }, [status, session, searchParams])



  // Load cart data
  useEffect(() => {
    if (params.id && !dataLoaded) {
      loadOrderSelections(params.id)
      const savedFormData = loadFormData(params.id)
      if (savedFormData) {
        setShippingAddress(savedFormData.shippingAddress || shippingAddress)
        setInvoiceDetails(savedFormData.invoiceDetails || invoiceDetails)
        setShippingMethod(savedFormData.shippingMethod || 'standard')
        setPaymentMethod(savedFormData.paymentMethod || 'card')
        setAgreements(savedFormData.agreements || { terms: false, privacy: false, marketing: false })
      }
      setDataLoaded(true)
    }
  }, [params.id, dataLoaded, loadOrderSelections, loadFormData])

  // Save form data
  useEffect(() => {
    if (dataLoaded && params.id) {
      const formDataToSave = {
        shippingAddress, invoiceDetails, shippingMethod, paymentMethod, agreements
      }
      localStorage.setItem(`formData_${params.id}`, JSON.stringify(formDataToSave))
    }
  }, [dataLoaded, params.id, shippingAddress, invoiceDetails, shippingMethod, paymentMethod, agreements])

  // Loading state logic
  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text">Loading checkout...</div>
      </div>
    )
  }

  // No order - but only show error if we're not still loading and have no token
  if (!order && !loading && !currentToken) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text">Order not found</div>
      </div>
    )
  }

  // Still loading order with token
  if (!order && currentToken) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text">Loading order...</div>
      </div>
    )
  }

  // Check if order is ready
  if (order.status !== 'VALUATED') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text">Order is not ready for checkout</div>
      </div>
    )
  }

  const calculateTotal = () => {
    if (!order) return 0
    
    let total = 0
    
    // Add selected offers
    Object.entries(selectedOffers).forEach(([itemId, selection]) => {
      if (selection.include && selection.offerId) {
        const item = order.items.find((i: any) => i.id === itemId)
        const offer = item?.offers?.find((o: any) => o.id === selection.offerId)
        if (offer && offer.unitPrice) {
          const adminQuantity = Math.min(
            parseInt(offer.quantityAvailable.toString()) || 0, 
            parseInt(item.quantity.toString()) || 1
          )
          total += parseFloat(offer.unitPrice.toString()) * adminQuantity
        }
      }
    })
    
    // Add selected upsells
    selectedUpsells.forEach((upsell) => {
      if (upsell.price && upsell.quantity) {
        total += parseFloat(upsell.price.toString()) * upsell.quantity
      }
    })
    
    // Add shipping cost
    total += shippingMethod === 'express' ? 25 : 15
    
    return total
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required agreements
    if (!agreements.terms || !agreements.privacy) {
      alert('Please accept the required agreements')
      return
    }
    
    // Validate invoice details if required
    if (invoiceDetails.required) {
      if (!invoiceDetails.companyName?.trim() || !invoiceDetails.nip?.trim()) {
        alert('Please fill in all required invoice details')
        return
      }
    }
    
    // Validate shipping address
    if (!shippingAddress.firstName?.trim() || !shippingAddress.lastName?.trim() || 
        !shippingAddress.phone?.trim() || !shippingAddress.email?.trim() ||
        !shippingAddress.line1?.trim() || !shippingAddress.city?.trim() || 
        !shippingAddress.postalCode?.trim()) {
      alert('Please fill in all required shipping address fields')
      return
    }
    
    // Validate that at least one offer is selected
    if (Object.values(selectedOffers).filter(s => s.include).length === 0) {
      alert('Please select at least one offer to proceed')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const token = currentToken || extractToken()
      const url = token ? `/api/v1/orders/${params.id}/checkout?token=${token}` : `/api/v1/orders/${params.id}/checkout`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress, invoiceDetails, shippingMethod, paymentMethod, agreements, selectedOffers, selectedUpsells
        }),
      })
      
      if (response.ok) {
        router.push(`/orders/${params.id}/payment` as any)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Checkout failed')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert(error instanceof Error ? error.message : 'Checkout failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <HeaderNav />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div variants={motionVariants.page} initial="hidden" animate="visible">
          {/* Header */}
          <motion.div variants={motionVariants.quickIn} className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/orders/${params.id}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Order
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-text">Checkout</h1>
                <p className="text-muted">Complete your order for #{order.shortCode}</p>
              </div>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div variants={motionVariants.quickIn} className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Selected Offers */}
                  {Object.entries(selectedOffers).map(([itemId, selection]) => {
                    if (!selection.include || !selection.offerId) return null
                    
                    const item = order.items.find((i: any) => i.id === itemId)
                    const offer = item?.offers?.find((o: any) => o.id === selection.offerId)
                    
                    if (!item || !offer) return null
                    
                    const adminQuantity = Math.min(
                      parseInt(offer.quantityAvailable.toString()) || 0, 
                      parseInt(item.quantity.toString()) || 1
                    )
                    const userRequested = parseInt(item.quantity.toString()) || 1
                    const hasQuantityMismatch = adminQuantity < userRequested
                    
                    return (
                      <div key={itemId} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                        <div>
                          <h4 className="font-medium text-text">{item.category.name}</h4>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-text/70">Qty: </span>
                            {hasQuantityMismatch ? (
                              <span className="text-destructive font-medium">
                                {adminQuantity}/{userRequested}
                              </span>
                            ) : (
                              <span className="text-text font-medium">{userRequested}</span>
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
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* Selected Upsells */}
                  {selectedUpsells.length > 0 && (
                    <>
                      <div className="pt-2 border-t border-border">
                        <h4 className="font-medium text-text mb-2">Additional Items</h4>
                        {selectedUpsells.map((upsell) => (
                          <div key={upsell.id} className="flex items-center justify-between py-2">
                            <div>
                              <h5 className="text-sm font-medium text-text">{upsell.title}</h5>
                              <p className="text-xs text-text/70">Qty: {upsell.quantity}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium text-text">
                                {formatPrice(upsell.price * upsell.quantity)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Subtotal */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-text/70">Subtotal</span>
                      <span className="text-text">
                        {formatPrice(calculateTotal() - (shippingMethod === 'express' ? 25 : 15))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text/70">Shipping</span>
                      <span className="text-text">
                        {shippingMethod === 'express' ? formatPrice(25) : formatPrice(15)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold text-text pt-2 border-t border-border">
                      <span>Total</span>
                      <span>{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Shipping Address */}
            <motion.div variants={motionVariants.quickIn}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">First Name *</label>
                      <Input
                        value={shippingAddress.firstName}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">Last Name *</label>
                      <Input
                        value={shippingAddress.lastName}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">Phone *</label>
                      <Input
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">Email *</label>
                      <Input
                        value={shippingAddress.email}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, email: e.target.value }))}
                        type="email"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-text mb-2">Address Line 1 *</label>
                      <Input
                        value={shippingAddress.line1}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, line1: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-text mb-2">Address Line 2</label>
                      <Input
                        value={shippingAddress.line2}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, line2: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">City *</label>
                      <Input
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">Postal Code *</label>
                      <Input
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-text mb-2">Country *</label>
                      <Select value={shippingAddress.country} onValueChange={(value) => setShippingAddress(prev => ({ ...prev, country: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Poland">Poland</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                          <SelectItem value="Slovakia">Slovakia</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Invoice Details */}
            <motion.div variants={motionVariants.quickIn}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Invoice Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="invoice-required"
                        checked={invoiceDetails.required}
                        onChange={(e) => setInvoiceDetails(prev => ({ ...prev, required: e.target.checked }))}
                        className="h-5 w-5 text-primary rounded border-2 border-border focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      />
                      <label htmlFor="invoice-required" className="text-sm text-text">
                        I need an invoice
                      </label>
                    </div>
                    
                    {invoiceDetails.required && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text mb-2">Company Name *</label>
                          <Input
                            value={invoiceDetails.companyName}
                            onChange={(e) => setInvoiceDetails(prev => ({ ...prev, companyName: e.target.value }))}
                            required={invoiceDetails.required}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text mb-2">NIP (Tax ID) *</label>
                          <Input
                            value={invoiceDetails.nip}
                            onChange={(e) => setInvoiceDetails(prev => ({ ...prev, nip: e.target.value }))}
                            required={invoiceDetails.required}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Shipping Method */}
            <motion.div variants={motionVariants.quickIn}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <input
                        type="radio"
                        id="standard"
                        name="shipping"
                        value="standard"
                        checked={shippingMethod === 'standard'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="text-primary"
                      />
                      <label htmlFor="standard" className="flex-1 cursor-pointer">
                        <div className="font-medium text-text">Standard Shipping</div>
                        <div className="text-sm text-text/70">5-7 business days</div>
                      </label>
                      <div className="font-medium text-text">+{formatPrice(15)}</div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <input
                        type="radio"
                        id="express"
                        name="shipping"
                        value="express"
                        checked={shippingMethod === 'express'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="text-primary"
                      />
                      <label htmlFor="express" className="flex-1 cursor-pointer">
                        <div className="font-medium text-text">Express Shipping</div>
                        <div className="text-sm text-text/70">2-3 business days</div>
                      </label>
                      <div className="font-medium text-text">+{formatPrice(25)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Method */}
            <motion.div variants={motionVariants.quickIn}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <input
                        type="radio"
                        id="card"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-primary"
                      />
                      <label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="font-medium text-text">Credit/Debit Card</div>
                        <div className="text-sm text-text/70">Secure payment via Stripe</div>
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <input
                        type="radio"
                        id="bank"
                        name="payment"
                        value="bank"
                        checked={paymentMethod === 'bank'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-primary"
                      />
                      <label htmlFor="bank" className="flex-1 cursor-pointer">
                        <div className="font-medium text-text">Bank Transfer</div>
                        <div className="text-sm text-text/70">Pay within 7 days</div>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Agreements */}
            <motion.div variants={motionVariants.quickIn}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Agreements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreements.terms}
                        onChange={(e) => setAgreements(prev => ({ ...prev, terms: e.target.checked }))}
                        required
                        className="h-5 w-5 text-primary rounded border-2 border-border focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      />
                      <label htmlFor="terms" className="text-sm text-text cursor-pointer">
                        I accept the <Link href={"/terms" as any} className="text-primary hover:underline">Terms and Conditions</Link> *
                      </label>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="privacy"
                        checked={agreements.privacy}
                        onChange={(e) => setAgreements(prev => ({ ...prev, privacy: e.target.checked }))}
                        required
                        className="h-5 w-5 text-primary rounded border-2 border-border focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      />
                      <label htmlFor="privacy" className="text-sm text-text cursor-pointer">
                        I accept the <Link href={"/privacy" as any} className="text-primary hover:underline">Privacy Policy</Link> *
                      </label>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="marketing"
                        checked={agreements.marketing}
                        onChange={(e) => setAgreements(prev => ({ ...prev, marketing: e.target.checked }))}
                        className="h-5 w-5 text-primary rounded border-2 border-border focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      />
                      <label htmlFor="marketing" className="text-sm text-text cursor-pointer">
                        I agree to receive marketing communications (optional)
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={motionVariants.quickIn} className="pt-8">
              <div className="flex justify-between items-center">
                <Button variant="outline" asChild size="lg" className="min-w-[140px] border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                  <Link href={`/orders/${params.id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Order
                  </Link>
                </Button>
                
                <Button
                  type="submit"
                  size="lg"
                  className="min-w-[200px] bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isSubmitting || Object.values(selectedOffers).filter(s => s.include && s.offerId).length === 0}
                >
                  {isSubmitting ? 'Processing...' : `Proceed to Payment - ${formatPrice(calculateTotal())} (${Object.values(selectedOffers).filter(s => s.include && s.offerId).length + selectedUpsells.length} items)`}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}




