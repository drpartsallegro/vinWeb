'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Database, 
  Globe, 
  CreditCard, 
  Bell, 
  Truck,
  Shield,
  Activity,
  Users,
  Package,
  TrendingUp,
  FileText
} from 'lucide-react';

interface ShopConfig {
  id: string;
  freeShippingThreshold: number;
  couponsEnabled: boolean;
  allowPartialAcceptance: boolean;
  requireSameEmailAtCheckout: boolean;
  requirePhone: boolean;
  quoteExpiryHours: number;
  shippingFreeQualifiers: string[];
  paymentProviders: any;
  notifications: any;
  brand: any;
  seo: any;
  updatedAt: string;
}

interface SystemStats {
  totalUsers: number;
  totalOrders: number;
  totalCategories: number;
  totalUpsells: number;
  totalNotifications: number;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<ShopConfig | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalCategories: 0,
    totalUpsells: 0,
    totalNotifications: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setConfig(data.shopConfig);
      setSystemStats(data.systemStats);
      setError(null);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to load settings');
      
      // Set fallback configuration
      setConfig({
        id: 'fallback',
        freeShippingThreshold: 500,
        couponsEnabled: true,
        allowPartialAcceptance: true,
        requireSameEmailAtCheckout: true,
        requirePhone: true,
        quoteExpiryHours: 24,
        shippingFreeQualifiers: ['INPOST_LOCKER', 'INPOST_COURIER', 'DPD', 'DHL', 'POCZTA'],
        paymentProviders: {
          p24Enabled: true,
          manualEnabled: true,
          codEnabled: true,
          p24Sandbox: false,
        },
        notifications: {
          emailOnValuated: true,
          emailOnPaid: true,
          emailOnCommentToUser: true,
          emailOnCommentToAdmin: true,
        },
        brand: {
          siteTitle: 'PartsFlow - Premium Auto Parts',
          metaDescription: 'VIN-based auto parts ordering platform',
          logoUrl: '/logo.png',
          themeColor: '#3B82F6',
        },
        seo: {
          canonicalBaseUrl: 'http://localhost:3000',
          sitemapEnabled: true,
          robotsPolicy: 'allow',
          jsonLdEnabled: true,
        },
        updatedAt: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: 'shop',
          config: {
            freeShippingThreshold: config.freeShippingThreshold,
            couponsEnabled: config.couponsEnabled,
            allowPartialAcceptance: config.allowPartialAcceptance,
            requireSameEmailAtCheckout: config.requireSameEmailAtCheckout,
            requirePhone: config.requirePhone,
            quoteExpiryHours: config.quoteExpiryHours,
            shippingFreeQualifiers: config.shippingFreeQualifiers,
            paymentProviders: config.paymentProviders,
            notifications: config.notifications,
            brand: config.brand,
            seo: config.seo,
          }
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update settings');
      
      alert('Settings updated successfully');
      await fetchSettings(); // Refresh data
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (field: keyof ShopConfig, value: any) => {
    if (!config) return;
    
    setConfig({
      ...config,
      [field]: value
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">No configuration found</h3>
        <p className="text-muted-foreground">Please check your database connection</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your shop configuration and system settings
          </p>
        </div>
        <Button onClick={fetchSettings} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <Settings className="h-4 w-4" />
              <span className="font-medium">Configuration Error:</span>
              <span>{error}</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              Using fallback configuration. Some features may be limited.
            </p>
          </CardContent>
        </Card>
      )}

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <p className="text-2xl font-bold">{systemStats.totalUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Total Orders</span>
            </div>
            <p className="text-2xl font-bold">{systemStats.totalOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium">Categories</span>
            </div>
            <p className="text-2xl font-bold">{systemStats.totalCategories}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Upsells</span>
            </div>
            <p className="text-2xl font-bold">{systemStats.totalUpsells}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium">Notifications</span>
            </div>
            <p className="text-2xl font-bold">{systemStats.totalNotifications}</p>
          </CardContent>
        </Card>
      </div>

      {/* Shop Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Shop Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Free Shipping Threshold</label>
              <Input
                type="number"
                value={config.freeShippingThreshold}
                onChange={(e) => updateConfig('freeShippingThreshold', parseFloat(e.target.value) || 0)}
                placeholder="500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quote Expiry Hours</label>
              <Input
                type="number"
                value={config.quoteExpiryHours}
                onChange={(e) => updateConfig('quoteExpiryHours', parseInt(e.target.value) || 24)}
                placeholder="24"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.couponsEnabled}
                onChange={(e) => updateConfig('couponsEnabled', e.target.checked)}
                className="h-4 w-4"
              />
              <label className="text-sm font-medium">Enable Coupons</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.allowPartialAcceptance}
                onChange={(e) => updateConfig('allowPartialAcceptance', e.target.checked)}
                className="h-4 w-4"
              />
              <label className="text-sm font-medium">Allow Partial Acceptance</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.requireSameEmailAtCheckout}
                onChange={(e) => updateConfig('requireSameEmailAtCheckout', e.target.checked)}
                className="h-4 w-4"
              />
              <label className="text-sm font-medium">Require Same Email at Checkout</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.requirePhone}
                onChange={(e) => updateConfig('requirePhone', e.target.checked)}
                className="h-4 w-4"
              />
              <label className="text-sm font-medium">Require Phone Number</label>
            </div>
          </div>

          {/* Save Button */}
          <Button onClick={handleSaveConfig} disabled={isSaving} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </CardContent>
      </Card>

      {/* Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Configuration Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Configuration ID:</span>
              <Badge variant="outline">{config.id}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Last Updated:</span>
              <Badge variant="outline">
                {new Date(config.updatedAt).toLocaleDateString()}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={error ? 'destructive' : 'default'}>
                {error ? 'Fallback Mode' : 'Database Connected'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
