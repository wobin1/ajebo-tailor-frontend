/**
 * Test utility to verify price formatting works correctly
 */

export function testPriceFormatting(): void {
  console.log('\n💰 Testing Price Formatting...\n');
  
  const testPrices = [
    { input: 29.99, expected: '$29.99' },
    { input: '29.99', expected: '$29.99' },
    { input: 100, expected: '$100.00' },
    { input: '100', expected: '$100.00' },
    { input: 0, expected: '$0.00' },
    { input: '0', expected: '$0.00' },
    { input: 1234.5, expected: '$1234.50' },
    { input: '1234.5', expected: '$1234.50' },
  ];
  
  testPrices.forEach((test, index) => {
    try {
      const formatted = `$${Number(test.input).toFixed(2)}`;
      const passed = formatted === test.expected;
      const status = passed ? '✅' : '❌';
      
      console.log(`${status} Test ${index + 1}: ${test.input} → ${formatted}`);
      if (!passed) {
        console.log(`   Expected: ${test.expected}, Got: ${formatted}`);
      }
    } catch (error) {
      console.log(`❌ Test ${index + 1}: ${test.input} → ERROR: ${error}`);
    }
  });
  
  console.log('\n✨ Price formatting tests completed!\n');
}

// Test edge cases
export function testPriceEdgeCases(): void {
  console.log('\n🔍 Testing Price Edge Cases...\n');
  
  const edgeCases = [
    { input: null, description: 'null value' },
    { input: undefined, description: 'undefined value' },
    { input: '', description: 'empty string' },
    { input: 'invalid', description: 'invalid string' },
    { input: NaN, description: 'NaN value' },
  ];
  
  edgeCases.forEach((test, index) => {
    try {
      const result = Number(test.input);
      const formatted = `$${result.toFixed(2)}`;
      console.log(`Test ${index + 1} (${test.description}): ${formatted}`);
    } catch (error) {
      console.log(`❌ Test ${index + 1} (${test.description}): ERROR - ${error}`);
    }
  });
  
  console.log('\n✨ Edge case tests completed!\n');
}

// Run all tests
export function runAllPriceTests(): void {
  testPriceFormatting();
  testPriceEdgeCases();
}
