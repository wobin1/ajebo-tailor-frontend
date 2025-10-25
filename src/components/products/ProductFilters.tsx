'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Filter } from 'lucide-react';

interface FilterState {
  search: string;
  minPrice: string;
  maxPrice: string;
  colors: string[];
  sizes: string[];
  category: string;
  subcategory: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableColors: string[];
  availableSizes: string[];
  categories: Array<{ name: string; slug: string; subcategories?: Array<{ name: string; slug: string }> }>;
}

export function ProductFilters({ 
  filters, 
  onFiltersChange, 
  availableColors, 
  availableSizes,
  categories 
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string | string[]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleColorToggle = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    handleFilterChange('colors', newColors);
  };

  const handleSizeToggle = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter(s => s !== size)
      : [...filters.sizes, size];
    handleFilterChange('sizes', newSizes);
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      minPrice: '',
      maxPrice: '',
      colors: [],
      sizes: [],
      category: '',
      subcategory: '',
    });
  };

  const hasActiveFilters = filters.search || filters.minPrice || filters.maxPrice || 
    filters.colors.length > 0 || filters.sizes.length > 0 || filters.category || filters.subcategory;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Filter Toggle */}
        <div className="flex items-center justify-between py-4 lg:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-black text-white text-xs px-2 py-1 rounded-full">
                {[filters.colors.length, filters.sizes.length, filters.category ? 1 : 0].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </div>

        {/* Desktop Filters */}
        <div className={`${isOpen ? 'block' : 'hidden'} lg:block py-6`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Price Range */}
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Min $"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full"
              />
              <Input
                type="number"
                placeholder="Max $"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Category */}
            <div>
              <select
                value={filters.category}
                onChange={(e) => {
                  handleFilterChange('category', e.target.value);
                  handleFilterChange('subcategory', ''); // Reset subcategory when category changes
                }}
                className="w-full h-9 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <select
                value={filters.subcategory}
                onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                className="w-full h-9 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                disabled={!filters.category}
              >
                <option value="">All Subcategories</option>
                {filters.category && 
                  categories
                    .find(cat => cat.name === filters.category)
                    ?.subcategories?.map((subcat) => (
                      <option key={subcat.slug} value={subcat.name}>
                        {subcat.name}
                      </option>
                    ))
                }
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Colors and Sizes */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colors */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Colors</h3>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorToggle(color)}
                    className={`px-3 py-1 text-sm border rounded-full transition-colors ${
                      filters.colors.includes(color)
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeToggle(size)}
                    className={`px-3 py-1 text-sm border rounded transition-colors ${
                      filters.sizes.includes(size)
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.search && (
                <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
                  <span>Search: {filters.search}</span>
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {filters.category && (
                <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
                  <span>{filters.category}</span>
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {filters.colors.map((color) => (
                <div key={color} className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
                  <span>{color}</span>
                  <button
                    onClick={() => handleColorToggle(color)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {filters.sizes.map((size) => (
                <div key={size} className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
                  <span>Size {size}</span>
                  <button
                    onClick={() => handleSizeToggle(size)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
