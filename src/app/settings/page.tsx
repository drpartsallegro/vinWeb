'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { HeaderNav } from '@/components/ui/HeaderNav'
import { motionVariants } from '@/lib/motion'
import { 
  User, 
  Shield, 
  LogOut,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    // TODO: Implement save functionality
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text mb-4">Please log in to access settings</h1>
          <Button asChild>
            <a href="/login">Go to Login</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <HeaderNav />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          variants={motionVariants.page}
          initial="hidden"
          animate="visible"
        >
          {/* Page Header */}
          <motion.div 
            variants={motionVariants.quickIn}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-text mb-4">Settings</h1>
            <p className="text-lg text-muted">
              Manage your account information and security
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Settings */}
            <motion.div variants={motionVariants.quickIn}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Input
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Input
                      label="Email Address"
                      type="email"
                      value={session.user.email || ''}
                      placeholder="your.email@example.com"
                      disabled
                    />
                    <p className="text-xs text-muted mt-1">
                      Email address cannot be changed
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Password Settings */}
            <motion.div variants={motionVariants.quickIn}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Password & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Input
                      label="Current Password"
                      type={showPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <Input
                      label="New Password"
                      type={showPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <Input
                      label="Confirm New Password"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showPassword ? 'Hide' : 'Show'} Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div 
            variants={motionVariants.quickIn}
            className="flex flex-col sm:flex-row gap-4 mt-8"
          >
            <Button 
              onClick={handleSave} 
              loading={isLoading}
              className="flex-1 sm:flex-none"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => signOut()}
              className="flex-1 sm:flex-none"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
