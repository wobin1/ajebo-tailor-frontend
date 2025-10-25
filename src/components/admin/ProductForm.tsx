'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, X } from 'lucide-react';

interface ProductFormData {
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

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  initialData?: Partial<ProductFormData>;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export default function ProductForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  mode
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: null,
    price: 0,
    original_price: null,
    sku: null,
    stock_quantity: 0,
    category_id: null,
    subcategory_id: null,
    colors: [],
    sizes: [],
    tags: [],
    images: [],
    featured: false,
    is_active: true
  });

  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || null,
        price: initialData.price || 0,
        original_price: initialData.original_price || null,
        sku: initialData.sku || null,
        stock_quantity: initialData.stock_quantity || 0,
        category_id: initialData.category_id || null,
        subcategory_id: initialData.subcategory_id || null,
        colors: initialData.colors || [],
        sizes: initialData.sizes || [],
        tags: initialData.tags || [],
        images: initialData.images || [],
        featured: initialData.featured || false,
        is_active: initialData.is_active !== undefined ? initialData.is_active : true
      });
    }
  }, [initialData]);

  const handleInputChange = (field: keyof ProductFormData, value: string | number | boolean | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addArrayItem = (field: 'colors' | 'sizes' | 'tags' | 'images', value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: 'colors' | 'sizes' | 'tags' | 'images', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Product' : 'Edit Product'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SKU</label>
                  <Input
                    value={formData.sku || ''}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="Enter SKU"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Original Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.original_price || ''}
                    onChange={(e) => handleInputChange('original_price', parseFloat(e.target.value) || undefined)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium mb-2">Colors</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="Add color"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('colors', newColor);
                        setNewColor('');
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      addArrayItem('colors', newColor);
                      setNewColor('');
                    }}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.colors.map((color, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {color}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('colors', index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium mb-2">Sizes</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="Add size"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('sizes', newSize);
                        setNewSize('');
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      addArrayItem('sizes', newSize);
                      setNewSize('');
                    }}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.sizes.map((size, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {size}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('sizes', index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('tags', newTag);
                        setNewTag('');
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      addArrayItem('tags', newTag);
                      setNewTag('');
                    }}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('tags', index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium mb-2">Image URLs</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="Add image URL"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('images', newImage);
                        setNewImage('');
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      addArrayItem('images', newImage);
                      setNewImage('');
                    }}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <span className="flex-1 text-sm truncate">{image}</span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('images', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Featured Product</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Update Product'}
                </Button>
              </div>
            </form>
      </DialogContent>
    </Dialog>
  );
}
