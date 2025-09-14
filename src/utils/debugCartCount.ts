/**
 * Debug utility to check cart count visibility issues
 */

import { getCart } from '@/services/cartApi';

/**
 * Debug cart count in console
 */
export async function debugCartCount(): Promise<void> {
  console.log('\n🔍 Debugging Cart Count...\n');
  
  // Check authentication
  const token = localStorage.getItem('ajebo_access_token');
  console.log('Auth token exists:', !!token);
  
  if (!token) {
    console.log('❌ No authentication token found. User needs to be logged in to see cart count.');
    return;
  }
  
  try {
    // Test cart API directly
    console.log('Fetching cart data...');
    const cartData = await getCart();
    
    console.log('✅ Cart API Response:', cartData);
    console.log('Total items:', cartData.data.items_count);
    console.log('Items array:', cartData.data.items);
    
    if (cartData.data.items_count > 0) {
      console.log('🛒 Cart has items - count should be visible');
    } else {
      console.log('📭 Cart is empty - no count badge should show');
    }
    
  } catch (error) {
    console.error('❌ Cart API Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        console.log('💡 Authentication issue - token may be expired');
      } else if (error.message.includes('404')) {
        console.log('💡 Cart endpoint not found - check backend');
      } else {
        console.log('💡 Network or server error');
      }
    }
  }
  
  console.log('\n=================================\n');
}

// Quick test function
export function testCartCount(): void {
  debugCartCount().catch(console.error);
}

// Check if user is properly authenticated
export function checkAuthState(): void {
  console.log('\n🔐 Checking Authentication State...\n');
  
  const token = localStorage.getItem('ajebo_access_token');
  const userData = localStorage.getItem('ajebo_user_data');
  
  console.log('Access token:', token ? 'Present' : 'Missing');
  console.log('User data:', userData ? 'Present' : 'Missing');
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('User info:', {
        id: user.id,
        email: user.email,
        role: user.role
      });
    } catch (e) {
      console.log('Invalid user data in localStorage');
    }
  }
  
  console.log('\n=================================\n');
}
