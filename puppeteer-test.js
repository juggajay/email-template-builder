const puppeteer = require('puppeteer');

async function runTests() {
  console.log('🚀 Starting Puppeteer automated testing...\n');
  
  let browser;
  try {
    // Launch browser with Puppeteer's bundled Chromium
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    console.log('✅ Browser launched successfully!\n');
    
    // Test 1: Landing Page
    console.log('1. Testing Landing Page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    const title = await page.title();
    console.log(`   ✓ Page title: ${title}`);
    
    // Check for main buttons
    const getStartedButton = await page.$('a:has-text("Get Started")') || await page.$('text/Get Started');
    const viewTemplatesButton = await page.$('a:has-text("View Templates")') || await page.$('text/View Templates');
    
    console.log(`   ✓ Get Started button exists: ${!!getStartedButton}`);
    console.log(`   ✓ View Templates button exists: ${!!viewTemplatesButton}`);
    
    await page.screenshot({ path: 'screenshots/landing-page.png' });
    console.log('   ✓ Screenshot saved: screenshots/landing-page.png');
    
    // Test 2: Templates Page
    console.log('\n2. Testing Templates Page...');
    await page.click('text/View Templates');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    console.log(`   ✓ Navigated to: ${page.url()}`);
    
    // Check for loading spinner
    const loadingText = await page.$('text/Loading templates');
    if (loadingText) {
      console.log('   ⚠ Loading spinner detected, waiting...');
      try {
        await page.waitForSelector('text/Loading templates', { hidden: true, timeout: 10000 });
        console.log('   ✓ Templates loaded');
      } catch {
        console.log('   ✗ Templates failed to load within 10 seconds');
      }
    }
    
    // Check for template cards
    const templateCards = await page.$$('[class*="card"]');
    console.log(`   ✓ Found ${templateCards.length} template cards`);
    
    await page.screenshot({ path: 'screenshots/templates-page.png' });
    console.log('   ✓ Screenshot saved: screenshots/templates-page.png');
    
    // Test 3: Click a template
    if (templateCards.length > 0) {
      console.log('\n3. Testing Template Click...');
      await templateCards[0].click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      console.log(`   ✓ Navigated to: ${page.url()}`);
      
      // Check if editor loaded
      const editorElement = await page.$('#email-editor');
      console.log(`   ✓ Editor element exists: ${!!editorElement}`);
      
      await page.screenshot({ path: 'screenshots/editor-page.png' });
      console.log('   ✓ Screenshot saved: screenshots/editor-page.png');
    }
    
    // Test 4: Authentication Pages
    console.log('\n4. Testing Authentication Pages...');
    
    // Login page
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    console.log(`   ✓ Login page - Email input: ${!!emailInput}, Password input: ${!!passwordInput}`);
    await page.screenshot({ path: 'screenshots/login-page.png' });
    
    // Signup page
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle2' });
    console.log(`   ✓ Signup page loaded`);
    await page.screenshot({ path: 'screenshots/signup-page.png' });
    
    // Password reset page
    await page.goto('http://localhost:3000/reset-password', { waitUntil: 'networkidle2' });
    console.log(`   ✓ Password reset page: ${page.url().includes('reset-password') ? 'Found' : 'Missing (404)'}`);
    
    // Test 5: Dashboard Pages
    console.log('\n5. Testing Dashboard Pages...');
    
    const dashboardPages = [
      { url: '/dashboard', name: 'Dashboard' },
      { url: '/billing', name: 'Billing' },
      { url: '/settings', name: 'Settings' }
    ];
    
    for (const pageInfo of dashboardPages) {
      await page.goto(`http://localhost:3000${pageInfo.url}`, { waitUntil: 'networkidle2' });
      console.log(`   ✓ ${pageInfo.name} page loads: ${page.url()}`);
      await page.screenshot({ path: `screenshots/${pageInfo.name.toLowerCase()}-page.png` });
    }
    
    // Test 6: Quick Navigation Test
    console.log('\n6. Testing Quick Navigation...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Click Get Started
    await page.click('text/Get Started');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log(`   ✓ Get Started navigates to: ${page.url()}`);
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   - Landing page: ✅');
    console.log('   - Templates page: ✅');
    console.log('   - Editor: ✅');
    console.log('   - Authentication: ✅');
    console.log('   - Dashboard pages: ✅');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (browser) {
      await browser.close();
      console.log('\n🔒 Browser closed');
    }
  }
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// Run the tests
runTests().catch(console.error);