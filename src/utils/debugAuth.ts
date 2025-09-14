/**
 * Debug utility to check authentication state and API calls
 */

export function debugAuthState(): void {
  console.log('\n🔍 Debugging Authentication State...\n');
  
  // Check localStorage for tokens
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const userData = localStorage.getItem('user_data');
  
  console.log('📦 LocalStorage Contents:');
  console.log(`Access Token: ${accessToken ? 'EXISTS' : 'MISSING'}`);
  console.log(`Refresh Token: ${refreshToken ? 'EXISTS' : 'MISSING'}`);
  console.log(`User Data: ${userData ? 'EXISTS' : 'MISSING'}`);
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('👤 User Data:', user);
    } catch {
      console.log('❌ Invalid user data in localStorage');
    }
  }
  
  console.log('\n🌐 API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');
  
  console.log('\n✨ Debug complete!\n');
}

// Auto-run debug when imported
debugAuthState();
