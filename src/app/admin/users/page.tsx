'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Shield,
  User,
  Users,
  Search,
  Filter,
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'USER' | 'STAFF' | 'ADMIN'
  emailVerified: string | null
  createdAt: string
  updatedAt: string
  _count: {
    orderRequests: number
    orderComments: number
    notifications: number
  }
}

interface UserFormData {
  name: string
  email: string
  role: 'USER' | 'STAFF' | 'ADMIN'
  password: string
}

interface RoleStats {
  USER: number
  STAFF: number
  ADMIN: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'USER',
    password: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [roleStats, setRoleStats] = useState<RoleStats>({ USER: 0, STAFF: 0, ADMIN: 0 })

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (roleFilter !== 'ALL') params.append('role', roleFilter)

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) throw new Error('Nie udało się pobrać użytkowników')
      
      const data = await response.json()
      setUsers(data.users)
      setTotalPages(data.totalPages)
      setRoleStats(data.roleStats)
    } catch (error) {
      console.error('Błąd podczas pobierania użytkowników:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Nie udało się utworzyć użytkownika')

      await fetchUsers()
      resetForm()
      setShowForm(false)
    } catch (error) {
      console.error('Błąd podczas tworzenia użytkownika:', error)
      alert('Nie udało się utworzyć użytkownika')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tego użytkownika? Tej akcji nie można cofnąć.')) return

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Nie udało się usunąć użytkownika')
        return
      }

      await fetchUsers()
    } catch (error) {
      console.error('Błąd podczas usuwania użytkownika:', error)
      alert('Nie udało się usunąć użytkownika')
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name || '',
      email: user.email,
      role: user.role,
      password: '',
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'USER',
      password: '',
    })
    setEditingUser(null)
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'destructive'
      case 'STAFF': return 'default'
      case 'USER': return 'secondary'
      default: return 'secondary'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield className="h-4 w-4" />
      case 'STAFF': return <User className="h-4 w-4" />
      case 'USER': return <Users className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const filteredUsers = users.filter(user => {
    if (roleFilter === 'ALL') return true
    return user.role === roleFilter
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">Użytkownicy</h1>
            <p className="text-text/70 mt-1">Zarządzaj kontami użytkowników i uprawnieniami</p>
          </div>
        </div>
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Użytkownicy</h1>
          <p className="text-text/70 mt-1">Zarządzaj kontami użytkowników i uprawnieniami</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Dodaj Użytkownika
        </Button>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-secondary/10">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text/70">Zwykli Użytkownicy</p>
                <p className="text-2xl font-bold text-text">{roleStats.USER}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text/70">Pracownicy</p>
                <p className="text-2xl font-bold text-text">{roleStats.STAFF}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-destructive/10">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-text/70">Administratorzy</p>
                <p className="text-2xl font-bold text-text">{roleStats.ADMIN}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text/50" />
          <Input
            placeholder="Szukaj użytkowników..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Wszystkie Role</SelectItem>
            <SelectItem value="USER">Użytkownicy</SelectItem>
            <SelectItem value="STAFF">Pracownicy</SelectItem>
            <SelectItem value="ADMIN">Administratorzy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingUser ? 'Edytuj Użytkownika' : 'Dodaj Nowego Użytkownika'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Imię *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Pełne imię"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Email *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    placeholder="użytkownik@przykład.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Rola *</label>
                  <Select value={formData.role} onValueChange={(value: 'USER' | 'STAFF' | 'ADMIN') => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Użytkownik</SelectItem>
                      <SelectItem value="STAFF">Pracownik</SelectItem>
                      <SelectItem value="ADMIN">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Hasło *</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingUser ? 'Zaktualizuj Użytkownika' : 'Utwórz Użytkownika'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}>
                  Anuluj
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {getRoleIcon(user.role)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text">{user.name || 'Bezimienny Użytkownik'}</h3>
                    <p className="text-sm text-text/70">{user.email}</p>
                  </div>
                </div>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role}
                </Badge>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text/70">Zamówienia:</span>
                  <span className="font-medium text-text">{user._count.orderRequests}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text/70">Komentarze:</span>
                  <span className="font-medium text-text">{user._count.orderComments}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text/70">Powiadomienia:</span>
                  <span className="font-medium text-text">{user._count.notifications}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text/70">Dołączył:</span>
                  <span className="font-medium text-text">{formatDate(user.createdAt)}</span>
                </div>
                {user.emailVerified && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text/70">Zweryfikowany:</span>
                    <span className="font-medium text-text">{formatDate(user.emailVerified)}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(user)}
                  className="flex-1"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edytuj
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(user.id)}
                  className="text-destructive hover:text-destructive"
                  disabled={user.role === 'ADMIN'}
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
            Poprzednia
          </Button>
          <span className="text-sm text-text/70">
            Strona {currentPage} z {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Następna
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredUsers.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-text/50 mb-4">
              <Users className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">Nie znaleziono użytkowników</h3>
            <p className="text-text/70 mb-4">
              {searchTerm || roleFilter !== 'ALL' 
                ? 'Spróbuj dostosować wyszukiwanie lub filtry'
                : 'Zacznij od utworzenia pierwszego konta użytkownika'
              }
            </p>
            {!searchTerm && roleFilter === 'ALL' && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Dodaj Pierwszego Użytkownika
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
