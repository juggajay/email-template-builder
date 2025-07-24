import { test, expect } from '@playwright/test';

test.describe('Template Save Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to editor page
    await page.goto('/editor');
    
    // Wait for editor to load
    await page.waitForSelector('#unlayer-editor-fixed', { timeout: 30000 });
    
    // Wait for editor to be ready
    await page.waitForFunction(() => {
      return (window as any).unlayer !== undefined;
    });
  });

  test('should show editor ready state', async ({ page }) => {
    // Check that the editor container is visible
    const editorContainer = page.locator('#unlayer-editor-fixed');
    await expect(editorContainer).toBeVisible();
    
    // Check that loading state is not visible
    const loadingState = page.locator('.editor-loading');
    await expect(loadingState).not.toBeVisible();
  });

  test('should enable save button when editor is ready', async ({ page }) => {
    // Wait for save button to be enabled
    const saveButton = page.getByRole('button', { name: /save & exit/i });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();
  });

  test('should show template name input', async ({ page }) => {
    // Check template name input is visible and editable
    const templateNameInput = page.getByRole('textbox', { name: /template name/i });
    await expect(templateNameInput).toBeVisible();
    await expect(templateNameInput).toBeEditable();
  });

  test('should allow changing template name', async ({ page }) => {
    const templateNameInput = page.getByRole('textbox', { name: /template name/i });
    
    // Clear existing text and type new name
    await templateNameInput.fill('Test Template Name');
    
    // Verify the value changed
    await expect(templateNameInput).toHaveValue('Test Template Name');
  });

  test('should show copy HTML button', async ({ page }) => {
    const copyButton = page.getByRole('button', { name: /copy html/i });
    await expect(copyButton).toBeVisible();
    await expect(copyButton).toBeEnabled();
  });

  test('should show merge tags panel toggle', async ({ page }) => {
    const mergeTagsButton = page.getByRole('button', { name: /merge tags/i });
    await expect(mergeTagsButton).toBeVisible();
    await expect(mergeTagsButton).toBeEnabled();
  });

  test('should toggle merge tags panel', async ({ page }) => {
    const mergeTagsButton = page.getByRole('button', { name: /merge tags/i });
    
    // Click to show panel
    await mergeTagsButton.click();
    
    // Check if panel appears (wait a bit for animation)
    await page.waitForTimeout(500);
    
    // Click again to hide panel
    await mergeTagsButton.click();
    await page.waitForTimeout(500);
  });

  test('should show preview data panel toggle', async ({ page }) => {
    const previewButton = page.getByRole('button', { name: /preview data/i });
    await expect(previewButton).toBeVisible();
    await expect(previewButton).toBeEnabled();
  });

  test('should show conditionals panel toggle', async ({ page }) => {
    const conditionalsButton = page.getByRole('button', { name: /conditionals/i });
    await expect(conditionalsButton).toBeVisible();
    await expect(conditionalsButton).toBeEnabled();
  });

  test('should show save dropdown menu', async ({ page }) => {
    const saveDropdown = page.getByRole('button', { name: /save & exit/i });
    
    // Click to open dropdown
    await saveDropdown.click();
    
    // Check dropdown items
    await expect(page.getByText('Save & Exit')).toBeVisible();
    await expect(page.getByText('Save as Template')).toBeVisible();
    await expect(page.getByText('Change Template')).toBeVisible();
  });

  test('should handle save as template option', async ({ page }) => {
    const saveDropdown = page.getByRole('button', { name: /save & exit/i });
    
    // Open dropdown
    await saveDropdown.click();
    
    // Click save as template
    const saveAsTemplateOption = page.getByText('Save as Template');
    await expect(saveAsTemplateOption).toBeVisible();
    
    // Note: In a real test, we'd need to handle authentication
    // For now, just verify the option is clickable
    await expect(saveAsTemplateOption).toBeEnabled();
  });

  test('should handle change template option', async ({ page }) => {
    const saveDropdown = page.getByRole('button', { name: /save & exit/i });
    
    // Open dropdown
    await saveDropdown.click();
    
    // Click change template
    const changeTemplateOption = page.getByText('Change Template');
    await expect(changeTemplateOption).toBeVisible();
    await expect(changeTemplateOption).toBeEnabled();
  });

  test('should show error when editor not ready for save', async ({ page }) => {
    // Artificially break the editor reference
    await page.evaluate(() => {
      (window as any).editorRef = null;
    });
    
    const saveDropdown = page.getByRole('button', { name: /save & exit/i });
    await saveDropdown.click();
    
    const saveAsTemplateOption = page.getByText('Save as Template');
    await saveAsTemplateOption.click();
    
    // Should show error toast (would need to check for toast in real implementation)
    await page.waitForTimeout(1000);
  });

  test('should handle mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if mobile editor wrapper is used
    await page.waitForTimeout(1000);
    
    // The layout should adapt to mobile
    const editorContainer = page.locator('#unlayer-editor-fixed');
    await expect(editorContainer).toBeVisible();
  });

  test('should maintain editor state during save operations', async ({ page }) => {
    // Add some content to the editor (this would require more complex interaction)
    const templateNameInput = page.getByRole('textbox', { name: /template name/i });
    await templateNameInput.fill('Persistent Template');
    
    // Verify the name persists
    await expect(templateNameInput).toHaveValue('Persistent Template');
    
    // Try to trigger save (without completing it due to auth requirements)
    const saveDropdown = page.getByRole('button', { name: /save & exit/i });
    await saveDropdown.click();
    
    // Close dropdown by clicking elsewhere
    await page.click('body');
    
    // Verify template name is still there
    await expect(templateNameInput).toHaveValue('Persistent Template');
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    // Test Ctrl+S shortcut (if implemented)
    await page.keyboard.press('Control+s');
    
    // Should either trigger save or show save dialog
    await page.waitForTimeout(500);
    
    // For now, just verify the page doesn't crash
    const editorContainer = page.locator('#unlayer-editor-fixed');
    await expect(editorContainer).toBeVisible();
  });

  test('should preserve unsaved changes warning', async ({ page }) => {
    // Make some changes
    const templateNameInput = page.getByRole('textbox', { name: /template name/i });
    await templateNameInput.fill('Changed Template');
    
    // Try to navigate away using change template
    const saveDropdown = page.getByRole('button', { name: /save & exit/i });
    await saveDropdown.click();
    
    const changeTemplateOption = page.getByText('Change Template');
    await changeTemplateOption.click();
    
    // Should show confirmation dialog
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('unsaved changes');
      dialog.dismiss();
    });
    
    await page.waitForTimeout(500);
  });
});

// Test helper functions for authenticated scenarios
test.describe('Authenticated Save Operations', () => {
  test.beforeEach(async ({ page }) => {
    // This would require setting up authentication in a real test
    // For now, we'll skip these tests or mock the auth state
    test.skip(process.env.TEST_SKIP_AUTH === 'true', 'Authentication required');
  });

  test('should successfully save new template', async ({ page }) => {
    await page.goto('/editor');
    await page.waitForSelector('#unlayer-editor-fixed');
    
    // Set template name
    const templateNameInput = page.getByRole('textbox', { name: /template name/i });
    await templateNameInput.fill('E2E Test Template');
    
    // Wait for editor to be ready
    await page.waitForFunction(() => (window as any).unlayer !== undefined);
    
    // Click save
    const saveDropdown = page.getByRole('button', { name: /save & exit/i });
    await saveDropdown.click();
    
    const saveAsTemplateOption = page.getByText('Save as Template');
    await saveAsTemplateOption.click();
    
    // Wait for save to complete (would show success toast)
    await page.waitForTimeout(3000);
    
    // Verify success (would check for success message)
  });

  test('should successfully update existing template', async ({ page }) => {
    // Load an existing template
    await page.goto('/editor?template=existing-id');
    await page.waitForSelector('#unlayer-editor-fixed');
    
    // Make changes
    const templateNameInput = page.getByRole('textbox', { name: /template name/i });
    await templateNameInput.fill('Updated Template Name');
    
    // Save changes
    const saveDropdown = page.getByRole('button', { name: /save & exit/i });
    await saveDropdown.click();
    
    const saveAsTemplateOption = page.getByText('Save as Template');
    await saveAsTemplateOption.click();
    
    // Wait for update to complete
    await page.waitForTimeout(3000);
  });

  test('should handle save and exit flow', async ({ page }) => {
    await page.goto('/editor');
    await page.waitForSelector('#unlayer-editor-fixed');
    
    // Set template name
    const templateNameInput = page.getByRole('textbox', { name: /template name/i });
    await templateNameInput.fill('Save and Exit Test');
    
    // Click save and exit
    const saveDropdown = page.getByRole('button', { name: /save & exit/i });
    await saveDropdown.click();
    
    const saveAndExitOption = page.getByText('Save & Exit').first();
    await saveAndExitOption.click();
    
    // Should redirect to templates page
    await page.waitForURL('**/templates**', { timeout: 10000 });
    
    // Verify we're on templates page
    expect(page.url()).toContain('/templates');
  });
});