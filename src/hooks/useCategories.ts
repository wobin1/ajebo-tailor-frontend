'use client';

import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '@/services/api';

// Hook for getting all categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Hook for getting a single category
export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoryApi.getCategory(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}
