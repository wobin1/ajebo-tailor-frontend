/**
 * Test utility to verify cart API integration
 */

import { addToCart, getCart } from '@/services/cartApi';

/**
 * Test add to cart functionality
 */
export async function testAddToCart(): Promise<void> {
  console.log('\n🛒 Testing Add to Cart API...\n');
  
  const testProduct = {
    product_id: '1',
    quantity: 1,
    size: 'M',
    color: 'Black',
  };
  
  try {
    console.log('Adding test product to cart...');
    console.log('Product details:', testProduct);
    
    const response = await addToCart(testProduct);
    
    console.log('✅ Add to cart successful!');
    console.log(`Message: ${response.message}`);
    console.log(`Product added: ${response.data.product_name}`);
    
  } catch (error) {
    console.error('❌ Add to cart failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('authentication')) {
        console.log('💡 This is expected - user needs to be logged in to add items to cart');
      } else if (error.message.includes('404')) {
        console.log('💡 Product not found - make sure backend has product data');
      } else {
        console.log('💡 Check if backend server is running and cart endpoints are available');
      }
    }
  }
  
  console.log('\n=====================================\n');
}

/**
 * Test get cart functionality
 */
export async function testGetCart(): Promise<void> {
  console.log('\n📋 Testing Get Cart API...\n');
  
  try {
    console.log('Fetching user cart...');
    
    const response = await getCart();
    
    console.log('✅ Get cart successful!');
    console.log(`Message: ${response.message}`);
    console.log(`Items in cart: ${response.data.items_count}`);
    console.log(`Total amount: $${response.data.estimated_total.toFixed(2)}`);
    
    if (response.data.items.length > 0) {
      console.log('Cart items:');
      response.data.items.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.product_name} (${item.size}, ${item.color}) - Qty: ${item.quantity}`);
      });
    } else {
      console.log('Cart is empty');
    }
    
  } catch (error) {
    console.error('❌ Get cart failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('authentication')) {
        console.log('💡 This is expected - user needs to be logged in to view cart');
      } else {
        console.log('💡 Check if backend server is running and cart endpoints are available');
      }
    }
  }
  
  console.log('\n=================================\n');
}

/**
 * Test cart API connectivity
 */
export async function testCartApiConnectivity(): Promise<void> {
  console.log('\n🔗 Testing Cart API Connectivity...\n');
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  console.log(`API Base URL: ${API_BASE_URL}`);
  
  try {
    // Test basic connectivity to cart endpoint
    const response = await fetch(`${API_BASE_URL}/api/v1/cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`Cart endpoint status: ${response.status} ${response.statusText}`);
    
    if (response.status === 401) {
      console.log('✅ Cart endpoint is reachable (authentication required as expected)');
    } else if (response.ok) {
      console.log('✅ Cart endpoint is reachable and accessible');
    } else {
      console.log('⚠️ Cart endpoint returned unexpected status');
    }
    
  } catch (error) {
    console.error('❌ Cart API connectivity test failed:', error);
    console.log('Make sure the backend server is running on the correct port');
  }
  
  console.log('\n========================================\n');
}

/**
 * Run all cart API tests
 */
export async function runAllCartApiTests(): Promise<void> {
  console.log('🚀 Starting Cart API Integration Tests...\n');
  
  await testCartApiConnectivity();
  await testGetCart();
  await testAddToCart();
  
  console.log('✨ Cart API tests completed!\n');
}

// Export convenience function for quick testing
export function testCartApiIntegration(): void {
  runAllCartApiTests().catch(console.error);
}
