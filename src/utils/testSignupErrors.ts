/**
 * Test utility to verify signup error handling with backend
 */

import { authApi } from '@/services/authApi';

export interface SignupErrorTest {
  name: string;
  email: string;
  password: string;
  userName: string;
  expectedError?: string;
  expectedStatus?: number;
}

export const signupErrorTests: SignupErrorTest[] = [
  {
    name: 'Valid registration',
    email: 'newuser@example.com',
    password: 'ValidPass123!',
    userName: 'New User',
  },
  {
    name: 'Invalid email format',
    email: 'invalid-email',
    password: 'ValidPass123!',
    userName: 'Test User',
    expectedError: 'email: value is not a valid email address',
    expectedStatus: 422,
  },
  {
    name: 'Password too short',
    email: 'test@example.com',
    password: '123',
    userName: 'Test User',
    expectedError: 'password: ensure this value has at least 8 characters',
    expectedStatus: 422,
  },
  {
    name: 'Empty name',
    email: 'test2@example.com',
    password: 'ValidPass123!',
    userName: '',
    expectedError: 'name: ensure this value has at least 2 characters',
    expectedStatus: 422,
  },
  {
    name: 'Duplicate email',
    email: 'admin@ajebo.com', // Assuming this exists in backend
    password: 'ValidPass123!',
    userName: 'Test User',
    expectedError: 'An account with this email already exists',
    expectedStatus: 409,
  },
];

export class SignupErrorTester {
  /**
   * Test a single signup scenario
   */
  static async testSignup(test: SignupErrorTest): Promise<{
    success: boolean;
    message: string;
    actualError?: string;
    actualStatus?: number;
  }> {
    try {
      await authApi.register({
        email: test.email,
        password: test.password,
        name: test.userName,
        role: 'customer',
      });

      // If we expected an error but didn't get one
      if (test.expectedError) {
        return {
          success: false,
          message: `Expected error "${test.expectedError}" but registration succeeded`,
        };
      }

      return {
        success: true,
        message: 'Registration successful as expected',
      };
    } catch (error) {
      const enhancedError = error as Error & { status?: number };
      const actualError = error instanceof Error ? error.message : 'Unknown error';
      const actualStatus = enhancedError.status;

      // If we expected success but got an error
      if (!test.expectedError) {
        return {
          success: false,
          message: `Expected success but got error: ${actualError}`,
          actualError,
          actualStatus,
        };
      }

      // Check if the error matches expectations
      const errorMatches = actualError.includes(test.expectedError) || 
                          actualError === test.expectedError;
      const statusMatches = !test.expectedStatus || actualStatus === test.expectedStatus;

      if (errorMatches && statusMatches) {
        return {
          success: true,
          message: 'Got expected error',
          actualError,
          actualStatus,
        };
      }

      return {
        success: false,
        message: `Error mismatch. Expected: "${test.expectedError}" (${test.expectedStatus}), Got: "${actualError}" (${actualStatus})`,
        actualError,
        actualStatus,
      };
    }
  }

  /**
   * Run all signup error tests
   */
  static async runAllTests(): Promise<void> {
    console.log('\n=== Signup Error Handling Tests ===');
    
    for (const test of signupErrorTests) {
      console.log(`\nTesting: ${test.name}`);
      console.log(`Email: ${test.email}`);
      console.log(`Password: ${test.password}`);
      console.log(`Name: ${test.userName}`);
      
      const result = await this.testSignup(test);
      
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.message}`);
      
      if (result.actualError) {
        console.log(`   Actual Error: ${result.actualError}`);
      }
      if (result.actualStatus) {
        console.log(`   Status Code: ${result.actualStatus}`);
      }
    }
    
    console.log('\n=====================================\n');
  }

  /**
   * Test specific validation scenarios
   */
  static async testValidationScenarios(): Promise<void> {
    console.log('\n=== Testing Validation Error Scenarios ===');

    const validationTests = [
      {
        name: 'Multiple validation errors',
        data: { email: 'bad-email', password: '123', name: '' },
        description: 'Should return multiple field validation errors'
      },
      {
        name: 'SQL injection attempt',
        data: { 
          email: "test'; DROP TABLE users; --@example.com", 
          password: 'ValidPass123!', 
          name: 'Test User' 
        },
        description: 'Should handle malicious input safely'
      },
      {
        name: 'XSS attempt in name',
        data: { 
          email: 'test@example.com', 
          password: 'ValidPass123!', 
          name: '<script>alert("xss")</script>' 
        },
        description: 'Should sanitize or reject XSS attempts'
      },
    ];

    for (const test of validationTests) {
      console.log(`\nTesting: ${test.name}`);
      console.log(`Description: ${test.description}`);
      
      try {
        await authApi.register({
          email: test.data.email,
          password: test.data.password,
          name: test.data.name,
          role: 'customer',
        });
        console.log('❌ Expected validation error but registration succeeded');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`✅ Got expected validation error: ${errorMessage}`);
      }
    }

    console.log('\n==========================================\n');
  }
}

// Export convenience function
export async function testSignupErrorHandling(): Promise<void> {
  await SignupErrorTester.runAllTests();
  await SignupErrorTester.testValidationScenarios();
}
