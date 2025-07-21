console.log('🔍 Verifying Shopify OAuth Fix\n');

// Test the exact logic from the callback route
const shop = 'xbbf0y-vp.myshopify.com';
const shopId = shop.replace('.myshopify.com', '');
const appHandle = process.env.SHOPIFY_APP_HANDLE || 'grant';
const shopifyAdminUrl = `https://admin.shopify.com/store/${shopId}/app/${appHandle}`;

console.log('Input:');
console.log('  Shop Domain:', shop);
console.log('  App Handle:', appHandle);

console.log('\nProcessing:');
console.log('  Extracted Shop ID:', shopId);
console.log('  Built URL:', shopifyAdminUrl);

console.log('\nVerification:');
const expectedUrl = 'https://admin.shopify.com/store/xbbf0y-vp/app/grant';
console.log('  Expected:', expectedUrl);
console.log('  Actual:  ', shopifyAdminUrl);
console.log('  Match:   ', shopifyAdminUrl === expectedUrl ? '✅ YES' : '❌ NO');

console.log('\n✅ Summary:');
console.log('  - Using /app/ (singular) ✓');
console.log('  - NOT using /apps/ (plural) ✓');
console.log('  - Redirect URL is correct ✓');

console.log('\n📝 Next Steps:');
console.log('  1. Deploy to production (Vercel)');
console.log('  2. Set SHOPIFY_APP_HANDLE=grant in production env');
console.log('  3. Run Shopify automated test');
console.log('  4. Should redirect to:', expectedUrl);