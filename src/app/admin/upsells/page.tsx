'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Gift,
  Tag,
  DollarSign,
  CheckCircle,
  XCircle,
} from 'lucide-react'

interface UpsellItem {
  id: string
  title: string
  imageUrl: string
  price: number
  active: boolean
  tags: string[]
  totalOrders: number
  totalQuantity: number
}

interface UpsellFormData {
  title: string
  imageUrl: string
  price: number
  active: boolean
  tags: string[]
}

export default function UpsellsPage() {
  const [upsellItems, setUpsellItems] = useState<UpsellItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<UpsellItem | null>(null)
  const [formData, setFormData] = useState<UpsellFormData>({
    title: '',
    imageUrl: '',
    price: 0,
    active: true,
    tags: [],
  })
  const [newTag, setNewTag] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchUpsellItems()
  }, [currentPage, searchTerm, statusFilter])

  const fetchUpsellItems = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'ALL') params.append('active', statusFilter === 'ACTIVE' ? 'true' : 'false')

      const response = await fetch(`/api/admin/upsells?${params}`)
      if (!response.ok) throw new Error('Failed to fetch upsell items')
      
      const data = await response.json()
      setUpsellItems(data.items)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching upsell items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingItem 
        ? `/api/admin/upsells/${editingItem.id}`
        : '/api/admin/upsells'
      
      const method = editingItem ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to save upsell item')

      await fetchUpsellItems()
      resetForm()
      setShowForm(false)
    } catch (error) {
      console.error('Error saving upsell item:', error)
      alert('Failed to save upsell item')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this upsell item?')) return

    try {
      const response = await fetch(`/api/admin/upsells/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to delete item')
        return
      }

      await fetchUpsellItems()
    } catch (error) {
      console.error('Error deleting upsell item:', error)
      alert('Failed to delete upsell item')
    }
  }

  const handleEdit = (item: UpsellItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      imageUrl: item.imageUrl,
      price: Number(item.price),
      active: item.active,
      tags: item.tags,
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      imageUrl: '',
      price: 0,
      active: true,
      tags: [],
    })
    setEditingItem(null)
    setNewTag('')
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }))
  }

  const filteredItems = upsellItems.filter(item => {
    if (statusFilter === 'ACTIVE' && !item.active) return false
    if (statusFilter === 'INACTIVE' && item.active) return false
    return true
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">Upsells</h1>
            <p className="text-text/70 mt-1">Manage recommended products and add-ons</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-32 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Upsells</h1>
          <p className="text-text/70 mt-1">Manage recommended products and add-ons</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Upsell Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search upsell items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Upsell Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingItem ? 'Edit Upsell Item' : 'Add New Upsell Item'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Product title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Price (PLN) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text mb-2">Image URL *</label>
                <Input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  required
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="h-4 w-4 text-primary rounded border-2 border-border focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
                <label htmlFor="active" className="text-sm font-medium text-text">
                  Active (visible to customers)
                </label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingItem ? 'Update Item' : 'Create Item'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Upsell Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-video bg-muted relative overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'https://via.placeholder.com/400x300?text=No+Image'
                }}
              />
              <div className="absolute top-2 right-2">
                <Badge variant={item.active ? 'default' : 'secondary'}>
                  {item.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold text-text mb-2 line-clamp-2">{item.title}</h3>
              <div className="text-2xl font-bold text-primary mb-3">
                {formatPrice(item.price)}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-text/70 mb-3">
                <div className="flex items-center gap-1">
                  <Gift className="h-4 w-4" />
                  <span>{item.totalOrders} orders</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{item.totalQuantity} units</span>
                </div>
              </div>

              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(item)}
                  className="flex-1"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-text/70">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-text/50 mb-4">
              <Gift className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">No upsell items found</h3>
            <p className="text-text/70 mb-4">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first upsell item'
              }
            </p>
            {!searchTerm && statusFilter === 'ALL' && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Add First Item
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
