/**
 * Test utility to verify product API integration
 */

import { getFeaturedProducts, getProducts, getProduct } from '@/services/productApi';

/**
 * Test featured products API endpoint
 */
export async function testFeaturedProducts(): Promise<void> {
  console.log('\n=== Testing Featured Products API ===');
  
  try {
    console.log('Fetching featured products...');
    const response = await getFeaturedProducts(4);
    
    console.log('✅ Featured products API call successful');
    console.log(`Response: ${response.message}`);
    console.log(`Products count: ${response.data.length}`);
    
    if (response.data.length > 0) {
      console.log('Sample product:', {
        id: response.data[0].id,
        name: response.data[0].name,
        price: response.data[0].price
      });
    }
    
  } catch (error) {
    console.error('❌ Featured products API test failed:', error);
  }
  
  console.log('=========================================\n');
}

/**
 * Test general products API endpoint
 */
export async function testProductsApi(): Promise<void> {
  console.log('\n=== Testing Products API ===');
  
  try {
    console.log('Fetching all products...');
    const response = await getProducts({ limit: 5 });
    
    console.log('✅ Products API call successful');
    console.log(`Response: ${response.message}`);
    console.log(`Products count: ${response.data.length}`);
    console.log(`Total products: ${response.total}`);
    
  } catch (error) {
    console.error('❌ Products API test failed:', error);
  }
  
  console.log('===============================\n');
}

/**
 * Test single product API endpoint
 */
export async function testSingleProduct(productId: string = '1'): Promise<void> {
  console.log('\n=== Testing Single Product API ===');
  
  try {
    console.log(`Fetching product with ID: ${productId}...`);
    const response = await getProduct(productId);
    
    console.log('✅ Single product API call successful');
    console.log(`Response: ${response.message}`);
    console.log('Product details:', {
      id: response.data.id,
      name: response.data.name,
      price: response.data.price,
      category: response.data.category
    });
    
  } catch (error) {
    console.error('❌ Single product API test failed:', error);
  }
  
  console.log('====================================\n');
}

/**
 * Test API connectivity and endpoints
 */
export async function testApiConnectivity(): Promise<void> {
  console.log('\n=== Testing API Connectivity ===');
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  console.log(`API Base URL: ${API_BASE_URL}`);
  
  try {
    // Test basic connectivity
    const response = await fetch(`${API_BASE_URL}/api/v1/products/featured?limit=1`);
    
    if (response.ok) {
      console.log('✅ API server is reachable');
      console.log(`Status: ${response.status} ${response.statusText}`);
    } else {
      console.log(`❌ API server returned error: ${response.status} ${response.statusText}`);
    }
    
  } catch (error) {
    console.error('❌ API connectivity test failed:', error);
    console.log('Make sure the backend server is running on the correct port');
  }
  
  console.log('=================================\n');
}

/**
 * Run all product API tests
 */
export async function runAllProductApiTests(): Promise<void> {
  console.log('🚀 Starting Product API Integration Tests...\n');
  
  await testApiConnectivity();
  await testFeaturedProducts();
  await testProductsApi();
  await testSingleProduct();
  
  console.log('✨ Product API tests completed!\n');
}

// Export convenience function for quick testing
export function testProductApiIntegration(): void {
  runAllProductApiTests().catch(console.error);
}
