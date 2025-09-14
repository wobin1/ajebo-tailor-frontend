/**
 * Stats API service for handling statistics-related API calls
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

export interface OrderStats {
  pending_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  pending_change: string;
  shipped_change: string;
  delivered_change: string;
  cancelled_change: string;
}

export interface DesignerStats {
  order_stats: OrderStats;
}

export interface StatsResponse {
  success: boolean;
  data: DesignerStats;
  message: string;
}

/**
 * Get designer dashboard statistics
 */
export async function getDesignerStats(): Promise<StatsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/stats/designer`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching designer stats:', error);
    throw error;
  }
}

/**
 * Get order statistics
 */
export async function getOrderStats(): Promise<{ success: boolean; data: OrderStats; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/stats/orders`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching order stats:', error);
    throw error;
  }
}
