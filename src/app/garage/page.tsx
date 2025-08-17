'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  Car, 
  Trash2, 
  Plus, 
  Search,
  Edit3,
  Calendar,
  Hash
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { HeaderNav } from '@/components/ui/HeaderNav'
import { formatDate } from '@/lib/utils'
import { motionVariants } from '@/lib/motion'

interface GarageVin {
  id: string
  vin: string
  label: string
  createdAt: string
}

export default function GaragePage() {
  const { data: session, status } = useSession()
  const [garageVins, setGarageVins] = useState<GarageVin[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingVin, setEditingVin] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      fetchGarageVins()
    }
  }, [status])

  const fetchGarageVins = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/v1/garage')
      if (response.ok) {
        const data = await response.json()
        setGarageVins(data.garageVins)
      }
    } catch (error) {
      console.error('Error fetching garage VINs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteVin = async (vinId: string) => {
    if (!confirm('Are you sure you want to remove this VIN from your garage?')) return

    try {
      const response = await fetch(`/api/v1/garage/${vinId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setGarageVins(prev => prev.filter(vin => vin.id !== vinId))
      } else {
        alert('Failed to delete VIN')
      }
    } catch (error) {
      console.error('Error deleting VIN:', error)
      alert('Failed to delete VIN')
    }
  }

  const handleEditVin = async (vinId: string) => {
    if (!editLabel.trim()) return

    try {
      const response = await fetch(`/api/v1/garage/${vinId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ label: editLabel.trim() }),
      })

      if (response.ok) {
        setGarageVins(prev => prev.map(vin => 
          vin.id === vinId ? { ...vin, label: editLabel.trim() } : vin
        ))
        setEditingVin(null)
        setEditLabel('')
      } else {
        alert('Failed to update VIN label')
      }
    } catch (error) {
      console.error('Error updating VIN:', error)
      alert('Failed to update VIN label')
    }
  }

  const filteredVins = garageVins.filter(vin =>
    vin.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vin.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-bg">
        <HeaderNav />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-bg">
        <HeaderNav />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text mb-4">My Garage</h1>
            <p className="text-muted mb-8">Please log in to view your saved VINs</p>
            <Button asChild>
              <a href="/login">Log In</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <HeaderNav />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          variants={motionVariants.page}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div 
            variants={motionVariants.quickIn}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-text">My Garage</h1>
              <p className="text-muted mt-1">Manage your saved vehicle VINs</p>
            </div>
            <Button asChild>
              <a href="/wizard">
                <Plus className="h-4 w-4 mr-2" />
                Add New VIN
              </a>
            </Button>
          </motion.div>

          {/* Search */}
          <motion.div variants={motionVariants.quickIn} className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
              <Input
                placeholder="Search VINs or labels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>

          {/* Garage VINs Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredVins.length > 0 ? (
            <motion.div 
              variants={motionVariants.quickIn}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredVins.map((vin) => (
                <Card key={vin.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Car className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-text">{vin.label}</h3>
                          <p className="font-mono text-sm text-muted">{vin.vin}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">Added:</span>
                        <span className="text-text">{formatDate(vin.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingVin(vin.id)
                          setEditLabel(vin.label)
                        }}
                        className="flex-1"
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteVin(vin.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          ) : (
            <motion.div variants={motionVariants.quickIn}>
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-muted mb-4">
                    <Car className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-text mb-2">No VINs in your garage</h3>
                  <p className="text-muted mb-4">
                    {searchTerm 
                      ? 'No VINs match your search'
                      : 'Start building your garage by adding vehicle VINs'
                    }
                  </p>
                  {!searchTerm && (
                    <Button asChild>
                      <a href="/wizard">
                        <Plus className="h-5 w-5 mr-2" />
                        Add Your First VIN
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Edit Modal */}
      {editingVin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-lg w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-text mb-4">Edit VIN Label</h3>
            <Input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              placeholder="Enter a label for this VIN"
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleEditVin(editingVin)}
                className="flex-1"
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingVin(null)
                  setEditLabel('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
