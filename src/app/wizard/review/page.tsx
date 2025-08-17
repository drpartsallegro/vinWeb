'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, EditIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Stepper } from '@/components/ui/Stepper'
import { Badge } from '@/components/ui/Badge'
import { HeaderNav } from '@/components/ui/HeaderNav'
import { motionVariants } from '@/lib/motion'
import { useSession } from 'next-auth/react'
import { useCart } from '@/contexts/CartContext'

const steps = [
  {
    id: 'identify',
    title: 'Vehicle Information',
    description: 'Enter your VIN and email',
    status: 'completed' as const,
  },
  {
    id: 'parts',
    title: 'Parts Selection',
    description: 'Choose your parts',
    status: 'completed' as const,
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Confirm your order',
    status: 'current' as const,
  },
]

export default function ReviewPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { wizardData, loadWizardData, clearWizardData } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [magicLink, setMagicLink] = useState<string | null>(null)

  useEffect(() => {
    // Load wizard data from context (for edit functionality)
    const stored = loadWizardData()
    if (!stored) {
      router.push('/wizard/identify')
      return
    }
  }, [router, loadWizardData])

  const handleSubmit = async () => {
    if (!wizardData) return
    
    setIsSubmitting(true)
    try {
      // Create FormData for the API
      const formData = new FormData()
      formData.append('vin', wizardData.vin)
      formData.append('email', wizardData.email)
      
      // Add items
      wizardData.items.forEach((item: any, index: number) => {
        formData.append(`items[${index}].categoryId`, item.categoryId)
        formData.append(`items[${index}].quantity`, item.quantity.toString())
        if (item.note) {
          formData.append(`items[${index}].note`, item.note)
        }
        if (item.photoFile) {
          formData.append(`items[${index}].photo`, item.photoFile)
        }
      })

      // Submit to API
      const response = await fetch('/api/v1/orders', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to submit order')
      }

      const result = await response.json()
      console.log('Order submitted successfully:', result)
      
      // Check if magic link was generated (for guest users)
      if (result.magicLinkUrl) {
        setMagicLink(result.magicLinkUrl)
      }
      
      // Set submitted state FIRST, then clear wizard data
      setSubmitted(true)
      console.log('Order submission completed, showing success page')
      
      // Clear the wizard data after setting submitted state
      setTimeout(() => {
        clearWizardData()
      }, 100)
    } catch (error) {
      console.error('Error submitting order:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check submitted state FIRST, before checking wizardData
  if (submitted) {
    return (
      <div className="min-h-screen bg-bg">
        <HeaderNav />
        
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <motion.div
            variants={motionVariants.page}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <motion.div variants={motionVariants.quickIn} className="mb-8">
              <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckIcon className="w-10 h-10 text-success" />
              </div>
              <h1 className="text-4xl font-bold text-text mb-4">
                Order Submitted!
              </h1>
              <p className="text-lg text-muted mb-6">
                Thank you for your order. We'll review your request and get back to you soon.
              </p>
            </motion.div>

            <motion.div variants={motionVariants.quickIn}>
              <Card className="mb-8">
                <CardHeader className="text-center">
                  <CardTitle>What happens next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-text">Review & Valuation</h4>
                      <p className="text-sm text-muted">Our team will review your parts request and provide pricing within 24-48 hours.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-text">Email Notification</h4>
                      <p className="text-sm text-muted">You'll receive an email with your order details and pricing information.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-text">Order Management</h4>
                      <p className="text-sm text-muted">Manage your order, make payments, and track shipping through your account.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Magic Link for Guest Users */}
            {!session?.user && (
              <motion.div variants={motionVariants.quickIn}>
                <Card className="mb-8 border-primary/20 bg-primary/5">
                  <CardHeader className="text-center">
                    <CardTitle className="text-primary">Access Your Order as Guest</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    {magicLink ? (
                      <>
                        <p className="text-sm text-muted mb-4">
                          Click the link below to access your order immediately:
                        </p>
                        <div className="bg-surface rounded-lg p-4 border border-border mb-4">
                          <Button asChild className="w-full">
                            <a href={magicLink} target="_blank" rel="noopener noreferrer">
                              View My Order
                            </a>
                          </Button>
                        </div>
                        <p className="text-xs text-muted">
                          A copy of this link has also been sent to: <span className="font-mono text-text">{wizardData?.email}</span>
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted mb-4">
                          Since you're not logged in, you'll receive a magic link via email to access your order.
                        </p>
                        <div className="bg-surface rounded-lg p-3 border border-border mb-4">
                          <p className="text-xs text-muted mb-2">Magic link will be sent to:</p>
                          <p className="font-mono text-sm text-text">{wizardData?.email}</p>
                        </div>
                        <p className="text-xs text-muted">
                          Click the link in your email to view order status, pricing, and updates.
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <motion.div variants={motionVariants.quickIn} className="space-y-4">
              {session?.user && (
                <Link href="/orders" className="block">
                  <Button className="w-full">
                    View My Orders
                  </Button>
                </Link>
              )}
              <Link href="/" className="block">
                <Button variant="outline" className="w-full">
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!wizardData) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-bg">
      <HeaderNav />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          variants={motionVariants.page}
          initial="hidden"
          animate="visible"
        >
          {/* Page Header */}
          <motion.div 
            variants={motionVariants.quickIn}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-text mb-4">
              Review Your Order
            </h1>
            <p className="text-lg text-muted max-w-xl mx-auto">
              Please review your information before submitting. You can go back to make changes if needed.
            </p>
          </motion.div>

          {/* Stepper */}
          <motion.div variants={motionVariants.quickIn} className="mb-8">
            <Stepper
              steps={steps}
              currentStep={2}
            />
          </motion.div>

          {/* Main Content */}
          <motion.div variants={motionVariants.quickIn} className="space-y-6">
            {/* Vehicle Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Vehicle Information</CardTitle>
                    <CardDescription>Your vehicle details and contact information</CardDescription>
                  </div>
                  <Link href="/wizard/identify">
                    <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary/50 hover:bg-primary/5 text-primary hover:text-primary/80 transition-all duration-200">
                      <EditIcon className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted">VIN Number</label>
                    <p className="text-lg font-mono text-text">{wizardData.vin}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted">Email Address</label>
                    <p className="text-lg text-text">{wizardData.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parts Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Parts Summary</CardTitle>
                    <CardDescription>
                      {wizardData.items.length} part{wizardData.items.length !== 1 ? 's' : ''} selected
                    </CardDescription>
                  </div>
                  <Link href="/wizard/parts">
                    <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary/50 hover:bg-primary/5 text-primary hover:text-primary/80 transition-all duration-200">
                      <EditIcon className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wizardData.items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="border border-border rounded-lg p-4 bg-surface2/20"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge variant="secondary">{index + 1}</Badge>
                            <h4 className="font-medium text-text">
                              {item.categoryId ? `Category ${item.categoryId}` : 'Category not selected'}
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted">Quantity:</span>
                              <span className="ml-2 text-text font-medium">{item.quantity}</span>
                            </div>
                            {item.note && (
                              <div>
                                <span className="text-muted">Note:</span>
                                <span className="ml-2 text-text">{item.note}</span>
                              </div>
                            )}
                          </div>
                          {item.photoFile && (
                            <div className="mt-3">
                              <span className="text-muted text-sm">Photo attached</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Important Information */}
            <motion.div variants={motionVariants.quickIn}>
              <Card className="border-warn/20 bg-warn/5">
                <CardHeader>
                  <CardTitle className="text-warn">Important Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-warn rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted">
                      By submitting this order, you agree to our terms of service and privacy policy.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-warn rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted">
                      You'll receive a confirmation email with your order details and next steps.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-warn rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted">
                      Our team will review your request and provide pricing within 24-48 hours.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={motionVariants.quickIn} className="pt-8">
              <div className="flex justify-between">
                <Link href="/wizard/parts">
                  <Button variant="outline" size="lg" className="min-w-[140px] border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Back to Parts Selection
                  </Button>
                </Link>
                
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  size="lg"
                  className="min-w-[160px] bg-success hover:bg-success/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Order Request'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
