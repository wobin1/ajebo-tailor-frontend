'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, CreditCard, Truck, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrder } from '@/services/orderApi';
import { addressApi } from '@/services/addressApi';
import { AddressSelector } from '@/components/address/AddressSelector';
import { toast } from 'sonner';

const checkoutSchema = z.object({
  // Payment Information
  cardNumber: z.string().min(16, 'Card number is required'),
  expiryDate: z.string().min(5, 'Expiry date is required'),
  cvv: z.string().min(3, 'CVV is required'),
  cardName: z.string().min(2, 'Cardholder name is required'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, total } = useCart();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<string>('');
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<string>('');

  // Fetch user addresses
  const { data: addresses = [], refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressApi.getUserAddresses,
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  const subtotal = total;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });


  if (!items.length) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
            <Button onClick={() => router.push('/products')}>Continue Shopping</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const onSubmit = async (data: CheckoutFormData) => {
    if (!user) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }

    setIsProcessing(true);
    try {
      // Create a dummy address if none exists
      let shippingAddressId = selectedShippingAddressId;
      
      if (!shippingAddressId && addresses.length === 0) {
        // Create dummy address for testing
        const dummyAddress = {
          first_name: 'Test',
          last_name: 'User',
          address1: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          zip_code: '12345',
          country: 'United States',
          address_type: 'shipping' as const,
          is_default: true
        };
        
        try {
          const createdAddress = await addressApi.createAddress(dummyAddress);
          shippingAddressId = createdAddress.id;
        } catch (error) {
          console.error('Failed to create dummy address:', error);
          toast.error('Failed to create address. Please try again.');
          return;
        }
      } else if (!shippingAddressId && addresses.length > 0) {
        // Use the first available address
        shippingAddressId = addresses[0].id;
      }

      const orderData = {
        items: items.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          customizations: {},
        })),
        shipping_address_id: shippingAddressId,
        billing_address_id: selectedBillingAddressId || shippingAddressId,
        payment_method: 'card'
      };

      const response = await createOrder(orderData);
      
      // Clear cart after successful order
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      toast.success('Order created successfully!');
      router.push(`/orders/${response.data.id}?success=true`);
    } catch (error) {
      console.error('Checkout failed:', error);
      
      // More specific error handling
      let errorMessage = 'Checkout failed. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = 'Please log in again to complete your order.';
          router.push('/auth/login?redirect=/checkout');
          return;
        } else if (error.message.includes('400')) {
          errorMessage = 'Please check your information and try again.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again in a few minutes.';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const shipping = 10;
  const tax = 0;
  const finalTotal = subtotal + shipping + tax;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600">Complete your purchase</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div className="space-y-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Truck className="h-5 w-5" />
                    <span>Shipping Address</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AddressSelector
                    addresses={addresses}
                    selectedAddressId={selectedShippingAddressId}
                    onAddressSelect={setSelectedShippingAddressId}
                    onAddressesChange={refetchAddresses}
                    title="Select Shipping Address"
                    addressType="shipping"
                  />
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Billing Address</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={!selectedBillingAddressId || selectedBillingAddressId === selectedShippingAddressId}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBillingAddressId(selectedShippingAddressId);
                          } else {
                            setSelectedBillingAddressId('');
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Same as shipping address</span>
                    </label>
                  </div>
                  
                  {selectedBillingAddressId !== selectedShippingAddressId && (
                    <AddressSelector
                      addresses={addresses}
                      selectedAddressId={selectedBillingAddressId}
                      onAddressSelect={setSelectedBillingAddressId}
                      onAddressesChange={refetchAddresses}
                      title="Select Billing Address"
                      addressType="billing"
                    />
                  )}
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number *
                    </label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      {...register('cardNumber')}
                      className={errors.cardNumber ? 'border-red-500' : ''}
                    />
                    {errors.cardNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date *
                      </label>
                      <Input
                        placeholder="MM/YY"
                        {...register('expiryDate')}
                        className={errors.expiryDate ? 'border-red-500' : ''}
                      />
                      {errors.expiryDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <Input
                        placeholder="123"
                        {...register('cvv')}
                        className={errors.cvv ? 'border-red-500' : ''}
                      />
                      {errors.cvv && (
                        <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name *
                    </label>
                    <Input
                      {...register('cardName')}
                      className={errors.cardName ? 'border-red-500' : ''}
                    />
                    {errors.cardName && (
                      <p className="mt-1 text-sm text-red-600">{errors.cardName.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-lg font-medium"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Complete Order - $${finalTotal.toFixed(2)}`}
              </Button>
              
              {/* Quick Order Button with Dummy Data */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-lg font-medium"
                disabled={isProcessing}
                onClick={async () => {
                  if (!user) {
                    router.push('/auth/login?redirect=/checkout');
                    return;
                  }
                  
                  setIsProcessing(true);
                  try {
                    // Create dummy address if none exists
                    let addressId: string;
                    
                    if (addresses.length > 0) {
                      addressId = addresses[0].id;
                    } else {
                      const dummyAddress = {
                        first_name: 'Test',
                        last_name: 'User',
                        address1: '123 Test Street',
                        city: 'Test City',
                        state: 'Test State',
                        zip_code: '12345',
                        country: 'United States',
                        address_type: 'shipping' as const,
                        is_default: true
                      };
                      
                      const createdAddress = await addressApi.createAddress(dummyAddress);
                      addressId = createdAddress.id;
                    }
                    
                    const orderData = {
                      items: items.map(item => ({
                        product_id: item.productId,
                        quantity: item.quantity,
                        size: item.size,
                        color: item.color,
                        customizations: {},
                      })),
                      shipping_address_id: addressId,
                      billing_address_id: addressId,
                      payment_method: 'card'
                    };
                    
                    const response = await createOrder(orderData);
                    queryClient.invalidateQueries({ queryKey: ['cart'] });
                    toast.success('Order created successfully!');
                    router.push(`/orders/${response.data.id}?success=true`);
                  } catch (error) {
                    console.error('Quick order failed:', error);
                    toast.error('Order creation failed. Please try again.');
                  } finally {
                    setIsProcessing(false);
                  }
                }}
              >
                {isProcessing ? 'Processing...' : 'Quick Order (Dummy Data)'}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex space-x-3">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        {item.product.images && item.product.images.length > 0 ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {item.size} • {item.color} • Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          ${(Number(item.product.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold border-t pt-2">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
