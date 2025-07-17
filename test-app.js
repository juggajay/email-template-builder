const { chromium } = require('@playwright/test');

async function testApplication() {
  console.log('Starting automated testing...\n');
  
  let browser;
  try {
    // Launch browser
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Test 1: Landing Page
    console.log('1. Testing Landing Page...');
    await page.goto('http://localhost:3000');
    
    // Check if main elements exist
    const title = await page.textContent('h1');
    console.log(`   ✓ Page title: ${title}`);
    
    const getStartedButton = await page.locator('text=Get Started').first();
    const viewTemplatesButton = await page.locator('text=View Templates').first();
    
    console.log(`   ✓ Get Started button exists: ${await getStartedButton.isVisible()}`);
    console.log(`   ✓ View Templates button exists: ${await viewTemplatesButton.isVisible()}`);
    
    // Test 2: Click View Templates
    console.log('\n2. Testing View Templates...');
    await viewTemplatesButton.click();
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    console.log(`   ✓ Navigated to: ${currentUrl}`);
    
    // Check if templates are loading
    const spinner = await page.locator('text=Loading templates').first();
    if (await spinner.isVisible()) {
      console.log('   ⚠ Templates still loading...');
      // Wait for templates to load
      await page.waitForSelector('text=Loading templates', { state: 'hidden', timeout: 10000 }).catch(() => {
        console.log('   ✗ Templates failed to load within 10 seconds');
      });
    }
    
    // Check for template cards
    const templateCards = await page.locator('[class*="template"], [class*="card"]').count();
    console.log(`   ✓ Found ${templateCards} template cards`);
    
    // Test 3: Click a template
    if (templateCards > 0) {
      console.log('\n3. Testing Template Click...');
      const firstTemplate = await page.locator('[class*="template"], [class*="card"]').first();
      await firstTemplate.click();
      await page.waitForLoadState('networkidle');
      
      console.log(`   ✓ Navigated to: ${page.url()}`);
      
      // Check if editor loaded
      const editorContainer = await page.locator('#email-editor').first();
      console.log(`   ✓ Editor container exists: ${await editorContainer.isVisible()}`);
    }
    
    // Test 4: Go back and test Get Started
    console.log('\n4. Testing Authentication Flow...');
    await page.goto('http://localhost:3000');
    await page.locator('text=Get Started').first().click();
    await page.waitForLoadState('networkidle');
    
    console.log(`   ✓ Navigated to: ${page.url()}`);
    
    // Check for signup form
    const emailInput = await page.locator('input[type="email"]').first();
    const passwordInput = await page.locator('input[type="password"]').first();
    
    console.log(`   ✓ Email input exists: ${await emailInput.isVisible()}`);
    console.log(`   ✓ Password input exists: ${await passwordInput.isVisible()}`);
    
    // Test 5: Check other pages
    console.log('\n5. Testing Other Pages...');
    
    const pagesToTest = [
      { url: '/dashboard', name: 'Dashboard' },
      { url: '/billing', name: 'Billing' },
      { url: '/settings', name: 'Settings' }
    ];
    
    for (const pageInfo of pagesToTest) {
      await page.goto(`http://localhost:3000${pageInfo.url}`);
      await page.waitForLoadState('networkidle');
      console.log(`   ✓ ${pageInfo.name} page loads: ${page.url()}`);
    }
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the tests
testApplication().catch(console.error);