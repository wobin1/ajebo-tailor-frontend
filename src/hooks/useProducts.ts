'use client';

import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/services/api';
import { Product } from '@/types';

// Hook for getting products with filtering
export function useProducts(params?: {
  category?: string;
  subcategory?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  featured?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.getProducts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for getting a single product
export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProduct(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for getting featured products
export function useFeaturedProducts(limit = 4) {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: () => productApi.getFeaturedProducts(limit),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for getting related products
export function useRelatedProducts(productId: string, limit = 4) {
  return useQuery({
    queryKey: ['products', 'related', productId, limit],
    queryFn: () => productApi.getRelatedProducts(productId, limit),
    enabled: !!productId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
