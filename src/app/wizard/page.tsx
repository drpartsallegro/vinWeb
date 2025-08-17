'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRightIcon, Car, Wrench, CheckCircleIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { HeaderNav } from '@/components/ui/HeaderNav'
import { motionVariants } from '@/lib/motion'

export default function WizardPage() {
  return (
    <div className="min-h-screen bg-bg">
      <HeaderNav />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={motionVariants.page}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Hero Section */}
          <motion.div 
            variants={motionVariants.quickIn}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-text mb-6">
              Get the Right Parts for Your Vehicle
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
              Our expert team will find the perfect parts for your vehicle. 
              Just provide your VIN and tell us what you need.
            </p>
            <Link href="/wizard/identify">
              <Button variant="default" size="lg" className="text-lg px-8 py-4 hover:bg-primary/90 hover:shadow-xl">
                Start Your Request
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          {/* How It Works */}
          <motion.div variants={motionVariants.quickIn} className="mb-16">
            <h2 className="text-3xl font-bold text-text text-center mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div variants={motionVariants.quickIn}>
                <Card className="text-center h-full">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Car className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle>1. Identify Your Vehicle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Enter your VIN number and email address. We'll use this to find parts that fit your specific vehicle.
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={motionVariants.quickIn}>
                <Card className="text-center h-full">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wrench className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle>2. Select Your Parts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Choose from our comprehensive parts catalog. Add photos and notes to help us identify exactly what you need.
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={motionVariants.quickIn}>
                <Card className="text-center h-full">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircleIcon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle>3. Get Your Quote</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      We'll review your request and provide competitive pricing within 24-48 hours. No obligation to purchase.
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div variants={motionVariants.quickIn} className="mb-16">
            <h2 className="text-3xl font-bold text-text text-center mb-12">
              Why Choose Us?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center mr-3">
                      <CheckCircleIcon className="w-5 h-5 text-success" />
                    </div>
                    Expert Parts Matching
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our team has years of experience in automotive parts. We'll find the right parts that fit your vehicle perfectly.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center mr-3">
                      <CheckCircleIcon className="w-5 h-5 text-success" />
                    </div>
                    Competitive Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    We work with multiple suppliers to ensure you get the best prices on quality parts.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center mr-3">
                      <CheckCircleIcon className="w-5 h-5 text-success" />
                    </div>
                    Fast Response
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get your quote within 24-48 hours. No waiting around for days to hear back.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center mr-3">
                      <CheckCircleIcon className="w-5 h-5 text-success" />
                    </div>
                    No Obligation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get your quote with no pressure to buy. We're here to help you make informed decisions.
                  </CardDescription>
                </CardContent>
              </Card>
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
                  <Link href="/wizard/identify">
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




