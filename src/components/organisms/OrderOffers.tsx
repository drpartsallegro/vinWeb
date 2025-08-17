import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Star, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { motionVariants } from '@/lib/motion'

export interface Offer {
  id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  currency?: string
  deliveryTime?: string
  rating?: number
  reviewCount?: number
  features: string[]
  isRecommended?: boolean
  isPopular?: boolean
  isLimited?: boolean
  stock?: number
  warranty?: string
  returnPolicy?: string
  supplier?: {
    name: string
    logo?: string
    verified?: boolean
  }
}

export interface OrderOffersProps {
  offers: Offer[]
  selectedOfferId?: string
  onOfferSelect?: (offerId: string) => void
  onOfferCompare?: (offerIds: string[]) => void
  className?: string
  showComparison?: boolean
  maxCompareCount?: number
  loading?: boolean
  emptyMessage?: string
  showFilters?: boolean
  showSorting?: boolean
  sortBy?: 'price' | 'rating' | 'delivery' | 'popularity'
  onSortChange?: (sortBy: string) => void
  filterOptions?: {
    priceRange?: [number, number]
    rating?: number
    deliveryTime?: string
    supplier?: string
  }
  onFilterChange?: (filters: any) => void
}

const OrderOffers = React.forwardRef<HTMLDivElement, OrderOffersProps>(
  (
    {
      offers,
      selectedOfferId,
      onOfferSelect,
      onOfferCompare,
      className,
      showComparison = false,
      maxCompareCount = 3,
      loading = false,
      emptyMessage = 'No offers available at the moment.',
      showFilters = true,
      showSorting = true,
      sortBy = 'price',
      onSortChange,
      filterOptions,
      onFilterChange,
      ...props
    },
    ref
  ) => {
    const [compareMode, setCompareMode] = React.useState(false)
    const [selectedForCompare, setSelectedForCompare] = React.useState<string[]>([])
    const [expandedOffers, setExpandedOffers] = React.useState<Set<string>>(new Set())
    const [showFiltersPanel, setShowFiltersPanel] = React.useState(false)

    const handleOfferSelect = (offerId: string) => {
      onOfferSelect?.(offerId)
    }

    const handleCompareToggle = (offerId: string) => {
      setSelectedForCompare(prev => {
        if (prev.includes(offerId)) {
          return prev.filter(id => id !== offerId)
        } else if (prev.length < maxCompareCount) {
          return [...prev, offerId]
        }
        return prev
      })
    }

    const handleCompareOffers = () => {
      if (selectedForCompare.length >= 2) {
        onOfferCompare?.(selectedForCompare)
        setCompareMode(true)
      }
    }

    const toggleOfferExpansion = (offerId: string) => {
      setExpandedOffers(prev => {
        const newSet = new Set(prev)
        if (newSet.has(offerId)) {
          newSet.delete(offerId)
        } else {
          newSet.add(offerId)
        }
        return newSet
      })
    }

    const formatPrice = (price: number, currency = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
      }).format(price)
    }

    const getSortedOffers = () => {
      if (!offers.length) return offers

      return [...offers].sort((a, b) => {
        switch (sortBy) {
          case 'price':
            return a.price - b.price
          case 'rating':
            return (b.rating || 0) - (a.rating || 0)
          case 'delivery':
            return (a.deliveryTime || '').localeCompare(b.deliveryTime || '')
          case 'popularity':
            return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0)
          default:
            return 0
        }
      })
    }

    const sortedOffers = getSortedOffers()

    if (loading) {
      return (
        <div ref={ref} className={cn('w-full', className)} {...props}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-6 bg-muted rounded w-1/4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-5/6" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )
    }

    if (!offers.length) {
      return (
        <div ref={ref} className={cn('w-full text-center py-12', className)} {...props}>
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Offers Found</h3>
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        </div>
      )
    }

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-foreground">
              Available Offers ({offers.length})
            </h2>
            {showComparison && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompareMode(!compareMode)}
                className="flex items-center space-x-2"
              >
                {compareMode ? 'Hide Comparison' : 'Compare Offers'}
                {selectedForCompare.length > 0 && (
                  <Badge variant="secondary" size="sm">
                    {selectedForCompare.length}
                  </Badge>
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Filters Toggle */}
            {showFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="flex items-center space-x-2"
              >
                Filters
                {showFiltersPanel ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            )}

            {/* Sorting */}
            {showSorting && (
              <select
                value={sortBy}
                onChange={(e) => onSortChange?.(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="price">Sort by Price</option>
                <option value="rating">Sort by Rating</option>
                <option value="delivery">Sort by Delivery</option>
                <option value="popularity">Sort by Popularity</option>
              </select>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && showFiltersPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 border rounded-lg bg-muted/50"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Price Range
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  />
                  <span className="text-muted-foreground">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Min Rating
                </label>
                <select className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm">
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Delivery Time
                </label>
                <select className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm">
                  <option value="">Any Time</option>
                  <option value="same-day">Same Day</option>
                  <option value="next-day">Next Day</option>
                  <option value="2-3-days">2-3 Days</option>
                  <option value="1-week">1 Week</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Supplier
                </label>
                <select className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm">
                  <option value="">Any Supplier</option>
                  {Array.from(new Set(offers.map(o => o.supplier?.name).filter(Boolean))).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Compare Mode Actions */}
        {compareMode && selectedForCompare.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-foreground">
                  Comparing {selectedForCompare.length} offers
                </span>
                <Button
                  size="sm"
                  onClick={handleCompareOffers}
                  disabled={selectedForCompare.length < 2}
                >
                  Compare Now
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedForCompare([])}
              >
                Clear Selection
              </Button>
            </div>
          </motion.div>
        )}

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {sortedOffers.map((offer, index) => (
              <motion.div
                key={offer.id}
                variants={motionVariants.quickIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                layout
              >
                <Card
                  className={cn(
                    'p-6 transition-all duration-200 cursor-pointer hover:shadow-lg',
                    selectedOfferId === offer.id && 'ring-2 ring-primary',
                    compareMode && selectedForCompare.includes(offer.id) && 'ring-2 ring-blue-500'
                  )}
                  onClick={() => handleOfferSelect(offer.id)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                        {offer.title}
                      </h3>
                      {offer.isRecommended && (
                        <Badge variant="success" size="sm" className="mb-2">
                          Recommended
                        </Badge>
                      )}
                      {offer.isPopular && (
                        <Badge variant="info" size="sm" className="mb-2">
                          Popular
                        </Badge>
                      )}
                      {offer.isLimited && (
                        <Badge variant="warning" size="sm" className="mb-2">
                          Limited Time
                        </Badge>
                      )}
                    </div>
                    {showComparison && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCompareToggle(offer.id)
                        }}
                        className={cn(
                          'ml-2',
                          selectedForCompare.includes(offer.id) && 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        )}
                      >
                        {selectedForCompare.includes(offer.id) ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <span className="text-xs">+</span>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-foreground">
                        {formatPrice(offer.price, offer.currency)}
                      </span>
                      {offer.originalPrice && offer.originalPrice > offer.price && (
                        <span className="text-lg text-muted-foreground line-through">
                          {formatPrice(offer.originalPrice, offer.currency)}
                        </span>
                      )}
                    </div>
                    {offer.originalPrice && offer.originalPrice > offer.price && (
                      <span className="text-sm text-green-600 dark:text-green-400">
                        Save {formatPrice(offer.originalPrice - offer.price, offer.currency)}
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  {offer.rating && (
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'w-4 h-4',
                              i < Math.floor(offer.rating!) ? 'text-yellow-400 fill-current' : 'text-muted-foreground'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {offer.rating.toFixed(1)} ({offer.reviewCount || 0} reviews)
                      </span>
                    </div>
                  )}

                  {/* Key Features */}
                  <div className="mb-4">
                    <ul className="space-y-2">
                      {offer.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="line-clamp-1">{feature}</span>
                        </li>
                      ))}
                      {offer.features.length > 3 && (
                        <li className="text-sm text-primary cursor-pointer hover:underline">
                          +{offer.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {offer.deliveryTime && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{offer.deliveryTime}</span>
                      </div>
                    )}
                    {offer.stock !== undefined && (
                      <div className="flex items-center space-x-2">
                        <span className={cn(
                          'w-2 h-2 rounded-full',
                          offer.stock > 10 ? 'bg-green-500' : offer.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
                        )} />
                        <span>
                          {offer.stock > 10 ? 'In Stock' : offer.stock > 0 ? `Only ${offer.stock} left` : 'Out of Stock'}
                        </span>
                      </div>
                    )}
                    {offer.supplier && (
                      <div className="flex items-center space-x-2">
                        <span>by {offer.supplier.name}</span>
                        {offer.supplier.verified && (
                          <Badge variant="success" size="sm">Verified</Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expand/Collapse */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleOfferExpansion(offer.id)
                    }}
                    className="w-full mt-4"
                  >
                    {expandedOffers.has(offer.id) ? 'Show Less' : 'Show More'}
                    {expandedOffers.has(offer.id) ? (
                      <ChevronUp className="w-4 h-4 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-2" />
                    )}
                  </Button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedOffers.has(offer.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t"
                      >
                        <div className="space-y-3">
                          <h4 className="font-medium text-foreground">All Features</h4>
                          <ul className="space-y-2">
                            {offer.features.map((feature, i) => (
                              <li key={i} className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                          {offer.warranty && (
                            <div className="text-sm">
                              <span className="font-medium">Warranty:</span> {offer.warranty}
                            </div>
                          )}
                          {offer.returnPolicy && (
                            <div className="text-sm">
                              <span className="font-medium">Return Policy:</span> {offer.returnPolicy}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    )
  }
)

OrderOffers.displayName = 'OrderOffers'

export { OrderOffers }
