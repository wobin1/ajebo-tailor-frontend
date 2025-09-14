/**
 * Complete cart flow testing utility
 */

import { addToCart, getCart, updateCartItem, removeFromCart, clearCart } from '@/services/cartApi';

/**
 * Test complete cart flow from add to checkout
 */
export async function testCompleteCartFlow(): Promise<void> {
  console.log('\n🛒 Testing Complete Cart Flow...\n');
  
  const testProduct = {
    product_id: '1',
    quantity: 2,
    size: 'L',
    color: 'Blue',
  };
  
  try {
    // Step 1: Add item to cart
    console.log('1. Adding item to cart...');
    const addResponse = await addToCart(testProduct);
    console.log('✅ Add to cart:', addResponse.message);
    
    // Step 2: Get cart to verify item was added
    console.log('\n2. Fetching cart...');
    let cartResponse = await getCart();
    console.log('✅ Cart fetched:', {
      totalItems: cartResponse.data.items_count,
      totalAmount: cartResponse.data.estimated_total,
      itemsCount: cartResponse.data.items.length
    });
    
    if (cartResponse.data.items.length > 0) {
      const firstItem = cartResponse.data.items[0];
      console.log('First item:', {
        name: firstItem.product_name,
        quantity: firstItem.quantity,
        size: firstItem.size,
        color: firstItem.color
      });
      
      // Step 3: Update item quantity
      console.log('\n3. Updating item quantity...');
      const updateResponse = await updateCartItem(firstItem.id, 3);
      console.log('✅ Quantity updated:', updateResponse.message);
      
      // Step 4: Verify quantity update
      console.log('\n4. Verifying quantity update...');
      cartResponse = await getCart();
      const updatedItem = cartResponse.data.items.find(item => item.id === firstItem.id);
      console.log('Updated quantity:', updatedItem?.quantity);
      
      // Step 5: Remove specific item
      console.log('\n5. Removing item...');
      const removeResponse = await removeFromCart(firstItem.id);
      console.log('✅ Item removed:', removeResponse.message);
      
      // Step 6: Verify removal
      console.log('\n6. Verifying removal...');
      cartResponse = await getCart();
      console.log('Items after removal:', cartResponse.data.items.length);
    }
    
    // Step 7: Add multiple items for clear test
    console.log('\n7. Adding multiple items for clear test...');
    await addToCart({ product_id: '1', quantity: 1, size: 'M', color: 'Red' });
    await addToCart({ product_id: '2', quantity: 2, size: 'L', color: 'Green' });
    
    cartResponse = await getCart();
    console.log('Items before clear:', cartResponse.data.items.length);
    
    // Step 8: Clear entire cart
    console.log('\n8. Clearing entire cart...');
    const clearResponse = await clearCart();
    console.log('✅ Cart cleared:', clearResponse.message);
    
    // Step 9: Verify cart is empty
    console.log('\n9. Verifying cart is empty...');
    cartResponse = await getCart();
    console.log('Items after clear:', cartResponse.data.items.length);
    
    console.log('\n🎉 Complete cart flow test successful!');
    
  } catch (error) {
    console.error('❌ Cart flow test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        console.log('💡 Authentication required - make sure user is logged in');
      } else if (error.message.includes('404')) {
        console.log('💡 Product or cart item not found');
      } else {
        console.log('💡 Check backend server and API endpoints');
      }
    }
  }
  
  console.log('\n=====================================\n');
}

/**
 * Test cart UI interactions
 */
export async function testCartUIFlow(): Promise<void> {
  console.log('\n🖱️ Testing Cart UI Flow...\n');
  
  try {
    // Test cart count display
    console.log('1. Testing cart count display...');
    const cartData = await getCart();
    console.log('Current cart count:', cartData.data.items_count);
    
    // Test cart sidebar data
    console.log('2. Testing cart sidebar data...');
    if (cartData.data.items.length > 0) {
      cartData.data.items.forEach((item, index) => {
        console.log(`Item ${index + 1}:`, {
          name: item.product_name,
          image: item.product_image ? 'Has image' : 'No image',
          price: `$${item.price}`,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        });
      });
    } else {
      console.log('Cart is empty - empty state should be shown');
    }
    
    console.log('\n✅ Cart UI flow test completed');
    
  } catch (error) {
    console.error('❌ Cart UI flow test failed:', error);
  }
  
  console.log('\n=====================================\n');
}

/**
 * Run all cart flow tests
 */
export async function runAllCartFlowTests(): Promise<void> {
  console.log('🚀 Starting Complete Cart Flow Tests...\n');
  
  await testCompleteCartFlow();
  await testCartUIFlow();
  
  console.log('✨ All cart flow tests completed!\n');
}

// Export convenience function for quick testing
export function testCartFlow(): void {
  runAllCartFlowTests().catch(console.error);
}
