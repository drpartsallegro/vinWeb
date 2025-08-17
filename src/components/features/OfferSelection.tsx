"use client"

import * as React from "react"
import { CheckCircle, Star, Truck, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { priceFormat } from "@/lib/utils"

export interface Offer {
  id: string
  supplierName: string
  supplierRating: number
  unitPrice: number
  totalPrice: number
  deliveryTime: string
  warranty: string
  quality: "A" | "B" | "C"
  isRecommended?: boolean
  features?: string[]
}

export interface OfferSelectionProps {
  offers: Offer[]
  selectedOfferId?: string
  onOfferSelect: (offerId: string) => void
  className?: string
  showQuality?: boolean
  showFeatures?: boolean
}

const OfferSelection = React.forwardRef<HTMLDivElement, OfferSelectionProps>(
  (
    {
      offers,
      selectedOfferId,
      onOfferSelect,
      className,
      showQuality = true,
      showFeatures = true,
    },
    ref
  ) => {
    const getQualityColor = (quality: Offer["quality"]) => {
      switch (quality) {
        case "A":
          return "text-success border-success/30 bg-success/10"
        case "B":
          return "text-warning border-warning/30 bg-warning/10"
        case "C":
          return "text-muted border-muted/30 bg-muted/10"
        default:
          return "text-muted border-border bg-surface-2"
      }
    }

    const getQualityLabel = (quality: Offer["quality"]) => {
      switch (quality) {
        case "A":
          return "Premium"
        case "B":
          return "Standard"
        case "C":
          return "Economy"
        default:
          return "Unknown"
      }
    }

    if (offers.length === 0) {
      return (
        <div className="text-center py-8 text-muted">
          <Shield className="mx-auto h-8 w-8 mb-2" />
          <p>No offers available at this time</p>
        </div>
      )
    }

    return (
      <div ref={ref} className={cn("w-full space-y-4", className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text">
            Available Offers ({offers.length})
          </h3>
          <div className="text-sm text-muted">
            Select the best option for you
          </div>
        </div>

        <div className="grid gap-4">
          {offers.map((offer) => {
            const isSelected = selectedOfferId === offer.id

            return (
              <Card
                key={offer.id}
                className={cn(
                  "transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "ring-2 ring-primary/20 border-primary/50 bg-primary/5"
                    : "hover:border-primary/30 hover:shadow-float/50"
                )}
                onClick={() => onOfferSelect(offer.id)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-text">
                          {offer.supplierName}
                        </h4>
                        {offer.isRecommended && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-success bg-success/10 rounded-full">
                            <CheckCircle className="h-3 w-3" />
                            Recommended
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-current text-warning" />
                          <span>{offer.supplierRating.toFixed(1)}</span>
                        </div>
                        {showQuality && (
                          <span
                            className={cn(
                              "px-2 py-1 text-xs font-medium rounded-full border",
                              getQualityColor(offer.quality)
                            )}
                          >
                            {getQualityLabel(offer.quality)} ({offer.quality})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-text">
                        {priceFormat(offer.totalPrice)}
                      </div>
                      <div className="text-sm text-muted">
                        {priceFormat(offer.unitPrice)} per unit
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4 text-muted" />
                      <span className="text-muted">Delivery:</span>
                      <span className="text-text font-medium">
                        {offer.deliveryTime}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-muted" />
                      <span className="text-muted">Warranty:</span>
                      <span className="text-text font-medium">
                        {offer.warranty}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-muted" />
                      <span className="text-muted">Quality:</span>
                      <span className="text-text font-medium">
                        {getQualityLabel(offer.quality)}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  {showFeatures && offer.features && offer.features.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-text mb-2">
                        Features:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {offer.features.map((feature, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-surface-2 text-muted rounded-full"
                          >
                            <CheckCircle className="h-3 w-3 text-success" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selection Button */}
                  <div className="flex justify-end">
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "min-w-[120px]",
                        isSelected && "bg-primary text-white"
                      )}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Selected
                        </>
                      ) : (
                        "Select Offer"
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }
)
OfferSelection.displayName = "OfferSelection"

export { OfferSelection }

