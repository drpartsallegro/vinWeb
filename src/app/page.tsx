'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRightIcon, CheckCircleIcon, TruckIcon, CreditCardIcon, ShieldIcon, ClockIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { HeaderNav } from '@/components/ui/HeaderNav'
import { motionVariants } from '@/lib/motion'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg">
      <HeaderNav />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={motionVariants.page}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section */}
          <motion.div 
            variants={motionVariants.quickIn}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-text mb-6">
              Premium Auto Parts
              <span className="block text-primary">Delivered Fast</span>
            </h1>
            <p className="text-xl text-muted max-w-3xl mx-auto mb-8">
              Get the right parts for your vehicle with our expert matching service. 
              VIN validation, competitive pricing, and fast delivery across Poland.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/wizard">
                <Button 
                  variant="default"
                  size="lg" 
                  className="text-lg px-8 py-4 hover:bg-primary/90 hover:shadow-xl"
                >
                  Start as Guest
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  variant="default"
                  size="lg" 
                  className="text-lg px-6 py-4 hover:bg-primary/90 hover:shadow-xl"
                >
                  Sign In
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={motionVariants.quickIn} className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>VIN Validation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Accurate parts matching using your vehicle's unique identification number
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <ShieldIcon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Admin Valuation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Expert review and pricing from our automotive specialists
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CreditCardIcon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>P24 & BLIK</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Secure payment options including P24 and BLIK for convenience
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TruckIcon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>InPost & DPD</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Fast delivery with InPost lockers and DPD courier service
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Free Shipping</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Free shipping on orders above our threshold with progress tracking
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <ClockIcon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>24h Quotes</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get competitive quotes within 24 hours of your request
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* How It Works */}
          <motion.div variants={motionVariants.quickIn} className="mb-16">
            <h2 className="text-3xl font-bold text-text text-center mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">Submit Request</h3>
                <p className="text-muted">
                  Enter your VIN and select the parts you need. Add photos and notes for better identification.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">Get Quote</h3>
                <p className="text-muted">
                  Our experts review your request and provide competitive pricing within 24 hours.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">Order & Delivery</h3>
                <p className="text-muted">
                  Choose your preferred parts and payment method. Fast delivery to your door or locker.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div variants={motionVariants.quickIn} className="text-center">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-8">
                <h3 className="text-2xl font-bold text-text mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-muted mb-6 max-w-lg mx-auto">
                  Join thousands of satisfied customers who trust us for their automotive parts needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/wizard">
                    <Button variant="default" size="lg" className="text-lg px-6 py-4 hover:bg-primary/90 hover:shadow-xl">
                      Start Your Request
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/orders">
                    <Button variant="outline" size="lg" className="text-lg px-6 py-4 border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                      View My Orders
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
