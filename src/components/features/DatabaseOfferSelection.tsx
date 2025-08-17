'use client'

import * as React from "react"
import { CheckCircle, Package, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/Card"
import { formatPrice } from "@/lib/utils"

export interface DatabaseOffer {
  id: string
  manufacturer: string
  unitPrice: number
  quantityAvailable: number
  notes?: string
  version: number
}

export interface DatabaseOfferSelectionProps {
  offers: DatabaseOffer[]
  selectedOfferId?: string
  onOfferSelect: (offerId: string | null) => void
  className?: string
  userRequestedQuantity?: number // Add this prop
}

const DatabaseOfferSelection = React.forwardRef<HTMLDivElement, DatabaseOfferSelectionProps>(
  (
    {
      offers,
      selectedOfferId,
      onOfferSelect,
      className,
      userRequestedQuantity = 1, // Add default value
    },
    ref
  ) => {
    if (!offers || offers.length === 0) {
      return (
        <div className="text-center py-8 text-muted">
          <Package className="mx-auto h-8 w-8 mb-2" />
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

        {/* No Action Option */}
        <Card
          className={cn(
            "transition-all duration-200 cursor-pointer",
            selectedOfferId === null
              ? "ring-2 ring-warn/30 border-warn/60 bg-warn/5"
              : "hover:border-warn/30 hover:shadow-float/50"
          )}
          onClick={() => onOfferSelect(null)}
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-text text-warn">
                    No Action Required
                  </h4>
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-warn bg-warn/10 rounded-full">
                    Skip
                  </span>
                </div>
                <p className="text-sm text-muted mt-1">
                  This part doesn't need replacement or repair
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-warn">
                  $0.00
                </div>
                <div className="text-sm text-muted">
                  no cost
                </div>
              </div>
            </div>

            {/* Selection indicator */}
            {selectedOfferId === null && (
              <div className="mt-4 pt-4 border-t border-warn/20">
                <div className="flex items-center gap-2 text-warn">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">No action selected</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="grid gap-4">
          {offers.map((offer) => {
            const isSelected = selectedOfferId === offer.id

            return (
              <Card
                key={offer.id}
                className={cn(
                  "transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "ring-2 ring-success/30 border-success/60 bg-success/5"
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
                          {offer.manufacturer}
                        </h4>
                      </div>
                      
                      {offer.notes && (
                        <p className="text-sm text-muted mt-1">{offer.notes}</p>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-text">
                        {formatPrice(offer.unitPrice)}
                      </div>
                      <div className="text-sm text-muted">
                        per unit
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-muted" />
                      <span className="text-muted">Available:</span>
                      {(() => {
                        const adminQuantity = Math.min(offer.quantityAvailable, userRequestedQuantity)
                        const hasQuantityMismatch = adminQuantity < userRequestedQuantity
                        return (
                          <span className={hasQuantityMismatch ? "text-destructive font-medium" : "text-text font-medium"}>
                            {adminQuantity} units
                          </span>
                        )
                      })()}
                      {(() => {
                        const adminQuantity = Math.min(offer.quantityAvailable, userRequestedQuantity)
                        const hasQuantityMismatch = adminQuantity < userRequestedQuantity
                        if (hasQuantityMismatch) {
                          return (
                            <span className="text-muted"> out of {userRequestedQuantity}</span>
                          )
                        }
                        return null
                      })()}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-muted" />
                      <span className="text-muted">Status:</span>
                      <span className="text-text font-medium">
                        {isSelected ? 'Selected' : 'Available'}
                      </span>
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-success/20">
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">This offer is selected</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }
)

DatabaseOfferSelection.displayName = "DatabaseOfferSelection"

export { DatabaseOfferSelection }
