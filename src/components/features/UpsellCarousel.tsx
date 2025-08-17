"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Plus, Minus, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { priceFormat } from "@/lib/utils"

export interface UpsellItem {
  id: string
  title: string
  description?: string
  price: number
  image?: string
  category?: string
  inStock?: boolean
  maxQuantity?: number
}

export interface UpsellCarouselProps {
  items: UpsellItem[]
  onQuantityChange: (itemId: string, quantity: number) => void
  selectedItems: Record<string, number>
  className?: string
  maxItems?: number
  loading?: boolean
  emptyMessage?: string
}

const UpsellCarousel = React.forwardRef<HTMLDivElement, UpsellCarouselProps>(
  (
    {
      items,
      onQuantityChange,
      selectedItems,
      className,
      maxItems = 4,
      loading = false,
      emptyMessage = "No recommended items available at the moment.",
    },
    ref
  ) => {
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [imageErrors, setImageErrors] = React.useState<Set<string>>(new Set())
    const visibleItems = items.slice(currentIndex, currentIndex + maxItems)

    const next = () => {
      setCurrentIndex((prev) =>
        prev + maxItems >= items.length ? 0 : prev + maxItems
      )
    }

    const prev = () => {
      setCurrentIndex((prev) =>
        prev - maxItems < 0 ? Math.max(0, items.length - maxItems) : prev - maxItems
      )
    }

    const updateQuantity = (itemId: string, newQuantity: number) => {
      const item = items.find(i => i.id === itemId)
      const maxQty = item?.maxQuantity || 10
      const clampedQuantity = Math.max(0, Math.min(newQuantity, maxQty))
      onQuantityChange(itemId, clampedQuantity)
    }

    const handleImageError = (itemId: string) => {
      setImageErrors(prev => new Set(prev).add(itemId))
    }

    if (loading) {
      return (
        <div ref={ref} className={cn("w-full", className)}>
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: maxItems }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-6 bg-muted rounded w-1/2" />
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded flex-1" />
                    <div className="h-8 w-8 bg-muted rounded" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )
    }

    if (items.length === 0) {
      return (
        <div ref={ref} className={cn("w-full text-center py-12", className)}>
          <ImageIcon className="h-12 w-12 text-muted mx-auto mb-4" />
          <p className="text-muted">{emptyMessage}</p>
        </div>
      )
    }

    return (
      <div ref={ref} className={cn("w-full", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text">Recommended Add-ons</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              disabled={currentIndex === 0}
              className="h-8 w-8"
              aria-label="Previous items"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={next}
              disabled={currentIndex + maxItems >= items.length}
              className="h-8 w-8"
              aria-label="Next items"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleItems.map((item) => {
            const quantity = selectedItems[item.id] || 0
            const isSelected = quantity > 0
            const isOutOfStock = item.inStock === false
            const maxQty = item.maxQuantity || 10

            return (
              <Card
                key={item.id}
                className={cn(
                  "transition-all duration-200 group",
                  isSelected && "ring-2 ring-primary/20 border-primary/50",
                  isOutOfStock && "opacity-60"
                )}
              >
                <div className="aspect-square overflow-hidden rounded-t-2xl bg-muted relative">
                  {item.image && !imageErrors.has(item.id) ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={() => handleImageError(item.id)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted" />
                    </div>
                  )}
                  
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-sm font-medium bg-danger px-2 py-1 rounded">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  {item.category && (
                    <span className="inline-block px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full mb-2">
                      {item.category}
                    </span>
                  )}
                  
                  <h4 className="font-medium text-text mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  
                  {item.description && item.description.trim() && (
                    <p className="text-sm text-muted mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-text">
                      {priceFormat(item.price)}
                    </span>
                    {item.maxQuantity && (
                      <span className="text-xs text-muted">
                        Max: {item.maxQuantity}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, quantity - 1)}
                      disabled={quantity === 0 || isOutOfStock}
                      className="h-8 w-8"
                      aria-label={`Decrease quantity of ${item.title}`}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <span className="flex-1 text-center text-sm font-medium text-text">
                      {quantity}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, quantity + 1)}
                      disabled={quantity >= maxQty || isOutOfStock}
                      className="h-8 w-8"
                      aria-label={`Increase quantity of ${item.title}`}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {items.length > maxItems && (
          <div className="flex justify-center mt-6">
            <div className="flex gap-2" role="tablist" aria-label="Carousel navigation">
              {Array.from({ length: Math.ceil(items.length / maxItems) }).map(
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index * maxItems)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index * maxItems === currentIndex
                        ? "bg-primary"
                        : "bg-border hover:bg-muted"
                    )}
                    role="tab"
                    aria-selected={index * maxItems === currentIndex}
                    aria-label={`Go to page ${index + 1}`}
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)
UpsellCarousel.displayName = "UpsellCarousel"

export { UpsellCarousel }




