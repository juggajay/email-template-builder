const { chromium } = require('playwright');

async function quickEditorTest() {
  console.log('Quick Editor Test - Starting...\n');
  const browser = await chromium.launch({ 
    headless: true // Run in headless mode for speed
  });
  
  const page = await browser.newPage();
  
  try {
    // Start timing
    const startTime = Date.now();
    
    // Navigate to editor
    console.log('1. Loading editor page...');
    const response = await page.goto('http://localhost:3000/editor', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    if (!response.ok()) {
      throw new Error(`Failed to load page: ${response.status()}`);
    }
    
    // Wait for editor to be ready
    console.log('2. Waiting for editor to initialize...');
    await page.waitForSelector('#unlayer-editor-fast, #unlayer-editor-fixed, #unlayer-editor', {
      timeout: 20000
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`   ✓ Editor loaded in ${loadTime}ms\n`);
    
    // Wait for iframe to load
    await page.waitForTimeout(3000);
    
    // Get all frames
    const frames = page.frames();
    console.log(`3. Found ${frames.length} frames`);
    
    // Find Unlayer iframe
    let editorFrame = null;
    for (const frame of frames) {
      if (frame.url().includes('unlayer') || frame.name().includes('unlayer')) {
        editorFrame = frame;
        console.log(`   ✓ Found Unlayer frame: ${frame.url()}\n`);
        break;
      }
    }
    
    if (!editorFrame) {
      console.log('   ! No Unlayer frame found, using main frame\n');
      editorFrame = page;
    }
    
    // Check for essential tools/tiles
    console.log('4. Checking for editor tools:');
    const tools = [
      'text', 'image', 'button', 'divider', 
      'spacer', 'social', 'columns', 'html'
    ];
    
    let foundCount = 0;
    for (const tool of tools) {
      try {
        const selectors = [
          `[data-tool="${tool}"]`,
          `[title*="${tool}" i]`,
          `.tool-${tool}`,
          `[class*="${tool}-tool"]`,
          `[data-id="${tool}"]`
        ];
        
        let found = false;
        for (const selector of selectors) {
          const elements = await editorFrame.$$(selector);
          if (elements.length > 0) {
            console.log(`   ✓ ${tool.padEnd(8)} - Found (${elements.length} elements)`);
            foundCount++;
            found = true;
            break;
          }
        }
        
        if (!found) {
          console.log(`   ✗ ${tool.padEnd(8)} - Not found`);
        }
      } catch (e) {
        console.log(`   ✗ ${tool.padEnd(8)} - Error: ${e.message}`);
      }
    }
    
    console.log(`\n5. Summary:`);
    console.log(`   - Load time: ${loadTime}ms`);
    console.log(`   - Tools found: ${foundCount}/${tools.length}`);
    console.log(`   - Status: ${foundCount === tools.length ? 'ALL TOOLS AVAILABLE ✓' : 'SOME TOOLS MISSING ✗'}`);
    
    // Take screenshot
    await page.screenshot({ path: 'editor-quick-test.png', fullPage: true });
    console.log('\n6. Screenshot saved: editor-quick-test.png');
    
  } catch (error) {
    console.error('\nERROR:', error.message);
    await page.screenshot({ path: 'editor-error.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

// Check if server is running
const http = require('http');

function checkServer() {
  return new Promise((resolve) => {
    http.get('http://localhost:3000', (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.error('Server is not running at http://localhost:3000');
    console.error('Please start the server first with: npm run dev');
    process.exit(1);
  }
  
  await quickEditorTest();
}

main().catch(console.error);