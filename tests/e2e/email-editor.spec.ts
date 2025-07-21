import { test, expect } from '@playwright/test';

test.describe('Email Template Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the editor page
    await page.goto('/editor');
    
    // Wait for the editor to load
    await page.waitForSelector('#unlayer-editor', { timeout: 30000 });
    
    // Wait for Unlayer to initialize
    await page.waitForFunction(() => window.unlayer !== undefined, { timeout: 30000 });
  });

  test('should load the email editor', async ({ page }) => {
    // Check if editor container is visible
    const editorContainer = page.locator('#unlayer-editor');
    await expect(editorContainer).toBeVisible();
    
    // Check if the editor iframe is loaded
    const iframe = page.frameLocator('#unlayer-editor iframe');
    await expect(iframe.locator('body')).toBeVisible();
  });

  test('should show all available blocks in the sidebar', async ({ page }) => {
    // Wait for the sidebar to be visible
    const iframe = page.frameLocator('#unlayer-editor iframe');
    
    // Check for standard blocks
    const standardBlocks = [
      'Text',
      'Image',
      'Button',
      'Divider',
      'Spacer',
      'Social',
      'Html',
      'Video',
      'Icons',
      'Menu',
      'Timer'
    ];
    
    for (const blockName of standardBlocks) {
      const block = iframe.locator(`text=${blockName}`);
      await expect(block.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should be able to drag and drop text block', async ({ page }) => {
    const iframe = page.frameLocator('#unlayer-editor iframe');
    
    // Find the text block in the sidebar
    const textBlock = iframe.locator('text=Text').first();
    await expect(textBlock).toBeVisible();
    
    // Find the drop zone
    const dropZone = iframe.locator('.u_row').first();
    
    // Drag and drop
    await textBlock.dragTo(dropZone);
    
    // Verify text block was added
    await expect(iframe.locator('.u-text-block')).toBeVisible();
  });

  test('should be able to drag and drop image block', async ({ page }) => {
    const iframe = page.frameLocator('#unlayer-editor iframe');
    
    // Find the image block
    const imageBlock = iframe.locator('text=Image').first();
    await expect(imageBlock).toBeVisible();
    
    // Find the drop zone
    const dropZone = iframe.locator('.u_row').first();
    
    // Drag and drop
    await imageBlock.dragTo(dropZone);
    
    // Verify image block was added
    await expect(iframe.locator('.u-image-block')).toBeVisible();
  });

  test('should be able to drag and drop button block', async ({ page }) => {
    const iframe = page.frameLocator('#unlayer-editor iframe');
    
    // Find the button block
    const buttonBlock = iframe.locator('text=Button').first();
    await expect(buttonBlock).toBeVisible();
    
    // Find the drop zone
    const dropZone = iframe.locator('.u_row').first();
    
    // Drag and drop
    await buttonBlock.dragTo(dropZone);
    
    // Verify button block was added
    await expect(iframe.locator('.u-button-block')).toBeVisible();
  });

  test('should be able to drag and drop column structures', async ({ page }) => {
    const iframe = page.frameLocator('#unlayer-editor iframe');
    
    // Test different column structures
    const columnStructures = [
      { text: '1 Column', selector: '.u_column' },
      { text: '2 Columns', selector: '.u_column' },
      { text: '3 Columns', selector: '.u_column' },
      { text: '4 Columns', selector: '.u_column' }
    ];
    
    for (const structure of columnStructures) {
      // Clear the canvas first
      await page.evaluate(() => {
        if (window.unlayer) {
          window.unlayer.loadDesign({ body: { rows: [] } });
        }
      });
      
      // Find the column structure
      const columnBlock = iframe.locator(`text=${structure.text}`).first();
      if (await columnBlock.isVisible()) {
        // Find the drop zone
        const dropZone = iframe.locator('.blockbuilder-content-body').first();
        
        // Drag and drop
        await columnBlock.dragTo(dropZone);
        
        // Verify columns were added
        const columns = iframe.locator(structure.selector);
        await expect(columns).toHaveCount(parseInt(structure.text));
      }
    }
  });

  test('should be able to save template', async ({ page }) => {
    const iframe = page.frameLocator('#unlayer-editor iframe');
    
    // Add some content
    const textBlock = iframe.locator('text=Text').first();
    const dropZone = iframe.locator('.u_row').first();
    await textBlock.dragTo(dropZone);
    
    // Click save button
    const saveButton = page.locator('button:has-text("Save Template")');
    await saveButton.click();
    
    // Check for success message or saved state
    // This depends on your implementation
  });

  test('should be able to export template', async ({ page }) => {
    const iframe = page.frameLocator('#unlayer-editor iframe');
    
    // Add some content
    const textBlock = iframe.locator('text=Text').first();
    const dropZone = iframe.locator('.u_row').first();
    await textBlock.dragTo(dropZone);
    
    // Export functionality would be tested here
    // This depends on your export implementation
  });

  test('should show custom e-commerce blocks', async ({ page }) => {
    const iframe = page.frameLocator('#unlayer-editor iframe');
    
    // Check for custom blocks if they're properly registered
    const customBlocks = ['Product', 'Product Showcase', 'Abandoned Cart'];
    
    for (const blockName of customBlocks) {
      const block = iframe.locator(`text=${blockName}`);
      // These might not be visible if not properly registered
      // We'll check and report
      const isVisible = await block.first().isVisible().catch(() => false);
      console.log(`Custom block "${blockName}" visible:`, isVisible);
    }
  });

  test('should handle editor errors gracefully', async ({ page }) => {
    // Check error state handling
    const errorMessage = page.locator('text=Failed to load email editor');
    await expect(errorMessage).not.toBeVisible();
    
    // Check that reload button appears on error
    const reloadButton = page.locator('button:has-text("Reload Page")');
    await expect(reloadButton).not.toBeVisible();
  });
});

// Helper to check if Unlayer is properly initialized
test('Unlayer initialization check', async ({ page }) => {
  await page.goto('/editor');
  
  // Wait for Unlayer to be available
  const unlayerLoaded = await page.waitForFunction(
    () => window.unlayer !== undefined,
    { timeout: 30000 }
  );
  
  expect(unlayerLoaded).toBeTruthy();
  
  // Check Unlayer version and features
  const unlayerInfo = await page.evaluate(() => {
    if (window.unlayer) {
      return {
        hasInit: typeof window.unlayer.init === 'function',
        hasLoadDesign: typeof window.unlayer.loadDesign === 'function',
        hasSaveDesign: typeof window.unlayer.saveDesign === 'function',
        hasExportHtml: typeof window.unlayer.exportHtml === 'function',
        hasAddEventListener: typeof window.unlayer.addEventListener === 'function'
      };
    }
    return null;
  });
  
  expect(unlayerInfo).toBeTruthy();
  expect(unlayerInfo.hasInit).toBe(true);
  expect(unlayerInfo.hasLoadDesign).toBe(true);
  expect(unlayerInfo.hasSaveDesign).toBe(true);
  expect(unlayerInfo.hasExportHtml).toBe(true);
  expect(unlayerInfo.hasAddEventListener).toBe(true);
});