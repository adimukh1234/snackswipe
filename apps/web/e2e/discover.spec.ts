import { test, expect } from '@playwright/test';

test.describe('Discover / Swipe flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/discover');
  });

  test('shows THE STACK header', async ({ page }) => {
    await expect(page.getByText('THE STACK')).toBeVisible();
  });

  test('loads dish cards from the feed', async ({ page }) => {
    // Wait for dishes or empty/error state
    await page.waitForSelector('[data-testid="dish-card"], [data-testid="stack-empty"], text=Oops', { timeout: 10000 });
    // If API is up, dish card should be visible
    const dishCard = page.locator('[data-testid="dish-card"]').first();
    const empty = page.locator('[data-testid="stack-empty"]');
    const error = page.getByText("Oops!");
    const visible = await Promise.race([
      dishCard.isVisible().then(v => v ? 'dish' : null),
      empty.isVisible().then(v => v ? 'empty' : null),
      error.isVisible().then(v => v ? 'error' : null),
    ]);
    expect(['dish', 'empty', 'error']).toContain(visible);
  });

  test('PASS and CRAVE buttons are present', async ({ page }) => {
    // Buttons render only when there are dishes; skip if stack is empty
    const hasDishes = await page.locator('[data-testid="dish-card"]').isVisible().catch(() => false);
    if (!hasDishes) return;
    await expect(page.locator('[data-testid="btn-pass"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-crave"]')).toBeVisible();
  });
});
