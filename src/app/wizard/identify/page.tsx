'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, ArrowRightIcon, ChevronDown, Car } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { HeaderNav } from '@/components/ui/HeaderNav'
import { motionVariants } from '@/lib/motion'
import { useSession } from 'next-auth/react'
import { useCart } from '@/contexts/CartContext'
import { IdentifyNavigation } from '@/components/ui/WizardNavigation'

const identifySchema = z.object({
  vin: z.string().length(17, 'VIN musi mieć dokładnie 17 znaków'),
  email: z.string().email('Proszę wprowadzić poprawny adres email').optional(),
}).refine((data) => {
  // If user is not logged in, email is required
  // If user is logged in, only VIN is required
  return true; // We'll handle this in the component
}, {
  message: "Email jest wymagany dla użytkowników gości"
});

type IdentifyForm = z.infer<typeof identifySchema>

interface GarageVin {
  id: string
  vin: string
  label: string
  createdAt: string
}

export default function IdentifyPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { saveWizardData, loadWizardData } = useCart()
  const [vinValue, setVinValue] = useState('')
  const [garageVins, setGarageVins] = useState<GarageVin[]>([])
  const [showVinDropdown, setShowVinDropdown] = useState(false)
  const [loadingGarage, setLoadingGarage] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setValue,
    watch,
    trigger,
  } = useForm<IdentifyForm>({
    resolver: zodResolver(identifySchema),
    mode: 'onChange',
  })

  const watchedVin = watch('vin')

  // Load existing wizard data if available (for edit functionality)
  useEffect(() => {
    const existingData = loadWizardData()
    if (existingData?.vin) {
      setVinValue(existingData.vin)
      setValue('vin', existingData.vin)
      if (existingData.email) {
        setValue('email', existingData.email)
      }
    }
  }, [loadWizardData, setValue])

  // Fetch user's saved VINs from garage
  useEffect(() => {
    const fetchGarageVins = async () => {
      if (!session?.user?.id) return
      
      try {
        setLoadingGarage(true)
        const response = await fetch('/api/v1/garage')
        if (response.ok) {
          const data = await response.json()
          setGarageVins(data.garageVins)
        }
      } catch (error) {
        console.error('Błąd podczas pobierania VIN z garażu:', error)
      } finally {
        setLoadingGarage(false)
      }
    }

    fetchGarageVins()
  }, [session?.user?.id])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showVinDropdown && !(event.target as Element).closest('.vin-dropdown')) {
        setShowVinDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showVinDropdown])

  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[IOQ]/g, '')
    setVinValue(value)
    setValue('vin', value)
    // Trigger validation after setting value
    trigger('vin')
  }

  const handleVinSelect = (vin: string) => {
    setVinValue(vin)
    setValue('vin', vin)
    setShowVinDropdown(false)
    trigger('vin')
  }

  // Custom validation for form submission
  const isFormValid = () => {
    if (!vinValue || vinValue.length !== 17) return false
    if (!session && !watch('email')) return false
    return true
  }

  const onSubmit = async (data: IdentifyForm) => {
    try {
      // Get existing wizard data to preserve any parts selections
      const existingData = loadWizardData()
      
      // Merge with existing data, preserving parts selections if they exist
      const updatedData = {
        ...existingData, // Preserve existing data (like parts selections)
        vin: data.vin,
        email: session?.user?.email || data.email, // Use session email if available
      }
      
      // Store the merged data for the wizard flow
      saveWizardData(updatedData)
      
      router.push('/wizard/parts')
    } catch (error) {
      console.error('Błąd:', error)
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
          className="max-w-2xl mx-auto"
        >
          {/* Page Header */}
          <motion.div 
            variants={motionVariants.quickIn}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-text mb-4">
              Zidentyfikuj Swój Pojazd
            </h1>
            <p className="text-lg text-muted max-w-xl mx-auto">
              Wprowadź swój numer VIN i adres email, aby rozpocząć zgłoszenie części
            </p>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={motionVariants.quickIn}>
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Informacje o Pojazdzie</CardTitle>
                <CardDescription>
                  Użyjemy tych informacji, aby znaleźć odpowiednie części do Twojego pojazdu
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Saved VINs Dropdown - Only show for logged-in users with saved VINs */}
                  {session?.user?.id && (
                    <div className="relative vin-dropdown">
                      <label className="block text-sm font-medium text-text mb-2">
                        Wybierz z Zapisanych VIN
                      </label>
                      {loadingGarage ? (
                        <div className="w-full px-4 py-3 bg-surface border border-border rounded-md">
                          <div className="flex items-center gap-2 text-muted">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                            <span>Ładowanie zapisanych VIN...</span>
                          </div>
                        </div>
                      ) : garageVins.length > 0 ? (
                        <div className="relative">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowVinDropdown(!showVinDropdown)}
                            className="w-full justify-between"
                          >
                            <span className="flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              {vinValue && garageVins.find(v => v.vin === vinValue)?.label || 'Wybierz zapisany VIN'}
                            </span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${showVinDropdown ? 'rotate-180' : ''}`} />
                          </Button>
                          
                          {showVinDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                              {garageVins.map((garageVin) => (
                                <button
                                  key={garageVin.id}
                                  type="button"
                                  onClick={() => handleVinSelect(garageVin.vin)}
                                  className="w-full px-4 py-3 text-left hover:bg-surface-2 border-b border-border last:border-b-0 transition-colors"
                                >
                                  <div className="font-medium text-text">{garageVin.label}</div>
                                  <div className="text-sm text-muted font-mono">{garageVin.vin}</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full px-4 py-3 bg-surface-2/50 border border-border rounded-md text-center text-sm text-muted">
                          Brak zapisanych VIN w Twoim garażu
                        </div>
                      )}
                      {garageVins.length > 0 && (
                        <p className="mt-2 text-xs text-muted">
                          Lub wprowadź nowy VIN poniżej
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <Input
                      label="Numer VIN"
                      placeholder="Wprowadź 17-znakowy VIN"
                      value={vinValue}
                      onChange={handleVinChange}
                      error={errors.vin?.message}
                      maxLength={17}
                      className="font-mono text-lg"
                    />
                    <p className="mt-2 text-xs text-muted">
                      Twój VIN zazwyczaj znajduje się na desce rozdzielczej lub ramie drzwi kierowcy
                    </p>
                    {vinValue && (
                      <div className="mt-2 text-xs text-muted">
                        Długość: {vinValue.length}/17
                      </div>
                    )}
                  </div>

                  {/* Only show email field for non-logged-in users */}
                  {!session && (
                    <div>
                      <Input
                        label="Adres Email"
                        type="email"
                        placeholder="twoj.email@przykład.com"
                        {...register('email')}
                        error={errors.email?.message}
                      />
                      <p className="mt-2 text-xs text-muted">
                        Wyślemy aktualizacje o Twoim zamówieniu na ten email
                      </p>
                    </div>
                  )}

                  <div className="bg-surface-2/50 rounded-lg p-4 text-sm text-muted">
                    <h4 className="font-medium text-text mb-2">Dlaczego potrzebujemy tych informacji?</h4>
                    <ul className="space-y-1 text-xs">
                      <li>• VIN pomaga nam znaleźć części pasujące do Twojego konkretnego pojazdu</li>
                      <li>• Email pozwala nam wysyłać Ci wyceny i aktualizacje zamówień</li>
                      <li>• Nigdy nie udostępniamy Twoich informacji osobom trzecim</li>
                    </ul>
                  </div>

                  <div className="pt-8">
                    <div className="flex justify-between">
                      <Link href="/">
                        <Button variant="outline" size="lg" className="min-w-[140px] border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                          <ArrowLeftIcon className="mr-2 h-4 w-4" />
                          Powrót do Strony Głównej
                        </Button>
                      </Link>
                      
                      <Button
                        type="submit"
                        disabled={!isFormValid() || isSubmitting}
                        loading={isSubmitting}
                        size="lg"
                        className="min-w-[160px] bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Kontynuuj do Wyboru Części
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Help Section */}
          <motion.div 
            variants={motionVariants.quickIn}
            className="mt-8 text-center"
          >
            <p className="text-sm text-muted mb-2">Potrzebujesz pomocy w znalezieniu VIN?</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🚗</span>
                </div>
                <h4 className="text-sm font-medium text-text">Deska Rozdzielcza</h4>
                <p className="text-xs text-muted">Lewy dolny róg deski rozdzielczej, widoczny przez przednią szybę</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🚪</span>
                </div>
                <h4 className="text-sm font-medium text-text">Drzwi Kierowcy</h4>
                <p className="text-xs text-muted">Na naklejce ramy drzwi, gdy drzwi są otwarte</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📋</span>
                </div>
                <h4 className="text-sm font-medium text-text">Dokumenty</h4>
                <p className="text-xs text-muted">Rejestracja pojazdu lub dokumenty ubezpieczenia</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

