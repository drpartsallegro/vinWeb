'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { 
  Download, 
  FileText, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  Calendar,
  BarChart3
} from 'lucide-react';

interface ReportData {
  orders?: any[];
  revenue?: any[];
  users?: any[];
  categories?: any[];
  upsells?: any[];
}

interface ReportStats {
  totalCount: number;
  totalValue?: number;
  averageValue?: number;
  topItems?: Array<{ name: string; count: number; value?: number }>;
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState('orders');
  const [dateRange, setDateRange] = useState('30');
  const [reportData, setReportData] = useState<ReportData>({});
  const [reportStats, setReportStats] = useState<ReportStats>({ totalCount: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  const reportTypes = [
    { value: 'orders', label: 'Orders Report', icon: Package },
    { value: 'revenue', label: 'Revenue Report', icon: DollarSign },
    { value: 'users', label: 'Users Report', icon: Users },
    { value: 'categories', label: 'Categories Report', icon: BarChart3 },
    { value: 'upsells', label: 'Upsells Report', icon: TrendingUp }
  ];

  const dateRanges = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: '365', label: 'Last year' },
    { value: 'all', label: 'All time' }
  ];

  useEffect(() => {
    generateReport();
  }, [reportType, dateRange]);

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/reports?reportType=${reportType}&dateRange=${dateRange}`);
      if (!response.ok) throw new Error('Failed to generate report');
      
      const data = await response.json();
      setReportData(data);
      
      // Calculate stats based on report type
      let stats: ReportStats = { totalCount: 0 };
      
      switch (reportType) {
        case 'orders':
          stats = {
            totalCount: data.orders?.length || 0,
            totalValue: data.orders?.reduce((sum: number, order: any) => sum + (order.total || 0), 0) || 0,
            averageValue: data.orders?.length ? (data.orders?.reduce((sum: number, order: any) => sum + (order.total || 0), 0) || 0) / data.orders?.length : 0,
            topItems: data.orders?.reduce((acc: any[], order: any) => {
              const category = order.category || 'Unknown';
              const existing = acc.find(item => item.name === category);
              if (existing) {
                existing.count++;
                existing.value = (existing.value || 0) + (order.total || 0);
              } else {
                acc.push({ name: category, count: 1, value: order.total || 0 });
              }
              return acc;
            }, []).sort((a: any, b: any) => b.count - a.count).slice(0, 5) || []
          };
          break;
        case 'revenue':
          stats = {
            totalCount: data.revenue?.length || 0,
            totalValue: data.revenue?.reduce((sum: number, rev: any) => sum + (rev.amount || 0), 0) || 0,
            averageValue: data.revenue?.length ? (data.revenue?.reduce((sum: number, rev: any) => sum + (rev.amount || 0), 0) || 0) / data.revenue?.length : 0,
            topItems: data.revenue?.reduce((acc: any[], rev: any) => {
              const month = rev.month || 'Unknown';
              const existing = acc.find(item => item.name === month);
              if (existing) {
                existing.count++;
                existing.value = (existing.value || 0) + (rev.amount || 0);
              } else {
                acc.push({ name: month, count: 1, value: rev.amount || 0 });
              }
              return acc;
            }, []).sort((a: any, b: any) => b.value - a.value).slice(0, 5) || []
          };
          break;
        case 'users':
          stats = {
            totalCount: data.users?.length || 0,
            topItems: data.users?.reduce((acc: any[], user: any) => {
              const role = user.role || 'Unknown';
              const existing = acc.find(item => item.name === role);
              if (existing) {
                existing.count++;
              } else {
                acc.push({ name: role, count: 1 });
              }
              return acc;
            }, []).sort((a: any, b: any) => b.count - a.count) || []
          };
          break;
        case 'categories':
          stats = {
            totalCount: data.categories?.length || 0,
            topItems: data.categories?.sort((a: any, b: any) => (b.orderCount || 0) - (a.orderCount || 0)).slice(0, 5) || []
          };
          break;
        case 'upsells':
          stats = {
            totalCount: data.upsells?.length || 0,
            totalValue: data.upsells?.reduce((sum: number, upsell: any) => sum + (upsell.totalRevenue || 0), 0) || 0,
            topItems: data.upsells?.sort((a: any, b: any) => (b.totalOrders || 0) - (a.totalOrders || 0)).slice(0, 5) || []
          };
          break;
      }
      
      setReportStats(stats);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await fetch(`/api/admin/reports?reportType=${reportType}&dateRange=${dateRange}&format=${exportFormat}`);
      if (!response.ok) throw new Error('Failed to export report');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report_${dateRange}_days.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const renderReportContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (reportType) {
      case 'orders':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Orders</span>
                  </div>
                  <p className="text-2xl font-bold">{reportStats.totalCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Revenue</span>
                  </div>
                  <p className="text-2xl font-bold">${reportStats.totalValue?.toFixed(2) || '0.00'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Average Order</span>
                  </div>
                  <p className="text-2xl font-bold">${reportStats.averageValue?.toFixed(2) || '0.00'}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Categories by Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportStats.topItems?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">{item.count} orders</span>
                        {item.value && (
                          <span className="text-sm font-medium">${item.value.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.orders?.slice(0, 10).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={order.status === 'COMPLETED' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                        <span className="font-medium">#{order.shortCode}</span>
                        <span className="text-sm text-muted-foreground">{order.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.total?.toFixed(2) || '0.00'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'revenue':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Revenue</span>
                  </div>
                  <p className="text-2xl font-bold">${reportStats.totalValue?.toFixed(2) || '0.00'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Average Revenue</span>
                  </div>
                  <p className="text-2xl font-bold">${reportStats.averageValue?.toFixed(2) || '0.00'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Period</span>
                  </div>
                  <p className="text-2xl font-bold">{dateRange === 'all' ? 'All Time' : `${dateRange} days`}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.revenue?.map((month: any) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">{month.month}</span>
                        <Badge variant="outline">{month.orderCount} orders</Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${month.amount?.toFixed(2) || '0.00'}</p>
                        <div className="w-32">
                          <ProgressBar 
                            value={month.amount ? (month.amount / (reportStats.totalValue || 1)) * 100 : 0} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Users</span>
                  </div>
                  <p className="text-2xl font-bold">{reportStats.totalCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Active Users</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {reportData.users?.filter((u: any) => u.lastLoginAt && new Date(u.lastLoginAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">New This Period</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {reportData.users?.filter((u: any) => {
                      if (dateRange === 'all') return true;
                      const days = parseInt(dateRange);
                      return new Date(u.createdAt) > new Date(Date.now() - days * 24 * 60 * 60 * 1000);
                    }).length || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Users by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportStats.topItems?.map((role) => (
                    <div key={role.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant={role.name === 'ADMIN' ? 'default' : 'secondary'}>
                          {role.name}
                        </Badge>
                        <span className="font-medium">{role.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{role.count} users</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.users?.slice(0, 10).map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <span className="font-medium">{user.name}</span>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.orderCount || 0} orders
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'categories':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Categories</span>
                  </div>
                  <p className="text-2xl font-bold">{reportStats.totalCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Active Categories</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {reportData.categories?.filter((c: any) => c.active).length || 0}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Orders</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {reportData.categories?.reduce((sum: number, cat: any) => sum + (cat.orderCount || 0), 0) || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportStats.topItems?.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <span className="font-medium">{category.name}</span>
                        <Badge variant={category.active ? 'default' : 'secondary'}>
                          {category.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{category.orderCount || 0} orders</p>
                        <p className="text-sm text-muted-foreground">
                          {category.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'upsells':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Upsells</span>
                  </div>
                  <p className="text-2xl font-bold">{reportStats.totalCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Revenue</span>
                  </div>
                  <p className="text-2xl font-bold">${reportStats.totalValue?.toFixed(2) || '0.00'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Active Items</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {reportData.upsells?.filter((u: any) => u.active).length || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Upsells</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportStats.topItems?.map((upsell, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <span className="font-medium">{upsell.title}</span>
                        <Badge variant={upsell.active ? 'default' : 'secondary'}>
                          {upsell.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{upsell.totalOrders || 0} orders</p>
                        <p className="text-sm text-muted-foreground">
                          ${upsell.totalRevenue?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upsell Performance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.upsells?.map((upsell: any) => (
                    <div key={upsell.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={upsell.active ? 'default' : 'secondary'}>
                          {upsell.active ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="font-medium">{upsell.title}</span>
                        <span className="text-sm text-muted-foreground">${upsell.price}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{upsell.totalOrders || 0} orders</p>
                        <p className="text-sm text-muted-foreground">
                          ${upsell.totalRevenue?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Select a report type to generate</h3>
            <p className="text-muted-foreground">Choose from the options above to view detailed reports</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and export detailed reports about your business performance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Report Type</label>
          <Select
            value={reportType}
            onValueChange={setReportType}
            options={reportTypes.map(type => ({
              value: type.value,
              label: type.label
            }))}
            placeholder="Select report type"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <Select
            value={dateRange}
            onValueChange={setDateRange}
            options={dateRanges.map(range => ({
              value: range.value,
              label: range.label
            }))}
            placeholder="Select date range"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Export Format</label>
          <Select
            value={exportFormat}
            onValueChange={(value: string) => setExportFormat(value as 'json' | 'csv')}
            options={[
              { value: 'json', label: 'JSON' },
              { value: 'csv', label: 'CSV' }
            ]}
            placeholder="Select format"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          onClick={generateReport}
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? 'Generating...' : 'Refresh Report'}
        </Button>
        <Button
          onClick={exportReport}
          disabled={isLoading || !reportData[reportType as keyof ReportData]}
        >
          <Download className="h-4 w-4 mr-2" />
          Export {exportFormat.toUpperCase()}
        </Button>
      </div>

      {renderReportContent()}
    </div>
  );
}
