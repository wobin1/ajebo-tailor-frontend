'use client';

import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '@/types';

// Mock data - replace with actual data fetching
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Loose Fit Hoodie',
    description: 'Comfortable loose fit hoodie perfect for casual wear',
    price: 129.99,
    originalPrice: 159.99,
    images: ['/images/hoodie-beige.jpg'],
    category: "Men's",
    subcategory: 'Hoodies',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Beige', 'Black', 'Gray'],
    inStock: true,
    featured: true,
    tags: ['casual', 'comfort'],
  },
  {
    id: '2',
    name: 'Patterned Scarf',
    description: 'Elegant patterned scarf for winter styling',
    price: 89.99,
    images: ['/images/scarf-pattern.jpg'],
    category: 'Accessories',
    subcategory: 'Scarves',
    sizes: ['One Size'],
    colors: ['Gray', 'Black', 'Navy'],
    inStock: true,
    featured: true,
    tags: ['winter', 'accessories'],
  },
  {
    id: '3',
    name: 'Relaxed Fit Coat Jacket',
    description: 'Premium relaxed fit coat jacket for cold weather',
    price: 159.99,
    images: ['/images/coat-black.jpg'],
    category: "Men's",
    subcategory: 'Outerwear',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Gray'],
    inStock: true,
    featured: true,
    tags: ['winter', 'outerwear'],
  },
  {
    id: '4',
    name: 'Rib-Knit Hat',
    description: 'Classic rib-knit hat for winter warmth',
    price: 75.99,
    images: ['/images/hat-beige.jpg'],
    category: 'Accessories',
    subcategory: 'Hats',
    sizes: ['One Size'],
    colors: ['Beige', 'Black', 'Gray'],
    inStock: true,
    featured: true,
    tags: ['winter', 'accessories'],
  },
];

export function CollectionsSection() {
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
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
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
