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
              Tanie Części Samochodowe
              <span className="block text-primary">Dostarczane Szybko</span>
            </h1>
            <p className="text-xl text-muted max-w-3xl mx-auto mb-8">
              Otrzymaj odpowiednie części do swojego pojazdu dzięki naszemu eksperckiemu serwisowi dopasowania. 
              Walidacja VIN, konkurencyjne ceny i szybka dostawa w całej Polsce.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/wizard">
                <Button 
                  variant="default"
                  size="lg" 
                  className="text-lg px-8 py-4 hover:bg-primary/90 hover:shadow-xl"
                >
                  Rozpocznij jako Gość
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  variant="default"
                  size="lg" 
                  className="text-lg px-6 py-4 hover:bg-primary/90 hover:shadow-xl"
                >
                  Zaloguj Się
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
                  <CardTitle>Walidacja VIN</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Dokładne dopasowanie części za pomocą unikalnego numeru identyfikacyjnego Twojego pojazdu
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <ShieldIcon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Wycena Admina</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Ekspercka recenzja i wycena od naszych specjalistów motoryzacyjnych
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
                    Bezpieczne opcje płatności w tym P24 i BLIK dla wygody
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
                    Szybka dostawa z paczkomatami InPost i kurierem DPD
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Darmowa Dostawa</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Darmowa dostawa dla zamówień powyżej naszego progu z śledzeniem postępu
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <ClockIcon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Wyceny w 24h</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Otrzymaj konkurencyjne wyceny w ciągu 24 godzin od Twojego zgłoszenia
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* How It Works */}
          <motion.div variants={motionVariants.quickIn} className="mb-16">
            <h2 className="text-3xl font-bold text-text text-center mb-12">
              Jak to Działa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">Złóż Zgłoszenie</h3>
                <p className="text-muted">
                  Wprowadź swój VIN i wybierz części, których potrzebujesz. Dodaj zdjęcia i notatki dla lepszej identyfikacji.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">Otrzymaj Wycenę</h3>
                <p className="text-muted">
                  Nasi eksperci przeglądają Twoje zgłoszenie i zapewniają konkurencyjne ceny w ciągu 24 godzin.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">Zamów i Dostawa</h3>
                <p className="text-muted">
                  Wybierz preferowane części i metodę płatności. Szybka dostawa pod drzwi lub do paczkomatu.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div variants={motionVariants.quickIn} className="text-center">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-8">
                <h3 className="text-2xl font-bold text-text mb-4">
                  Gotowy do Rozpoczęcia?
                </h3>
                <p className="text-muted mb-6 max-w-lg mx-auto">
                  Dołącz do tysięcy zadowolonych klientów, którzy nam ufają w swoich potrzebach motoryzacyjnych.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/wizard">
                    <Button variant="default" size="lg" className="text-lg px-6 py-4 hover:bg-primary/90 hover:shadow-xl">
                      Rozpocznij Zgłoszenie
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/orders">
                    <Button variant="outline" size="lg" className="text-lg px-6 py-4 border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                      Zobacz Moje Zamówienia
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
