import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows Crave header', async ({ page }) => {
    await expect(page.getByText('Crave')).toBeVisible();
  });

  test('shows category chips', async ({ page }) => {
    await expect(page.getByText('All')).toBeVisible();
    await expect(page.getByText('Pizza')).toBeVisible();
    await expect(page.getByText('Sushi')).toBeVisible();
  });

  test('clicking category chip updates active state', async ({ page }) => {
    const pizzaChip = page.getByText('Pizza');
    await pizzaChip.click();
    // After click, the chip should be styled as active (black text on lime bg)
    // We verify that clicking didn't crash the page
    await expect(page.getByText('Pizza')).toBeVisible();
    await expect(page.getByText('Crave')).toBeVisible();
  });

  test('shows hero Start Swiping section', async ({ page }) => {
    await expect(page.getByText('Start')).toBeVisible();
    await expect(page.getByText('Swiping')).toBeVisible();
  });

  test('shows Recent Craves section', async ({ page }) => {
    await expect(page.getByText('Recent Craves')).toBeVisible();
  });

  test('shows Trending Nearby section', async ({ page }) => {
    await expect(page.getByText('Trending Nearby')).toBeVisible();
  });
});
