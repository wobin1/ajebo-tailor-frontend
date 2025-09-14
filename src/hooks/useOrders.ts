'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserOrders, getOrder, createOrder, updateOrderStatus } from '@/services/orderApi';
import type { Order } from '@/services/orderApi';

// Hook for getting user orders with pagination and filtering
export function useUserOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}) {
  return useQuery({
    queryKey: ['orders', 'user', params],
    queryFn: () => getUserOrders(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });
}

// Alias for backward compatibility - simplified version for profile page
export function useOrders() {
  const { data, isLoading, error } = useUserOrders({ limit: 50 });
  
  // Debug logging
  console.log('useOrders - Raw data:', data);
  console.log('useOrders - Orders array:', data?.data);
  console.log('useOrders - Meta:', data?.meta);
  console.log('useOrders - Error:', error);
  
  return {
    data: data?.data || [],
    isLoading,
    error,
    total: data?.meta?.pagination?.total || 0
  };
}

// Hook for getting a single order
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for creating an order
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      // Invalidate and refetch user orders
      queryClient.invalidateQueries({ queryKey: ['orders', 'user'] });
    },
  });
}

// Hook for updating order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order['status'] }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      // Invalidate user orders to refresh the list
      queryClient.invalidateQueries({ queryKey: ['orders', 'user'] });
    },
  });
}
