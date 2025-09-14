/**
 * Product API service for handling product-related API calls
 */

import { Product } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface FeaturedProductsResponse {
  data: Product[];
  message: string;
}

/**
 * Get featured products from the API
 */
export async function getFeaturedProducts(limit: number = 4): Promise<FeaturedProductsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/featured?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching featured products:', error);
    // Return fallback data for development
    return {
      data: [],
      message: 'Failed to fetch featured products'
    };
  }
}

/**
 * Get all products with filtering and pagination
 */
export async function getProducts(filters: Record<string, unknown> = {}): Promise<{ data: Product[]; total: number; message: string }> {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const queryString = params.toString();
    const url = queryString ? `${API_BASE_URL}/api/v1/products?${queryString}` : `${API_BASE_URL}/api/v1/products`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      data: [],
      total: 0,
      message: 'Failed to fetch products'
    };
  }
}

/**
 * Get product by ID or slug
 */
export async function getProduct(productId: string): Promise<{ data: Product; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}
