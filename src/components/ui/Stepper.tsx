import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface Step {
  id: string
  title: string
  description?: string
  status: 'pending' | 'current' | 'completed' | 'error'
}

export interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
  orientation?: 'horizontal' | 'vertical'
  showStepNumbers?: boolean
  showStepDescriptions?: boolean
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ 
    steps, 
    currentStep, 
    className, 
    orientation = 'horizontal',
    showStepNumbers = true,
    showStepDescriptions = true,
    ...props 
  }, ref) => {
    const getStepStatus = (index: number): Step['status'] => {
      if (index < currentStep) return 'completed'
      if (index === currentStep) return 'current'
      return 'pending'
    }

    const getStepIcon = (status: Step['status'], index: number) => {
      if (status === 'completed') {
        return <Check className="h-4 w-4 text-white" />
      }
      if (showStepNumbers) {
        return <span className="text-sm font-medium">{index + 1}</span>
      }
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          className
        )}
        {...props}
      >
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          const isLast = index === steps.length - 1

          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center',
                orientation === 'horizontal' ? 'flex-1' : 'w-full',
                orientation === 'horizontal' && !isLast && 'mr-4',
                orientation === 'vertical' && !isLast && 'mb-4'
              )}
            >
              <div className="flex items-center">
                {/* Step indicator */}
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200',
                    status === 'completed' && 'border-success bg-success text-white',
                    status === 'current' && 'border-primary bg-primary text-white',
                    status === 'pending' && 'border-border bg-surface text-muted',
                    status === 'error' && 'border-danger bg-danger text-white'
                  )}
                >
                  {getStepIcon(status, index)}
                </div>

                {/* Step content */}
                <div className={cn(
                  'ml-3',
                  orientation === 'horizontal' && 'flex-1'
                )}>
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        'text-sm font-medium transition-colors',
                        status === 'completed' && 'text-success',
                        status === 'current' && 'text-primary',
                        status === 'pending' && 'text-muted',
                        status === 'error' && 'text-danger'
                      )}
                    >
                      {step.title}
                    </span>
                    {showStepDescriptions && step.description && (
                      <span className="text-xs text-muted mt-1">
                        {step.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    'flex-1 transition-colors flex items-center justify-center',
                    orientation === 'horizontal' ? 'mx-4 h-px' : 'ml-4 w-px h-8',
                    status === 'completed' ? 'bg-success' : 'bg-border'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }
)
Stepper.displayName = "Stepper"

export { Stepper }

