'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User } from '@/types';
import { authApi, TokenResponse } from '@/services/authApi';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        // Check if user is authenticated based on stored tokens
        if (authApi.isAuthenticated()) {
          // Try to get current user data from storage first
          const storedUser = authApi.getCurrentUserData();
          if (storedUser) {
            dispatch({ type: 'SET_USER', payload: storedUser });
            dispatch({ type: 'SET_LOADING', payload: false });
            
            // Validate token by fetching fresh user data in background (non-blocking)
            authApi.getCurrentUser()
              .then(currentUser => {
                dispatch({ type: 'SET_USER', payload: currentUser });
              })
              .catch(() => {
                // If token validation fails, clear auth state silently
                console.log('Token validation failed, logging out');
                dispatch({ type: 'LOGOUT' });
              });
          } else {
            // No stored user data but token exists, try to fetch from API
            authApi.getCurrentUser()
              .then(currentUser => {
                dispatch({ type: 'SET_USER', payload: currentUser });
                dispatch({ type: 'SET_LOADING', payload: false });
              })
              .catch(() => {
                // Token is invalid, clear auth state and continue as guest
                console.log('User not authenticated, continuing as guest');
                dispatch({ type: 'LOGOUT' });
                dispatch({ type: 'SET_LOADING', payload: false });
              });
          }
        } else {
          // No authentication tokens, continue as guest
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const tokenResponse: TokenResponse = await authApi.login({ email, password });
      dispatch({ type: 'SET_USER', payload: tokenResponse.user });
    } catch (error) {
      let errorMessage = 'Login failed';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check for enhanced error information from backend
        const enhancedError = error as Error & { status?: number; details?: unknown };
        if (enhancedError.status) {
          // Provide more specific error messages based on status code
          switch (enhancedError.status) {
            case 400:
              errorMessage = 'Invalid email or password';
              break;
            case 401:
              errorMessage = 'Invalid email or password';
              break;
            case 403:
              errorMessage = 'Account is disabled. Please contact support';
              break;
            case 422:
              errorMessage = error.message || 'Please check your input and try again';
              break;
            case 429:
              errorMessage = 'Too many login attempts. Please try again later';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later';
              break;
            default:
              errorMessage = error.message;
          }
        }
      }
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const tokenResponse: TokenResponse = await authApi.register({
        email,
        password,
        name,
        role: 'customer',
      });
      dispatch({ type: 'SET_USER', payload: tokenResponse.user });
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check for enhanced error information from backend
        const enhancedError = error as Error & { status?: number; details?: unknown };
        if (enhancedError.status) {
          // Provide more specific error messages based on status code
          switch (enhancedError.status) {
            case 400:
              // Bad request - usually validation errors
              errorMessage = error.message || 'Invalid registration data provided';
              break;
            case 409:
              // Conflict - user already exists
              errorMessage = 'An account with this email already exists';
              break;
            case 422:
              // Unprocessable entity - validation errors
              errorMessage = error.message || 'Please check your input and try again';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later';
              break;
            default:
              errorMessage = error.message;
          }
        }
      }
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
