'use client';

import React, { useState } from 'react';
import { Search, Filter, Edit, Plus, Package, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminProducts, createProduct, updateProduct, deleteProduct } from '@/services/adminApi';

interface ProductFormData {
  id?: string;
  name: string;
  description?: string | null;
  price: number;
  original_price?: number | null;
  sku?: string | null;
  stock_quantity: number;
  category_id?: string | null;
  subcategory_id?: string | null;
  colors: string[];
  sizes: string[];
  tags: string[];
  images: string[];
  featured: boolean;
  is_active: boolean;
}
import Image from 'next/image';
import ProductForm from '@/components/admin/ProductForm';
import DeleteConfirmModal from '@/components/shared/DeleteConfirmModal';

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductFormData | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  
  // Filter states
  const [filters, setFilters] = useState({
    category_id: '',
    in_stock: '',
    is_active: '',
    featured: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  
  const queryClient = useQueryClient();

  // Fetch products from backend
  const {
    data: productsResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-products', currentPage, searchTerm, filters],
    queryFn: () => getAdminProducts({
      page: currentPage,
      limit: 12,
      search: searchTerm || undefined,
      category_id: filters.category_id || undefined,
      in_stock: filters.in_stock ? filters.in_stock === 'true' : undefined,
      is_active: filters.is_active ? filters.is_active === 'true' : undefined,
      featured: filters.featured ? filters.featured === 'true' : undefined,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order as 'asc' | 'desc',
    }),
  });

  const products = productsResponse?.data || [];
  const pagination = productsResponse?.meta?.pagination;

  // Mutations for CRUD operations
  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => createProduct(data as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setIsProductFormOpen(false);
      setSelectedProduct(null);
    },
    onError: (error) => {
      console.error('Error creating product:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductFormData }) => updateProduct(id, data as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setIsProductFormOpen(false);
      setSelectedProduct(null);
    },
    onError: (error) => {
      console.error('Error updating product:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
    }
  });

  // Event handlers
  const handleCreateProduct = () => {
    setFormMode('create');
    setSelectedProduct(null);
    setIsProductFormOpen(true);
  };

  const handleEditProduct = (product: ProductFormData) => {
    setFormMode('edit');
    setSelectedProduct(product);
    setIsProductFormOpen(true);
  };

  const handleDeleteProduct = (product: ProductFormData) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = (data: ProductFormData) => {
    if (formMode === 'create') {
      createMutation.mutate(data);
    } else if (selectedProduct?.id) {
      updateMutation.mutate({ id: selectedProduct.id, data });
    }
  };

  const handleConfirmDelete = () => {
    if (selectedProduct?.id) {
      deleteMutation.mutate(selectedProduct.id);
    }
  };

  const getStatusColor = (isActive: boolean, stockQuantity: number) => {
    if (!isActive) return 'bg-gray-100 text-gray-800';
    if (stockQuantity <= 0) return 'bg-red-100 text-red-800';
    if (stockQuantity <= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (isActive: boolean, stockQuantity: number) => {
    if (!isActive) return 'Inactive';
    if (stockQuantity <= 0) return 'Out of Stock';
    if (stockQuantity <= 5) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600 mt-2">Manage your product catalog</p>
        </div>
        <Button onClick={handleCreateProduct}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Row */}
            <div className="w-full">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filters Row */}
            <div className="flex gap-2 flex-wrap items-center">
              {/* Category Filter */}
              <select
                value={filters.category_id}
                onChange={(e) => setFilters(prev => ({ ...prev, category_id: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Categories</option>
                <option value="1">Men&apos;s Clothing</option>
                <option value="2">Women&apos;s Clothing</option>
                <option value="3">Accessories</option>
                <option value="4">Footwear</option>
              </select>

              {/* Stock Status Filter */}
              <select
                value={filters.in_stock}
                onChange={(e) => setFilters(prev => ({ ...prev, in_stock: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Stock</option>
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
              </select>

              {/* Active Status Filter */}
              <select
                value={filters.is_active}
                onChange={(e) => setFilters(prev => ({ ...prev, is_active: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              {/* Featured Filter */}
              <select
                value={filters.featured}
                onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Featured</option>
                <option value="true">Featured</option>
                <option value="false">Not Featured</option>
              </select>

              {/* Sort By Filter */}
              <select
                value={filters.sort_by}
                onChange={(e) => setFilters(prev => ({ ...prev, sort_by: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="created_at">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="stock_quantity">Sort by Stock</option>
              </select>

              {/* Sort Order Filter */}
              <select
                value={filters.sort_order}
                onChange={(e) => setFilters(prev => ({ ...prev, sort_order: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>

              {/* Clear Filters Button */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilters({
                    category_id: '',
                    in_stock: '',
                    is_active: '',
                    featured: '',
                    sort_by: 'created_at',
                    sort_order: 'desc'
                  });
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="text-sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load products</h3>
            <Button onClick={() => refetch()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square bg-gray-100 relative">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className={getStatusColor(product.is_active, product.stock_quantity)}>
                      {getStatusText(product.is_active, product.stock_quantity)}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</p>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
                      {product.original_price && Number(product.original_price) > Number(product.price) && (
                        <span className="text-sm text-gray-500 line-through">
                          ${Number(product.original_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-medium ${
                      product.stock_quantity <= 0 ? 'text-red-600' : 
                      product.stock_quantity <= 5 ? 'text-yellow-600' : 
                      'text-green-600'
                    }`}>
                      Stock: {product.stock_quantity} {
                        product.stock_quantity <= 0 ? '(Out of Stock)' :
                        product.stock_quantity <= 5 ? '(Low Stock)' :
                        '(In Stock)'
                      }
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Featured: {product.featured ? 'Yes' : 'No'}</p>
                    <p className="text-sm text-gray-600">
                      Sizes: {product.sizes.length > 0 ? product.sizes.join(', ') : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Colors: {product.colors.length > 0 ? product.colors.join(', ') : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteProduct(product)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-500">
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                {pagination.total} products
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(pagination.total_pages, currentPage + 1))}
                  disabled={currentPage === pagination.total_pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Product Form Modal */}
      <ProductForm
        isOpen={isProductFormOpen}
        onClose={() => {
          setIsProductFormOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedProduct ?? undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
        mode={formMode}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
