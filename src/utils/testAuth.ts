/**
 * Test utility to verify authentication API integration
 * This can be used to test the connection between frontend and backend
 */

import { authApi } from '@/services/authApi';

export interface AuthTestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown> | string;
}

export class AuthTester {
  /**
   * Test backend API connectivity
   */
  static async testConnection(): Promise<AuthTestResult> {
    try {
      // Try to make a simple request to the backend
      const response = await fetch('http://localhost:8000/api/v1/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        return {
          success: true,
          message: 'Backend API is reachable (401 expected for unauthenticated request)',
        };
      }

      return {
        success: true,
        message: `Backend API responded with status: ${response.status}`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to connect to backend API',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test user registration flow
   */
  static async testRegistration(
    email: string = 'test@example.com',
    password: string = 'testpassword123',
    name: string = 'Test User'
  ): Promise<AuthTestResult> {
    try {
      const response = await authApi.register({
        email,
        password,
        name,
        role: 'customer',
      });

      return {
        success: true,
        message: 'Registration successful',
        details: {
          userId: response.user.id,
          email: response.user.email,
          name: response.user.name,
          hasTokens: !!(response.access_token && response.refresh_token),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Registration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test user login flow
   */
  static async testLogin(
    email: string = 'test@example.com',
    password: string = 'testpassword123'
  ): Promise<AuthTestResult> {
    try {
      const response = await authApi.login({ email, password });

      return {
        success: true,
        message: 'Login successful',
        details: {
          userId: response.user.id,
          email: response.user.email,
          name: response.user.name,
          hasTokens: !!(response.access_token && response.refresh_token),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Login failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test getting current user
   */
  static async testGetCurrentUser(): Promise<AuthTestResult> {
    try {
      const user = await authApi.getCurrentUser();

      return {
        success: true,
        message: 'Successfully retrieved current user',
        details: {
          userId: user.id,
          email: user.email,
          name: user.name,
          isActive: user.is_active,
          emailVerified: user.email_verified,
        } as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get current user',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test token refresh
   */
  static async testTokenRefresh(): Promise<AuthTestResult> {
    try {
      const response = await authApi.refreshAccessToken();

      if (!response) {
        return {
          success: false,
          message: 'No refresh token available',
        };
      }

      return {
        success: true,
        message: 'Token refresh successful',
        details: {
          hasNewTokens: !!(response.access_token && response.refresh_token),
          expiresIn: response.expires_in,
        } as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Token refresh failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test logout
   */
  static async testLogout(): Promise<AuthTestResult> {
    try {
      await authApi.logout();

      // Check if tokens were cleared
      const isAuthenticated = authApi.isAuthenticated();

      return {
        success: true,
        message: 'Logout successful',
        details: {
          tokensCleared: !isAuthenticated,
        } as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Logout failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Run complete authentication flow test
   */
  static async runCompleteTest(): Promise<AuthTestResult[]> {
    const results: AuthTestResult[] = [];

    // Test 1: Backend connectivity
    console.log('Testing backend connectivity...');
    results.push(await this.testConnection());

    // Test 2: Registration (if backend is available)
    if (results[0].success) {
      console.log('Testing registration...');
      const testEmail = `test-${Date.now()}@example.com`;
      results.push(await this.testRegistration(testEmail, 'testpassword123', 'Test User'));

      // Test 3: Login with the same credentials
      if (results[1].success) {
        console.log('Testing login...');
        results.push(await this.testLogin(testEmail, 'testpassword123'));

        // Test 4: Get current user
        if (results[2].success) {
          console.log('Testing get current user...');
          results.push(await this.testGetCurrentUser());

          // Test 5: Token refresh
          console.log('Testing token refresh...');
          results.push(await this.testTokenRefresh());

          // Test 6: Logout
          console.log('Testing logout...');
          results.push(await this.testLogout());
        }
      }
    }

    return results;
  }

  /**
   * Print test results to console
   */
  static printResults(results: AuthTestResult[]): void {
    console.log('\n=== Authentication API Test Results ===');
    results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} Test ${index + 1}: ${result.message}`);
      if (result.details) {
        console.log('   Details:', result.details);
      }
    });
    console.log('=======================================\n');
  }
}

// Export convenience function for quick testing
export async function testAuthFlow(): Promise<void> {
  const results = await AuthTester.runCompleteTest();
  AuthTester.printResults(results);
}
