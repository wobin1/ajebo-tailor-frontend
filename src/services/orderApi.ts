/**
 * Order API service for handling order-related API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ajebo-tailor-backend.onrender.com';

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

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  size: string;
  color: string;
  product_price: number;
  customizations?: Record<string, unknown>;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface PaymentMethod {
  type: string;
  last4: string;
}

export interface Order {
  id: string;
  order_number?: string;
  user_id: string;
  customer_name?: string;
  customer_email?: string;
  items?: OrderItem[];
  items_count?: number;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount?: number;
  total: number;
  total_amount?: number; // Keep for backward compatibility
  currency?: string;
  payment_status?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  shipping_address?: ShippingAddress;
  billing_address_id?: string;
  shipping_address_id?: string;
  payment_method?: PaymentMethod;
  notes?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  items: Array<{
    product_id: string;
    quantity: number;
    size: string;
    color: string;
    customizations?: Record<string, unknown>;
  }>;
  shipping_address_id: string;
  billing_address_id?: string;
  payment_method: string;
}

export interface DesignerOrderRequest {
  items: Array<{
    product_id: string;
    quantity: number;
    size: string;
    color: string;
    customizations?: Record<string, unknown>;
  }>;
  payment_method?: string;
}

export interface OrderResponse {
  success: boolean;
  data: Order;
  message: string;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: Order[];
  meta: {
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}

/**
 * Create a new order
 */
export async function createOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Create a new designer order (no shipping address required)
 */
export async function createDesignerOrder(orderData: DesignerOrderRequest): Promise<OrderResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/designer`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error creating designer order:', error);
    throw error;
  }
}

/**
 * Get user's orders with filtering and pagination
 */
export async function getUserOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}): Promise<OrdersResponse> {
  try {
    const searchParams = new URLSearchParams();
    
    // Add pagination parameters
    searchParams.append('page', (params?.page || 1).toString());
    searchParams.append('limit', (params?.limit || 10).toString());
    
    // Add filtering parameters if provided
    if (params?.status) searchParams.append('status', params.status);
    if (params?.payment_status) searchParams.append('payment_status', params.payment_status);
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params?.sort_order) searchParams.append('sort_order', params.sort_order);

    const response = await fetch(`${API_BASE_URL}/api/v1/orders?${searchParams.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
}

/**
 * Get a specific order by ID
 */
export async function getOrder(orderId: string): Promise<OrderResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/${orderId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

/**
 * Update order status (admin only)
 */
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<OrderResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

/**
 * Cancel an order
 */
export async function cancelOrder(orderId: string): Promise<OrderResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
}

// Product interfaces for designer selection
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  original_price?: number;
  category_id?: string;
  subcategory_id?: string;
  images: string[];
  sizes: string[];
  colors: string[];
  tags: string[];
  in_stock: boolean;
  stock_quantity: number;
  featured: boolean;
  is_active: boolean;
  sku?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
  meta: {
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}

/**
 * Get products for designer selection
 */
export async function getProductsForDesigner(params?: {
  search?: string;
  limit?: number;
  in_stock?: boolean;
}): Promise<ProductsResponse> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params?.search) searchParams.append('search', params.search);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.in_stock !== undefined) searchParams.append('in_stock', params.in_stock.toString());
    
    // Default to showing only in-stock products
    if (params?.in_stock === undefined) searchParams.append('in_stock', 'true');

    const response = await fetch(`${API_BASE_URL}/api/v1/products?${searchParams.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching products for designer:', error);
    throw error;
  }
}
