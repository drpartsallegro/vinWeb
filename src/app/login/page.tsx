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
  email: z.string().email('Proszę wprowadzić poprawny adres email'),
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Imię musi mieć co najmniej 2 znaki'),
  email: z.string().email('Proszę wprowadzić poprawny adres email'),
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie pasują do siebie",
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
        setError('Nieprawidłowy email lub hasło')
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
      setError('Wystąpił błąd. Proszę spróbować ponownie.')
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
          setError('Rejestracja udana, ale logowanie nie powiodło się. Proszę spróbować się zalogować.')
        } else {
          router.push('/orders')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Rejestracja nie powiodła się. Proszę spróbować ponownie.')
      }
    } catch (error) {
      setError('Wystąpił błąd. Proszę spróbować ponownie.')
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
              {isLogin ? 'Witaj Ponownie' : 'Utwórz Konto'}
            </h1>
            <p className="text-muted">
              {isLogin 
                ? 'Zaloguj się, aby uzyskać dostęp do swojego konta i zamówień'
                : 'Dołącz do tysięcy zadowolonych klientów'
              }
            </p>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={motionVariants.quickIn}>
            <Card className="w-full">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">
                  {isLogin ? 'Zaloguj Się' : 'Zarejestruj Się'}
                </CardTitle>
                <CardDescription>
                  {isLogin 
                    ? 'Wprowadź swoje dane logowania, aby kontynuować'
                    : 'Wypełnij swoje dane, aby rozpocząć'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {isLogin ? (
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <div>
                      <Input
                        label="Adres Email"
                        type="email"
                        placeholder="twoj.email@przykład.com"
                        leftIcon={<Mail className="w-4 h-4" />}
                        {...loginForm.register('email')}
                        error={loginForm.formState.errors.email?.message}
                      />
                    </div>

                    <div>
                      <Input
                        label="Hasło"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Wprowadź swoje hasło"
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
                      Zaloguj Się
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-muted">
                        Skontaktuj się z obsługą klienta w przypadku problemów z logowaniem
                      </p>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div>
                      <Input
                        label="Pełne Imię"
                        placeholder="Wprowadź swoje pełne imię"
                        leftIcon={<User className="w-4 h-4" />}
                        {...registerForm.register('name')}
                        error={registerForm.formState.errors.name?.message}
                      />
                    </div>

                    <div>
                      <Input
                        label="Adres Email"
                        type="email"
                        placeholder="twoj.email@przykład.com"
                        leftIcon={<Mail className="w-4 h-4" />}
                        {...registerForm.register('email')}
                        error={registerForm.formState.errors.email?.message}
                      />
                    </div>

                    <div>
                      <Input
                        label="Hasło"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Utwórz hasło"
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
                        label="Potwierdź Hasło"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Potwierdź swoje hasło"
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
                      Utwórz Konto
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                )}

                {/* Toggle between login/register */}
                <div className="mt-6 pt-6 border-t border-border text-center">
                  <p className="text-sm text-muted mb-2">
                    {isLogin ? "Nie masz konta?" : "Masz już konto?"}
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
                    {isLogin ? 'Utwórz konto' : 'Zaloguj się zamiast tego'}
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
                <h4 className="text-sm font-medium text-text">Bezpieczne</h4>
                <p className="text-xs text-muted">Bezpieczeństwo na poziomie bankowym dla Twoich danych</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-sm font-medium text-text">Osobiste</h4>
                <p className="text-xs text-muted">Śledź swoje zamówienia i historię</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-sm font-medium text-text">Prywatne</h4>
                <p className="text-xs text-muted">Twoje dane pozostają z Tobą</p>
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
                Powrót do Strony Głównej
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}





