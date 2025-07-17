const { chromium } = require('playwright');
const fs = require('fs').promises;

async function testAllTemplates() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down for visibility
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const baseUrl = 'http://localhost:3000';
  const testResults = {
    categories: {},
    previewTests: [],
    editorTests: [],
    timestamp: new Date().toISOString()
  };

  console.log('🧪 Comprehensive Template Testing\n');
  console.log('=====================================\n');

  try {
    // Step 1: Navigate to templates page
    console.log('📋 Step 1: Loading Templates Gallery...');
    await page.goto(`${baseUrl}/templates`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Take screenshot of templates page
    await page.screenshot({ path: 'screenshots/templates-gallery.png', fullPage: true });
    console.log('✅ Templates page loaded\n');

    // Step 2: Test each category
    const categories = [
      { id: 'abandoned-cart', name: 'Abandoned Cart' },
      { id: 'welcome', name: 'Welcome' },
      { id: 'order-confirmation', name: 'Order Confirmation' },
      { id: 'product-launch', name: 'Product Launch' },
      { id: 'promotional', name: 'Promotional' }
    ];

    for (const category of categories) {
      console.log(`\n🏷️  Testing ${category.name} Templates`);
      console.log('-----------------------------------');
      
      testResults.categories[category.id] = {
        name: category.name,
        templates: [],
        previewsWorking: 0,
        editorsWorking: 0
      };

      // Click category filter
      const categoryButton = page.locator(`button:has-text("${category.name}")`).first();
      if (await categoryButton.isVisible()) {
        await categoryButton.click();
        await page.waitForTimeout(1500);
        console.log(`✅ Filtered to ${category.name} category`);
      }

      // Get all template cards in this category
      const templateCards = await page.locator('[class*="card"], article').all();
      console.log(`📦 Found ${templateCards.length} templates`);

      // Test first 2 templates in each category
      for (let i = 0; i < Math.min(2, templateCards.length); i++) {
        const card = templateCards[i];
        
        // Get template name
        const templateName = await card.locator('h3').textContent() || `Template ${i + 1}`;
        console.log(`\n   📧 Testing: ${templateName}`);

        // Test 1: Check preview thumbnail
        const previewDiv = await card.locator('.aspect-video').first();
        const hasPreview = await previewDiv.isVisible();
        console.log(`   - Preview thumbnail: ${hasPreview ? '✅' : '❌'}`);

        // Test 2: Test eye button (preview)
        const eyeButton = await card.locator('button:has(svg[class*="Eye"])').first();
        if (await eyeButton.isVisible()) {
          // Listen for popup
          const [previewPage] = await Promise.all([
            context.waitForEvent('page'),
            eyeButton.click()
          ]);
          
          await previewPage.waitForLoadState();
          await page.waitForTimeout(1000);
          
          // Check if preview loaded
          const previewTitle = await previewPage.title();
          const hasContent = await previewPage.locator('body').textContent();
          const previewWorking = hasContent && hasContent.length > 100;
          
          console.log(`   - Eye button preview: ${previewWorking ? '✅' : '❌'}`);
          
          // Take screenshot of preview
          await previewPage.screenshot({ 
            path: `screenshots/preview-${category.id}-${i}.png`,
            fullPage: true 
          });
          
          await previewPage.close();
          
          testResults.previewTests.push({
            category: category.id,
            template: templateName,
            success: previewWorking
          });
          
          if (previewWorking) {
            testResults.categories[category.id].previewsWorking++;
          }
        }

        // Test 3: Click template to open editor
        await card.click();
        await page.waitForTimeout(3000);

        // Check if we're on editor page
        if (page.url().includes('/editor')) {
          console.log('   - Navigation to editor: ✅');
          
          // Wait for editor to load
          await page.waitForTimeout(5000);
          
          // Check for Unlayer editor
          const hasEditor = await page.locator('iframe#editor, #editor, [id*="editor"]').count() > 0;
          console.log(`   - Email editor loaded: ${hasEditor ? '✅' : '❌'}`);
          
          if (hasEditor) {
            // Take screenshot of editor
            await page.screenshot({ 
              path: `screenshots/editor-${category.id}-${i}.png`,
              fullPage: true 
            });
            
            testResults.categories[category.id].editorsWorking++;
          }
          
          testResults.editorTests.push({
            category: category.id,
            template: templateName,
            success: hasEditor
          });

          // Go back to templates
          await page.goto(`${baseUrl}/templates`, { waitUntil: 'networkidle' });
          await page.waitForTimeout(1500);
          
          // Re-apply category filter
          const catButton = page.locator(`button:has-text("${category.name}")`).first();
          if (await catButton.isVisible()) {
            await catButton.click();
            await page.waitForTimeout(1000);
          }
        }
        
        testResults.categories[category.id].templates.push({
          name: templateName,
          hasPreview: hasPreview,
          previewWorks: testResults.previewTests[testResults.previewTests.length - 1]?.success || false,
          editorWorks: testResults.editorTests[testResults.editorTests.length - 1]?.success || false
        });
      }
    }

    // Step 3: Test "All Templates" view
    console.log('\n\n🌐 Testing All Templates View');
    console.log('-----------------------------------');
    
    const allButton = page.locator('button:has-text("All Templates")').first();
    if (await allButton.isVisible()) {
      await allButton.click();
      await page.waitForTimeout(1500);
      
      const totalTemplates = await page.locator('[class*="card"], article').count();
      console.log(`✅ Total templates displayed: ${totalTemplates}`);
    }

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
  }

  // Generate summary report
  console.log('\n\n📊 TEST SUMMARY REPORT');
  console.log('=====================================\n');

  let totalTemplatesTested = 0;
  let totalPreviewsWorking = 0;
  let totalEditorsWorking = 0;

  for (const [categoryId, data] of Object.entries(testResults.categories)) {
    console.log(`${data.name}:`);
    console.log(`  Templates tested: ${data.templates.length}`);
    console.log(`  Preview buttons working: ${data.previewsWorking}/${data.templates.length}`);
    console.log(`  Editors loading: ${data.editorsWorking}/${data.templates.length}`);
    console.log('');
    
    totalTemplatesTested += data.templates.length;
    totalPreviewsWorking += data.previewsWorking;
    totalEditorsWorking += data.editorsWorking;
  }

  console.log('OVERALL:');
  console.log(`  Total templates tested: ${totalTemplatesTested}`);
  console.log(`  Preview success rate: ${totalPreviewsWorking}/${totalTemplatesTested} (${Math.round(totalPreviewsWorking/totalTemplatesTested*100)}%)`);
  console.log(`  Editor success rate: ${totalEditorsWorking}/${totalTemplatesTested} (${Math.round(totalEditorsWorking/totalTemplatesTested*100)}%)`);

  // Save detailed report
  await fs.writeFile('template-test-report.json', JSON.stringify(testResults, null, 2));
  console.log('\n📄 Detailed report saved to: template-test-report.json');

  await browser.close();
}

// Create screenshots directory
async function ensureScreenshotsDir() {
  try {
    await fs.mkdir('screenshots', { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

// Run tests
ensureScreenshotsDir().then(() => {
  testAllTemplates().catch(console.error);
});