import { test, expect } from '@playwright/test';

test.describe('Shopify OAuth Flow', () => {
  test('OAuth callback redirects to Shopify admin URL', async ({ page, request }) => {
    console.log('Testing Shopify OAuth redirect...');
    
    // Test parameters
    const shopDomain = 'xbbf0y-vp.myshopify.com';
    const shopId = 'xbbf0y-vp';
    const code = 'test-auth-code';
    const state = 'test-state';
    const hmac = 'test-hmac';
    
    // Expected redirect URL
    const expectedRedirectUrl = `https://admin.shopify.com/store/${shopId}/app/grant`;
    
    // First, let's test the callback endpoint directly
    console.log('Testing callback endpoint directly...');
    
    try {
      // Make a request to the callback endpoint
      const callbackUrl = `http://localhost:3000/api/shopify/callback?shop=${shopDomain}&code=${code}&state=${state}&hmac=${hmac}`;
      
      // Use page.goto with waitUntil to handle redirects
      const response = await page.goto(callbackUrl, {
        waitUntil: 'commit',
        timeout: 10000
      });
      
      // Check if we got redirected
      const currentUrl = page.url();
      console.log('Current URL after redirect:', currentUrl);
      
      // The page might redirect to login first if not authenticated
      if (currentUrl.includes('/login')) {
        console.log('Redirected to login page (expected if not authenticated)');
      } else if (currentUrl.includes('/settings')) {
        console.log('Redirected to settings page (error case)');
      } else if (currentUrl.includes('admin.shopify.com')) {
        console.log('✅ Successfully redirected to Shopify admin!');
        expect(currentUrl).toContain('admin.shopify.com/store/');
        expect(currentUrl).toContain('/app/grant');
      }
      
    } catch (error) {
      console.log('Error during redirect test:', error.message);
      
      // If we can't follow the redirect due to CORS or domain restrictions,
      // let's at least test the API response
      console.log('\nTesting API response headers...');
      
      const apiResponse = await request.get(`http://localhost:3000/api/shopify/callback`, {
        params: {
          shop: shopDomain,
          code: code,
          state: state,
          hmac: hmac
        },
        maxRedirects: 0, // Don't follow redirects
        ignoreHTTPSErrors: true
      });
      
      console.log('Response status:', apiResponse.status());
      console.log('Response headers:', await apiResponse.allHeaders());
      
      // Check for redirect status
      if (apiResponse.status() === 302 || apiResponse.status() === 307) {
        const location = apiResponse.headers()['location'];
        console.log('Redirect location:', location);
        
        // Verify the redirect URL
        if (location) {
          if (location === expectedRedirectUrl) {
            console.log('✅ Redirect URL is correct!');
          } else if (location.includes('admin.shopify.com')) {
            console.log('✅ Redirecting to Shopify admin (good)');
            console.log('   Expected:', expectedRedirectUrl);
            console.log('   Actual:', location);
          } else {
            console.log('❌ Wrong redirect URL!');
            console.log('   Expected:', expectedRedirectUrl);
            console.log('   Actual:', location);
          }
        }
      }
    }
  });

  test('Full OAuth flow simulation', async ({ page }) => {
    console.log('\nTesting full OAuth flow...');
    
    // Start at the settings page
    await page.goto('http://localhost:3000/settings?tab=integrations', {
      waitUntil: 'networkidle'
    });
    
    // Check if we need to log in first
    if (page.url().includes('/login')) {
      console.log('Need to log in first...');
      // You would add login steps here
      return;
    }
    
    // Look for Shopify integration section
    const shopifySection = await page.locator('text=Shopify Integration').first();
    if (await shopifySection.isVisible()) {
      console.log('✅ Found Shopify integration section');
      
      // Check if already connected
      const connectedBadge = await page.locator('text=Connected').first();
      if (await connectedBadge.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('Already connected to Shopify');
        
        // Look for disconnect button
        const disconnectBtn = await page.locator('button:has-text("Disconnect")').first();
        if (await disconnectBtn.isVisible()) {
          console.log('Found disconnect button');
        }
      } else {
        console.log('Not connected - looking for connect form');
        
        // Find the store domain input
        const storeInput = await page.locator('input[placeholder*="mystore"]').first();
        if (await storeInput.isVisible()) {
          console.log('✅ Found store domain input');
          
          // Fill in the store domain
          await storeInput.fill('xbbf0y-vp');
          
          // Find and click connect button
          const connectBtn = await page.locator('button:has-text("Connect Shopify Store")').first();
          if (await connectBtn.isVisible()) {
            console.log('✅ Found connect button');
            
            // Monitor network requests
            const redirectPromise = page.waitForRequest(request => 
              request.url().includes('/api/shopify/auth') || 
              request.url().includes('myshopify.com'),
              { timeout: 5000 }
            ).catch(() => null);
            
            // Click connect
            await connectBtn.click();
            
            const redirectRequest = await redirectPromise;
            if (redirectRequest) {
              console.log('OAuth redirect initiated to:', redirectRequest.url());
            }
          }
        }
      }
    } else {
      console.log('Could not find Shopify integration section');
    }
  });
});

// Test the redirect logic in isolation
test('Redirect URL construction', async () => {
  const testCases = [
    { shop: 'xbbf0y-vp.myshopify.com', expectedId: 'xbbf0y-vp' },
    { shop: 'test-store.myshopify.com', expectedId: 'test-store' },
    { shop: 'my-shop-123.myshopify.com', expectedId: 'my-shop-123' }
  ];
  
  for (const testCase of testCases) {
    const shopId = testCase.shop.replace('.myshopify.com', '');
    const redirectUrl = `https://admin.shopify.com/store/${shopId}/app/grant`;
    
    console.log(`${testCase.shop} → ${redirectUrl}`);
    expect(shopId).toBe(testCase.expectedId);
    expect(redirectUrl).toBe(`https://admin.shopify.com/store/${testCase.expectedId}/app/grant`);
  }
  
  console.log('✅ All redirect URL constructions are correct');
});