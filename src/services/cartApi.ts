/**
 * Cart API service for handling cart-related API calls
 */

// Cart API service using direct fetch calls

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ajebo_access_token');
}

// Helper function to create authenticated headers
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  customizations?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  items: CartItem[];
  items_count: number;
  estimated_total: number;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
}

export interface CartItemCreate {
  product_id: string;
  quantity: number;
  size: string;
  color: string;
  customizations?: Record<string, unknown>;
}

export interface CartResponse {
  success: boolean;
  data: Cart;
  message: string;
}

export interface AddToCartResponse {
  data: {
    added: boolean;
    product_name: string;
  };
  message: string;
}

/**
 * Get user's cart
 */
export async function getCart(): Promise<CartResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/cart`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching cart:', error);
    // Return empty cart for unauthenticated users
    return {
      success: true,
      data: {
        items: [],
        items_count: 0,
        estimated_total: 0,
        subtotal: 0,
        tax_amount: 0,
        shipping_amount: 0,
      },
      message: 'Cart retrieved successfully'
    };
  }
}

/**
 * Add item to cart
 */
export async function addToCart(item: CartItemCreate): Promise<AddToCartResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/cart/items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(itemId: string, quantity: number): Promise<{ data: { updated: boolean; product_name: string }; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/cart/items/${itemId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(itemId: string): Promise<{ data: { removed: boolean; product_name: string }; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}

/**
 * Clear entire cart
 */
export async function clearCart(): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/cart/clear`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}
