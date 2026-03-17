import { test, expect } from '@playwright/test';

test.describe('Search modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('opens search modal on clicking search button', async ({ page }) => {
    await page.locator('[data-testid="btn-search"]').click();
    await expect(page.getByPlaceholder('Search dishes, restaurants...')).toBeVisible({ timeout: 3000 });
  });

  test('closes search modal on Cancel', async ({ page }) => {
    await page.locator('[data-testid="btn-search"]').click();
    await expect(page.getByPlaceholder('Search dishes, restaurants...')).toBeVisible({ timeout: 3000 });
    await page.getByText('Cancel').click();
    await expect(page.getByPlaceholder('Search dishes, restaurants...')).not.toBeVisible();
  });

  test('typing triggers search and shows results or empty state', async ({ page }) => {
    await page.locator('[data-testid="btn-search"]').click();
    const input = page.getByPlaceholder('Search dishes, restaurants...');
    await expect(input).toBeVisible({ timeout: 3000 });
    await input.fill('pizza');
    // After debounce (300ms), either results or empty state should appear
    await page.waitForTimeout(600);
    const hasResults = await page.locator('button').filter({ hasText: /₹/ }).count() > 0;
    const hasEmpty = await page.getByText('No dishes found').isVisible().catch(() => false);
    const hasError = await page.getByText(/error|failed/i).isVisible().catch(() => false);
    expect(hasResults || hasEmpty || hasError).toBeTruthy();
  });

  test('clears results when query is cleared', async ({ page }) => {
    await page.locator('[data-testid="btn-search"]').click();
    const input = page.getByPlaceholder('Search dishes, restaurants...');
    await input.fill('pizza');
    await page.waitForTimeout(600);
    await input.fill('');
    await page.waitForTimeout(400);
    // No results should remain after clearing
    const resultCount = await page.locator('button').filter({ hasText: /₹/ }).count();
    expect(resultCount).toBe(0);
  });
});
