import { User } from '@/types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_V1_PREFIX = '/api/v1';

// Types matching backend models
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  role?: 'customer' | 'admin' | 'designer';
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}

// Token management
class TokenManager {
  private static ACCESS_TOKEN_KEY = 'ajebo_access_token';
  private static REFRESH_TOKEN_KEY = 'ajebo_refresh_token';
  private static USER_DATA_KEY = 'ajebo_user_data';

  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static getUserData(): User | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(this.USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  static setTokens(tokenResponse: TokenResponse): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokenResponse.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokenResponse.refresh_token);
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(tokenResponse.user));
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}

// HTTP Client with automatic token handling
class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}${API_V1_PREFIX}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const accessToken = TokenManager.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if token exists
    if (accessToken && !TokenManager.isTokenExpired(accessToken)) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized - attempt token refresh
      if (response.status === 401 && accessToken) {
        const refreshed = await this.refreshTokens();
        if (refreshed) {
          // Retry the original request with new token
          const newAccessToken = TokenManager.getAccessToken();
          if (newAccessToken) {
            const newHeaders = {
              ...headers,
              Authorization: `Bearer ${newAccessToken}`
            };
            const retryResponse = await fetch(url, { ...config, headers: newHeaders });
            return this.handleResponse<T>(retryResponse);
          }
        }
        // If refresh failed, clear tokens and throw error
        TokenManager.clearTokens();
        throw new Error('Authentication failed. Please log in again.');
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      let errorDetails: unknown = null;
      
      try {
        const errorData = await response.json();
        
        // Handle FastAPI validation errors
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Validation errors from Pydantic
            const validationErrors = errorData.detail.map((err: Record<string, unknown>) => {
              const field = err.loc && Array.isArray(err.loc) ? err.loc.join('.') : 'field';
              return `${field}: ${err.msg}`;
            });
            errorMessage = validationErrors.join(', ');
            errorDetails = errorData.detail;
          } else if (typeof errorData.detail === 'string') {
            // Simple error message
            errorMessage = errorData.detail;
          } else {
            // Complex error object
            errorMessage = errorData.detail.message || errorData.detail.toString();
            errorDetails = errorData.detail;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || `HTTP ${response.status}`;
      }
      
      // Create enhanced error with additional context
      const error = new Error(errorMessage);
      (error as Error & { status?: number; details?: unknown }).status = response.status;
      (error as Error & { status?: number; details?: unknown }).details = errorDetails;
      throw error;
    }

    try {
      const data = await response.json();
      // Handle the standardized API response format
      if (data.success !== undefined) {
        return data.data;
      }
      return data;
    } catch {
      throw new Error('Invalid response format');
    }
  }

  private async refreshTokens(): Promise<boolean> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data: ApiResponse<TokenResponse> = await response.json();
        TokenManager.setTokens(data.data);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await this.request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    TokenManager.setTokens(response);
    return response;
  }

  async register(userData: RegisterRequest): Promise<TokenResponse> {
    const response = await this.request<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    TokenManager.setTokens(response);
    return response;
  }

  async logout(): Promise<void> {
    const refreshToken = TokenManager.getRefreshToken();
    
    if (refreshToken) {
      try {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }
    
    TokenManager.clearTokens();
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    await this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  async refreshAccessToken(): Promise<TokenResponse | null> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await this.request<TokenResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      
      TokenManager.setTokens(response);
      return response;
    } catch {
      TokenManager.clearTokens();
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const accessToken = TokenManager.getAccessToken();
    const refreshToken = TokenManager.getRefreshToken();
    
    if (!accessToken || !refreshToken) return false;
    
    // If access token is expired but refresh token exists, we're still considered authenticated
    // The automatic refresh will handle getting a new access token
    return true;
  }

  // Get stored user data
  getCurrentUserData(): User | null {
    return TokenManager.getUserData();
  }
}

// Export singleton instance
export const authApi = new ApiClient();
export { TokenManager };
