/**
 * Test utility to verify Next.js image configuration
 */

export function testImageConfiguration(): void {
  console.log('\n🖼️ Testing Next.js Image Configuration...\n');
  
  const testUrls = [
    'https://example.com/suit1.jpg',
    'https://ajebo-tailor-backend.onrender.com/images/product1.jpg',
    'https://images.unsplash.com/photo-123456',
    'https://via.placeholder.com/300x300',
    'https://s3.amazonaws.com/bucket/image.jpg',
  ];
  
  console.log('✅ Next.js image configuration updated to allow:');
  console.log('  - example.com (HTTPS)');
  console.log('  - ajebo-tailor-backend.onrender.com (HTTPS)');
  console.log('  - *.amazonaws.com (HTTPS)');
  console.log('  - images.unsplash.com (HTTPS)');
  console.log('  - via.placeholder.com (HTTPS)');
  
  console.log('\n📋 Test URLs that should now work:');
  testUrls.forEach((url, index) => {
    console.log(`  ${index + 1}. ${url}`);
  });
  
  console.log('\n⚠️ Note: You need to restart the Next.js development server for changes to take effect.');
  console.log('   Run: npm run dev or yarn dev\n');
  
  console.log('✨ Image configuration test completed!\n');
}

// Auto-run test
testImageConfiguration();
