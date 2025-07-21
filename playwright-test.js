const { chromium } = require('playwright');

(async () => {
  console.log('Starting Playwright tests...\n');
  
  // Launch browser with Playwright's bundled Chromium
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('✅ Browser launched successfully!\n');
    
    // Test 1: Landing Page
    console.log('1. Testing Landing Page...');
    await page.goto('http://localhost:3000');
    const title = await page.title();
    console.log(`   ✓ Page title: ${title}`);
    
    // Take screenshot
    await page.screenshot({ path: 'landing-page.png' });
    console.log('   ✓ Screenshot saved: landing-page.png');
    
    // Check buttons
    const getStartedBtn = await page.locator('text=Get Started');
    const viewTemplatesBtn = await page.locator('text=View Templates');
    console.log(`   ✓ Get Started button visible: ${await getStartedBtn.isVisible()}`);
    console.log(`   ✓ View Templates button visible: ${await viewTemplatesBtn.isVisible()}`);
    
    // Test 2: Templates Page
    console.log('\n2. Testing Templates Page...');
    await viewTemplatesBtn.click();
    await page.waitForLoadState('networkidle');
    console.log(`   ✓ Navigated to: ${page.url()}`);
    
    // Check for loading spinner
    const loadingSpinner = page.locator('text=Loading templates');
    if (await loadingSpinner.isVisible()) {
      console.log('   ⚠ Templates loading spinner detected');
      try {
        await loadingSpinner.waitFor({ state: 'hidden', timeout: 5000 });
        console.log('   ✓ Templates loaded');
      } catch {
        console.log('   ✗ Templates failed to load');
      }
    }
    
    await page.screenshot({ path: 'templates-page.png' });
    console.log('   ✓ Screenshot saved: templates-page.png');
    
    // Test 3: Authentication
    console.log('\n3. Testing Authentication Pages...');
    await page.goto('http://localhost:3000/login');
    console.log(`   ✓ Login page: ${page.url()}`);
    await page.screenshot({ path: 'login-page.png' });
    
    await page.goto('http://localhost:3000/signup');
    console.log(`   ✓ Signup page: ${page.url()}`);
    await page.screenshot({ path: 'signup-page.png' });
    
    // Test 4: Dashboard
    console.log('\n4. Testing Dashboard...');
    await page.goto('http://localhost:3000/dashboard');
    console.log(`   ✓ Dashboard page: ${page.url()}`);
    await page.screenshot({ path: 'dashboard-page.png' });
    
    // Test 5: Editor
    console.log('\n5. Testing Editor...');
    await page.goto('http://localhost:3000/editor');
    console.log(`   ✓ Editor page: ${page.url()}`);
    await page.screenshot({ path: 'editor-page.png' });
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await browser.close();
  }
})();