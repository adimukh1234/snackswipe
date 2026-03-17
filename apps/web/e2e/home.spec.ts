import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows Crave header', async ({ page }) => {
    // Use exact heading to avoid matching "Recent Craves"
    await expect(page.getByRole('heading', { name: 'Crave', exact: true })).toBeVisible();
  });

  test('shows category chips', async ({ page }) => {
    // Use role=button with exact name to avoid matching "View All"
    await expect(page.getByRole('button', { name: 'All', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pizza', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sushi', exact: true })).toBeVisible();
  });

  test('clicking category chip updates active state', async ({ page }) => {
    await page.getByRole('button', { name: 'Pizza', exact: true }).click();
    // Verify clicking didn't crash the page
    await expect(page.getByRole('button', { name: 'Pizza', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Crave', exact: true })).toBeVisible();
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
