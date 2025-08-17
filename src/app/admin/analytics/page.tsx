'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import {
  BarChart3,
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    total: number;
    transactionCount: number;
    averageOrderValue: number;
  };
  orders: {
    total: number;
    statusBreakdown: Record<string, number>;
  };
  topCategories: Array<{
    categoryId: string;
    categoryName: string;
    categoryPath: string;
    orderCount: number;
    totalQuantity: number;
  }>;
  monthlyRevenue: Array<{
    month: number;
    monthName: string;
    revenue: number;
  }>;
  userGrowth: Array<{
    week: string;
    newUsers: number;
  }>;
  topUpsells: Array<{
    id: string;
    title: string;
    price: number;
    active: boolean;
    orderCount: number;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  period: number;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [selectedReport, setSelectedReport] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`/api/admin/reports?type=${selectedReport}&format=${format}&startDate=${getStartDate()}&endDate=${new Date().toISOString()}`);
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedReport}_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedReport}_report_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report');
    }
  };

  const getStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - parseInt(period));
    return date.toISOString();
  };

  const getPeriodLabel = () => {
    switch (period) {
      case '7': return 'Last 7 days';
      case '30': return 'Last 30 days';
      case '90': return 'Last 90 days';
      case '365': return 'Last year';
      default: return 'Last 30 days';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">Analytics</h1>
            <p className="text-text/70 mt-1">Business insights and performance metrics</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Analytics</h1>
          <p className="text-text/70 mt-1">Business insights and performance metrics</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-text/50 mb-4">
              <BarChart3 className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">No analytics data available</h3>
            <p className="text-text/70">Analytics data will appear here once you have orders and transactions.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { revenue, orders, topCategories, monthlyRevenue, userGrowth, topUpsells } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Analytics</h1>
          <p className="text-text/70 mt-1">Business insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="orders">Orders</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="users">Users</SelectItem>
                <SelectItem value="categories">Categories</SelectItem>
                <SelectItem value="upsells">Upsells</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => exportReport('json')}>
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            <Button variant="outline" onClick={() => exportReport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Period Info */}
      <div className="text-sm text-text/70">
        Showing data for: <span className="font-medium text-text">{getPeriodLabel()}</span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text/70">Total Revenue</p>
                <p className="text-3xl font-bold text-text mt-2">
                  {formatPrice(revenue.total)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 text-sm text-text/70">
              {revenue.transactionCount} transactions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text/70">Total Orders</p>
                <p className="text-3xl font-bold text-text mt-2">
                  {orders.total}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-accent/10">
                <ShoppingBag className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div className="mt-4 text-sm text-text/70">
              Avg: {formatPrice(revenue.averageOrderValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text/70">New Users</p>
                <p className="text-3xl font-bold text-text mt-2">
                  {userGrowth.reduce((sum, week) => sum + week.newUsers, 0)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-success/10">
                <Users className="h-6 w-6 text-success" />
              </div>
            </div>
            <div className="mt-4 text-sm text-text/70">
              This period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text/70">Top Categories</p>
                <p className="text-3xl font-bold text-text mt-2">
                  {topCategories.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-warning/10">
                <BarChart3 className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="mt-4 text-sm text-text/70">
              Active categories
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(orders.statusBreakdown).map(([status, count]) => (
              <div key={status} className="text-center p-4 border border-border rounded-lg">
                <div className="text-2xl font-bold text-text">{count}</div>
                <div className="text-sm text-text/70 capitalize">{status.toLowerCase()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCategories.slice(0, 5).map((category, index) => (
              <div key={category.categoryId} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-text">{category.categoryName}</div>
                    <div className="text-sm text-text/70">{category.categoryPath}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-text">{category.orderCount} orders</div>
                  <div className="text-sm text-text/70">{category.totalQuantity} units</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Upsells */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Upsells</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topUpsells.slice(0, 5).map((upsell, index) => (
              <div key={upsell.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-text">{upsell.title}</div>
                    <div className="text-sm text-text/70">
                      {upsell.active ? 'Active' : 'Inactive'} • {formatPrice(upsell.price)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-text">{upsell.orderCount} orders</div>
                  <div className="text-sm text-text/70">
                    Revenue: {formatPrice(upsell.totalRevenue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {monthlyRevenue.map((month) => {
              const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));
              const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={month.month} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-text/70 mb-2 text-center">
                    {formatPrice(month.revenue)}
                  </div>
                  <div
                    className="w-full bg-primary rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-text/70 mt-2 text-center">
                    {month.monthName}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* User Growth */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {userGrowth.map((week, index) => {
              const maxUsers = Math.max(...userGrowth.map(w => w.newUsers));
              const height = maxUsers > 0 ? (week.newUsers / maxUsers) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-text/70 mb-2 text-center">
                    {week.newUsers} users
                  </div>
                  <div
                    className="w-full bg-success rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-text/70 mt-2 text-center">
                    {week.week}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
