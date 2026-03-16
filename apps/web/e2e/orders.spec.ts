import { test, expect } from '@playwright/test';
import { setupClerkTestingToken } from '@clerk/testing/playwright';

test.describe('Orders / The Drop', () => {
  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page });
    await page.goto('/orders');
  });

  test('shows The Drop header', async ({ page }) => {
    await expect(page.getByText('The Drop')).toBeVisible({ timeout: 5000 });
  });

  test('shows empty state when no orders', async ({ page }) => {
    // Either shows orders list or empty state
    await page.waitForSelector('text=The Drop', { timeout: 5000 });
    const empty = page.getByText('No drops yet');
    const orderExists = page.locator('[data-testid="order-card"]').first();
    const either = await Promise.race([
      empty.isVisible({ timeout: 5000 }).then(v => v ? 'empty' : null),
      orderExists.isVisible({ timeout: 5000 }).then(v => v ? 'order' : null),
    ]).catch(() => null);
    expect(['empty', 'order']).toContain(either);
  });
});
