'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { mockProducts } from '@/lib/mockData';

interface FilterState {
  search: string;
  minPrice: string;
  maxPrice: string;
  colors: string[];
  sizes: string[];
  category: string;
  subcategory: string;
}

export default function ProductsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const category = params.category as string;
  
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    minPrice: '',
    maxPrice: '',
    colors: [],
    sizes: [],
    category: category === 'all' ? '' : decodeURIComponent(category || ''),
    subcategory: '',
  });

  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Get categories for filter dropdown
  const { data: categories = [] } = useCategories();

  // Build query parameters for API
  const queryParams = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
    };

    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.subcategory) params.subcategory = filters.subcategory;
    if (filters.minPrice) params.minPrice = parseFloat(filters.minPrice);
    if (filters.maxPrice) params.maxPrice = parseFloat(filters.maxPrice);
    if (filters.colors.length > 0) params.colors = filters.colors;
    if (filters.sizes.length > 0) params.sizes = filters.sizes;

    return params;
  }, [filters, currentPage]);

  // Fetch products
  const { data, isLoading, error } = useProducts(queryParams);
  const products = data?.products || [];
  const totalProducts = data?.total || 0;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  // Get available colors and sizes from all products for filters
  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    mockProducts.forEach(product => {
      product.colors.forEach(color => colors.add(color));
    });
    return Array.from(colors).sort();
  }, []);

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    mockProducts.forEach(product => {
      product.sizes.forEach(size => sizes.add(size));
    });
    return Array.from(sizes).sort((a, b) => {
      // Custom sort for clothing sizes
      const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2T', '3T', '4T', '5T', '6', '8', '10', '12'];
      const aIndex = sizeOrder.indexOf(a);
      const bIndex = sizeOrder.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Sort products
  const sortedProducts = useMemo(() => {
    if (!products) return [];
    
    const sorted = [...products];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
        return sorted.sort((a, b) => b.id.localeCompare(a.id));
      case 'featured':
      default:
        return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }, [products, sortBy]);

  const categoryName = filters.category || 'All Products';
  const breadcrumb = filters.category ? 
    `Home > ${filters.category}${filters.subcategory ? ` > ${filters.subcategory}` : ''}` : 
    'Home > All Products';

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <nav className="text-sm text-gray-600 mb-4">
              {breadcrumb}
            </nav>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-light text-gray-900 tracking-wider">
                  {categoryName}
                </h1>
                <p className="mt-2 text-gray-600">
                  {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
                </p>
              </div>
              
              {/* Sort Dropdown */}
              <div className="mt-4 sm:mt-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <ProductFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableColors={availableColors}
          availableSizes={availableSizes}
          categories={categories}
        />

        {/* Products */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProductGrid 
            products={sortedProducts} 
            isLoading={isLoading} 
            error={error?.message || null} 
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm border rounded-md ${
                        currentPage === page
                          ? 'bg-black text-white border-black'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
