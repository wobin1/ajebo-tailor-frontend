'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@/services/api';
import { Order } from '@/types';

// Hook for getting user orders
export function useUserOrders(userId: string) {
  return useQuery({
    queryKey: ['orders', 'user', userId],
    queryFn: () => orderApi.getUserOrders(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Alias for backward compatibility
export const useOrders = useUserOrders;

// Hook for getting a single order
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getOrder(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for creating an order
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) =>
      orderApi.createOrder(orderData),
    onSuccess: (newOrder) => {
      // Invalidate and refetch user orders
      queryClient.invalidateQueries({ queryKey: ['orders', 'user', newOrder.userId] });
      // Add the new order to the cache
      queryClient.setQueryData(['order', newOrder.id], newOrder);
    },
  });
}

// Hook for updating order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order['status'] }) =>
      orderApi.updateOrderStatus(orderId, status),
    onSuccess: (updatedOrder) => {
      if (updatedOrder) {
        // Update the order in cache
        queryClient.setQueryData(['order', updatedOrder.id], updatedOrder);
        // Invalidate user orders to refresh the list
        queryClient.invalidateQueries({ queryKey: ['orders', 'user', updatedOrder.userId] });
      }
    },
  });
}
