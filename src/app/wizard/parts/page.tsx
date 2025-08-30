'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Stepper } from '@/components/ui/Stepper'
import { ImageUploader } from '@/components/features/ImageUploader'
import { HeaderNav } from '@/components/ui/HeaderNav'
import { motionVariants } from '@/lib/motion'
import { useCart } from '@/contexts/CartContext'
import categoriesData from '../../../../data/categories.json'

const partsSchema = z.object({
  items: z.array(z.object({
          categoryId: z.string().min(1, 'Proszę wybrać kategorię'),
    quantity: z.number().min(1, 'Ilość musi wynosić co najmniej 1').max(999, 'Ilość za duża'),
    note: z.string().max(200, 'Notatka nie może przekraczać 200 znaków').optional(),
    photoFile: z.any().optional(),
      })).min(1, 'Wymagane jest co najmniej jedno zamówienie'),
})

type PartsForm = z.infer<typeof partsSchema>

const steps = [
  {
    id: 'identify',
    title: 'Identify Vehicle',
    description: 'Enter your VIN and email',
    status: 'completed' as const,
  },
  {
    id: 'parts',
    title: 'Select Categories',
    description: 'Choose the parts you need',
    status: 'current' as const,
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Confirm your order',
    status: 'pending' as const,
  },
]

// Flatten categories for select options
const getCategoryOptions = () => {
  const options: Array<{ value: string; label: string }> = []
  
  categoriesData.forEach(category => {
    if (category.children && category.children.length > 0) {
      category.children.forEach(child => {
        options.push({
          value: child.id,
          label: `${category.name} → ${child.name}`,
        })
      })
    } else {
      options.push({
        value: category.id,
        label: category.name,
      })
    }
  })
  
  return options
}

export default function PartsPage() {
  const router = useRouter()
  const { wizardData, saveWizardData, loadWizardData } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
  } = useForm<PartsForm>({
    resolver: zodResolver(partsSchema),
    defaultValues: {
      items: [{ categoryId: '', quantity: 1, note: '', photoFile: null }],
    },
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  useEffect(() => {
    if (!wizardData) {
      router.push('/wizard/identify')
      return
    }

    // Load existing parts data if available (for edit functionality)
    if (wizardData.items && wizardData.items.length > 0) {
      reset({
        items: wizardData.items.map((item: any) => ({
          categoryId: item.categoryId || '',
          quantity: item.quantity || 1,
          note: item.note || '',
          photoFile: item.photoFile || null,
        }))
      })
    } else {
      // Initialize with at least one empty item if no existing data
      reset({
        items: [{ categoryId: '', quantity: 1, note: '', photoFile: null }],
      })
    }
  }, [wizardData, router, reset])

  const categoryOptions = getCategoryOptions()

  const onSubmit = async (data: PartsForm) => {
    setIsSubmitting(true)
    try {
      // Preserve existing wizard data and only update the items
      const completeData = {
        ...wizardData,
        items: data.items,
      }
      
      // Save the complete data to ensure it persists
      saveWizardData(completeData)
      router.push('/wizard/review')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addItem = () => {
    append({ categoryId: '', quantity: 1, note: '', photoFile: null })
  }

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
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
              Wybierz Kategorie Części
            </h1>
            <p className="text-lg text-muted max-w-xl mx-auto">
              Wybierz części, których potrzebujesz dla swojego pojazdu. Możesz dodać zdjęcia, aby pomóc nam zidentyfikować dokładne części.
            </p>
          </motion.div>

          {/* Stepper */}
          <motion.div variants={motionVariants.quickIn} className="mb-8">
            <Stepper
              steps={steps}
              currentStep={1}
            />
          </motion.div>

          {/* Main Content */}
          <motion.div variants={motionVariants.quickIn}>
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Wybór Części</CardTitle>
                <CardDescription>
                  Dodaj części, których potrzebujesz. Możesz dołączyć zdjęcia i notatki dla lepszej identyfikacji.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-6">
                    {fields.map((field, index) => (
                      <motion.div
                        key={field.id}
                        variants={motionVariants.quickIn}
                        className="border border-border rounded-lg p-4 space-y-4 bg-surface2/20"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium text-text">
                            Część {index + 1}
                          </h4>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-danger hover:text-danger hover:bg-danger/10"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-text mb-2">
                              Wyszukiwana część
                            </label>
                            <Select
                              value={watch(`items.${index}.categoryId`)}
                              onValueChange={(value) => setValue(`items.${index}.categoryId`, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Wybierz kategorię..." />
                              </SelectTrigger>
                              <SelectContent>
                                {categoryOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.items?.[index]?.categoryId?.message && (
                              <p className="mt-2 text-sm text-danger">
                                {errors.items[index]?.categoryId?.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <Input
                              label="Ilość"
                              type="number"
                              min="1"
                              max="999"
                              {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                              error={errors.items?.[index]?.quantity?.message}
                            />
                          </div>
                        </div>

                        <div>
                          <Textarea
                            label="Notatki (Opcjonalnie)"
                            placeholder="Szczegóły, numery części lub wymagania..."
                            rows={3}
                            {...register(`items.${index}.note`)}
                            error={errors.items?.[index]?.note?.message}
                          />
                          <p className="mt-2 text-xs text-muted">
                            Maksymalnie 200 znaków
                          </p>
                        </div>

                        <div>
                          <ImageUploader
                            label="Zdjęcie (Opcjonalnie)"
                            helperText="Prześlij zdjęcie, aby pomóc nam zidentyfikować dokładną część"
                            onFileSelect={(file) => setValue(`items.${index}.photoFile`, file)}
                            maxSize={5}
                            currentFile={watch(`items.${index}.photoFile`)}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addItem}
                      className="w-full max-w-sm border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-primary hover:text-primary/80"
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Dodaj Kolejną Część
                    </Button>
                  </div>

                  <div className="bg-surface2/50 rounded-lg p-4 text-sm text-muted">
                    <h4 className="font-medium text-text mb-2">Wskazówki dla lepszych wyników:</h4>
                    <ul className="space-y-1 text-xs">
                      <li>• Bądź jak najbardziej szczegółowy w wyborze części</li>
                      <li>• Dołącz zdjęcia, gdy nie jesteś pewien dokładnej części</li>
                      <li>• Dodaj notatki z numerami części, jeśli je masz</li>
                      <li>• Zawsze możesz zmodyfikować swoje zamówienie po złożeniu</li>
                    </ul>
                  </div>

                  <div className="pt-8">
                    <div className="flex justify-between">
                      <Link href="/wizard/identify">
                        <Button variant="outline" size="lg" className="min-w-[140px] border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                          <ArrowLeftIcon className="mr-2 h-4 w-4" />
                          Powrót do Informacji o Pojazdzie
                        </Button>
                      </Link>
                      
                      <Button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        loading={isSubmitting}
                        size="lg"
                        className="min-w-[160px] bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Kontynuuj do Podsumowania
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
