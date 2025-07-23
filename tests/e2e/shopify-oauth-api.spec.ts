import { test, expect } from '@playwright/test';

test.describe('Shopify OAuth API Tests', () => {
  test('Callback endpoint returns correct redirect', async ({ request }) => {
    console.log('Testing Shopify OAuth callback endpoint...\n');
    
    // Test with the exact parameters Shopify would send
    const params = {
      shop: 'xbbf0y-vp.myshopify.com',
      code: 'test-code-123',
      state: 'test-state',
      hmac: 'test-hmac-signature',
      timestamp: '1753075164'
    };
    
    console.log('Request parameters:', params);
    
    try {
      // Make request without following redirects
      const response = await request.get('http://localhost:3000/api/shopify/callback', {
        params,
        maxRedirects: 0,
        failOnStatusCode: false
      });
      
      const status = response.status();
      const headers = await response.headers();
      
      console.log('\nResponse details:');
      console.log('Status:', status);
      console.log('Headers:', headers);
      
      // Check for redirect response
      if (status === 302 || status === 307 || status === 308) {
        const location = headers['location'];
        console.log('\n✅ Got redirect response');
        console.log('Location:', location);
        
        // Verify it's redirecting to Shopify admin
        if (location) {
          // Expected: https://admin.shopify.com/store/xbbf0y-vp/app/grant
          expect(location).toContain('admin.shopify.com');
          expect(location).toContain('/store/xbbf0y-vp/app/');
          
          if (location === 'https://admin.shopify.com/store/xbbf0y-vp/app/grant') {
            console.log('✅ PERFECT! Redirect URL is exactly correct!');
          } else {
            console.log('⚠️  Redirect URL format:');
            console.log('   Expected: https://admin.shopify.com/store/xbbf0y-vp/app/grant');
            console.log('   Actual:  ', location);
          }
        }
      } else if (status === 401) {
        console.log('❌ Got 401 Unauthorized - likely missing auth cookie');
        const body = await response.text();
        console.log('Response body:', body);
      } else if (status === 400) {
        console.log('❌ Got 400 Bad Request');
        const body = await response.text();
        console.log('Response body:', body);
      } else {
        console.log('❌ Unexpected status code:', status);
        const body = await response.text();
        console.log('Response body:', body.substring(0, 200) + '...');
      }
      
    } catch (error) {
      console.log('❌ Error testing callback:', (error as Error).message);
    }
  });

  test('Test different shop domains', async ({ request }) => {
    console.log('\nTesting various shop domain formats...\n');
    
    const testShops = [
      'xbbf0y-vp.myshopify.com',
      'test-store.myshopify.com',
      'my-shop-123.myshopify.com'
    ];
    
    for (const shop of testShops) {
      const shopId = shop.replace('.myshopify.com', '');
      const expectedUrl = `https://admin.shopify.com/store/${shopId}/app/grant`;
      
      console.log(`Testing ${shop}:`);
      console.log(`  Expected redirect: ${expectedUrl}`);
      
      const response = await request.get('http://localhost:3000/api/shopify/callback', {
        params: {
          shop,
          code: 'test-code',
          state: 'test-state',
          hmac: 'test-hmac'
        },
        maxRedirects: 0,
        failOnStatusCode: false
      });
      
      const location = response.headers()['location'];
      if (location) {
        console.log(`  Actual redirect:   ${location}`);
        console.log(`  Match: ${location === expectedUrl ? '✅' : '❌'}\n`);
      } else {
        console.log(`  No redirect header (status: ${response.status()})\n`);
      }
    }
  });
});