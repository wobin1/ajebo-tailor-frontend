'use client';

import React from 'react';
import { Package, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { getAdminStats, getAdminOrders, getAdminProducts } from '@/services/adminApi';

export default function AdminDashboard() {
  // Fetch admin statistics
  const {
    data: statsResponse,
    isLoading: statsLoading,
    error: statsError
  } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch recent orders
  const {
    data: ordersResponse,
    isLoading: ordersLoading,
    error: ordersError
  } = useQuery({
    queryKey: ['admin-orders', { limit: 5, sort_by: 'created_at', sort_order: 'desc' }],
    queryFn: () => getAdminOrders({ limit: 5, sort_by: 'created_at', sort_order: 'desc' }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch low stock products
  const {
    data: productsResponse,
    isLoading: productsLoading,
    error: productsError
  } = useQuery({
    queryKey: ['admin-products', { limit: 5, sort_by: 'stock_quantity', sort_order: 'asc' }],
    queryFn: () => getAdminProducts({ limit: 5, sort_by: 'stock_quantity', sort_order: 'asc' }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const stats = statsResponse?.data;
  const recentOrders = ordersResponse?.data || [];
  const lowStockProducts = productsResponse?.data?.filter(p => p.stock_quantity <= 10) || [];

  const statsCards = [
    {
      title: 'Total Orders',
      value: stats ? stats.total_orders.toString() : '...',
      icon: ShoppingCart,
      change: stats && stats.orders_change !== undefined ? `${stats.orders_change >= 0 ? '+' : ''}${stats.orders_change.toFixed(1)}%` : '...',
      changeType: stats && stats.orders_change !== undefined && stats.orders_change >= 0 ? 'positive' : 'negative',
    },
    {
      title: 'Pending Orders',
      value: stats ? stats.pending_orders.toString() : '...',
      icon: AlertCircle,
      change: 'Needs attention',
      changeType: stats && stats.pending_orders > 0 ? 'warning' : 'positive',
    },
    {
      title: 'Revenue',
      value: stats ? `$${stats.total_revenue.toLocaleString()}` : '...',
      icon: TrendingUp,
      change: stats && stats.revenue_change !== undefined ? `${stats.revenue_change >= 0 ? '+' : ''}${stats.revenue_change.toFixed(1)}%` : '...',
      changeType: stats && stats.revenue_change !== undefined && stats.revenue_change >= 0 ? 'positive' : 'negative',
    },
    {
      title: 'Delivered Orders',
      value: stats ? stats.delivered_orders.toString() : '...',
      icon: Package,
      change: 'Completed',
      changeType: 'positive',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </CardContent>
            </Card>
          ))
        ) : statsError ? (
          <div className="col-span-full text-center py-8">
            <p className="text-red-500">Failed to load statistics</p>
          </div>
        ) : (
          statsCards.map((stat) => {
            const Icon = stat.icon;
            const changeColor = stat.changeType === 'positive' ? 'text-green-600' : 
                               stat.changeType === 'negative' ? 'text-red-600' : 'text-yellow-600';
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className={`text-xs mt-1 ${changeColor}`}>
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ordersLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                ))
              ) : ordersError ? (
                <p className="text-red-500 text-sm">Failed to load orders</p>
              ) : recentOrders.length > 0 ? (
                recentOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Order #{order.order_number || order.id.slice(-6)}</p>
                      <p className="text-sm text-gray-600">{order.customer_name || order.customer_email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${order.total.toFixed(2)}</p>
                      <p className={`text-sm capitalize ${
                        order.status === 'pending' ? 'text-yellow-600' :
                        order.status === 'delivered' ? 'text-green-600' :
                        order.status === 'cancelled' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productsLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-gray-200 rounded w-12 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))
              ) : productsError ? (
                <p className="text-red-500 text-sm">Failed to load products</p>
              ) : lowStockProducts.length > 0 ? (
                lowStockProducts.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">SKU: {product.sku || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        product.stock_quantity <= 5 ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {product.stock_quantity} left
                      </p>
                      <p className="text-sm text-gray-600">
                        {product.stock_quantity <= 5 ? 'Critical' : 'Low stock'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">All products well stocked</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
