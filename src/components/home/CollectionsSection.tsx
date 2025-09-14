'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from './ProductCard';
import { Product } from '@/types';
import { getFeaturedProducts } from '@/services/productApi';

export function CollectionsSection() {
  const {
    data: featuredProductsResponse,
    isLoading,
    error
  } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => getFeaturedProducts(4),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const products = featuredProductsResponse?.data || [];

  if (error) {
    console.error('Failed to load featured products:', error);
  }
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4 tracking-wider">
            WINTER COLLECTIONS
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            LET US LOVE WINTER FOR IT IS THE SPRING OF GENIUS
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">Unable to load products. Please try again later.</p>
            </div>
          ) : products.length > 0 ? (
            // Products
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            // No products
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No featured products available.</p>
            </div>
          )}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <button className="bg-black text-white px-8 py-3 text-sm font-medium tracking-wider uppercase hover:bg-gray-900 transition-colors">
            View All Collections
          </button>
        </div>
      </div>
    </section>
  );
}
