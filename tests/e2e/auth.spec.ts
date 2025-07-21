import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Login/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should display signup page', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveTitle(/Sign Up/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should handle invalid login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('text=/Invalid login credentials|User not found|Password incorrect/i')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate between login and signup', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=/Sign up|Create account|Don\'t have an account/i');
    await expect(page).toHaveURL(/signup/);
    
    await page.click('text=/Log in|Sign in|Already have an account/i');
    await expect(page).toHaveURL(/login/);
  });

  test('should display password reset page', async ({ page }) => {
    await page.goto('/reset-password');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Send Reset Link")')).toBeVisible();
  });

  test('should require email for password reset', async ({ page }) => {
    await page.goto('/reset-password');
    await page.click('button:has-text("Send Reset Link")');
    
    // Check for validation error
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required', '');
  });
});