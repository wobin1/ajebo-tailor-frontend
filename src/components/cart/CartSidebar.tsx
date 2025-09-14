'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/services/orderApi';
import { addressApi } from '@/services/addressApi';
import { useAuth } from '@/context/AuthContext';

export function CartSidebar() {
  const { isOpen, closeCart, updateQuantity, removeItem, items, total, itemCount } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Use cart data from CartContext instead of API query
  // This provides immediate access to cart state without API dependency

  // Fetch user addresses for quick checkout
  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressApi.getUserAddresses,
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  // Mutation for creating order
  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      // Clear cart and redirect to order success page
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      closeCart();
      router.push(`/orders/${data.data.id}?success=true`);
    },
    onError: (error) => {
      console.error('Order creation failed:', error);
      // Fall back to checkout page where user can select/add addresses
      closeCart();
      router.push('/checkout');
    },
  });

  const handleCheckout = () => {
    if (items.length === 0) {
      return;
    }

    // If user is not authenticated, redirect to login
    if (!user) {
      closeCart();
      router.push('/auth/login?redirect=/checkout');
      return;
    }

    // Check if user has a default address for quick checkout
    const defaultAddress = addresses.find(addr => addr.is_default);
    
    if (!defaultAddress) {
      // No default address found, redirect to full checkout page
      closeCart();
      router.push('/checkout');
      return;
    }

    // Create order using default address ID
    const orderData = {
      items: items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        customizations: {},
      })),
      shipping_address_id: defaultAddress.id,
      billing_address_id: defaultAddress.id, // Use same address for billing
      payment_method: 'card'
    };

    createOrderMutation.mutate(orderData);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col border-l border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Shopping Cart ({itemCount})</h2>
          <Button variant="ghost" size="icon" onClick={closeCart}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingBag className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium mb-2">Your cart is empty</p>
              <p className="text-sm text-center">Add some items to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex space-x-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                    {item.product.images && item.product.images.length > 0 ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.size} • {item.color}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      ${Number(item.product.price).toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 ml-2"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Button 
              className="w-full bg-black text-white hover:bg-gray-900"
              onClick={handleCheckout}
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Order...
                </>
              ) : addresses.find(addr => addr.is_default) ? (
                'Quick Checkout'
              ) : (
                'Checkout'
              )}
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                closeCart();
                router.push('/checkout');
              }}
            >
              {addresses.find(addr => addr.is_default) ? 'Full Checkout' : 'Go to Checkout'}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
