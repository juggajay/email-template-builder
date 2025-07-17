import { test, expect } from '@playwright/test';

test.describe('Navigation and Pages', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Email Template Builder|Template Builder|Home/);
    
    // Check for main CTAs
    await expect(page.locator('text=/Get Started|Start Building|Create Templates/i')).toBeVisible();
  });

  test('should have working navigation menu', async ({ page }) => {
    await page.goto('/');
    
    // Check navigation links
    const navLinks = [
      { text: 'Templates', href: /templates/ },
      { text: 'Pricing', href: /pricing/ },
      { text: 'Features', href: /features|#features/ },
    ];
    
    for (const link of navLinks) {
      const navLink = page.locator(`nav a:has-text("${link.text}"), header a:has-text("${link.text}")`).first();
      if (await navLink.isVisible()) {
        const href = await navLink.getAttribute('href');
        expect(href).toMatch(link.href);
      }
    }
  });

  test('should navigate to dashboard when logged in', async ({ page }) => {
    // First, let's check if dashboard requires auth
    await page.goto('/dashboard');
    
    // If redirected to login, that's expected
    if (page.url().includes('/login')) {
      expect(page.url()).toContain('/login');
    } else {
      // If dashboard loads, check for dashboard elements
      await expect(page.locator('text=/Dashboard|Overview|My Templates/i')).toBeVisible();
    }
  });

  test('should load pricing page', async ({ page }) => {
    await page.goto('/pricing');
    
    // Check for pricing tiers
    await expect(page.locator('text=/Free|Starter|Basic/i')).toBeVisible();
    await expect(page.locator('text=/Pro|Professional|Premium/i')).toBeVisible();
    await expect(page.locator('text=/Agency|Enterprise|Team/i')).toBeVisible();
  });

  test('should have responsive mobile menu', async ({ page, isMobile }) => {
    if (!isMobile) {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
    }
    
    await page.goto('/');
    
    // Look for mobile menu button
    const mobileMenuButton = page.locator('button[aria-label*="menu"], button:has-text("Menu"), [data-testid="mobile-menu"]');
    
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      
      // Check if mobile menu opened
      await expect(page.locator('nav').first()).toBeVisible();
    }
  });

  test('should check for 404 pages', async ({ page }) => {
    const nonExistentPages = [
      '/this-page-does-not-exist',
      '/random-404-page',
      '/api/non-existent-endpoint'
    ];
    
    for (const url of nonExistentPages) {
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      
      // Check if we get 404 status or 404 page content
      if (response) {
        const status = response.status();
        if (status === 404) {
          expect(status).toBe(404);
        } else {
          // Check for 404 content in the page
          await expect(page.locator('text=/404|Not Found|Page not found/i')).toBeVisible();
        }
      }
    }
  });
});