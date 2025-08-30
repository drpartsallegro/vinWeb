'use client'

import { Button } from '@/components/ui/Button'
import { ArrowLeft, ArrowRight, Check, Edit } from 'lucide-react'
import Link from 'next/link'

interface WizardNavigationProps {
  onBack?: () => void
  onContinue?: () => void
  backHref?: string
  continueHref?: string
  backLabel?: string
  continueLabel?: string
  backIcon?: React.ReactNode
  continueIcon?: React.ReactNode
  isContinueDisabled?: boolean
  isLoading?: boolean
  showBack?: boolean
  showContinue?: boolean
  variant?: 'default' | 'submit' | 'review'
  className?: string
}

export function WizardNavigation({
  onBack,
  onContinue,
  backHref,
  continueHref,
  backLabel = 'Back',
  continueLabel = 'Continue',
  backIcon = <ArrowLeft className="h-4 w-4" />,
  continueIcon = <ArrowRight className="h-4 w-4" />,
  isContinueDisabled = false,
  isLoading = false,
  showBack = true,
  showContinue = true,
  variant = 'default',
  className = ''
}: WizardNavigationProps) {
  const getContinueButton = () => {
    if (variant === 'submit') {
      return (
        <Button
          onClick={onContinue}
          disabled={isContinueDisabled || isLoading}
          loading={isLoading}
          size="lg"
          className="min-w-[160px] bg-success hover:bg-success/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Check className="mr-2 h-4 w-4" />
          {continueLabel}
        </Button>
      )
    }

    if (variant === 'review') {
      return (
        <Button
          onClick={onContinue}
          disabled={isContinueDisabled || isLoading}
          loading={isLoading}
          size="lg"
          className="min-w-[160px] bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {continueLabel}
          {continueIcon}
        </Button>
      )
    }

    return (
      <Button
        onClick={onContinue}
        disabled={isContinueDisabled || isLoading}
        loading={isLoading}
        size="lg"
        className="min-w-[160px] bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {continueLabel}
        {continueIcon}
      </Button>
    )
  }

  const getBackButton = () => {
    if (backHref) {
      return (
        <Button
          variant="outline"
          size="lg"
          asChild
          className="min-w-[140px] border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
        >
          <Link href={backHref}>
            {backIcon}
            <span className="ml-2">{backLabel}</span>
          </Link>
        </Button>
      )
    }

    return (
      <Button
        variant="outline"
        size="lg"
        onClick={onBack}
        className="min-w-[140px] border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
      >
        {backIcon}
        <span className="ml-2">{backLabel}</span>
      </Button>
    )
  }

  return (
    <div className={`flex items-center justify-between pt-8 ${className}`}>
      <div className="flex-1 flex items-center">
        {showBack && getBackButton()}
      </div>
      
      <div className="flex-1 flex justify-end items-center">
        {showContinue && getContinueButton()}
      </div>
    </div>
  )
}

// Specialized navigation components for different wizard steps
export function IdentifyNavigation({ onContinue, isDisabled, isLoading }: {
  onContinue: () => void
  isDisabled: boolean
  isLoading: boolean
}) {
  return (
    <WizardNavigation
      backHref="/"
              backLabel="Powrót do Strony Głównej"
              continueLabel="Kontynuuj do Wyboru Części"
      onContinue={onContinue}
      isContinueDisabled={isDisabled}
      isLoading={isLoading}
      variant="default"
    />
  )
}

export function PartsNavigation({ onContinue, isDisabled, isLoading }: {
  onContinue: () => void
  isDisabled: boolean
  isLoading: boolean
}) {
  return (
    <WizardNavigation
      backHref="/wizard/identify"
              backLabel="Powrót do Informacji o Pojazdzie"
        continueLabel="Kontynuuj do Podsumowania"
      onContinue={onContinue}
      isContinueDisabled={isDisabled}
      isLoading={isLoading}
      variant="default"
    />
  )
}

export function ReviewNavigation({ onContinue, isDisabled, isLoading }: {
  onContinue: () => void
  isDisabled: boolean
  isLoading: boolean
}) {
  return (
    <WizardNavigation
      backHref="/wizard/parts"
              backLabel="Powrót do Wyboru Części"
        continueLabel="Złóż Zamówienie"
      onContinue={onContinue}
      isContinueDisabled={isDisabled}
      isLoading={isLoading}
      variant="submit"
    />
  )
}

export function CheckoutNavigation({ onContinue, isDisabled, isLoading, total, itemCount }: {
  onContinue: () => void
  isDisabled: boolean
  isLoading: boolean
  total: string
  itemCount: number
}) {
  return (
    <WizardNavigation
      backHref="#"
              backLabel="Powrót do Zamówienia"
      continueLabel={`Proceed to Payment - ${total} (${itemCount} items)`}
      onContinue={onContinue}
      isContinueDisabled={isDisabled}
      isLoading={isLoading}
      variant="review"
      continueIcon={<ArrowRight className="h-4 w-4" />}
    />
  )
}
