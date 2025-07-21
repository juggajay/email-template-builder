/**
 * Test script to verify Shopify OAuth redirect locally
 */

const testShopDomain = 'xbbf0y-vp.myshopify.com';

// Extract shop ID (remove .myshopify.com)
const shopId = testShopDomain.replace('.myshopify.com', '');
console.log('Shop Domain:', testShopDomain);
console.log('Extracted Shop ID:', shopId);

// Build the redirect URL
const appHandle = process.env.SHOPIFY_APP_HANDLE || 'grant';
const shopifyAdminUrl = `https://admin.shopify.com/store/${shopId}/app/${appHandle}`;

console.log('\nExpected Redirect URL:');
console.log(shopifyAdminUrl);

console.log('\nThis should match:');
console.log('https://admin.shopify.com/store/xbbf0y-vp/app/grant');

// Test with different shop domains
const testCases = [
  'xbbf0y-vp.myshopify.com',
  'my-test-store.myshopify.com',
  'another-shop.myshopify.com'
];

console.log('\n--- Testing Multiple Shop Domains ---');
testCases.forEach(shop => {
  const id = shop.replace('.myshopify.com', '');
  console.log(`${shop} → https://admin.shopify.com/store/${id}/app/grant`);
});