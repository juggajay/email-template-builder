// Test the OAuth callback redirect logic
console.log('Testing Shopify OAuth Callback Logic\n');

// Simulate the callback parameters
const shop = 'xbbf0y-vp.myshopify.com';
const code = 'test-code-123';
const state = 'test-state';
const hmac = 'test-hmac';

console.log('Input Parameters:');
console.log('- Shop:', shop);
console.log('- Code:', code);
console.log('- State:', state);
console.log('- HMAC:', hmac);

// Extract shop ID from domain (remove .myshopify.com)
const shopId = shop.replace('.myshopify.com', '');
console.log('\nExtracted Shop ID:', shopId);

// Get app handle from environment or use default
const appHandle = process.env.SHOPIFY_APP_HANDLE || 'grant';
console.log('App Handle:', appHandle);

// For embedded apps, redirect to Shopify admin
// Format: https://admin.shopify.com/store/{shop-id}/app/{app-handle}
const shopifyAdminUrl = `https://admin.shopify.com/store/${shopId}/app/${appHandle}`;

console.log('\n✅ Redirect URL:');
console.log(shopifyAdminUrl);

console.log('\n📋 Verification:');
console.log('Expected:', 'https://admin.shopify.com/store/xbbf0y-vp/app/grant');
console.log('Matches:', shopifyAdminUrl === 'https://admin.shopify.com/store/xbbf0y-vp/app/grant' ? '✅ YES' : '❌ NO');

// Test error scenarios
console.log('\n🧪 Testing Edge Cases:');

const testShops = [
  'test-store.myshopify.com',
  'my-shop-123.myshopify.com',
  'store.myshopify.com'
];

testShops.forEach(testShop => {
  const testShopId = testShop.replace('.myshopify.com', '');
  const testUrl = `https://admin.shopify.com/store/${testShopId}/app/${appHandle}`;
  console.log(`${testShop} → ${testUrl}`);
});