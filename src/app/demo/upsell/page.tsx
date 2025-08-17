"use client"

import { useState } from 'react'
import { UpsellCarousel, type UpsellItem } from '@/components/features/UpsellCarousel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const sampleUpsellItems: UpsellItem[] = [
  {
    id: '1',
    title: 'Premium Oil Filter',
    description: 'High-quality oil filter for better engine performance and longer engine life. Made with advanced filtration technology.',
    price: 29.99,
    image: '/test-image.jpg',
    category: 'Filters',
    inStock: true,
    maxQuantity: 5
  },
  {
    id: '2',
    title: 'Air Filter',
    description: 'Clean air filter for improved engine efficiency and better fuel economy. Easy to install and maintain.',
    price: 19.99,
    category: 'Filters',
    inStock: true,
    maxQuantity: 3
  },
  {
    id: '3',
    title: 'Brake Pads',
    description: 'Durable brake pads for reliable stopping power. Ceramic compound for quiet operation and long life.',
    price: 89.99,
    image: '/brake-pads.jpg',
    category: 'Brakes',
    inStock: false
  },
  {
    id: '4',
    title: 'Spark Plugs',
    description: 'High-performance spark plugs for optimal ignition and engine performance. Iridium construction for durability.',
    price: 45.99,
    category: 'Ignition',
    inStock: true,
    maxQuantity: 8
  },
  {
    id: '5',
    title: 'Windshield Wipers',
    description: 'Premium windshield wipers for clear visibility in all weather conditions. Easy installation and quiet operation.',
    price: 24.99,
    category: 'Exterior',
    inStock: true,
    maxQuantity: 4
  },
  {
    id: '6',
    title: 'Floor Mats',
    description: 'Custom-fit floor mats to protect your vehicle interior. Weather-resistant and easy to clean.',
    price: 69.99,
    image: '/floor-mats.jpg',
    category: 'Interior',
    inStock: true,
    maxQuantity: 2
  }
]

export default function UpsellDemoPage() {
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [showEmpty, setShowEmpty] = useState(false)

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: quantity
    }))
  }

  const toggleLoading = () => {
    setLoading(!loading)
  }

  const toggleEmpty = () => {
    setShowEmpty(!showEmpty)
  }

  const resetSelection = () => {
    setSelectedItems({})
  }

  const calculateTotal = () => {
    return Object.entries(selectedItems).reduce((total, [itemId, quantity]) => {
      const item = sampleUpsellItems.find(i => i.id === itemId)
      return total + (item?.price || 0) * quantity
    }, 0)
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text mb-4">UpsellCarousel Demo</h1>
        <p className="text-muted text-lg">Showcasing the improved carousel component with various features</p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button onClick={toggleLoading} variant={loading ? "destructive" : "default"}>
              {loading ? "Stop Loading" : "Show Loading State"}
            </Button>
            <Button onClick={toggleEmpty} variant={showEmpty ? "destructive" : "default"}>
              {showEmpty ? "Show Items" : "Show Empty State"}
            </Button>
            <Button onClick={resetSelection} variant="outline">
              Reset Selection
            </Button>
          </div>
          
          {Object.keys(selectedItems).length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Selected Items:</h4>
              <div className="space-y-2">
                {Object.entries(selectedItems).map(([itemId, quantity]) => {
                  const item = sampleUpsellItems.find(i => i.id === itemId)
                  if (!item) return null
                  return (
                    <div key={itemId} className="flex justify-between text-sm">
                      <span>{item.title} x{quantity}</span>
                      <span>${(item.price * quantity).toFixed(2)}</span>
                    </div>
                  )
                })}
                <div className="border-t pt-2 font-semibold">
                  <span>Total: ${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* UpsellCarousel Demo */}
      <Card>
        <CardHeader>
          <CardTitle>UpsellCarousel Component</CardTitle>
        </CardHeader>
        <CardContent>
          <UpsellCarousel
            items={showEmpty ? [] : sampleUpsellItems}
            onQuantityChange={handleQuantityChange}
            selectedItems={selectedItems}
            loading={loading}
            emptyMessage="No recommended items available at the moment. Please check back later!"
            maxItems={4}
          />
        </CardContent>
      </Card>

      {/* Features Showcase */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Loading states with skeleton animations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Empty state with custom messages</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Out of stock indicators</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Quantity limits per item</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Image fallbacks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Accessibility features</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Component Props</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><strong>items:</strong> Array of upsell items</div>
            <div><strong>onQuantityChange:</strong> Callback for quantity updates</div>
            <div><strong>selectedItems:</strong> Current selection state</div>
            <div><strong>loading:</strong> Show loading skeletons</div>
            <div><strong>emptyMessage:</strong> Custom empty state message</div>
            <div><strong>maxItems:</strong> Items per carousel page</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
