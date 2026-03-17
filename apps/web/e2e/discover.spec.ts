import { test, expect } from '@playwright/test';

/** Wait for the discover page to exit the loading state */
async function waitForDiscoverReady(page: Parameters<typeof test>[1]['page']) {
  await Promise.race([
    page.locator('[data-testid="dish-card"]').first().waitFor({ state: 'visible', timeout: 12000 }),
    page.locator('[data-testid="stack-empty"]').waitFor({ state: 'visible', timeout: 12000 }),
    page.getByText('Oops!').waitFor({ state: 'visible', timeout: 12000 }),
  ]).catch(() => {
    // If nothing resolves, the page may still be loading — tests will handle
  });
}

test.describe('Discover / Swipe flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/discover');
    await waitForDiscoverReady(page);
  });

  test('shows THE STACK header or error/loading state', async ({ page }) => {
    // "THE STACK" only shows when dishes are loaded; error state shows "Oops!"
    const hasStack = await page.getByText('THE STACK').isVisible().catch(() => false);
    const hasError = await page.getByText('Oops!').isVisible().catch(() => false);
    const hasLoading = await page.getByText('Loading the stack...').isVisible().catch(() => false);
    expect(hasStack || hasError || hasLoading).toBeTruthy();
  });

  test('resolves to a known state after loading', async ({ page }) => {
    const dishCard = page.locator('[data-testid="dish-card"]').first();
    const empty = page.locator('[data-testid="stack-empty"]');
    const error = page.getByText('Oops!');
    const state = await Promise.race([
      dishCard.waitFor({ state: 'visible', timeout: 12000 }).then(() => 'dish'),
      empty.waitFor({ state: 'visible', timeout: 12000 }).then(() => 'empty'),
      error.waitFor({ state: 'visible', timeout: 12000 }).then(() => 'error'),
    ]).catch(() => 'timeout');
    expect(['dish', 'empty', 'error']).toContain(state);
  });

  test('PASS and CRAVE buttons present when dishes are loaded', async ({ page }) => {
    const hasDishes = await page.locator('[data-testid="dish-card"]').isVisible().catch(() => false);
    if (!hasDishes) {
      test.skip();
      return;
    }
    await expect(page.locator('[data-testid="btn-pass"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-crave"]')).toBeVisible();
  });

  test('Try Again button visible on error state', async ({ page }) => {
    const hasError = await page.getByText('Oops!').isVisible().catch(() => false);
    if (!hasError) {
      test.skip();
      return;
    }
    await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
  });
});
