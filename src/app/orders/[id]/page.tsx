'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, Package, Truck, CreditCard, MessageCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getOrder, OrderItem, OrderResponse } from '@/services/orderApi';

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);

  const orderId = params.id as string;
  const isSuccess = searchParams.get('success') === 'true';

  // Show success message if redirected from checkout
  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      // Remove success param from URL after showing message
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      window.history.replaceState({}, '', url.toString());
    }
  }, [isSuccess]);

  // Fetch order details
  const {
    data: orderData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
    enabled: !!user && !!orderId,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Handle query success and error states
  useEffect(() => {
    if (error) {
      console.error('Order fetch error:', error);
    }
  }, [error]);

  useEffect(() => {
    if (orderData) {
      console.log('Order data received:', orderData);
    }
  }, [orderData]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/orders');
    }
  }, [user, router]);

  const order = orderData?.data;

  // Debug logging
  console.log('Order query state:', { orderData, isLoading, error, order });

  // Early returns for loading and error states
  if (!user) return null;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading order details...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !order) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-4">The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
            {error && (
              <p className="text-red-600 mb-8 text-sm">Error: {(error as Error).message}</p>
            )}
            <Button onClick={() => router.push('/orders')}>View All Orders</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // At this point, TypeScript knows order is defined

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading order details...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || (!isLoading && !order)) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-4">The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
            {error && (
              <p className="text-red-600 mb-8 text-sm">Error: {(error as Error).message}</p>
            )}
            <Button onClick={() => router.push('/orders')}>View All Orders</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // At this point, order is guaranteed to be defined due to the check above

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    if (!status) return <Package className="w-4 h-4" />;
    
    switch (status.toLowerCase()) {
      case 'pending':
        return <CreditCard className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">Order Placed Successfully!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Thank you for your order. We&apos;ll send you updates as your order is processed.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  // Generate random vendor number for demo
                  const vendorNumber = Math.floor(Math.random() * 9000) + 1000;
                  window.open(`https://wa.me/${vendorNumber}?text=Hi, I just placed an order (${order.id}) and would like to discuss the details.`, '_blank');
                }}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
                size="sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Vendor</span>
              </Button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/orders')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Orders</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
              <p className="text-sm text-gray-500">
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
            {getStatusIcon(order.status)}
            <span className="capitalize">{order.status}</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items && order.items.length > 0 ? order.items.map((item: OrderItem) => (
                    <div key={item.id} className="flex space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        {item.product_image && (
                          <Image
                            src={item.product_image}
                            alt={item.product_name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.product_name}
                        </h3>
                        <div className="mt-1 text-sm text-gray-500">
                          <p>Size: {item.size}</p>
                          <p>Color: {item.color}</p>
                          <p>Quantity: {item.quantity}</p>
                        </div>
                        <p className="mt-2 text-sm font-medium text-gray-900">
                          ${(Number(item.product_price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No items found in this order.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${Number(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>${Number(order.shipping_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${Number(order.tax_amount || 0).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${Number(order.total_amount || order.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {order.shipping_address && Object.keys(order.shipping_address).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-900">
                      {order.shipping_address.firstName} {order.shipping_address.lastName}
                    </p>
                    <p>{order.shipping_address.address1}</p>
                    {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
                    </p>
                    <p>{order.shipping_address.country}</p>
                    {order.shipping_address.phone && <p>Phone: {order.shipping_address.phone}</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {order.payment_method?.type === 'card' ? 'Credit Card' : 'Payment Method'}
                    </p>
                    {order.payment_method?.last4 && (
                      <p className="text-gray-600">**** **** **** {order.payment_method.last4}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Order Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => {
                    // Generate random vendor number for demo
                    const vendorNumber = Math.floor(Math.random() * 9000) + 1000;
                    window.open(`https://wa.me/${vendorNumber}?text=Hi, I have a question about my order (${order.id}). Can you help me?`, '_blank');
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat Vendor</span>
                </Button>
                {order.status === 'pending' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (confirm('Are you sure you want to cancel this order?')) {
                        // TODO: Implement cancel order functionality
                        console.log('Cancel order:', order.id);
                      }
                    }}
                  >
                    Cancel Order
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
