import { test, expect } from '@playwright/test';

test.describe('Template Management', () => {
  test('should display template gallery', async ({ page }) => {
    await page.goto('/templates');
    
    // Check for template categories
    await expect(page.locator('text=/All Templates|Browse Templates/i')).toBeVisible();
    
    // Check for template cards
    const templateCards = page.locator('[data-testid="template-card"], .template-card, article');
    await expect(templateCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter templates by category', async ({ page }) => {
    await page.goto('/templates');
    
    // Click on a category filter
    const categories = ['abandoned-cart', 'welcome', 'promotional', 'order-confirmation', 'product-launch'];
    
    for (const category of categories) {
      const categoryButton = page.locator(`button:has-text("${category}"), [data-category="${category}"]`).first();
      if (await categoryButton.isVisible()) {
        await categoryButton.click();
        await page.waitForTimeout(500); // Wait for filter to apply
        
        // Verify URL or active state changed
        const isActive = await categoryButton.evaluate(el => 
          el.classList.contains('active') || 
          el.classList.contains('selected') || 
          el.getAttribute('aria-pressed') === 'true'
        );
        
        expect(isActive).toBeTruthy();
        break;
      }
    }
  });

  test('should preview template', async ({ page }) => {
    await page.goto('/templates');
    
    // Click on first template
    const firstTemplate = page.locator('[data-testid="template-card"], .template-card, article').first();
    await firstTemplate.click();
    
    // Check if preview modal or page opened
    await expect(page.locator('text=/Preview|Customize|Use This Template/i')).toBeVisible({ timeout: 10000 });
  });

  test('should open template editor', async ({ page }) => {
    await page.goto('/editor');
    
    // Check for Unlayer editor
    await expect(page.locator('#editor, [data-testid="email-editor"], iframe')).toBeVisible({ timeout: 15000 });
  });

  test('should handle template categories navigation', async ({ page }) => {
    await page.goto('/templates');
    
    // Check all category links work
    const categoryLinks = [
      { name: 'Abandoned Cart', url: /abandoned-cart/ },
      { name: 'Welcome', url: /welcome/ },
      { name: 'Promotional', url: /promotional/ },
      { name: 'Order Confirmation', url: /order-confirmation/ },
      { name: 'Product Launch', url: /product-launch/ }
    ];
    
    for (const category of categoryLinks) {
      const link = page.locator(`a:has-text("${category.name}"), button:has-text("${category.name}")`).first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForLoadState('networkidle');
        
        // Verify navigation or filter applied
        const currentUrl = page.url();
        const hasCategory = currentUrl.includes(category.name.toLowerCase().replace(' ', '-'));
        expect(hasCategory).toBeTruthy();
        
        await page.goto('/templates'); // Go back for next iteration
      }
    }
  });
});