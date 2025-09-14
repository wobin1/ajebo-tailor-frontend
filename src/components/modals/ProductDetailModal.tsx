'use client';

import React from 'react';
import Image from 'next/image';
import { Package, Calendar, DollarSign, Hash, Palette, Ruler, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Order, OrderItem } from '@/services/orderApi';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  isUpdating?: boolean;
  isLoading?: boolean;
  error?: Error | null;
}

export default function ProductDetailModal({ 
  isOpen, 
  onClose, 
  order, 
  onStatusUpdate,
  isUpdating = false,
  isLoading = false,
  error = null
}: ProductDetailModalProps) {

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      case 'urgent': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (order) {
      onStatusUpdate(order.id, newStatus);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Order Details
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {order?.order_number || 'Loading...'}
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {isLoading && (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading order details</h3>
            <p className="text-gray-600">{error.message}</p>
          </div>
        )}

        {/* Order Content - Only show when not loading and no error */}
        {!isLoading && !error && order && (
          <>
        {/* Order Summary */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                  <Hash className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Order ID</p>
                  <p className="font-semibold text-gray-900">{order.order_number}</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="font-semibold text-gray-900">${order.total}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Order Date</p>
                  <p className="font-semibold text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
                  <Package className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Items</p>
                  <p className="font-semibold text-gray-900">{order.items_count || order.items?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status and Priority */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Status:</span>
              <Badge className={getStatusColor(order.status || '')}>
                {order.status?.replace('_', ' ') || 'N/A'}
              </Badge>
            </div>
            {order.priority && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Priority:</span>
                <Badge className={getPriorityColor(order.priority)}>
                  {order.priority} priority
                </Badge>
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="font-semibold text-gray-900">{order.customer_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">{order.customer_email || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
          
          {order.items && order.items.length > 0 ? (
            <div className="space-y-4">
              {order.items.map((item: OrderItem, index: number) => (
                <div key={index} className="rounded-lg border bg-white p-4 shadow-sm">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                      {item.product_image ? (
                        <Image 
                          src={item.product_image} 
                          alt={item.product_name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-gray-400" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.product_name}</h4>
                          <p className="text-sm text-gray-600">Product ID: {item.product_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${item.product_price}</p>
                          <p className="text-sm text-gray-600">per item</p>
                        </div>
                      </div>

                      {/* Product Attributes */}
                      <div className="flex flex-wrap gap-4 mt-3">
                        <div className="flex items-center space-x-2">
                          <Hash className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                        </div>
                        
                        {item.size && (
                          <div className="flex items-center space-x-2">
                            <Ruler className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Size: {item.size}</span>
                          </div>
                        )}
                        
                        {item.color && (
                          <div className="flex items-center space-x-2">
                            <Palette className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Color: {item.color}</span>
                          </div>
                        )}
                      </div>

                      {/* Customizations */}
                      {item.customizations && Object.keys(item.customizations).length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">Customizations:</p>
                          <div className="bg-gray-50 rounded p-2 mt-1">
                            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                              {JSON.stringify(item.customizations, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Item Total */}
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Subtotal ({item.quantity} items)</span>
                          <span className="font-semibold text-gray-900">
                            ${order.subtotal}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No product details available</p>
            </div>
          )}

          {/* Order Totals */}
          <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">${order.tax_amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium">${order.shipping_amount}</span>
              </div>
              {order.discount_amount && order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span className="font-medium">-${order.discount_amount}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>${order.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Status Update */}
        <div className="border-t bg-gray-50 p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-500 mb-2">Update Order Status</p>
              <select
                value={order.status || ''}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdating}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="flex justify-center">
              <Button onClick={onClose} className="w-full sm:w-auto">
                Close
              </Button>
            </div>
          </div>
        </div>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
}
