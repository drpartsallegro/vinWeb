import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'

export interface WizardStep {
  id: string
  title: string
  description?: string
  component: React.ReactNode
  validation?: () => boolean | Promise<boolean>
  isOptional?: boolean
  isCompleted?: boolean
  hasError?: boolean
  errorMessage?: string
}

export interface WizardFormProps {
  steps: WizardStep[]
  currentStep: number
  onStepChange: (step: number) => void
  onComplete?: () => void
  onCancel?: () => void
  className?: string
  showProgress?: boolean
  showStepNumbers?: boolean
  allowStepNavigation?: boolean
  showValidationErrors?: boolean
  loading?: boolean
  submitLabel?: string
  cancelLabel?: string
  nextLabel?: string
  previousLabel?: string
  completeLabel?: string
}

const WizardForm = React.forwardRef<HTMLDivElement, WizardFormProps>(
  (
    {
      steps,
      currentStep,
      onStepChange,
      onComplete,
      onCancel,
      className,
      showProgress = true,
      showStepNumbers = true,
      allowStepNavigation = true,
      showValidationErrors = true,
      loading = false,
      submitLabel = 'Submit',
      cancelLabel = 'Cancel',
      nextLabel = 'Next',
      previousLabel = 'Previous',
      completeLabel = 'Complete',
      ...props
    },
    ref
  ) => {
    const [isValidating, setIsValidating] = React.useState(false)
    const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({})

    const currentStepData = steps[currentStep]
    const isFirstStep = currentStep === 0
    const isLastStep = currentStep === steps.length - 1
    const progress = ((currentStep + 1) / steps.length) * 100

    const validateCurrentStep = async (): Promise<boolean> => {
      if (!currentStepData.validation) return true

      setIsValidating(true)
      try {
        const isValid = await currentStepData.validation()
        if (!isValid) {
          setValidationErrors(prev => ({
            ...prev,
            [currentStepData.id]: currentStepData.errorMessage || 'This step has validation errors'
          }))
        } else {
          setValidationErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors[currentStepData.id]
            return newErrors
          })
        }
        return isValid
      } catch (error) {
        setValidationErrors(prev => ({
          ...prev,
          [currentStepData.id]: error instanceof Error ? error.message : 'Validation failed'
        }))
        return false
      } finally {
        setIsValidating(false)
      }
    }

    const handleNext = async () => {
      if (isValidating) return

      const isValid = await validateCurrentStep()
      if (isValid && !isLastStep) {
        onStepChange(currentStep + 1)
      }
    }

    const handlePrevious = () => {
      if (!isFirstStep) {
        onStepChange(currentStep - 1)
      }
    }

    const handleStepClick = async (stepIndex: number) => {
      if (!allowStepNavigation) return

      // Validate current step before allowing navigation
      if (stepIndex > currentStep) {
        const isValid = await validateCurrentStep()
        if (!isValid) return
      }

      onStepChange(stepIndex)
    }

    const handleComplete = async () => {
      if (isValidating) return

      const isValid = await validateCurrentStep()
      if (isValid) {
        onComplete?.()
      }
    }

    const getStepStatus = (stepIndex: number) => {
      if (stepIndex < currentStep) return 'completed'
      if (stepIndex === currentStep) return 'current'
      return 'upcoming'
    }

    return (
      <div ref={ref} className={cn('w-full max-w-4xl mx-auto', className)} {...props}>
        {/* Progress Bar */}
        {showProgress && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm font-medium text-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <ProgressBar value={progress} className="h-2" />
          </div>
        )}

        {/* Step Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(index)
              const isClickable = allowStepNavigation && (status === 'completed' || index <= currentStep)

              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-center space-x-3 cursor-pointer transition-all duration-200',
                    !isClickable && 'cursor-not-allowed opacity-50'
                  )}
                  onClick={() => isClickable && handleStepClick(index)}
                >
                  {/* Step Number/Icon */}
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200',
                      status === 'completed' && 'bg-primary border-primary text-primary-foreground',
                      status === 'current' && 'bg-primary/10 border-primary text-primary',
                      status === 'upcoming' && 'bg-muted border-muted-foreground text-muted-foreground'
                    )}
                  >
                    {showStepNumbers ? (
                      status === 'completed' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )
                    ) : (
                      status === 'completed' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3
                        className={cn(
                          'text-sm font-medium transition-colors',
                          status === 'current' && 'text-primary',
                          status === 'completed' && 'text-foreground',
                          status === 'upcoming' && 'text-muted-foreground'
                        )}
                      >
                        {step.title}
                      </h3>
                      {step.isOptional && (
                        <Badge variant="secondary" size="sm">
                          Optional
                        </Badge>
                      )}
                      {step.hasError && (
                        <Badge variant="destructive" size="sm">
                          Error
                        </Badge>
                      )}
                    </div>
                    {step.description && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {step.description}
                      </p>
                    )}
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-px transition-colors duration-200',
                        status === 'completed' ? 'bg-primary' : 'bg-muted'
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* Step Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {currentStepData.title}
                </h2>
                {currentStepData.description && (
                  <p className="text-muted-foreground">
                    {currentStepData.description}
                  </p>
                )}
              </div>

              {/* Validation Error */}
              {showValidationErrors && validationErrors[currentStepData.id] && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4"
                >
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    {validationErrors[currentStepData.id]}
                  </span>
                </motion.div>
              )}

              {/* Step Component */}
              <div className="min-h-[400px]">
                {currentStepData.component}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center space-x-2">
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                {cancelLabel}
              </Button>
            )}
            {!isFirstStep && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={loading || isValidating}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {previousLabel}
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {!isLastStep ? (
              <Button
                onClick={handleNext}
                disabled={loading || isValidating}
                className="flex items-center space-x-2"
              >
                {nextLabel}
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading || isValidating}
                className="flex items-center space-x-2"
              >
                {isValidating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                    />
                    Validating...
                  </>
                ) : (
                  <>
                    {completeLabel}
                    <Check className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }
)

WizardForm.displayName = 'WizardForm'

export { WizardForm }
