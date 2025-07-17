const { chromium } = require('playwright');

async function testSaveFunctionality() {
  console.log('Testing Template Save Functionality...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down to see what's happening
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Browser Error:', msg.text());
    } else {
      console.log('Browser Log:', msg.text());
    }
  });
  
  // Log network errors
  page.on('response', response => {
    if (response.status() >= 400) {
      console.error(`Network Error: ${response.status()} ${response.url()}`);
    }
  });

  try {
    // 1. Navigate to login page first
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Check if already logged in
    if (page.url().includes('/dashboard')) {
      console.log('   ✓ Already logged in');
    } else {
      console.log('   ! Not logged in - need to implement login flow');
      // For now, let's try to continue anyway
    }
    
    // 2. Navigate to editor
    console.log('\n2. Navigating to editor...');
    await page.goto('http://localhost:3000/editor');
    await page.waitForLoadState('networkidle');
    
    // 3. Wait for editor to load
    console.log('\n3. Waiting for editor to load...');
    const editorLoaded = await page.waitForSelector('#unlayer-editor-fixed, #unlayer-editor', { 
      timeout: 30000 
    }).catch(() => null);
    
    if (editorLoaded) {
      console.log('   ✓ Editor loaded');
    } else {
      console.log('   ✗ Editor failed to load');
      throw new Error('Editor not found');
    }
    
    // Wait for Unlayer to initialize
    await page.waitForTimeout(5000);
    
    // 4. Check if Save button exists
    console.log('\n4. Looking for Save button...');
    const saveButton = await page.waitForSelector('button:has-text("Save Template")', {
      timeout: 10000
    }).catch(() => null);
    
    if (saveButton) {
      console.log('   ✓ Save button found');
      const isVisible = await saveButton.isVisible();
      console.log(`   - Visible: ${isVisible}`);
      const isEnabled = await saveButton.isEnabled();
      console.log(`   - Enabled: ${isEnabled}`);
    } else {
      console.log('   ✗ Save button not found');
    }
    
    // 5. Add some content to the editor
    console.log('\n5. Adding content to editor...');
    
    // Try to find the iframe and interact with it
    const frames = page.frames();
    console.log(`   - Found ${frames.length} frames`);
    
    // 6. Try to save
    console.log('\n6. Attempting to save...');
    if (saveButton) {
      // Take screenshot before save
      await page.screenshot({ path: 'before-save.png', fullPage: true });
      
      console.log('   - Clicking Save button...');
      await saveButton.click();
      
      // Wait for any response
      await page.waitForTimeout(3000);
      
      // Check for alerts or modals
      const alertText = await page.evaluate(() => {
        return window.lastAlertMessage || null;
      }).catch(() => null);
      
      if (alertText) {
        console.log(`   - Alert message: "${alertText}"`);
      }
      
      // Take screenshot after save
      await page.screenshot({ path: 'after-save.png', fullPage: true });
    }
    
    // 7. Check network requests
    console.log('\n7. Monitoring network requests...');
    
    // Set up request monitoring
    const saveRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/') && request.method() === 'POST') {
        saveRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        });
      }
    });
    
    // Try save again to capture network activity
    if (saveButton) {
      console.log('   - Clicking Save button again to monitor network...');
      await saveButton.click();
      await page.waitForTimeout(2000);
      
      console.log(`   - Captured ${saveRequests.length} save requests`);
      saveRequests.forEach(req => {
        console.log(`     • ${req.method} ${req.url}`);
      });
    }
    
    // 8. Check localStorage and sessionStorage
    console.log('\n8. Checking storage...');
    const storage = await page.evaluate(() => {
      return {
        localStorage: Object.keys(localStorage),
        sessionStorage: Object.keys(sessionStorage)
      };
    });
    
    console.log('   - localStorage keys:', storage.localStorage);
    console.log('   - sessionStorage keys:', storage.sessionStorage);
    
    // 9. Final status
    console.log('\n9. Test Summary:');
    console.log('   - Editor loaded: ✓');
    console.log(`   - Save button found: ${saveButton ? '✓' : '✗'}`);
    console.log('   - Screenshots saved: before-save.png, after-save.png');
    
  } catch (error) {
    console.error('\nTest failed:', error.message);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Override alert to capture messages
const script = `
  window.lastAlertMessage = null;
  const originalAlert = window.alert;
  window.alert = function(message) {
    window.lastAlertMessage = message;
    console.log('Alert:', message);
    originalAlert.call(window, message);
  };
`;

// Run the test
testSaveFunctionality().catch(console.error);