const { chromium } = require('playwright');
const fs = require('fs').promises;

async function testTemplateBuilder() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const baseUrl = 'http://localhost:3000';
  const testResults = {
    passed: [],
    failed: [],
    errors: [],
    screenshots: [],
    timestamp: new Date().toISOString()
  };

  // Helper function to test a page
  async function testPage(name, path, checks) {
    console.log(`\n🧪 Testing ${name}...`);
    try {
      const response = await page.goto(`${baseUrl}${path}`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Check response status
      if (response && response.status() !== 200) {
        testResults.failed.push({
          test: name,
          error: `HTTP ${response.status()}`,
          url: `${baseUrl}${path}`
        });
        return false;
      }

      // Run custom checks
      if (checks) {
        await checks();
      }

      // Take screenshot
      const screenshotPath = `screenshots/${name.replace(/\s+/g, '-').toLowerCase()}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      testResults.screenshots.push(screenshotPath);

      // Check for console errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      if (consoleErrors.length > 0) {
        testResults.errors.push({
          test: name,
          consoleErrors
        });
      } else {
        testResults.passed.push(name);
      }

      console.log(`✅ ${name} passed`);
      return true;
    } catch (error) {
      console.log(`❌ ${name} failed: ${error.message}`);
      testResults.failed.push({
        test: name,
        error: error.message,
        stack: error.stack
      });
      return false;
    }
  }

  // Create screenshots directory
  await fs.mkdir('screenshots', { recursive: true });

  // Test 1: Homepage
  await testPage('Homepage', '/', async () => {
    await page.waitForSelector('text=/Get Started|Start Building|Create Templates/i', { timeout: 10000 });
    const title = await page.title();
    console.log(`  Title: ${title}`);
  });

  // Test 2: Login Page
  await testPage('Login Page', '/login', async () => {
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.waitForSelector('button[type="submit"]', { timeout: 10000 });
  });

  // Test 3: Signup Page
  await testPage('Signup Page', '/signup', async () => {
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
  });

  // Test 4: Reset Password Page
  await testPage('Reset Password', '/reset-password', async () => {
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  });

  // Test 5: Templates Gallery
  await testPage('Templates Gallery', '/templates', async () => {
    await page.waitForSelector('text=/All Templates|Browse Templates|Templates/i', { timeout: 10000 });
    // Wait for template cards to load
    await page.waitForTimeout(2000);
  });

  // Test 6: Pricing Page
  await testPage('Pricing Page', '/pricing', async () => {
    await page.waitForSelector('text=/Free|Starter|Basic/i', { timeout: 10000 });
    await page.waitForSelector('text=/Pro|Professional|Premium/i', { timeout: 10000 });
  });

  // Test 7: Editor Page
  await testPage('Editor Page', '/editor', async () => {
    // Wait for editor to load (might be iframe or div)
    await page.waitForTimeout(5000);
    const hasEditor = await page.locator('#editor, [data-testid="email-editor"], iframe').count() > 0;
    if (!hasEditor) {
      throw new Error('Editor not found on page');
    }
  });

  // Test 8: Dashboard (might redirect to login)
  await testPage('Dashboard', '/dashboard', async () => {
    // Check if redirected to login or shows dashboard
    await page.waitForTimeout(2000);
    const url = page.url();
    if (url.includes('/login')) {
      console.log('  Dashboard correctly requires authentication');
    } else {
      await page.waitForSelector('text=/Dashboard|Overview|My Templates/i', { timeout: 10000 });
    }
  });

  // Test 9: 404 Page
  await testPage('404 Page', '/non-existent-page-12345', async () => {
    await page.waitForTimeout(2000);
    // Check for 404 content
    const has404 = await page.locator('text=/404|Not Found|Page not found/i').count() > 0;
    if (!has404) {
      console.log('  Warning: No 404 message found');
    }
  });

  // Test 10: Check responsiveness
  console.log('\n📱 Testing Mobile Responsiveness...');
  await context.setViewportSize({ width: 375, height: 667 });
  await testPage('Mobile Homepage', '/', async () => {
    await page.waitForTimeout(1000);
    // Check for mobile menu
    const hasMobileMenu = await page.locator('button[aria-label*="menu"], button:has-text("Menu"), [data-testid="mobile-menu"]').count() > 0;
    console.log(`  Mobile menu present: ${hasMobileMenu}`);
  });

  // Generate test report
  const report = {
    ...testResults,
    summary: {
      total: testResults.passed.length + testResults.failed.length,
      passed: testResults.passed.length,
      failed: testResults.failed.length,
      errors: testResults.errors.length
    }
  };

  await fs.writeFile('test-report.json', JSON.stringify(report, null, 2));

  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${report.summary.passed}`);
  console.log(`❌ Failed: ${report.summary.failed}`);
  console.log(`⚠️  Errors: ${report.summary.errors}`);

  await browser.close();

  // Exit with error if tests failed
  if (report.summary.failed > 0 || report.summary.errors > 0) {
    process.exit(1);
  }
}

// Run tests
testTemplateBuilder().catch(console.error);