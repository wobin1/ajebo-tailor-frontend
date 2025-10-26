import { Product, Category, Order, User } from '@/types';
import { mockProducts, mockCategories, mockOrders, mockUsers } from '@/lib/mockData';
import { authApi } from './authApi';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ajebo-tailor-backend.onrender.com';
const API_V1_PREFIX = '/api/v1';

// Simulate API delay for mock endpoints
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// HTTP Client for authenticated requests
class AuthenticatedApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}${API_V1_PREFIX}`;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const accessToken = authApi.getCurrentUserData() ? 
      localStorage.getItem('ajebo_access_token') : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, try to refresh
        const refreshed = await authApi.refreshAccessToken();
        if (refreshed) {
          // Retry with new token
          const newHeaders = {
            ...headers,
            Authorization: `Bearer ${refreshed.access_token}`
          };
          const retryResponse = await fetch(url, { ...config, headers: newHeaders });
          if (retryResponse.ok) {
            return retryResponse.json();
          }
        }
        throw new Error('Authentication required');
      }
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // User profile endpoints
  async getUserProfile(): Promise<User> {
    return this.request<User>('/users/profile');
  }

  async updateUserProfile(userData: Partial<User>): Promise<User> {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }
}

const apiClient = new AuthenticatedApiClient();

// Export the authenticated API client for use in other parts of the app
export { apiClient };

// Product API
export const productApi = {
  // Get all products with optional filtering
  getProducts: async (params?: {
    category?: string;
    subcategory?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    colors?: string[];
    sizes?: string[];
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ products: Product[]; total: number }> => {
    await delay(500); // Simulate network delay
    
    let filteredProducts = [...mockProducts];
    
    if (params?.category) {
      filteredProducts = filteredProducts.filter(p => 
        p.category.toLowerCase() === params.category?.toLowerCase()
      );
    }
    
    if (params?.subcategory) {
      filteredProducts = filteredProducts.filter(p => 
        p.subcategory?.toLowerCase() === params.subcategory?.toLowerCase()
      );
    }
    
    if (params?.search) {
      const searchTerm = params.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    if (params?.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= params.minPrice!);
    }
    
    if (params?.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= params.maxPrice!);
    }
    
    if (params?.colors && params.colors.length > 0) {
      filteredProducts = filteredProducts.filter(p => 
        p.colors.some(color => params.colors!.includes(color))
      );
    }
    
    if (params?.sizes && params.sizes.length > 0) {
      filteredProducts = filteredProducts.filter(p => 
        p.sizes.some(size => params.sizes!.includes(size))
      );
    }
    
    if (params?.featured !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.featured === params.featured);
    }
    
    const total = filteredProducts.length;
    
    // Apply pagination
    if (params?.limit || params?.offset) {
      const offset = params?.offset || 0;
      const limit = params?.limit || 12;
      filteredProducts = filteredProducts.slice(offset, offset + limit);
    }
    
    return { products: filteredProducts, total };
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<Product | null> => {
    await delay(300);
    return mockProducts.find(p => p.id === id) || null;
  },

  // Get featured products
  getFeaturedProducts: async (limit = 4): Promise<Product[]> => {
    await delay(400);
    return mockProducts.filter(p => p.featured).slice(0, limit);
  },

  // Get related products
  getRelatedProducts: async (productId: string, limit = 4): Promise<Product[]> => {
    await delay(400);
    const product = mockProducts.find(p => p.id === productId);
    if (!product) return [];
    
    return mockProducts
      .filter(p => p.id !== productId && p.category === product.category)
      .slice(0, limit);
  }
};

// Category API
export const categoryApi = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    await delay(300);
    return mockCategories;
  },

  // Get category by slug
  getCategory: async (slug: string): Promise<Category | null> => {
    await delay(300);
    return mockCategories.find(c => c.slug === slug) || null;
  }
};

// Order API
export const orderApi = {
  // Get user orders
  getUserOrders: async (userId: string): Promise<Order[]> => {
    await delay(500);
    return mockOrders.filter(o => o.userId === userId);
  },

  // Get single order
  getOrder: async (orderId: string): Promise<Order | null> => {
    await delay(400);
    return mockOrders.find(o => o.id === orderId) || null;
  },

  // Create new order
  createOrder: async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    await delay(800);
    
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // In a real app, this would be saved to the backend
    mockOrders.push(newOrder);
    
    return newOrder;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<Order | null> => {
    await delay(400);
    
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return null;
    
    mockOrders[orderIndex] = {
      ...mockOrders[orderIndex],
      status,
      updatedAt: new Date().toISOString()
    };
    
    return mockOrders[orderIndex];
  }
};

// User API
export const userApi = {
  // Get user profile
  getUser: async (userId: string): Promise<User | null> => {
    await delay(300);
    return mockUsers.find(u => u.id === userId) || null;
  },

  // Update user profile
  updateUser: async (userId: string, userData: Partial<User>): Promise<User | null> => {
    await delay(500);
    
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;
    
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...userData
    };
    
    return mockUsers[userIndex];
  },

  // Authenticate user (login)
  authenticate: async (email: string, password: string): Promise<User | null> => {
    await delay(800);
    
    // In a real app, this would verify password hash
    const user = mockUsers.find(u => u.email === email);
    
    // Simulate password check (in real app, compare with hashed password)
    if (user && password.length >= 6) {
      return user;
    }
    
    return null;
  },

  // Register new user
  register: async (email: string, password: string, name: string): Promise<User> => {
    await delay(1000);
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: 'customer',
      is_active: true,
      email_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    return newUser;
  }
};

// Search API
export const searchApi = {
  // Search products
  searchProducts: async (query: string, limit = 10): Promise<Product[]> => {
    await delay(400);
    
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return mockProducts
      .filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
      .slice(0, limit);
  },

  // Get search suggestions
  getSearchSuggestions: async (query: string): Promise<string[]> => {
    await delay(200);
    
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    const suggestions = new Set<string>();
    
    // Add product names that match
    mockProducts.forEach(p => {
      if (p.name.toLowerCase().includes(searchTerm)) {
        suggestions.add(p.name);
      }
      
      // Add categories that match
      if (p.category.toLowerCase().includes(searchTerm)) {
        suggestions.add(p.category);
      }
      
      // Add tags that match
      p.tags.forEach(tag => {
        if (tag.toLowerCase().includes(searchTerm)) {
          suggestions.add(tag);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, 8);
  }
};
