/**
 * Test utility to verify password validation requirements
 */

export interface PasswordTest {
  password: string;
  shouldPass: boolean;
  description: string;
}

export const passwordTests: PasswordTest[] = [
  {
    password: 'Password123',
    shouldPass: true,
    description: 'Valid password with uppercase, lowercase, and numbers'
  },
  {
    password: 'UPPERCASE123',
    shouldPass: true,
    description: 'Valid password with uppercase and numbers'
  },
  {
    password: 'MyPass1',
    shouldPass: true,
    description: 'Minimum length with uppercase and digit'
  },
  {
    password: 'password123',
    shouldPass: false,
    description: 'No uppercase letter - should fail'
  },
  {
    password: 'Pass',
    shouldPass: false,
    description: 'Too short (less than 6 characters) - should fail'
  },
  {
    password: 'PASSWORD123',
    shouldPass: true,
    description: 'All uppercase with digits - should pass'
  },
  {
    password: 'PASSWORD',
    shouldPass: false,
    description: 'All uppercase but no digits - should fail'
  },
  {
    password: 'lowercase',
    shouldPass: false,
    description: 'All lowercase, no uppercase or digits - should fail'
  },
  {
    password: '123456',
    shouldPass: false,
    description: 'Numbers only, no uppercase - should fail'
  },
  {
    password: 'Special@123',
    shouldPass: true,
    description: 'Special characters with uppercase and digits - should pass'
  },
  {
    password: 'special@123',
    shouldPass: false,
    description: 'Special characters without uppercase - should fail'
  },
  {
    password: 'PasswordNoDigit',
    shouldPass: false,
    description: 'Has uppercase but no digits - should fail'
  },
  {
    password: 'Pass1',
    shouldPass: true,
    description: 'Minimum valid password with uppercase and digit'
  }
];

/**
 * Test password validation using the same regex as the signup form
 */
export function testPasswordValidation(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Test minimum length
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  // Test uppercase letter requirement
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Test digit requirement
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one digit');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Run all password validation tests
 */
export function runPasswordValidationTests(): void {
  console.log('\n=== Password Validation Tests ===');
  
  let passedTests = 0;
  const totalTests = passwordTests.length;
  
  passwordTests.forEach((test, index) => {
    const result = testPasswordValidation(test.password);
    const actuallyPassed = result.isValid;
    const testPassed = actuallyPassed === test.shouldPass;
    
    const status = testPassed ? '✅' : '❌';
    console.log(`${status} Test ${index + 1}: ${test.description}`);
    console.log(`   Password: "${test.password}"`);
    console.log(`   Expected: ${test.shouldPass ? 'PASS' : 'FAIL'}`);
    console.log(`   Actual: ${actuallyPassed ? 'PASS' : 'FAIL'}`);
    
    if (result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.join(', ')}`);
    }
    
    if (testPassed) {
      passedTests++;
    }
    
    console.log('');
  });
  
  console.log(`Results: ${passedTests}/${totalTests} tests passed`);
  console.log('================================\n');
}

/**
 * Test specific scenarios for the uppercase and digit requirements
 */
export function testPasswordRequirements(): void {
  console.log('\n=== Password Requirements Tests ===');
  
  const testCases = [
    { password: 'Password123', hasUpper: true, hasDigit: true, description: 'Valid: has both uppercase and digit' },
    { password: 'password123', hasUpper: false, hasDigit: true, description: 'Invalid: missing uppercase' },
    { password: 'PASSWORD', hasUpper: true, hasDigit: false, description: 'Invalid: missing digit' },
    { password: 'password', hasUpper: false, hasDigit: false, description: 'Invalid: missing both' },
    { password: 'Pass1', hasUpper: true, hasDigit: true, description: 'Valid: minimum requirements met' },
    { password: 'UPPER123', hasUpper: true, hasDigit: true, description: 'Valid: all caps with digits' },
    { password: 'Special@1A', hasUpper: true, hasDigit: true, description: 'Valid: special chars with requirements' },
  ];
  
  testCases.forEach(testCase => {
    const hasUppercase = /[A-Z]/.test(testCase.password);
    const hasDigit = /[0-9]/.test(testCase.password);
    const upperCorrect = hasUppercase === testCase.hasUpper;
    const digitCorrect = hasDigit === testCase.hasDigit;
    const allCorrect = upperCorrect && digitCorrect;
    
    const status = allCorrect ? '✅' : '❌';
    console.log(`${status} "${testCase.password}" - ${testCase.description}`);
    console.log(`   Uppercase: ${hasUppercase ? 'Yes' : 'No'} | Digit: ${hasDigit ? 'Yes' : 'No'}`);
  });
  
  console.log('====================================\n');
}

// Export convenience function for quick testing
export function testAllPasswordValidation(): void {
  runPasswordValidationTests();
  testPasswordRequirements();
}
