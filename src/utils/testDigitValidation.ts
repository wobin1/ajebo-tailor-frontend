/**
 * Quick test to verify the digit validation is working correctly
 */

import { testAllPasswordValidation } from './testPasswordValidation';

// Test the new digit requirement
console.log('Testing Password Validation with Digit Requirement...\n');

// Run comprehensive tests
testAllPasswordValidation();

// Additional focused tests for digit requirement
console.log('=== Focused Digit Validation Tests ===');

const digitTests = [
  { password: 'Password1', expected: true, reason: 'Has uppercase and digit' },
  { password: 'Password', expected: false, reason: 'Missing digit' },
  { password: 'password1', expected: false, reason: 'Missing uppercase' },
  { password: 'PASSWORD1', expected: true, reason: 'All caps with digit' },
  { password: 'Pass123', expected: true, reason: 'Multiple digits' },
  { password: 'MyPass0', expected: true, reason: 'Zero is a valid digit' },
  { password: 'Test9', expected: false, reason: 'Too short (5 chars)' },
  { password: 'TestPass', expected: false, reason: 'No digits' },
];

digitTests.forEach((test, index) => {
  const hasUppercase = /[A-Z]/.test(test.password);
  const hasDigit = /[0-9]/.test(test.password);
  const isLongEnough = test.password.length >= 6;
  const isValid = hasUppercase && hasDigit && isLongEnough;
  
  const status = isValid === test.expected ? '✅' : '❌';
  console.log(`${status} Test ${index + 1}: "${test.password}"`);
  console.log(`   Reason: ${test.reason}`);
  console.log(`   Length: ${test.password.length} | Uppercase: ${hasUppercase} | Digit: ${hasDigit}`);
  console.log(`   Expected: ${test.expected} | Actual: ${isValid}\n`);
});

console.log('Digit validation testing complete!');
