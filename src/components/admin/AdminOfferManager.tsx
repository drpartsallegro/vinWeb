'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { Plus, Save, X } from 'lucide-react'

interface AdminOfferManagerProps {
  orderItem: any
  onOfferAdded: () => void
}

export function AdminOfferManager({ orderItem, onOfferAdded }: AdminOfferManagerProps) {
  const { addToast } = useToast()
  const [isAddingOffer, setIsAddingOffer] = useState(false)
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null)
  const [newOffer, setNewOffer] = useState({
    manufacturer: '',
    unitPrice: '',
    quantityAvailable: '',
    notes: ''
  })
  const [editOffer, setEditOffer] = useState({
    manufacturer: '',
    unitPrice: '',
    quantityAvailable: '',
    notes: ''
  })

  // Check if we've reached the limit of 3 offers
  const hasReachedLimit = orderItem.offers && orderItem.offers.length >= 3
  const canAddMore = !hasReachedLimit

  // Debug logging
  console.log('AdminOfferManager Debug:', {
    orderItemId: orderItem.id,
    offersCount: orderItem.offers ? orderItem.offers.length : 0,
    hasReachedLimit,
    canAddMore,
    isAddingOffer
  })

  const handleAddOffer = async () => {
    if (!newOffer.manufacturer || !newOffer.unitPrice || !newOffer.quantityAvailable) {
      addToast({
        type: 'error',
        title: 'Missing Information',
        description: 'Please fill in all required fields'
      })
      return
    }

    // Check if we've reached the limit
    if (hasReachedLimit) {
      addToast({
        type: 'error',
        title: 'Offer Limit Reached',
        description: 'Maximum of 3 offers allowed per category'
      })
      return
    }

    try {
      const response = await fetch(`/api/admin/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderItemId: orderItem.id,
          manufacturer: newOffer.manufacturer,
          unitPrice: parseFloat(newOffer.unitPrice),
          quantityAvailable: parseInt(newOffer.quantityAvailable),
          notes: newOffer.notes || undefined
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add offer')
      }

      addToast({
        type: 'success',
        title: 'Offer Added',
        description: 'New offer has been added successfully'
      })

      // Reset form
      setNewOffer({
        manufacturer: '',
        unitPrice: '',
        quantityAvailable: '',
        notes: ''
      })
      setIsAddingOffer(false)
      onOfferAdded()
    } catch (error) {
      console.error('Error adding offer:', error)
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to add offer. Please try again.'
      })
    }
  }

  const handleEditOffer = async () => {
    if (!editingOfferId || !editOffer.manufacturer || !editOffer.unitPrice || !editOffer.quantityAvailable) {
      addToast({
        type: 'error',
        title: 'Missing Information',
        description: 'Please fill in all required fields'
      })
      return
    }

    try {
      const response = await fetch(`/api/admin/offers`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offerId: editingOfferId,
          manufacturer: editOffer.manufacturer,
          unitPrice: parseFloat(editOffer.unitPrice),
          quantityAvailable: parseInt(editOffer.quantityAvailable),
          notes: editOffer.notes || undefined
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update offer')
      }

      addToast({
        type: 'success',
        title: 'Offer Updated',
        description: 'Offer has been updated successfully'
      })

      setEditingOfferId(null)
      setEditOffer({
        manufacturer: '',
        unitPrice: '',
        quantityAvailable: '',
        notes: ''
      })
      onOfferAdded()
    } catch (error) {
      console.error('Error updating offer:', error)
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to update offer. Please try again.'
      })
    }
  }

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('Are you sure you want to delete this offer? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/offers`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offerId: offerId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete offer')
      }

      addToast({
        type: 'success',
        title: 'Offer Deleted',
        description: 'Offer has been deleted successfully'
      })

      onOfferAdded()
    } catch (error) {
      console.error('Error deleting offer:', error)
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to delete offer. Please try again.'
      })
    }
  }

  const startEditing = (offer: any) => {
    setEditingOfferId(offer.id)
    setEditOffer({
      manufacturer: offer.manufacturer,
      unitPrice: offer.unitPrice.toString(),
      quantityAvailable: offer.quantityAvailable.toString(),
      notes: offer.notes || ''
    })
  }

  const cancelEditing = () => {
    setEditingOfferId(null)
    setEditOffer({
      manufacturer: '',
      unitPrice: '',
      quantityAvailable: '',
      notes: ''
    })
  }

  const handleCancel = () => {
    setIsAddingOffer(false)
    setNewOffer({
      manufacturer: '',
      unitPrice: '',
      quantityAvailable: '',
      notes: ''
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
                          <span>Części Zamówione ({orderItem.quantity})</span>
          {canAddMore && (
            <div className="flex items-center gap-2">
              {!isAddingOffer && (
                <Button
                  size="sm"
                  onClick={() => setIsAddingOffer(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Offer
                </Button>
              )}
              <span className="text-sm text-text/70 px-2 py-1 bg-chip rounded">
                {orderItem.offers ? orderItem.offers.length : 0}/3 offers
              </span>
            </div>
          )}
          {hasReachedLimit && (
            <span className="text-sm text-text/70 px-2 py-1 bg-chip rounded">
              Max offers reached (3/3)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Part Information */}
          <div className="p-3 bg-chip rounded-lg">
            <h4 className="font-medium text-text">{orderItem.category.name}</h4>
            <p className="text-sm text-text/70">{orderItem.categoryPath}</p>
                            <p className="text-sm text-text/70">Ilość: {orderItem.quantity}</p>
                {orderItem.note && (
                  <p className="text-sm text-text/70 mt-1">Notatka: {orderItem.note}</p>
                )}
          </div>

          {/* Existing Offers */}
          {orderItem.offers && orderItem.offers.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-text">Current Offers:</h5>
                <span className="text-sm text-text/70">
                  {orderItem.offers.length}/3 offers
                </span>
              </div>
              
              {/* Encouragement to add more offers */}
              {orderItem.offers.length < 3 && (
                <div className="p-2 bg-primary/10 border border-primary/20 rounded text-sm text-primary">
                  💡 You can add {3 - orderItem.offers.length} more offer{3 - orderItem.offers.length !== 1 ? 's' : ''} for this category
                </div>
              )}
              
              {orderItem.offers.map((offer: any) => (
                <div key={offer.id} className="p-3 bg-bg border rounded-lg">
                  {editingOfferId === offer.id ? (
                    // Edit Form
                    <div className="space-y-3">
                      <h6 className="font-medium text-text">Editing Offer</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          label="Manufacturer"
                          value={editOffer.manufacturer}
                          onChange={(e) => setEditOffer(prev => ({ ...prev, manufacturer: e.target.value }))}
                          placeholder="e.g., Bosch, Continental"
                        />
                        <Input
                          label="Unit Price ($)"
                          type="number"
                          step="0.01"
                          value={editOffer.unitPrice}
                          onChange={(e) => setEditOffer(prev => ({ ...prev, unitPrice: e.target.value }))}
                          placeholder="0.00"
                        />
                        <Input
                          label="Quantity Available"
                          type="number"
                          value={editOffer.quantityAvailable}
                          onChange={(e) => setEditOffer(prev => ({ ...prev, quantityAvailable: e.target.value }))}
                          placeholder="1"
                        />
                        <div className="md:col-span-2">
                          <Textarea
                            label="Notes (Optional)"
                            value={editOffer.notes}
                            onChange={(e) => setEditOffer(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Additional information about this offer..."
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleEditOffer} size="sm">
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={cancelEditing} size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Display Offer
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-text">{offer.manufacturer}</p>
                        <p className="text-sm text-text/70">
                          Price: ${offer.unitPrice} | Available: {offer.quantityAvailable}
                        </p>
                        {offer.notes && (
                          <p className="text-sm text-text/70">{offer.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(offer)}
                          className="text-xs"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="text-xs text-red-500"
                        >
                          Delete
                        </Button>
                        <span className="text-xs text-text/70">
                          v{offer.version}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="p-3 bg-warn/10 border border-warn/20 rounded-lg">
                <p className="text-warn font-medium">No offers available yet</p>
                <p className="text-sm text-text/70 mt-1">
                  Customers need at least one offer to proceed. Add your first offer now!
                </p>
              </div>
            </div>
          )}

          {/* Add New Offer Form */}
          {isAddingOffer && (
            <div className="p-4 border rounded-lg bg-bg">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-text">Add New Offer</h5>
                <span className="text-sm text-text/70">
                  {orderItem.offers ? orderItem.offers.length + 1 : 1}/3
                </span>
              </div>
              
              {orderItem.offers && orderItem.offers.length === 2 && (
                <div className="mb-3 p-2 bg-warn/10 border border-warn/20 rounded text-sm text-warn">
                  ⚠️ This will be your final offer for this category
                </div>
              )}
              
              {orderItem.offers && orderItem.offers.length === 1 && (
                <div className="mb-3 p-2 bg-info/10 border border-info/20 rounded text-sm text-info">
                  💡 Great! You can add 1 more offer to give customers more choices
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Manufacturer"
                  value={newOffer.manufacturer}
                  onChange={(e) => setNewOffer(prev => ({ ...prev, manufacturer: e.target.value }))}
                  placeholder="e.g., Bosch, Continental"
                />
                <Input
                  label="Unit Price ($)"
                  type="number"
                  step="0.01"
                  value={newOffer.unitPrice}
                  onChange={(e) => setNewOffer(prev => ({ ...prev, unitPrice: e.target.value }))}
                  placeholder="0.00"
                />
                <Input
                  label="Quantity Available"
                  type="number"
                  value={newOffer.quantityAvailable}
                  onChange={(e) => setNewOffer(prev => ({ ...prev, quantityAvailable: e.target.value }))}
                  placeholder="1"
                />
                <div className="md:col-span-2">
                  <Textarea
                    label="Notes (Optional)"
                    value={newOffer.notes}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional information about this offer..."
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddOffer} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Offer
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
