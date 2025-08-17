'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { signIn, getSession } from 'next-auth/react'
import { Eye, EyeOff, ArrowRightIcon, ArrowLeftIcon, Lock, Mail, User, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { HeaderNav } from '@/components/ui/HeaderNav'
import { motionVariants } from '@/lib/motion'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Check for mode query parameter to automatically show signup
  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode === 'signup') {
      setIsLogin(false)
    }
  }, [searchParams])

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  })

  const onLoginSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        // Check user role and redirect accordingly
        try {
          const sessionResponse = await fetch('/api/auth/session')
          if (sessionResponse.ok) {
            const session = await sessionResponse.json()
            if (session?.user?.role === 'ADMIN') {
              router.push('/admin')
            } else {
              router.push('/orders')
            }
          } else {
            router.push('/orders')
          }
        } catch (error) {
          // Fallback to default redirect
          router.push('/orders')
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const onRegisterSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      if (response.ok) {
        // Auto-login after successful registration
        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        })

        if (result?.error) {
          setError('Registration successful but login failed. Please try logging in.')
        } else {
          router.push('/orders')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Registration failed. Please try again.')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <HeaderNav />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={motionVariants.page}
          initial="hidden"
          animate="visible"
          className="max-w-md mx-auto"
        >
          {/* Page Header */}
          <motion.div 
            variants={motionVariants.quickIn}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-2 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-text mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-muted">
              {isLogin 
                ? 'Sign in to access your account and orders'
                : 'Join thousands of satisfied customers'
              }
            </p>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={motionVariants.quickIn}>
            <Card className="w-full">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </CardTitle>
                <CardDescription>
                  {isLogin 
                    ? 'Enter your credentials to continue'
                    : 'Fill in your details to get started'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {isLogin ? (
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <div>
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="your.email@example.com"
                        leftIcon={<Mail className="w-4 h-4" />}
                        {...loginForm.register('email')}
                        error={loginForm.formState.errors.email?.message}
                      />
                    </div>

                    <div>
                      <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        leftIcon={<Lock className="w-4 h-4" />}
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-muted hover:text-text transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                        {...loginForm.register('password')}
                        error={loginForm.formState.errors.password?.message}
                      />
                    </div>

                    {error && (
                      <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg p-3">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!loginForm.formState.isValid || isLoading}
                      loading={isLoading}
                    >
                      Sign In
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>

                    <div className="text-center">
                      <Link 
                        href="/forgot-password"
                        className="text-sm text-primary hover:text-primary-2 transition-colors"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div>
                      <Input
                        label="Full Name"
                        placeholder="Enter your full name"
                        leftIcon={<User className="w-4 h-4" />}
                        {...registerForm.register('name')}
                        error={registerForm.formState.errors.name?.message}
                      />
                    </div>

                    <div>
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="your.email@example.com"
                        leftIcon={<Mail className="w-4 h-4" />}
                        {...registerForm.register('email')}
                        error={registerForm.formState.errors.email?.message}
                      />
                    </div>

                    <div>
                      <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        leftIcon={<Lock className="w-4 h-4" />}
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-muted hover:text-text transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                        {...registerForm.register('password')}
                        error={registerForm.formState.errors.password?.message}
                      />
                    </div>

                    <div>
                      <Input
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        leftIcon={<Lock className="w-4 h-4" />}
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-muted hover:text-text transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                        {...registerForm.register('confirmPassword')}
                        error={registerForm.formState.errors.confirmPassword?.message}
                      />
                    </div>

                    {error && (
                      <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg p-3">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!registerForm.formState.isValid || isLoading}
                      loading={isLoading}
                    >
                      Create Account
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                )}

                {/* Toggle between login/register */}
                <div className="mt-6 pt-6 border-t border-border text-center">
                  <p className="text-sm text-muted mb-2">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                  </p>
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setError('')
                      loginForm.reset()
                      registerForm.reset()
                    }}
                    className="text-primary hover:text-primary-2 transition-colors font-medium"
                  >
                    {isLogin ? 'Create an account' : 'Sign in instead'}
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Section */}
          <motion.div 
            variants={motionVariants.quickIn}
            className="mt-8 text-center"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-sm font-medium text-text">Secure</h4>
                <p className="text-xs text-muted">Bank-level security for your data</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-sm font-medium text-text">Personal</h4>
                <p className="text-xs text-muted">Track your orders and history</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-sm font-medium text-text">Private</h4>
                <p className="text-xs text-muted">Your data stays with you</p>
              </div>
            </div>
          </motion.div>

          {/* Back to Home */}
          <motion.div 
            variants={motionVariants.quickIn}
            className="mt-8 text-center"
          >
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}





