/**
 * Quick test to verify product API works without authentication
 */

import { getFeaturedProducts } from '@/services/productApi';

export async function testUnauthenticatedProductApi(): Promise<void> {
  console.log('🧪 Testing Product API without authentication...\n');
  
  try {
    console.log('Fetching featured products as guest user...');
    const response = await getFeaturedProducts(4);
    
    console.log('✅ Success! Featured products loaded without authentication');
    console.log(`Message: ${response.message}`);
    console.log(`Products count: ${response.data.length}`);
    
    if (response.data.length > 0) {
      console.log('Sample product:', {
        id: response.data[0].id,
        name: response.data[0].name,
        price: response.data[0].price
      });
    } else {
      console.log('ℹ️ No products returned (this is normal if backend has no data)');
    }
    
  } catch (error) {
    console.error('❌ Product API test failed:', error);
    console.log('This suggests the backend may require authentication for product endpoints');
  }
  
  console.log('\n✨ Test completed!');
}

// Auto-run test when imported
testUnauthenticatedProductApi();
