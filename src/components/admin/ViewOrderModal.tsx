'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Package, CreditCard, MapPin, Mail } from 'lucide-react';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  size?: string;
  color?: string;
  product_price: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number?: string;
  user_id: string;
  customer_name?: string;
  customer_email?: string;
  items?: OrderItem[];
  items_count?: number;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount?: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  payment_status?: string;
  payment_method?: string;
  tracking_number?: string;
  notes?: string;
  shipping_address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  billing_address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
}

interface ViewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  isLoading?: boolean;
}

export default function ViewOrderModal({ isOpen, onClose, order, isLoading }: ViewOrderModalProps) {
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

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const safeNumber = (value: unknown, defaultValue = 0): number => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return defaultValue;
    }
    return Number(value);
  };

  if (!order && !isLoading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-3xl lg:max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details</span>
            {order && (
              <div className="flex gap-2">
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
                {order.priority && (
                  <Badge className={getPriorityColor(order.priority)}>
                    {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)} Priority
                  </Badge>
                )}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Order #</span>
                      <span className="font-medium">{order.order_number || order.id.slice(-8)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="text-sm">{formatDate(order.created_at)}</span>
                    </div>
                    {order.tracking_number && (
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Tracking:</span>
                        <span className="text-sm font-mono">{order.tracking_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="text-sm">{order.customer_name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="text-sm">{order.customer_email || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 my-4" />

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items ({order.items_count || order.items?.length || 0})</h3>
              {order.items && order.items.length > 0 ? (
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          {item.product_image ? (
                            <div 
                              className="w-full h-full object-cover rounded-lg bg-center bg-cover"
                              style={{ backgroundImage: `url(${item.product_image})` }}
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>Qty: {item.quantity}</span>
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </div>
                          <p className="text-sm text-gray-600">${safeNumber(item.product_price).toFixed(2)} each</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${safeNumber(item.subtotal).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No items found for this order</p>
              )}
            </div>

            <div className="border-t border-gray-200 my-4" />

            {/* Payment & Shipping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Payment Status:</span>
                    <Badge variant="outline">{order.payment_status || 'N/A'}</Badge>
                  </div>
                  {order.payment_method && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Payment Method:</span>
                      <span className="text-sm">{order.payment_method}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>${safeNumber(order.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span>${safeNumber(order.tax_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span>${safeNumber(order.shipping_amount).toFixed(2)}</span>
                  </div>
                  {order.discount_amount && safeNumber(order.discount_amount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-green-600">-${safeNumber(order.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 my-4" />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${safeNumber(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Addresses */}
            {(order.shipping_address || order.billing_address) && (
              <>
                <div className="border-t border-gray-200 my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {order.shipping_address && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                        <div className="text-sm text-gray-600">
                          <p>{order.shipping_address.street}</p>
                          <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                          <p>{order.shipping_address.country}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {order.billing_address && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                        <div className="text-sm text-gray-600">
                          <p>{order.billing_address.street}</p>
                          <p>{order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}</p>
                          <p>{order.billing_address.country}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Notes */}
            {order.notes && (
              <>
                <div className="border-t border-gray-200 my-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{order.notes}</p>
                </div>
              </>
            )}

            {/* Timeline */}
            <div className="border-t border-gray-200 my-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Order created:</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
                {order.shipped_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600">Order shipped:</span>
                    <span>{formatDate(order.shipped_at)}</span>
                  </div>
                )}
                {order.delivered_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Order delivered:</span>
                    <span>{formatDate(order.delivered_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Package className="h-12 w-12 text-gray-300" />
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Order Data</h3>
                <p className="text-gray-500">Unable to load order details. The order may not exist or there was an error retrieving the data.</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
