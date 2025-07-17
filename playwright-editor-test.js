const { chromium } = require('playwright');

async function testEditor() {
  console.log('Starting Playwright editor test...');
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down for visibility
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    // Navigate to the editor
    console.log('Navigating to editor...');
    await page.goto('http://localhost:3000/editor');
    
    // Wait for editor to load
    console.log('Waiting for editor to load...');
    const startTime = Date.now();
    
    // Wait for the editor container
    await page.waitForSelector('#unlayer-editor-fast, #unlayer-editor-fixed, #unlayer-editor', { 
      timeout: 30000 
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`Editor loaded in ${loadTime}ms`);
    
    // Wait a bit more for full initialization
    await page.waitForTimeout(3000);
    
    // Check if we're in an iframe (Unlayer uses iframe)
    const frames = page.frames();
    console.log(`Found ${frames.length} frames`);
    
    // Find the Unlayer iframe
    let editorFrame = null;
    for (const frame of frames) {
      const url = frame.url();
      if (url.includes('unlayer.com') || url.includes('editor')) {
        editorFrame = frame;
        console.log('Found editor frame:', url);
        break;
      }
    }
    
    if (!editorFrame) {
      console.log('No editor frame found, checking main frame...');
      editorFrame = page;
    }
    
    // Test all tiles/blocks
    const tilesToTest = [
      { name: 'Text', selector: '[data-tool="text"], [title*="Text"], .tool-text, [class*="text-tool"]' },
      { name: 'Image', selector: '[data-tool="image"], [title*="Image"], .tool-image, [class*="image-tool"]' },
      { name: 'Button', selector: '[data-tool="button"], [title*="Button"], .tool-button, [class*="button-tool"]' },
      { name: 'Divider', selector: '[data-tool="divider"], [title*="Divider"], .tool-divider, [class*="divider-tool"]' },
      { name: 'Spacer', selector: '[data-tool="spacer"], [title*="Spacer"], .tool-spacer, [class*="spacer-tool"]' },
      { name: 'Social', selector: '[data-tool="social"], [title*="Social"], .tool-social, [class*="social-tool"]' },
      { name: 'Columns', selector: '[data-tool="columns"], [title*="Column"], .tool-columns, [class*="column-tool"]' },
      { name: 'HTML', selector: '[data-tool="html"], [title*="HTML"], .tool-html, [class*="html-tool"]' }
    ];
    
    console.log('\nChecking for tiles/blocks...');
    const foundTiles = [];
    const missingTiles = [];
    
    for (const tile of tilesToTest) {
      try {
        // Try multiple selectors
        const selectors = tile.selector.split(', ');
        let found = false;
        
        for (const selector of selectors) {
          try {
            const element = await editorFrame.waitForSelector(selector, { 
              timeout: 2000,
              state: 'visible' 
            });
            if (element) {
              found = true;
              const boundingBox = await element.boundingBox();
              if (boundingBox) {
                console.log(`✓ Found ${tile.name} tile at position:`, boundingBox);
                foundTiles.push(tile.name);
                break;
              }
            }
          } catch (e) {
            // Try next selector
          }
        }
        
        if (!found) {
          console.log(`✗ ${tile.name} tile not found`);
          missingTiles.push(tile.name);
        }
      } catch (error) {
        console.log(`✗ ${tile.name} tile not found:`, error.message);
        missingTiles.push(tile.name);
      }
    }
    
    // Try to find any drag-and-drop elements
    console.log('\nLooking for any draggable elements...');
    const draggables = await editorFrame.$$('[draggable="true"], .draggable, [data-draggable], .u-tool-item, .tool-item');
    console.log(`Found ${draggables.length} draggable elements`);
    
    // Test drag and drop for Text block
    console.log('\nTesting drag and drop...');
    try {
      const textTool = await editorFrame.waitForSelector('[data-tool="text"], .tool-text, [title*="Text"]', { 
        timeout: 5000 
      });
      
      if (textTool) {
        const dropZone = await editorFrame.waitForSelector('.u-row, [data-droppable], .droppable, #editor-canvas, .editor-content', { 
          timeout: 5000 
        });
        
        if (dropZone) {
          console.log('Attempting drag and drop...');
          await textTool.dragTo(dropZone);
          await page.waitForTimeout(2000);
          console.log('✓ Drag and drop completed');
        } else {
          console.log('✗ No drop zone found');
        }
      }
    } catch (error) {
      console.log('✗ Drag and drop test failed:', error.message);
    }
    
    // Performance metrics
    console.log('\n=== Performance Report ===');
    console.log(`Initial load time: ${loadTime}ms`);
    console.log(`Found tiles: ${foundTiles.join(', ') || 'None'}`);
    console.log(`Missing tiles: ${missingTiles.join(', ') || 'None'}`);
    
    // Take a screenshot
    await page.screenshot({ path: 'editor-test-screenshot.png', fullPage: true });
    console.log('\nScreenshot saved as editor-test-screenshot.png');
    
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'editor-error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run the test
testEditor().catch(console.error);