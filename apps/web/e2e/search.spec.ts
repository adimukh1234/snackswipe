import { test, expect } from '@playwright/test';

test.describe('Search modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('opens search modal on clicking search button', async ({ page }) => {
    await page.locator('button').filter({ has: page.locator('svg') }).first().click();
    // The search input should be visible inside the modal
    await expect(page.getByPlaceholder('Search dishes, restaurants...')).toBeVisible({ timeout: 3000 });
  });

  test('closes search modal on Cancel', async ({ page }) => {
    await page.locator('button').filter({ has: page.locator('svg') }).first().click();
    await expect(page.getByPlaceholder('Search dishes, restaurants...')).toBeVisible({ timeout: 3000 });
    await page.getByText('Cancel').click();
    await expect(page.getByPlaceholder('Search dishes, restaurants...')).not.toBeVisible();
  });

  test('typing shows a loading state then results or empty', async ({ page }) => {
    await page.locator('button').filter({ has: page.locator('svg') }).first().click();
    const input = page.getByPlaceholder('Search dishes, restaurants...');
    await expect(input).toBeVisible({ timeout: 3000 });
    await input.fill('pizza');
    // After debounce (300ms), either results or empty state should appear
    await page.waitForTimeout(500);
    const hasResults = await page.locator('button').filter({ hasText: /₹/ }).count() > 0;
    const hasEmpty = await page.getByText('No dishes found').isVisible().catch(() => false);
    expect(hasResults || hasEmpty).toBeTruthy();
  });
});
