"use client"

import * as React from "react"
import { ShoppingCart, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { priceFormat } from "@/lib/utils"

export interface TotalBarProps {
  total: number
  itemCount: number
  onCheckout?: () => void
  className?: string
  disabled?: boolean
  loading?: boolean
}

const TotalBar = React.forwardRef<HTMLDivElement, TotalBarProps>(
  (
    {
      total,
      itemCount,
      onCheckout,
      className,
      disabled = false,
      loading = false,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur-sm p-4",
          className
        )}
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-muted">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-sm">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted">Total</div>
              <div className="text-xl font-bold text-text">
                {priceFormat(total)}
              </div>
            </div>
          </div>

          <Button
            onClick={onCheckout}
            disabled={disabled || loading || itemCount === 0}
            className="min-w-[140px]"
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                Checkout
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }
)
TotalBar.displayName = "TotalBar"

export { TotalBar }

