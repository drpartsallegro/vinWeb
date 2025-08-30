'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  CreditCard, 
  Banknote, 
  Truck,
  MapPin,
  Building2,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { HeaderNav } from '@/components/ui/HeaderNav'
import { useToast } from '@/lib/hooks'
import { checkoutSchema } from '@/lib/validations'
import { formatPrice } from '@/lib/utils'
import { motionVariants } from '@/lib/motion'
import { z } from 'zod'

type CheckoutForm = z.infer<typeof checkoutSchema>

interface CheckoutViewProps {
  order: any
  shopConfig: any
  isGuest: boolean
}

export function CheckoutView({ order, shopConfig, isGuest }: CheckoutViewProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentProvider: 'P24',
      shipping: {
        method: 'INPOST_LOCKER',
      },
      address: {
        country: 'PL',
      },
    },
    mode: 'onChange',
  })

  const watchedPaymentProvider = watch('paymentProvider')
  const watchedShippingMethod = watch('shipping.method')

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0
    
    // Add selected offers
    order.items.forEach((item: any) => {
      if (item.chosenOffer) {
        subtotal += parseFloat(item.chosenOffer.offer.unitPrice) * item.quantity
      }
    })
    
    // Add upsells
    order.addons.forEach((addon: any) => {
      subtotal += parseFloat(addon.upsellItem.price) * addon.quantity
    })
    
    // Apply coupon discount
    let discount = 0
    if (appliedCoupon) {
      if (appliedCoupon.type === 'PERCENT') {
        discount = subtotal * (appliedCoupon.value / 100)
      } else {
        discount = Math.min(appliedCoupon.value, subtotal)
      }
    }
    
    const discountedSubtotal = subtotal - discount
    
    // Calculate shipping
    const freeShippingThreshold = parseFloat(shopConfig.freeShippingThreshold.toString())
    const qualifiesForFreeShipping = discountedSubtotal >= freeShippingThreshold
    
    let shippingCost = 0
    if (!qualifiesForFreeShipping) {
      const shippingRates: Record<string, number> = {
        'INPOST_LOCKER': 15.99,
        'INPOST_PARCEL': 19.99,
        'DPD': 24.99,
        'DHL': 29.99,
      }
      shippingCost = shippingRates[watchedShippingMethod] || 0
    }
    
    const total = discountedSubtotal + shippingCost
    
    return {
      subtotal,
      discount,
      discountedSubtotal,
      shippingCost,
      total,
      qualifiesForFreeShipping,
    }
  }

  const totals = calculateTotals()

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    
    try {
      // TODO: Implement coupon validation API call
      const mockCoupon = {
        code: couponCode.toUpperCase(),
        type: 'PERCENT',
        value: 10,
        description: '10% off your order'
      }
      
      setAppliedCoupon(mockCoupon)
      setCouponCode('')
      addToast({
        title: 'Coupon Applied',
        description: `${mockCoupon.description}`,
        type: 'success'
      })
    } catch (error) {
      addToast({
        title: 'Invalid Coupon',
        description: 'Please check your coupon code and try again.',
        type: 'error'
      })
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    addToast({
      title: 'Coupon Removed',
      description: 'Coupon has been removed from your order.',
      type: 'info'
    })
  }

  const onSubmit = async (data: CheckoutForm) => {
    setIsSubmitting(true)
    
    try {
      // TODO: Implement checkout submission
      console.log('Checkout data:', data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      addToast({
        title: 'Order Submitted',
        description: 'Your order has been submitted successfully!',
        type: 'success'
      })
      
      // Redirect to order confirmation
      router.push(`/orders/${order.id}/confirmation`)
    } catch (error) {
      addToast({
        title: 'Checkout Failed',
        description: 'Wystąpił błąd podczas przetwarzania Twojego zamówienia. Spróbuj ponownie.',
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <HeaderNav />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/orders/${order.id}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Order
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-text">Checkout</h1>
                <p className="text-muted">Complete your order #{order.shortCode}</p>
              </div>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div variants={motionVariants.quickIn} className="mb-8">
            <ProgressBar
              value={3}
              max={3}
              label="Checkout Progress"
              showValue={false}
              variant="primary"
            />
            <div className="flex justify-between mt-2 text-sm text-muted">
              <span>Order Review</span>
              <span>Payment & Shipping</span>
              <span>Confirmation</span>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Method */}
              <motion.div variants={motionVariants.quickIn}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="p24"
                          value="P24"
                          {...register('paymentProvider')}
                          className="text-primary focus:ring-primary"
                        />
                        <label htmlFor="p24" className="text-sm font-medium text-text">
                          P24 (PayU)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="manual"
                          value="MANUAL"
                          {...register('paymentProvider')}
                          className="text-primary focus:ring-primary"
                        />
                        <label htmlFor="manual" className="text-sm font-medium text-text">
                          Manual Transfer
                        </label>
                      </div>
                    </div>
                    
                    {watchedPaymentProvider === 'MANUAL' && (
                      <div className="p-4 bg-warn/10 border border-warn/20 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-warn mt-0.5" />
                          <div>
                            <h4 className="font-medium text-warn mb-1">Manual Payment Required</h4>
                            <p className="text-sm text-muted">
                              You'll receive payment instructions via email after order confirmation.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Shipping Information */}
              <motion.div variants={motionVariants.quickIn}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Shipping Method
                      </label>
                      <Select
                        value={watchedShippingMethod}
                        onValueChange={(value) => setValue('shipping.method', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select shipping method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INPOST_LOCKER">InPost Locker (15.99 PLN)</SelectItem>
                          <SelectItem value="INPOST_PARCEL">InPost Parcel (19.99 PLN)</SelectItem>
                          <SelectItem value="DPD">DPD (24.99 PLN)</SelectItem>
                          <SelectItem value="DHL">DHL (29.99 PLN)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          First Name
                        </label>
                        <Input
                          {...register('shipping.firstName')}
                          placeholder="John"
                          className={errors.shipping?.firstName ? 'border-danger' : ''}
                        />
                        {errors.shipping?.firstName && (
                          <p className="text-sm text-danger mt-1">{errors.shipping.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Last Name
                        </label>
                        <Input
                          {...register('shipping.lastName')}
                          placeholder="Doe"
                          className={errors.shipping?.lastName ? 'border-danger' : ''}
                        />
                        {errors.shipping?.lastName && (
                          <p className="text-sm text-danger mt-1">{errors.shipping.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Email
                      </label>
                      <Input
                        {...register('shipping.email')}
                        type="email"
                        placeholder="john@example.com"
                        className={errors.shipping?.email ? 'border-danger' : ''}
                      />
                      {errors.shipping?.email && (
                        <p className="text-sm text-danger mt-1">{errors.shipping.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Phone
                      </label>
                      <Input
                        {...register('shipping.phone')}
                        placeholder="+48 123 456 789"
                        className={errors.shipping?.phone ? 'border-danger' : ''}
                      />
                      {errors.shipping?.phone && (
                        <p className="text-sm text-danger mt-1">{errors.shipping.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Address
                      </label>
                      <Input
                        {...register('shipping.address')}
                        placeholder="Street Address"
                        className={errors.shipping?.address ? 'border-danger' : ''}
                      />
                      {errors.shipping?.address && (
                        <p className="text-sm text-danger mt-1">{errors.shipping.address.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          City
                        </label>
                        <Input
                          {...register('shipping.city')}
                          placeholder="Warsaw"
                          className={errors.shipping?.city ? 'border-danger' : ''}
                        />
                        {errors.shipping?.city && (
                          <p className="text-sm text-danger mt-1">{errors.shipping.city.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Postal Code
                        </label>
                        <Input
                          {...register('shipping.postalCode')}
                          placeholder="00-000"
                          className={errors.shipping?.postalCode ? 'border-danger' : ''}
                        />
                        {errors.shipping?.postalCode && (
                          <p className="text-sm text-danger mt-1">{errors.shipping.postalCode.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Country
                        </label>
                        <Select
                          value={watch('shipping.country')}
                          onValueChange={(value) => setValue('shipping.country', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PL">Poland</SelectItem>
                            <SelectItem value="DE">Germany</SelectItem>
                            <SelectItem value="CZ">Czech Republic</SelectItem>
                            <SelectItem value="SK">Slovakia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Billing Information */}
              <motion.div variants={motionVariants.quickIn}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Billing Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="sameAsShipping"
                        {...register('billing.sameAsShipping')}
                        className="text-primary focus:ring-primary"
                      />
                      <label htmlFor="sameAsShipping" className="text-sm font-medium text-text">
                        Same as shipping address
                      </label>
                    </div>

                    {!watch('billing.sameAsShipping') && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-text mb-2">
                              First Name
                            </label>
                            <Input
                              {...register('billing.firstName')}
                              placeholder="John"
                              className={errors.billing?.firstName ? 'border-danger' : ''}
                            />
                            {errors.billing?.firstName && (
                              <p className="text-sm text-danger mt-1">{errors.billing.firstName.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text mb-2">
                              Last Name
                            </label>
                            <Input
                              {...register('billing.lastName')}
                              placeholder="Doe"
                              className={errors.billing?.lastName ? 'border-danger' : ''}
                            />
                            {errors.billing?.lastName && (
                              <p className="text-sm text-danger mt-1">{errors.billing.lastName.message}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text mb-2">
                            Address
                          </label>
                          <Input
                            {...register('billing.address')}
                            placeholder="Street Address"
                            className={errors.billing?.address ? 'border-danger' : ''}
                          />
                          {errors.billing?.address && (
                            <p className="text-sm text-danger mt-1">{errors.billing.address.message}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-text mb-2">
                              City
                            </label>
                            <Input
                              {...register('billing.city')}
                              placeholder="Warsaw"
                              className={errors.billing?.city ? 'border-danger' : ''}
                            />
                            {errors.billing?.city && (
                              <p className="text-sm text-danger mt-1">{errors.billing.city.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text mb-2">
                              Postal Code
                            </label>
                            <Input
                              {...register('billing.postalCode')}
                              placeholder="00-000"
                              className={errors.billing?.postalCode ? 'border-danger' : ''}
                            />
                            {errors.billing?.postalCode && (
                              <p className="text-sm text-danger mt-1">{errors.billing.postalCode.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text mb-2">
                              Country
                            </label>
                            <Select
                              value={watch('billing.country')}
                              onValueChange={(value) => setValue('billing.country', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PL">Poland</SelectItem>
                                <SelectItem value="DE">Germany</SelectItem>
                                <SelectItem value="CZ">Czech Republic</SelectItem>
                                <SelectItem value="SK">Slovakia</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Additional Notes */}
              <motion.div variants={motionVariants.quickIn}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Additional Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      {...register('notes')}
                      placeholder="Any special instructions or notes for your order..."
                      rows={3}
                      className={errors.notes ? 'border-danger' : ''}
                    />
                    {errors.notes && (
                      <p className="text-sm text-danger mt-1">{errors.notes.message}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar - Order Summary */}
            <div className="space-y-6">
              <motion.div variants={motionVariants.quickIn}>
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-text">{item.category.name}</p>
                            <p className="text-xs text-muted">Qty: {item.quantity}</p>
                          </div>
                          <span className="text-sm font-medium text-text">
                            {item.chosenOffer ? formatPrice(parseFloat(item.chosenOffer.offer.unitPrice) * item.quantity) : 'TBD'}
                          </span>
                        </div>
                      ))}
                      
                      {order.addons.map((addon: any) => (
                        <div key={addon.id} className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-text">{addon.upsellItem.name}</p>
                            <p className="text-xs text-muted">Qty: {addon.quantity}</p>
                          </div>
                          <span className="text-sm font-medium text-text">
                            {formatPrice(parseFloat(addon.upsellItem.price) * addon.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Coupon Code */}
                    <div className="border-t border-border pt-4">
                      <div className="flex gap-2">
                        <Input
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Coupon code"
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={handleApplyCoupon}
                          disabled={!couponCode.trim()}
                        >
                          Apply
                        </Button>
                      </div>
                      
                      {appliedCoupon && (
                        <div className="mt-2 p-2 bg-success/10 border border-success/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-success">{appliedCoupon.code}</p>
                              <p className="text-xs text-muted">{appliedCoupon.description}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveCoupon}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Totals */}
                    <div className="border-t border-border pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted">Subtotal</span>
                        <span className="text-sm text-text">{formatPrice(totals.subtotal)}</span>
                      </div>
                      
                      {totals.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted">Discount</span>
                          <span className="text-sm text-success">-{formatPrice(totals.discount)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted">Shipping</span>
                        <span className="text-sm text-text">
                          {totals.qualifiesForFreeShipping ? (
                            <span className="text-success">Free</span>
                          ) : (
                            formatPrice(totals.shippingCost)
                          )}
                        </span>
                      </div>
                      
                      <div className="border-t border-border pt-2">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold text-text">Total</span>
                          <span className="text-lg font-semibold text-text">{formatPrice(totals.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Free Shipping Progress */}
                    {!totals.qualifiesForFreeShipping && (
                      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="text-center">
                                                     <ProgressBar
                             value={totals.discountedSubtotal}
                             max={parseFloat(shopConfig.freeShippingThreshold.toString())}
                             showLabel={false}
                             variant="default"
                             className="mb-2"
                           />
                          <p className="text-xs text-muted">
                            Add {formatPrice(parseFloat(shopConfig.freeShippingThreshold.toString()) - totals.discountedSubtotal)} more for free shipping
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={motionVariants.quickIn}>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Order
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-muted text-center mt-2">
                  By completing your order, you agree to our terms and conditions.
                </p>
              </motion.div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

