import * as React from 'react'
import { motion } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreditCard, Lock, Shield, Truck, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Badge } from '@/components/ui/Badge'
import { motionVariants } from '@/lib/motion'

// Validation schemas
const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
})

const shippingSchema = z.object({
  address: z.string().min(10, 'Please enter a complete address'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Please enter a valid ZIP code'),
  country: z.string().min(2, 'Country is required'),
})

const paymentSchema = z.object({
  cardNumber: z.string().min(16, 'Please enter a valid card number'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Please enter a valid expiry date (MM/YY)'),
  cvv: z.string().min(3, 'CVV must be at least 3 digits'),
  cardholderName: z.string().min(2, 'Cardholder name is required'),
})

const checkoutSchema = z.object({
  personalInfo: personalInfoSchema,
  shipping: shippingSchema,
  payment: paymentSchema,
  terms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  newsletter: z.boolean().optional(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export interface CheckoutFormProps {
  className?: string
  onSubmit?: (data: CheckoutFormData) => void
  onCancel?: () => void
  loading?: boolean
  orderSummary?: {
    subtotal: number
    shipping: number
    tax: number
    total: number
    currency?: string
  }
  shippingOptions?: Array<{
    id: string
    name: string
    price: number
    estimatedDays: string
    description?: string
  }>
  selectedShippingOption?: string
  onShippingOptionChange?: (optionId: string) => void
  showOrderSummary?: boolean
  showSecurityBadges?: boolean
  showProgressIndicator?: boolean
  currentStep?: number
  totalSteps?: number
}

const CheckoutForm = React.forwardRef<HTMLFormElement, CheckoutFormProps>(
  (
    {
      className,
      onSubmit,
      onCancel,
      loading = false,
      orderSummary,
      shippingOptions = [],
      selectedShippingOption,
      onShippingOptionChange,
      showOrderSummary = true,
      showSecurityBadges = true,
      showProgressIndicator = true,
      currentStep = 1,
      totalSteps = 3,
      ...props
    },
    ref
  ) => {
    const [activeSection, setActiveSection] = React.useState<'personal' | 'shipping' | 'payment'>('personal')
    const [formData, setFormData] = React.useState<Partial<CheckoutFormData>>({})

    const {
      control,
      handleSubmit,
      formState: { errors, isValid },
      watch,
      setValue,
    } = useForm<CheckoutFormData>({
      resolver: zodResolver(checkoutSchema),
      mode: 'onChange',
      defaultValues: {
        personalInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
        },
        shipping: {
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        payment: {
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardholderName: '',
        },
        terms: false,
        newsletter: false,
      },
    })

    const watchedValues = watch()

    const handleSectionChange = (section: 'personal' | 'shipping' | 'payment') => {
      setActiveSection(section)
    }

    const handleFormSubmit = (data: CheckoutFormData) => {
      onSubmit?.(data)
    }

    const formatCurrency = (amount: number, currency = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
      }).format(amount)
    }

    const getSectionStatus = (section: string) => {
      if (section === activeSection) return 'current'
      if (formData[section as keyof CheckoutFormData]) return 'completed'
      return 'upcoming'
    }

    const renderPersonalInfoSection = () => (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={motionVariants.fade}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="personalInfo.firstName"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  First Name *
                </label>
                <Input
                  {...field}
                  placeholder="Enter your first name"
                  error={errors.personalInfo?.firstName?.message}
                />
              </div>
            )}
          />

          <Controller
            name="personalInfo.lastName"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Last Name *
                </label>
                <Input
                  {...field}
                  placeholder="Enter your last name"
                  error={errors.personalInfo?.lastName?.message}
                />
              </div>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="personalInfo.email"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address *
                </label>
                <Input
                  {...field}
                  type="email"
                  placeholder="Enter your email"
                  error={errors.personalInfo?.email?.message}
                />
              </div>
            )}
          />

          <Controller
            name="personalInfo.phone"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number *
                </label>
                <Input
                  {...field}
                  type="tel"
                  placeholder="Enter your phone number"
                  error={errors.personalInfo?.phone?.message}
                />
              </div>
            )}
          />
        </div>
      </motion.div>
    )

    const renderShippingSection = () => (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={motionVariants.fade}
        className="space-y-6"
      >
        <Controller
          name="shipping.address"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Street Address *
              </label>
              <Input
                {...field}
                placeholder="Enter your street address"
                error={errors.shipping?.address?.message}
              />
            </div>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="shipping.city"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  City *
                </label>
                <Input
                  {...field}
                  placeholder="Enter your city"
                  error={errors.shipping?.city?.message}
                />
              </div>
            )}
          />

          <Controller
            name="shipping.state"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  State *
                </label>
                <Input
                  {...field}
                  placeholder="Enter your state"
                  error={errors.shipping?.state?.message}
                />
              </div>
            )}
          />

          <Controller
            name="shipping.zipCode"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ZIP Code *
                </label>
                <Input
                  {...field}
                  placeholder="Enter ZIP code"
                  error={errors.shipping?.zipCode?.message}
                />
              </div>
            )}
          />
        </div>

        <Controller
          name="shipping.country"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Country *
              </label>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                error={errors.shipping?.country?.message}
              >
                <option value="">Select a country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="AU">Australia</option>
              </Select>
            </div>
          )}
        />

        {shippingOptions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Shipping Method
            </label>
            <div className="space-y-3">
              {shippingOptions.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    'flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200',
                    selectedShippingOption === option.id
                      ? 'border-primary bg-primary/5'
                      : 'border-input hover:border-primary/50'
                  )}
                >
                  <input
                    type="radio"
                    name="shippingOption"
                    value={option.id}
                    checked={selectedShippingOption === option.id}
                    onChange={() => onShippingOptionChange?.(option.id)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{option.name}</span>
                      <span className="font-bold text-foreground">
                        {formatCurrency(option.price, orderSummary?.currency)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description || `Estimated delivery: ${option.estimatedDays}`}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    )

    const renderPaymentSection = () => (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={motionVariants.fade}
        className="space-y-6"
      >
        <Controller
          name="payment.cardNumber"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Card Number *
              </label>
              <div className="relative">
                <Input
                  {...field}
                  placeholder="1234 5678 9012 3456"
                  error={errors.payment?.cardNumber?.message}
                  className="pl-10"
                />
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="payment.expiryDate"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Expiry Date *
                </label>
                <Input
                  {...field}
                  placeholder="MM/YY"
                  error={errors.payment?.expiryDate?.message}
                />
              </div>
            )}
          />

          <Controller
            name="payment.cvv"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  CVV *
                </label>
                <Input
                  {...field}
                  placeholder="123"
                  error={errors.payment?.cvv?.message}
                />
              </div>
            )}
          />

          <Controller
            name="payment.cardholderName"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cardholder Name *
                </label>
                <Input
                  {...field}
                  placeholder="Name on card"
                  error={errors.payment?.cardholderName?.message}
                />
              </div>
            )}
          />
        </div>

        {showSecurityBadges && (
          <div className="flex items-center justify-center space-x-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Truck className="w-4 h-4" />
              <span>Fast Delivery</span>
            </div>
          </div>
        )}
      </motion.div>
    )

    return (
      <div ref={ref} className={cn('w-full max-w-4xl mx-auto', className)} {...props}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Progress Indicator */}
          {showProgressIndicator && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {Math.round((currentStep / totalSteps) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Section Navigation */}
          <div className="flex items-center justify-center space-x-1 p-1 bg-muted rounded-lg">
            {[
              { id: 'personal', label: 'Personal Info', icon: '👤' },
              { id: 'shipping', label: 'Shipping', icon: '📦' },
              { id: 'payment', label: 'Payment', icon: '💳' },
            ].map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => handleSectionChange(section.id as any)}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                  activeSection === section.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span>{section.icon}</span>
                <span className="hidden sm:inline">{section.label}</span>
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="bg-background border rounded-lg p-6">
            {activeSection === 'personal' && renderPersonalInfoSection()}
            {activeSection === 'shipping' && renderShippingSection()}
            {activeSection === 'payment' && renderPaymentSection()}
          </div>

          {/* Terms and Newsletter */}
          <div className="space-y-4">
            <Controller
              name="terms"
              control={control}
              render={({ field }) => (
                <label className="flex items-start space-x-3 cursor-pointer">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    error={errors.terms?.message}
                  />
                  <div className="text-sm text-muted-foreground">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:underline">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                    *
                  </div>
                </label>
              )}
            />

            <Controller
              name="newsletter"
              control={control}
              render={({ field }) => (
                <label className="flex items-start space-x-3 cursor-pointer">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <div className="text-sm text-muted-foreground">
                    Subscribe to our newsletter for updates and exclusive offers
                  </div>
                </label>
              )}
            />
          </div>

          {/* Order Summary */}
          {showOrderSummary && orderSummary && (
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(orderSummary.subtotal, orderSummary.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatCurrency(orderSummary.shipping, orderSummary.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatCurrency(orderSummary.tax, orderSummary.currency)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(orderSummary.total, orderSummary.currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>

            <div className="flex items-center space-x-3">
              {activeSection !== 'personal' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (activeSection === 'shipping') setActiveSection('personal')
                    if (activeSection === 'payment') setActiveSection('shipping')
                  }}
                  disabled={loading}
                >
                  Previous
                </Button>
              )}

              {activeSection !== 'payment' ? (
                <Button
                  type="button"
                  onClick={() => {
                    if (activeSection === 'personal') setActiveSection('shipping')
                    if (activeSection === 'shipping') setActiveSection('payment')
                  }}
                  disabled={loading}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading || !isValid}
                  className="flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Complete Order
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    )
  }
)

CheckoutForm.displayName = 'CheckoutForm'

export { CheckoutForm }
