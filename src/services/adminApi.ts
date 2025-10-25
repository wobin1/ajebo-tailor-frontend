/**
 * Admin API service for handling admin-related API calls
 */

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

// Admin Statistics Interfaces
export interface AdminStats {
  total_orders: number;
  pending_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  orders_change: number;
  revenue_change: number;
}

export interface AdminStatsResponse {
  success: boolean;
  data: AdminStats;
  message: string;
}

// Admin Orders Interfaces
export interface AdminOrdersResponse {
  success: boolean;
  message: string;
  data: Array<{
    id: string;
    order_number?: string;
    user_id: string;
    customer_name?: string;
    customer_email?: string;
    items?: Array<{
      id: string;
      product_id: string;
      product_name: string;
      product_image: string;
      quantity: number;
      size: string;
      color: string;
      product_price: number;
    }>;
    items_count?: number;
    subtotal: number;
    tax_amount: number;
    shipping_amount: number;
    discount_amount?: number;
    total: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    payment_status?: string;
    created_at: string;
    updated_at: string;
    shipped_at?: string;
    delivered_at?: string;
  }>;
  meta: {
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}

// Admin Users Interface
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'designer' | 'admin';
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface AdminUsersResponse {
  success: boolean;
  message: string;
  data: AdminUser[];
  meta: {
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}

// Product Management Interfaces
export interface AdminProduct {
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

export interface AdminProductsResponse {
  success: boolean;
  message: string;
  data: AdminProduct[];
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
 * Get admin dashboard statistics
 */
export async function getAdminStats(): Promise<AdminStatsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/stats/admin`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
}

/**
 * Get all orders for admin management
 */
export async function getAdminOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
  payment_status?: string;
  priority?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}): Promise<AdminOrdersResponse> {
  try {
    const searchParams = new URLSearchParams();
    
    // Add pagination parameters
    searchParams.append('page', (params?.page || 1).toString());
    searchParams.append('limit', (params?.limit || 20).toString());
    
    // Add filtering parameters if provided
    if (params?.status) searchParams.append('status', params.status);
    if (params?.payment_status) searchParams.append('payment_status', params.payment_status);
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params?.sort_order) searchParams.append('sort_order', params.sort_order);

    const response = await fetch(`${API_BASE_URL}/api/v1/admin/orders?${searchParams.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    throw error;
  }
}

/**
 * Get specific order for admin
 */
export async function getAdminOrder(orderId: string): Promise<{
  success: boolean;
  data: AdminOrdersResponse['data'][0];
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/orders/${orderId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching admin order:', error);
    throw error;
  }
}

/**
 * Update an order (admin only)
 */
export async function updateOrder(
  orderId: string,
  orderData: {
    status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_status?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    tracking_number?: string;
    notes?: string;
  }
): Promise<{
  success: boolean;
  data: AdminOrdersResponse['data'][0];
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

/**
 * Delete/Cancel an order (admin only)
 */
export async function deleteOrder(orderId: string): Promise<{
  success: boolean;
  data: { deleted: boolean };
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/orders/${orderId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}

/**
 * Get order statistics for admin dashboard
 */
export async function getOrderStatistics(): Promise<{
  success: boolean;
  data: {
    total_orders: number;
    pending_orders: number;
    confirmed_orders: number;
    shipped_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    total_revenue: number;
    average_order_value: number;
  };
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/orders/statistics/overview`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    throw error;
  }
}

/**
 * Get all users for admin management
 */
export async function getAdminUsers(params?: {
  page?: number;
  limit?: number;
  role?: string;
  is_active?: boolean;
  email_verified?: boolean;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}): Promise<AdminUsersResponse> {
  try {
    const searchParams = new URLSearchParams();
    
    // Add pagination parameters
    searchParams.append('page', (params?.page || 1).toString());
    searchParams.append('limit', (params?.limit || 20).toString());
    
    // Add filtering parameters if provided
    if (params?.role) searchParams.append('role', params.role);
    if (params?.is_active !== undefined) searchParams.append('is_active', params.is_active.toString());
    if (params?.email_verified !== undefined) searchParams.append('email_verified', params.email_verified.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params?.sort_order) searchParams.append('sort_order', params.sort_order);

    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users?${searchParams.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
}

/**
 * Get specific user for admin
 */
export async function getAdminUser(userId: string): Promise<{
  success: boolean;
  data: AdminUser & {
    profile?: {
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      postal_code?: string;
    };
    order_count: number;
    total_spent: number;
  };
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching admin user:', error);
    throw error;
  }
}

/**
 * Create a new user (admin only)
 */
export async function createUser(userData: {
  email: string;
  name: string;
  password: string;
  role?: 'customer' | 'designer' | 'admin';
  is_active?: boolean;
  phone?: string;
}): Promise<{
  success: boolean;
  data: AdminUser;
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update user information (admin only)
 */
export async function updateUser(
  userId: string,
  userData: {
    name?: string;
    email?: string;
    role?: 'customer' | 'designer' | 'admin';
    is_active?: boolean;
    phone?: string;
  }
): Promise<{
  success: boolean;
  data: AdminUser;
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Delete/Deactivate user (admin only)
 */
export async function deleteUser(userId: string): Promise<{
  success: boolean;
  data: { deleted: boolean };
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * Get user statistics for admin dashboard
 */
export async function getUserStatistics(): Promise<{
  success: boolean;
  data: {
    total_users: number;
    active_users: number;
    customers: number;
    designers: number;
    admins: number;
    verified_users: number;
  };
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/statistics/overview`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    throw error;
  }
}

/**
 * Get all products for admin management
 */
export async function getAdminProducts(params?: {
  page?: number;
  limit?: number;
  category_id?: string;
  in_stock?: boolean;
  is_active?: boolean;
  featured?: boolean;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}): Promise<AdminProductsResponse> {
  try {
    const searchParams = new URLSearchParams();
    
    // Add pagination parameters
    searchParams.append('page', (params?.page || 1).toString());
    searchParams.append('limit', (params?.limit || 20).toString());
    
    // Add filtering parameters if provided
    if (params?.category_id) searchParams.append('category_id', params.category_id);
    if (params?.in_stock !== undefined) searchParams.append('in_stock', params.in_stock.toString());
    if (params?.is_active !== undefined) searchParams.append('is_active', params.is_active.toString());
    if (params?.featured !== undefined) searchParams.append('featured', params.featured.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params?.sort_order) searchParams.append('sort_order', params.sort_order);

    const response = await fetch(`${API_BASE_URL}/api/v1/admin/products?${searchParams.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching admin products:', error);
    throw error;
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  userId: string, 
  role: 'customer' | 'designer' | 'admin'
): Promise<{
  success: boolean;
  data: AdminUser;
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

/**
 * Deactivate/activate user (admin only)
 */
export async function toggleUserStatus(
  userId: string, 
  is_active: boolean
): Promise<{
  success: boolean;
  data: AdminUser;
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_active }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
}

/**
 * Create a new product (admin only)
 */
export async function createProduct(productData: {
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  sku?: string;
  stock_quantity: number;
  category_id?: string;
  subcategory_id?: string;
  colors: string[];
  sizes: string[];
  tags: string[];
  images: string[];
  featured: boolean;
  is_active: boolean;
}): Promise<{
  success: boolean;
  data: AdminProduct;
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

/**
 * Update a product (admin only)
 */
export async function updateProduct(
  productId: string,
  productData: {
    name?: string;
    description?: string;
    price?: number;
    original_price?: number;
    sku?: string;
    stock_quantity?: number;
    category_id?: string;
    subcategory_id?: string;
    colors?: string[];
    sizes?: string[];
    tags?: string[];
    images?: string[];
    featured?: boolean;
    is_active?: boolean;
  }
): Promise<{
  success: boolean;
  data: AdminProduct;
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/products/${productId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

/**
 * Delete a product (admin only)
 */
export async function deleteProduct(productId: string): Promise<{
  success: boolean;
  data: { deleted: boolean };
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/products/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}
