const { chromium } = require('playwright');

async function testTemplates() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const baseUrl = 'http://localhost:3000';
  const results = [];

  console.log('🧪 Testing Email Template Builder - Template Loading\n');

  try {
    // Step 1: Go to templates page
    console.log('1️⃣ Navigating to templates page...');
    await page.goto(`${baseUrl}/templates`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Step 2: Check if templates are displayed
    console.log('2️⃣ Checking for template cards...');
    const templateCards = await page.locator('[class*="card"], article').count();
    console.log(`   Found ${templateCards} template cards`);

    if (templateCards === 0) {
      console.log('   ❌ No templates found! Checking for errors...');
      const errorText = await page.textContent('body');
      console.log('   Page content:', errorText.substring(0, 200));
      return;
    }

    // Step 3: Get all categories
    const categories = ['abandoned-cart', 'welcome', 'order-confirmation', 'product-launch', 'promotional'];
    
    for (const category of categories) {
      console.log(`\n3️⃣ Testing ${category} templates...`);
      
      // Click on category filter if available
      const categoryButton = page.locator(`button:has-text("${category.replace('-', ' ')}")`).first();
      if (await categoryButton.isVisible()) {
        await categoryButton.click();
        await page.waitForTimeout(1000);
      }

      // Find first template in this category
      const firstTemplate = page.locator('[class*="card"], article').first();
      if (await firstTemplate.isVisible()) {
        // Get template name
        const templateName = await firstTemplate.locator('h3, [class*="title"]').textContent() || 'Unknown';
        console.log(`   📧 Testing template: ${templateName}`);

        // Click on the template
        await firstTemplate.click();
        await page.waitForTimeout(2000);

        // Check if we're on the editor page
        if (page.url().includes('/editor')) {
          console.log('   ✅ Successfully navigated to editor');
          
          // Wait for editor to load
          await page.waitForTimeout(3000);
          
          // Check for Unlayer editor iframe
          const editorFrame = await page.locator('iframe[id*="editor"], iframe[class*="editor"]').count();
          if (editorFrame > 0) {
            console.log('   ✅ Email editor loaded successfully');
            
            // Take screenshot
            const screenshotName = `template-${category}-editor.png`;
            await page.screenshot({ 
              path: `screenshots/${screenshotName}`, 
              fullPage: true 
            });
            console.log(`   📸 Screenshot saved: ${screenshotName}`);
            
            results.push({
              category,
              template: templateName,
              status: 'success',
              editorLoaded: true
            });
          } else {
            console.log('   ⚠️  Editor iframe not found');
            results.push({
              category,
              template: templateName,
              status: 'warning',
              editorLoaded: false,
              error: 'Editor iframe not found'
            });
          }

          // Go back to templates
          await page.goto(`${baseUrl}/templates`, { waitUntil: 'networkidle' });
          await page.waitForTimeout(1000);
        } else {
          console.log('   ❌ Failed to navigate to editor');
          results.push({
            category,
            template: templateName,
            status: 'error',
            error: 'Navigation failed'
          });
        }
      } else {
        console.log(`   ⚠️  No templates found in ${category} category`);
      }
    }

    // Step 4: Test direct editor access with template ID
    console.log('\n4️⃣ Testing direct template loading...');
    
    // Try to load a specific template by ID (if we can find one)
    await page.goto(`${baseUrl}/templates`);
    await page.waitForTimeout(2000);
    
    // Get first template href
    const firstLink = await page.locator('a[href*="/editor?template="]').first().getAttribute('href');
    if (firstLink) {
      const templateId = firstLink.split('template=')[1];
      console.log(`   Loading template ID: ${templateId}`);
      
      await page.goto(`${baseUrl}/editor?template=${templateId}`);
      await page.waitForTimeout(5000);
      
      const hasEditor = await page.locator('iframe[id*="editor"], iframe[class*="editor"], #editor').count() > 0;
      console.log(`   Editor loaded: ${hasEditor ? '✅' : '❌'}`);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }

  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  const successful = results.filter(r => r.status === 'success').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log(`✅ Successful: ${successful}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Errors: ${errors}`);
  
  console.log('\nDetailed Results:');
  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.category} - ${result.template}: ${result.error || 'OK'}`);
  });

  await browser.close();
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// Run tests
testTemplates().catch(console.error);