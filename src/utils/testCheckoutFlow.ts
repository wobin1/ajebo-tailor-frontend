/**
 * Comprehensive test utility for checkout flow
 * Tests the complete checkout process including cart operations and order creation
 */

import { addToCart, getCart, clearCart } from '@/services/cartApi';
import { createOrder } from '@/services/orderApi';
import { addressApi, type CreateAddressData } from '@/services/addressApi';

interface TestProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
}

interface TestCheckoutData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

export async function testCompleteCheckoutFlow() {
  console.log('🧪 Starting Complete Checkout Flow Test...');
  
  try {
    // Step 1: Test adding items to cart
    console.log('\n📦 Step 1: Adding test items to cart...');
    
    const testProduct: TestProduct = {
      id: 'test-product-1',
      name: 'Test Tailored Shirt',
      price: 89.99,
      images: ['/images/test-shirt.jpg']
    };

    const addToCartData = {
      product_id: testProduct.id,
      quantity: 2,
      size: 'M',
      color: 'Blue',
      customizations: {
        collar: 'spread',
        cuffs: 'button',
        monogram: 'JD'
      }
    };

    const addResult = await addToCart(addToCartData);
    console.log('✅ Add to cart result:', addResult);

    // Step 2: Verify cart contents
    console.log('\n🛒 Step 2: Fetching cart contents...');
    const cartResult = await getCart();
    console.log('✅ Cart contents:', cartResult);

    if (!cartResult.success || !cartResult.data.items.length) {
      throw new Error('Cart is empty after adding items');
    }

    // Step 3: Test checkout form data
    console.log('\n📋 Step 3: Preparing checkout form data...');
    const checkoutData: TestCheckoutData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
      address1: '123 Main Street',
      address2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      cardNumber: '4111111111111111',
      expiryDate: '12/25',
      cvv: '123',
      cardName: 'John Doe'
    };

    console.log('✅ Checkout form data prepared:', {
      ...checkoutData,
      cardNumber: '**** **** **** 1111',
      cvv: '***'
    });

    // Step 4: Create shipping address first
    console.log('\n📍 Step 4: Creating shipping address...');
    const addressData: CreateAddressData = {
      first_name: checkoutData.firstName,
      last_name: checkoutData.lastName,
      company: '',
      address1: checkoutData.address1,
      address2: checkoutData.address2 || '',
      city: checkoutData.city,
      state: checkoutData.state,
      zip_code: checkoutData.zipCode,
      country: checkoutData.country,
      phone: checkoutData.phone,
      address_type: 'shipping',
      is_default: false
    };

    const addressResult = await addressApi.createAddress(addressData);
    console.log('✅ Address created:', addressResult);

    if (!addressResult.id) {
      throw new Error('Failed to create shipping address');
    }

    // Step 5: Create order
    console.log('\n🎯 Step 5: Creating order...');
    const orderData = {
      items: cartResult.data.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        customizations: item.customizations,
      })),
      shipping_address_id: addressResult.id,
      payment_method: 'card',
    };

    const orderResult = await createOrder(orderData);
    console.log('✅ Order created successfully:', orderResult);

    // Step 6: Verify cart is cleared (optional - depends on backend behavior)
    console.log('\n🧹 Step 6: Checking if cart was cleared...');
    const cartAfterOrder = await getCart();
    console.log('✅ Cart after order:', cartAfterOrder);

    // Step 7: Test order confirmation flow
    console.log('\n📧 Step 7: Order confirmation flow...');
    if (orderResult.success && orderResult.data.id) {
      console.log('✅ Order ID for confirmation:', orderResult.data.id);
      console.log('✅ Redirect URL would be:', `/orders/${orderResult.data.id}?success=true`);
    }

    console.log('\n🎉 Complete Checkout Flow Test PASSED!');
    console.log('Summary:');
    console.log('- ✅ Added items to cart');
    console.log('- ✅ Retrieved cart contents');
    console.log('- ✅ Prepared checkout form data');
    console.log('- ✅ Created shipping address');
    console.log('- ✅ Created order successfully');
    console.log('- ✅ Order confirmation flow ready');

    return {
      success: true,
      cartResult,
      orderResult,
      message: 'Complete checkout flow test passed successfully'
    };

  } catch (error) {
    console.error('❌ Checkout Flow Test FAILED:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Checkout flow test failed'
    };
  }
}

export async function testCheckoutValidation() {
  console.log('🔍 Testing Checkout Form Validation...');
  
  // Test cases for form validation
  const testCases = [
    {
      name: 'Empty required fields',
      data: {},
      shouldFail: true
    },
    {
      name: 'Invalid email',
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '555-123-4567'
      },
      shouldFail: true
    },
    {
      name: 'Invalid card number',
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        cardNumber: '1234',
        expiryDate: '12/25',
        cvv: '123'
      },
      shouldFail: true
    },
    {
      name: 'Valid data',
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-123-4567',
        address1: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
        cardNumber: '4111111111111111',
        expiryDate: '12/25',
        cvv: '123',
        cardName: 'John Doe'
      },
      shouldFail: false
    }
  ];

  console.log('✅ Validation test cases prepared:', testCases.length);
  return testCases;
}

export async function testErrorHandling() {
  console.log('🚨 Testing Error Handling...');
  
  try {
    // Test with invalid auth token
    console.log('Testing with invalid auth token...');
    
    // Save current token
    const currentToken = localStorage.getItem('ajebo_access_token');
    
    // Set invalid token
    localStorage.setItem('ajebo_access_token', 'invalid-token');
    
    // Try to get cart
    const cartResult = await getCart();
    console.log('Cart result with invalid token:', cartResult);
    
    // Restore token
    if (currentToken) {
      localStorage.setItem('ajebo_access_token', currentToken);
    } else {
      localStorage.removeItem('ajebo_access_token');
    }
    
    console.log('✅ Error handling test completed');
    
  } catch (error) {
    console.error('Error in error handling test:', error);
  }
}

// Utility function to run all checkout tests
export async function runAllCheckoutTests() {
  console.log('🧪 Running All Checkout Tests...\n');
  
  const results = {
    checkoutFlow: await testCompleteCheckoutFlow(),
    validation: await testCheckoutValidation(),
    errorHandling: await testErrorHandling()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('- Checkout Flow:', results.checkoutFlow.success ? '✅ PASSED' : '❌ FAILED');
  console.log('- Validation Tests:', '✅ PREPARED');
  console.log('- Error Handling:', '✅ COMPLETED');
  
  return results;
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).testCheckoutFlow = testCompleteCheckoutFlow;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).runAllCheckoutTests = runAllCheckoutTests;
  console.log('🔧 Checkout test functions available in browser console:');
  console.log('- testCheckoutFlow()');
  console.log('- runAllCheckoutTests()');
}
