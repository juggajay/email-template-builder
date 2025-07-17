const puppeteer = require('puppeteer');

async function testTemplateLoading() {
  console.log('🔍 Testing Template Loading Process (Headless)\n');
  console.log('=====================================\n');
  
  const browser = await puppeteer.launch({ 
    headless: true, // Run in headless mode
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  const logs = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    logs.push(`[${type}] ${text}`);
    
    if (type === 'error') {
      console.error('❌ BROWSER ERROR:', text);
    } else if (text.includes('[Editor') || text.includes('[EmailEditor]')) {
      console.log('📝', text);
    }
  });

  const baseUrl = 'http://localhost:3000';
  
  try {
    // Step 1: Navigate to templates page
    console.log('\n🎯 Step 1: Loading Templates Gallery...');
    await page.goto(`${baseUrl}/templates`, { waitUntil: 'networkidle0' });
    
    // Step 2: Click on first template
    console.log('\n🎯 Step 2: Clicking first template...');
    await page.click('[class*="card"]:first-child, article:first-child');
    
    // Step 3: Wait for navigation to editor
    console.log('\n🎯 Step 3: Waiting for editor page...');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    const url = page.url();
    const templateId = new URL(url).searchParams.get('template');
    console.log(`📋 Template ID: ${templateId}`);
    
    // Wait for potential editor loading
    await page.waitForTimeout(5000);
    
    // Step 4: Get all console logs
    console.log('\n🎯 Step 4: Browser Console Logs:');
    console.log('-----------------------------------');
    logs.forEach(log => console.log(log));
    
    // Step 5: Get page state
    console.log('\n🎯 Step 5: Page State Analysis:');
    const pageState = await page.evaluate(() => {
      return {
        url: window.location.href,
        hasUnlayer: typeof window.unlayer !== 'undefined',
        editorElement: !!document.querySelector('#email-editor'),
        editorContent: document.querySelector('#email-editor')?.innerHTML?.length || 0,
        iframeCount: document.querySelectorAll('iframe').length,
        unlayerScripts: Array.from(document.scripts).filter(s => s.src.includes('unlayer')).map(s => s.src),
        errors: window.errors || []
      };
    });
    
    console.log(JSON.stringify(pageState, null, 2));
    
    // Take screenshot
    await page.screenshot({ 
      path: 'template-loading-headless.png',
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved: template-loading-headless.png');
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
  }
  
  await browser.close();
}

// Run test
testTemplateLoading().catch(console.error);