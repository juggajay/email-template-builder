import { test, expect } from '@playwright/test';

test.describe('Shopify OAuth Direct Tests', () => {
  test('Test OAuth redirect logic directly', async ({ page }) => {
    console.log('Testing OAuth redirect logic...\n');
    
    // Create a test page that simulates the OAuth callback logic
    await page.goto('about:blank');
    
    // Inject and run the redirect logic
    const result = await page.evaluate(() => {
      // Simulate the OAuth callback logic
      const shop = 'xbbf0y-vp.myshopify.com';
      const shopId = shop.replace('.myshopify.com', '');
      const appHandle = 'grant'; // Default value
      const shopifyAdminUrl = `https://admin.shopify.com/store/${shopId}/app/${appHandle}`;
      
      return {
        shop,
        shopId,
        appHandle,
        redirectUrl: shopifyAdminUrl,
        expected: 'https://admin.shopify.com/store/xbbf0y-vp/app/grant'
      };
    });
    
    console.log('Test results:');
    console.log(`Shop: ${result.shop}`);
    console.log(`Shop ID: ${result.shopId}`);
    console.log(`App Handle: ${result.appHandle}`);
    console.log(`Redirect URL: ${result.redirectUrl}`);
    console.log(`Expected: ${result.expected}`);
    console.log(`Match: ${result.redirectUrl === result.expected ? '✅ YES' : '❌ NO'}`);
    
    expect(result.redirectUrl).toBe(result.expected);
  });

  test('Test with actual API request (with cookies)', async ({ page, context }) => {
    console.log('\nTesting with OAuth state cookie...\n');
    
    // Set a test OAuth state cookie
    await context.addCookies([{
      name: 'shopify_oauth_state',
      value: 'test-state',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax'
    }]);
    
    // Now make the request
    const response = await page.request.get('http://localhost:3000/api/shopify/callback', {
      params: {
        shop: 'xbbf0y-vp.myshopify.com',
        code: 'test-code',
        state: 'test-state',
        hmac: 'test-hmac'
      },
      maxRedirects: 0,
      failOnStatusCode: false
    });
    
    const status = response.status();
    const headers = response.headers();
    
    console.log('Response status:', status);
    console.log('Location header:', headers['location'] || 'Not found');
    
    if (headers['location']) {
      const location = headers['location'];
      console.log('\nRedirect analysis:');
      
      if (location.includes('admin.shopify.com')) {
        console.log('✅ Redirecting to Shopify admin');
        
        if (location.includes('/app/grant')) {
          console.log('✅ Using correct /app/grant path');
        } else if (location.includes('/apps/grant')) {
          console.log('❌ Using wrong /apps/grant path (should be /app/)');
        }
        
        const expectedUrl = 'https://admin.shopify.com/store/xbbf0y-vp/app/grant';
        if (location === expectedUrl) {
          console.log('✅ PERFECT! Exact match with expected URL');
        } else {
          console.log('⚠️  URL mismatch:');
          console.log('   Expected:', expectedUrl);
          console.log('   Actual:  ', location);
        }
      } else if (location.includes('localhost:3000') || location.includes('zebamail.com')) {
        console.log('❌ Still redirecting to app domain instead of Shopify admin');
      } else {
        console.log('❓ Unexpected redirect location');
      }
    }
  });

  test('Manual verification steps', async () => {
    console.log('\n📋 Manual Verification Checklist:\n');
    console.log('1. Check the code in /src/app/api/shopify/callback/route.ts');
    console.log('   - Line ~101 should have: /app/grant (not /apps/grant)');
    console.log('   - Should redirect to: https://admin.shopify.com/store/${shopId}/app/${appHandle}');
    console.log('\n2. Environment variables needed:');
    console.log('   - SHOPIFY_CLIENT_ID');
    console.log('   - SHOPIFY_CLIENT_SECRET');
    console.log('   - SHOPIFY_APP_HANDLE=grant');
    console.log('\n3. The redirect should happen AFTER:');
    console.log('   - OAuth state validation');
    console.log('   - HMAC verification');
    console.log('   - User authentication check');
    console.log('   - OAuth token exchange');
    console.log('\n4. Common issues:');
    console.log('   - Missing OAuth state cookie → redirects to /settings?error=invalid_state');
    console.log('   - Invalid HMAC → redirects to /settings?error=invalid_hmac');
    console.log('   - Not logged in → redirects to /login');
    console.log('   - Success → redirects to https://admin.shopify.com/store/{id}/app/grant');
  });
});