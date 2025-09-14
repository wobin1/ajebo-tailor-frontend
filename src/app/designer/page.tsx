'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, TrendingUp, TrendingDown, XCircle, CheckCircle, Clock, Users, MessageCircle, Scissors, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDesignerStats } from '@/services/statsApi';
import { getUserOrders, Order, getProductsForDesigner, Product } from '@/services/orderApi';
import { createDesignerOrder, DesignerOrderRequest } from '@/services/orderApi';
import { toast } from 'sonner';
import { ComingSoonModal } from '@/components/ComingSoonModal';

export default function DesignerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [comingSoonModal, setComingSoonModal] = useState({ isOpen: false, featureName: '' });
  const queryClient = useQueryClient();
  
  // Modal state
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  
  // Form state
  const [orderForm, setOrderForm] = useState({
    customer_email: '',
    customer_name: '',
    customer_phone: '',
    items: [{
      product_id: '',
      product_name: '',
      quantity: 1,
      size: '',
      color: '',
      price: 0,
      customizations: {}
    }],
    shipping_address: {
      firstName: '',
      lastName: '',
      address1: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      phone: ''
    },
    payment_method: 'cash_on_delivery',
    notes: ''
  });

  // Fetch designer stats from API
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['designer-stats'],
    queryFn: getDesignerStats,
    enabled: !!user,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Fetch recent orders from API
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ['designer-orders'],
    queryFn: () => getUserOrders({ page: 1, limit: 5, sort_by: 'created_at', sort_order: 'desc' }),
    enabled: !!user,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Fetch products for selection
  const {
    data: productsData,
    isLoading: productsLoading,
  } = useQuery({
    queryKey: ['products-for-designer', productSearch],
    queryFn: () => getProductsForDesigner({ 
      search: productSearch || undefined, 
      limit: 50,
      in_stock: true 
    }),
    enabled: !!user && isCreateOrderOpen,
    refetchOnWindowFocus: false,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: createDesignerOrder,
    onSuccess: () => {
      toast.success('Order created successfully!');
      setIsCreateOrderOpen(false);
      // Reset form
      setOrderForm({
        customer_email: '',
        customer_name: '',
        customer_phone: '',
        items: [{
          product_id: '',
          product_name: '',
          quantity: 1,
          size: '',
          color: '',
          price: 0,
          customizations: {}
        }],
        shipping_address: {
          firstName: '',
          lastName: '',
          address1: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'US',
          phone: ''
        },
        payment_method: 'cash_on_delivery',
        notes: ''
      });
      // Refresh orders and stats
      queryClient.invalidateQueries({ queryKey: ['designer-orders'] });
      queryClient.invalidateQueries({ queryKey: ['designer-stats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create order');
    },
  });

  // Fill form with dummy data for testing
  const fillDummyData = () => {
    setOrderForm({
      customer_email: 'john.doe@example.com',
      customer_name: 'John Doe',
      customer_phone: '+1 (555) 123-4567',
      items: [{
        product_id: 'prod_001',
        product_name: 'Custom Business Suit',
        quantity: 1,
        size: 'L',
        color: 'Navy Blue',
        price: 899.99,
        customizations: {}
      }],
      shipping_address: {
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
        phone: '+1 (555) 123-4567'
      },
      payment_method: 'card',
      notes: 'Rush order - needed for business meeting next week. Please ensure perfect fit.'
    });
  };

  // Handle form submission
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!orderForm.customer_email || !orderForm.customer_name || !orderForm.items[0].product_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Create order request
    const orderRequest: DesignerOrderRequest = {
      items: orderForm.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        customizations: item.customizations
      })),
      // Don't include shipping_address_id for designer orders - let backend handle it
      ...(orderForm.payment_method && { payment_method: orderForm.payment_method })
    };

    createOrderMutation.mutate(orderRequest);
  };

  // Create stats array from API data or fallback to defaults
  const stats = statsData?.data ? [
    {
      title: 'Pending Orders',
      value: statsData.data.order_stats.pending_orders.toString(),
      icon: Package,
      change: statsData.data.order_stats.pending_change,
      changeType: 'warning' as const,
    },
    {
      title: 'Shipped Orders',
      value: statsData.data.order_stats.shipped_orders.toString(),
      icon: Truck,
      change: statsData.data.order_stats.shipped_change,
      changeType: 'info' as const,
    },
    {
      title: 'Delivered Orders',
      value: statsData.data.order_stats.delivered_orders.toString(),
      icon: CheckCircle,
      change: statsData.data.order_stats.delivered_change,
      changeType: 'positive' as const,
    },
    {
      title: 'Cancelled Orders',
      value: statsData.data.order_stats.cancelled_orders.toString(),
      icon: XCircle,
      change: statsData.data.order_stats.cancelled_change,
      changeType: 'negative' as const,
    },
  ] : [
    {
      title: 'Pending Orders',
      value: '15',
      icon: Package,
      change: '+3 new today',
      changeType: 'warning' as const,
    },
    {
      title: 'Shipped Orders',
      value: '8',
      icon: Truck,
      change: '2 today',
      changeType: 'info' as const,
    },
    {
      title: 'Delivered Orders',
      value: '42',
      icon: CheckCircle,
      change: '+5 this week',
      changeType: 'positive' as const,
    },
    {
      title: 'Cancelled Orders',
      value: '3',
      icon: XCircle,
      change: '1 this week',
      changeType: 'negative' as const,
    },
  ];

  // Get recent orders from API data or fallback
  const recentOrders = ordersData?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatOrderDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show loading state
  if (statsLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Designer Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your tailoring orders and client communications</p>
        </div>

        {/* Loading Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Designer Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your tailoring orders and client communications</p>
        {statsError && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Unable to load live stats. Showing cached data.
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${
                  stat.changeType === 'positive' ? 'text-green-500' :
                  stat.changeType === 'warning' ? 'text-yellow-500' :
                  stat.changeType === 'negative' ? 'text-red-500' :
                  'text-blue-500'
                }`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className={`text-xs mt-1 ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'warning' ? 'text-yellow-600' :
                  stat.changeType === 'negative' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/designer/orders')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                    <div className="flex justify-between items-start mb-2">
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="h-3 w-24 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order: Order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">
                          #{order.order_number || order.id.slice(0, 8)} - Order {order.id.slice(0, 8)}
                        </p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.items_count || order.items?.length || 0} item(s) - ${order.total_amount}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {formatOrderDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No orders found</p>
                <p className="text-sm text-gray-400 mt-1">Orders will appear here when customers place them</p>
              </div>
            )}
            {ordersError && (
              <div className="text-center py-4">
                <p className="text-sm text-red-600">Unable to load orders</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full justify-start" variant="outline">
                    <Scissors className="h-4 w-4 mr-2" />
                    Create New Order
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <DialogTitle className="text-2xl font-semibold text-gray-900">Create New Order</DialogTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={fillDummyData}
                        className="text-xs"
                      >
                        Fill Sample Data
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">Create a custom order for your client with detailed specifications.</p>
                  </DialogHeader>
                  <form onSubmit={handleCreateOrder} className="space-y-8">
                    {/* Customer Information */}
                    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="customer_name">Customer Name *</Label>
                          <Input
                            id="customer_name"
                            value={orderForm.customer_name}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, customer_name: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="customer_email">Email *</Label>
                          <Input
                            id="customer_email"
                            type="email"
                            value={orderForm.customer_email}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, customer_email: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="customer_phone">Phone</Label>
                        <Input
                          id="customer_phone"
                          value={orderForm.customer_phone}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, customer_phone: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Product Information */}
                    <div className="bg-blue-50 p-6 rounded-lg space-y-4">
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Product Information</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="product_search">Search Products *</Label>
                          <Input
                            id="product_search"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            placeholder="Search for products..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="product_select">Select Product *</Label>
                          <Select
                            value={orderForm.items[0].product_id}
                            onValueChange={(value) => {
                              const selectedProduct = productsData?.data.find((p: Product) => p.id === value);
                              setOrderForm(prev => ({
                                ...prev,
                                items: [{
                                  ...prev.items[0],
                                  product_id: value,
                                  product_name: selectedProduct?.name || '',
                                  price: selectedProduct?.price || 0
                                }]
                              }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                            <SelectContent>
                              {productsLoading ? (
                                <SelectItem value="loading" disabled>Loading products...</SelectItem>
                              ) : productsData?.data?.length ? (
                                productsData.data.map((product: Product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} - ${product.price}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-products" disabled>No products found</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        {orderForm.items[0].product_id && (
                          <div className="p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-600">
                              Selected: <span className="font-medium">{orderForm.items[0].product_name}</span> - ${orderForm.items[0].price}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={orderForm.items[0].quantity}
                            onChange={(e) => setOrderForm(prev => ({
                              ...prev,
                              items: [{ ...prev.items[0], quantity: parseInt(e.target.value) || 1 }]
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="size">Size</Label>
                          <Input
                            id="size"
                            value={orderForm.items[0].size}
                            onChange={(e) => setOrderForm(prev => ({
                              ...prev,
                              items: [{ ...prev.items[0], size: e.target.value }]
                            }))}
                            placeholder="e.g., M, L, XL"
                          />
                        </div>
                        <div>
                          <Label htmlFor="color">Color</Label>
                          <Input
                            id="color"
                            value={orderForm.items[0].color}
                            onChange={(e) => setOrderForm(prev => ({
                              ...prev,
                              items: [{ ...prev.items[0], color: e.target.value }]
                            }))}
                            placeholder="e.g., Navy, Black"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-green-50 p-6 rounded-lg space-y-4">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={orderForm.shipping_address.firstName}
                            onChange={(e) => setOrderForm(prev => ({
                              ...prev,
                              shipping_address: { ...prev.shipping_address, firstName: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={orderForm.shipping_address.lastName}
                            onChange={(e) => setOrderForm(prev => ({
                              ...prev,
                              shipping_address: { ...prev.shipping_address, lastName: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="address1">Address</Label>
                        <Input
                          id="address1"
                          value={orderForm.shipping_address.address1}
                          onChange={(e) => setOrderForm(prev => ({
                            ...prev,
                            shipping_address: { ...prev.shipping_address, address1: e.target.value }
                          }))}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={orderForm.shipping_address.city}
                            onChange={(e) => setOrderForm(prev => ({
                              ...prev,
                              shipping_address: { ...prev.shipping_address, city: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={orderForm.shipping_address.state}
                            onChange={(e) => setOrderForm(prev => ({
                              ...prev,
                              shipping_address: { ...prev.shipping_address, state: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            value={orderForm.shipping_address.zipCode}
                            onChange={(e) => setOrderForm(prev => ({
                              ...prev,
                              shipping_address: { ...prev.shipping_address, zipCode: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-yellow-50 p-6 rounded-lg space-y-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-yellow-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
                      </div>
                      <Select
                        value={orderForm.payment_method}
                        onValueChange={(value) => setOrderForm(prev => ({ ...prev, payment_method: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                          <SelectItem value="card">Credit Card</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Notes */}
                    <div className="bg-purple-50 p-6 rounded-lg space-y-4">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Additional Notes</h3>
                      </div>
                      <div>
                        <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Special Instructions</Label>
                        <Textarea
                          id="notes"
                          value={orderForm.notes}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Add any special instructions, measurements, or customization details..."
                          rows={4}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        * Required fields must be filled
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateOrderOpen(false)}
                          className="px-6"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createOrderMutation.isPending}
                          className="px-6 bg-blue-600 hover:bg-blue-700"
                        >
                          {createOrderMutation.isPending ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Creating...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Scissors className="h-4 w-4" />
                              <span>Create Order</span>
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setComingSoonModal({ isOpen: true, featureName: 'Schedule Fitting' })}
              >
                <Clock className="h-4 w-4 mr-2" />
                Schedule Fitting
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setComingSoonModal({ isOpen: true, featureName: 'Add New Client' })}
              >
                <Users className="h-4 w-4 mr-2" />
                Add New Client
              </Button>
              
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      {/* <Card className="mt-6">
        <CardHeader>
          <CardTitle>Today&apos;s Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div>
                <p className="font-medium text-blue-900">10:00 AM - Fitting Appointment</p>
                <p className="text-sm text-blue-700">John Doe - Custom Suit measurements</p>
              </div>
              <Button size="sm" variant="outline">
                Mark Complete
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
              <div>
                <p className="font-medium text-yellow-900">2:00 PM - Delivery</p>
                <p className="text-sm text-yellow-700">Mike Johnson - Casual Shirt pickup</p>
              </div>
              <Button size="sm" variant="outline">
                Mark Complete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card> */}
      
      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={comingSoonModal.isOpen}
        onClose={() => setComingSoonModal({ isOpen: false, featureName: '' })}
        featureName={comingSoonModal.featureName}
      />
    </div>
  );
}
