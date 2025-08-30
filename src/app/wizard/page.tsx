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
              Otrzymaj Odpowiednie Części do Swojego Pojazdu
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
              Nasz ekspercki zespół znajdzie idealne części do Twojego pojazdu. 
              Wystarczy, że podasz swój VIN i powiesz nam, czego potrzebujesz.
            </p>
            <Link href="/wizard/identify">
              <Button variant="default" size="lg" className="text-lg px-8 py-4 hover:bg-primary/90 hover:shadow-xl">
                Rozpocznij Zgłoszenie
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          {/* How It Works */}
          <motion.div variants={motionVariants.quickIn} className="mb-16">
            <h2 className="text-3xl font-bold text-text text-center mb-12">
              Jak to Działa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div variants={motionVariants.quickIn}>
                <Card className="text-center h-full">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Car className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle>1. Zidentyfikuj Swój Pojazd</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Wprowadź swój numer VIN i adres email. Użyjemy tego, aby znaleźć części pasujące do Twojego konkretnego pojazdu.
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
                    <CardTitle>2. Wybierz Swoje Części</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Wybierz z naszego kompleksowego katalogu części. Dodaj zdjęcia i notatki, aby pomóc nam dokładnie zidentyfikować to, czego potrzebujesz.
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
                    <CardTitle>3. Otrzymaj Wycenę</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Przejrzymy Twoje zgłoszenie i zapewnimy konkurencyjne ceny w ciągu 24-48 godzin. Brak zobowiązań do zakupu.
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div variants={motionVariants.quickIn} className="mb-16">
            <h2 className="text-3xl font-bold text-text text-center mb-12">
              Dlaczego Nas Wybrać?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center mr-3">
                      <CheckCircleIcon className="w-5 h-5 text-success" />
                    </div>
                    Eksperckie Dopasowanie Części
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Nasz zespół ma lata doświadczenia w częściach samochodowych. Znajdziemy odpowiednie części, które idealnie pasują do Twojego pojazdu.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center mr-3">
                      <CheckCircleIcon className="w-5 h-5 text-success" />
                    </div>
                    Konkurencyjne Ceny
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Współpracujemy z wieloma dostawcami, aby zapewnić Ci najlepsze ceny za jakościowe części.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center mr-3">
                      <CheckCircleIcon className="w-5 h-5 text-success" />
                    </div>
                    Szybka Odpowiedź
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Otrzymaj wycenę w ciągu 24-48 godzin. Nie czekaj dni na odpowiedź.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center mr-3">
                      <CheckCircleIcon className="w-5 h-5 text-success" />
                    </div>
                    Brak Zobowiązań
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Otrzymaj wycenę bez presji zakupu. Jesteśmy tutaj, aby pomóc Ci podejmować świadome decyzje.
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
                  Gotowy do Rozpoczęcia?
                </h3>
                <p className="text-muted mb-6 max-w-lg mx-auto">
                  Dołącz do tysięcy zadowolonych klientów, którzy nam ufają w swoich potrzebach motoryzacyjnych.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/wizard/identify">
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




