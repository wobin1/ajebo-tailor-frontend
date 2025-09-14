'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { CartItem, Product } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isOpen: boolean;
  isLoading: boolean;
}

interface CartContextType extends CartState {
  addItem: (product: Product, size: string, color: string, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
  closeCart: () => void;
  refreshCart: () => Promise<void>;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'TOGGLE_CART' }
  | { type: 'CLOSE_CART' };

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isOpen: false,
  isLoading: false,
};

function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
}

function calculateItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'LOAD_CART': {
      const items = action.payload;
      return {
        ...state,
        items,
        total: calculateTotal(items),
        itemCount: calculateItemCount(items),
        isLoading: false,
      };
    }

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false,
      };

    default:
      return state;
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useAuth();

  const refreshCart = useCallback(async () => {
    if (!user) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { getCart } = await import('@/services/cartApi');
      const backendCart = await getCart();
      
      if (backendCart.success) {
        // Convert backend cart items to frontend format
        const convertedItems: CartItem[] = backendCart.data.items.map(item => ({
          id: item.id,
          productId: item.product_id,
          product: {
            id: item.product_id,
            name: item.product_name,
            price: item.price,
            images: item.product_image ? [item.product_image] : [],
            description: '',
            originalPrice: undefined,
            category: '',
            subcategory: '',
            sizes: [item.size],
            colors: [item.color],
            inStock: true,
            featured: false,
            tags: []
          },
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        }));
        
        dispatch({ type: 'LOAD_CART', payload: convertedItems });
      } else {
        dispatch({ type: 'LOAD_CART', payload: [] });
      }
    } catch (error) {
      console.error('Failed to load cart from backend:', error);
      dispatch({ type: 'LOAD_CART', payload: [] });
    }
  }, [user]);

  // Load cart from backend on mount and when user changes
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      // Clear cart when user logs out
      dispatch({ type: 'LOAD_CART', payload: [] });
    }
  }, [user, refreshCart]);

  const addItem = async (product: Product, size: string, color: string, quantity = 1) => {
    if (!user) {
      console.error('User must be authenticated to add items to cart');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { addToCart } = await import('@/services/cartApi');
      await addToCart({
        product_id: product.id,
        quantity,
        size,
        color,
      });
      
      // Refresh cart from backend after successful addition
      await refreshCart();
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const removeItem = async (itemId: string) => {
    if (!user) {
      console.error('User must be authenticated to remove items from cart');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { removeFromCart } = await import('@/services/cartApi');
      await removeFromCart(itemId);
      
      // Refresh cart from backend after successful removal
      await refreshCart();
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user) {
      console.error('User must be authenticated to update cart items');
      return;
    }

    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { updateCartItem } = await import('@/services/cartApi');
      await updateCartItem(itemId, quantity);
      
      // Refresh cart from backend after successful update
      await refreshCart();
    } catch (error) {
      console.error('Failed to update cart item quantity:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) {
      console.error('User must be authenticated to clear cart');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { clearCart: clearBackendCart } = await import('@/services/cartApi');
      await clearBackendCart();
      
      // Refresh cart from backend after successful clear
      await refreshCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  const value: CartContextType = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    closeCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
