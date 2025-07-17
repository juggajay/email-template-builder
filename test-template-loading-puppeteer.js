const puppeteer = require('puppeteer');

async function testTemplateLoading() {
  console.log('🔍 Testing Template Loading Process\n');
  console.log('=====================================\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true, // Open dev tools to see console logs
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      console.error('❌ BROWSER ERROR:', text);
    } else if (text.includes('[Editor') || text.includes('[EmailEditor]')) {
      console.log('📝', text);
    }
  });
  
  page.on('pageerror', error => {
    console.error('❌ PAGE ERROR:', error.message);
  });

  const baseUrl = 'http://localhost:3000';
  
  try {
    // Step 1: Navigate to templates page
    console.log('\n🎯 Step 1: Loading Templates Gallery...');
    await page.goto(`${baseUrl}/templates`, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);
    
    // Check if templates loaded
    const hasTemplates = await page.$$eval('[class*="card"], article', els => els.length > 0);
    console.log(`✅ Templates loaded: ${hasTemplates}`);
    
    // Step 2: Click on first template
    console.log('\n🎯 Step 2: Clicking first template...');
    const templateName = await page.$eval('[class*="card"] h3, article h3', el => el.textContent);
    console.log(`📧 Template selected: ${templateName}`);
    
    await page.click('[class*="card"], article');
    
    // Step 3: Wait for navigation to editor
    console.log('\n🎯 Step 3: Waiting for editor page...');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Navigated to editor');
    
    const url = page.url();
    const templateId = new URL(url).searchParams.get('template');
    console.log(`📋 Template ID: ${templateId}`);
    
    // Step 4: Wait for editor to load
    console.log('\n🎯 Step 4: Waiting for Unlayer editor...');
    
    // Wait for various possible editor elements
    const editorSelectors = [
      'iframe#email-editor',
      '#email-editor iframe',
      'div#email-editor',
      '[id*="editor"]'
    ];
    
    let editorFound = false;
    for (const selector of editorSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`✅ Found editor element: ${selector}`);
          editorFound = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!editorFound) {
      console.log('❌ No editor element found');
    }
    
    // Wait a bit more for editor initialization
    await page.waitForTimeout(5000);
    
    // Step 5: Check for Unlayer on window
    console.log('\n🎯 Step 5: Checking Unlayer availability...');
    const hasUnlayer = await page.evaluate(() => {
      return typeof window.unlayer !== 'undefined';
    });
    console.log(`Unlayer available: ${hasUnlayer ? '✅' : '❌'}`);
    
    // Step 6: Check editor content
    console.log('\n🎯 Step 6: Checking editor content...');
    
    // Check if editor is initialized
    const editorInitialized = await page.evaluate(() => {
      const editorDiv = document.querySelector('#email-editor');
      return editorDiv && editorDiv.innerHTML.length > 0;
    });
    console.log(`Editor initialized: ${editorInitialized ? '✅' : '❌'}`);
    
    // Step 7: Get debug info from page
    console.log('\n🎯 Step 7: Getting debug info...');
    const debugInfo = await page.evaluate(() => {
      return {
        hasUnlayer: typeof window.unlayer !== 'undefined',
        editorDivExists: !!document.querySelector('#email-editor'),
        editorDivContent: document.querySelector('#email-editor')?.innerHTML.substring(0, 100),
        bodyClasses: document.body.className,
        scripts: Array.from(document.scripts).map(s => s.src).filter(s => s.includes('unlayer'))
      };
    });
    console.log('Debug info:', JSON.stringify(debugInfo, null, 2));
    
    // Take screenshot
    await page.screenshot({ 
      path: 'template-loading-test.png',
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved: template-loading-test.png');
    
    // Keep browser open for 30 seconds to observe
    console.log('\n⏳ Keeping browser open for observation...');
    console.log('   Check the browser console for debug logs');
    console.log('   Press Ctrl+C to close\n');
    
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    
    // Take error screenshot
    await page.screenshot({ 
      path: 'template-loading-error.png',
      fullPage: true 
    });
    console.log('📸 Error screenshot saved: template-loading-error.png');
  }
  
  await browser.close();
}

// Run test
testTemplateLoading().catch(console.error);