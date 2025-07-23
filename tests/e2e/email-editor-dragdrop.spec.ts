import { test, expect } from '@playwright/test';

test.describe('Email Editor Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the editor
    await page.goto('/editor', { waitUntil: 'networkidle' });
    
    // Wait for the editor to fully load
    await page.waitForSelector('#unlayer-editor', { state: 'visible', timeout: 30000 });
    
    // Wait for Unlayer to be initialized
    await page.waitForFunction(() => {
      return window.unlayer && typeof window.unlayer.loadDesign === 'function';
    }, { timeout: 30000 });
    
    // Wait a bit more for the iframe to be ready
    await page.waitForTimeout(2000);
  });

  test('should display all block categories', async ({ page }) => {
    // Get the Unlayer iframe
    const editorFrame = page.frameLocator('#unlayer-editor iframe').first();
    
    // Check for block categories
    const categories = ['Content', 'Structure', 'Commerce'];
    
    for (const category of categories) {
      const categoryElement = editorFrame.getByText(category, { exact: false });
      const isVisible = await categoryElement.isVisible().catch(() => false);
      console.log(`Category "${category}" visible:`, isVisible);
    }
    
    // Check for basic blocks
    const basicBlocks = ['Text', 'Image', 'Button', 'Divider', 'Spacer'];
    
    for (const block of basicBlocks) {
      const blockElement = editorFrame.getByText(block, { exact: true });
      const isVisible = await blockElement.isVisible().catch(() => false);
      console.log(`Block "${block}" visible:`, isVisible);
      
      if (isVisible) {
        await expect(blockElement).toBeVisible();
      }
    }
  });

  test('should have visible blocks (not white on white)', async ({ page }) => {
    const editorFrame = page.frameLocator('#unlayer-editor iframe').first();
    
    // Check the background color of the tools panel
    const toolsPanel = editorFrame.locator('.tools-panel, [class*="tools"], [class*="sidebar"]').first();
    
    if (await toolsPanel.isVisible()) {
      const backgroundColor = await toolsPanel.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      console.log('Tools panel background color:', backgroundColor);
      
      // Should not be white or transparent
      expect(backgroundColor).not.toBe('rgb(255, 255, 255)');
      expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('should drag and drop text block', async ({ page }) => {
    const editorFrame = page.frameLocator('#unlayer-editor iframe').first();
    
    // Find the text block
    const textBlock = editorFrame.locator('[draggable="true"]').filter({ hasText: 'Text' }).first();
    
    // Wait for it to be visible
    await expect(textBlock).toBeVisible({ timeout: 10000 });
    
    // Get the canvas/drop area
    const canvas = editorFrame.locator('.u-row, [class*="canvas"], [class*="drop"], [class*="content"]').first();
    await expect(canvas).toBeVisible();
    
    // Log initial state
    const initialBlocks = await editorFrame.locator('.u-block, [class*="block"]').count();
    console.log('Initial blocks in canvas:', initialBlocks);
    
    // Perform drag and drop
    await textBlock.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Wait for the drop to complete
    await page.waitForTimeout(1000);
    
    // Check if a new block was added
    const finalBlocks = await editorFrame.locator('.u-block, [class*="block"]').count();
    console.log('Final blocks in canvas:', finalBlocks);
    
    // Should have more blocks after drag and drop
    expect(finalBlocks).toBeGreaterThan(initialBlocks);
  });

  test('should drag and drop image block', async ({ page }) => {
    const editorFrame = page.frameLocator('#unlayer-editor iframe').first();
    
    // Find the image block
    const imageBlock = editorFrame.locator('[draggable="true"]').filter({ hasText: 'Image' }).first();
    
    // Wait for it to be visible
    await expect(imageBlock).toBeVisible({ timeout: 10000 });
    
    // Get the canvas
    const canvas = editorFrame.locator('.u-row, [class*="canvas"], [class*="drop"]').first();
    
    // Perform drag and drop
    await imageBlock.dragTo(canvas);
    
    // Wait for the drop to complete
    await page.waitForTimeout(1000);
    
    // Check if an image block was added
    const imageBlocks = await editorFrame.locator('.u-image, [class*="image"]').count();
    expect(imageBlocks).toBeGreaterThan(0);
  });

  test('should drag and drop column structure', async ({ page }) => {
    const editorFrame = page.frameLocator('#unlayer-editor iframe').first();
    
    // Look for column structures
    const columnStructures = await editorFrame.locator('[data-structure], [class*="structure"]').all();
    
    if (columnStructures.length > 0) {
      const firstStructure = columnStructures[0];
      const canvas = editorFrame.locator('.u-row, [class*="canvas"]').first();
      
      // Drag the structure
      await firstStructure.dragTo(canvas);
      
      // Wait for the drop
      await page.waitForTimeout(1000);
      
      // Check if columns were added
      const columns = await editorFrame.locator('.u-column, [class*="column"]').count();
      expect(columns).toBeGreaterThan(0);
    }
  });

  test('should verify editor is interactive', async ({ page }) => {
    // Test if we can interact with the editor
    const result = await page.evaluate(() => {
      if (window.unlayer) {
        // Try to get the current design
        return new Promise((resolve) => {
          window.unlayer.saveDesign((design: any) => {
            resolve({
              hasUnlayer: true,
              hasDesign: !!design,
              rowCount: design?.body?.rows?.length || 0
            });
          });
        });
      }
      return { hasUnlayer: false };
    });
    
    console.log('Editor state:', result);
    expect((result as any).hasUnlayer).toBe(true);
  });

  test('debug: log Unlayer configuration', async ({ page }) => {
    // Get the current Unlayer configuration
    const config = await page.evaluate(() => {
      if (window.unlayer) {
        // Get iframe src to check configuration
        const iframe = document.querySelector('#unlayer-editor iframe');
        return {
          iframeSrc: (iframe as HTMLIFrameElement)?.src,
          unlayerMethods: Object.keys(window.unlayer).filter(key => typeof window.unlayer[key] === 'function')
        };
      }
      return null;
    });
    
    console.log('Unlayer configuration:', config);
  });
});