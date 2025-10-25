'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductFilters } from '@/components/products/ProductFilters';
import { useProducts } from '@/hooks/useProducts';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: initialQuery,
    minPrice: '',
    maxPrice: '',
    category: '',
    subcategory: '',
    colors: [] as string[],
    sizes: [] as string[],
  });
  const [sortBy, setSortBy] = useState('relevance');

  // Update search query when URL params change
  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, search: query }));
  }, [searchParams]);

  const { data: productsData, isLoading, error } = useProducts({
    search: filters.search,
    minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
    category: filters.category || undefined,
    subcategory: filters.subcategory || undefined,
    colors: filters.colors.length > 0 ? filters.colors : undefined,
    sizes: filters.sizes.length > 0 ? filters.sizes : undefined,
  });

  // Sort products
  const sortedProducts = useMemo(() => {
    const products = productsData?.products || [];
    if (!products || products.length === 0) return [];
    
    const productsCopy = [...products];
    
    switch (sortBy) {
      case 'price-low':
        return productsCopy.sort((a, b) => a.price - b.price);
      case 'price-high':
        return productsCopy.sort((a, b) => b.price - a.price);
      case 'name':
        return productsCopy.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
        // Sort by newest - since we don't have createdAt, just return as is
        return productsCopy;
      case 'relevance':
      default:
        // For relevance, prioritize products that match the search term in name
        if (filters.search) {
          return productsCopy.sort((a, b) => {
            const aNameMatch = a.name.toLowerCase().includes(filters.search.toLowerCase());
            const bNameMatch = b.name.toLowerCase().includes(filters.search.toLowerCase());
            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;
            return 0;
          });
        }
        return productsCopy;
    }
  }, [productsData, sortBy, filters.search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...filters, search: searchQuery };
    setFilters(newFilters);
    
    // Update URL
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    router.push(`/search?${params.toString()}`);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: searchQuery, // Keep the search query
      minPrice: '',
      maxPrice: '',
      category: '',
      subcategory: '',
      colors: [] as string[],
      sizes: [] as string[],
    };
    setFilters(clearedFilters);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.category) count++;
    if (filters.subcategory) count++;
    if (filters.colors.length > 0) count++;
    if (filters.sizes.length > 0) count++;
    return count;
  }, [filters]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            <Button type="submit" size="lg" className="px-8">
              Search
            </Button>
          </form>

          {filters.search && (
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Search results for &quot;{filters.search}&quot;
              </h1>
              <p className="text-gray-600">
                {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} found
              </p>
            </div>
          )}
        </div>

        {/* Filters and Sort Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 ml-1">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {activeFilterCount > 0 && (
              <Button variant="ghost" onClick={clearFilters} className="text-sm">
                Clear all filters
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="sm:hidden"
                  >
                    ×
                  </Button>
                </div>
                <ProductFilters
                  filters={filters}
                  onFiltersChange={handleFilterChange}
                  availableColors={['Black', 'White', 'Blue', 'Red', 'Green']}
                  availableSizes={['XS', 'S', 'M', 'L', 'XL', 'XXL']}
                  categories={[]}
                />
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {!filters.search && !isLoading && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Start your search</h2>
                <p className="text-gray-600">Enter a search term to find products</p>
              </div>
            )}

            {filters.search && (
              <ProductGrid
                products={sortedProducts}
                isLoading={isLoading}
                error={error?.message || null}
                emptyMessage={`No products found for "${filters.search}"`}
                emptyDescription="Try adjusting your search terms or filters"
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
