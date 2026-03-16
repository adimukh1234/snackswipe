import { test, expect } from '@playwright/test';

test.describe('Cart', () => {
  test('shows empty cart message when no items', async ({ page }) => {
    // Clear localStorage cart first
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('zomagram-cart'));
    await page.goto('/cart');
    await expect(page.getByText(/empty|nothing|no items/i)).toBeVisible({ timeout: 5000 });
  });

  test('cart count badge not shown when cart is empty', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('zomagram-cart'));
    await page.reload();
    const badge = page.locator('[data-testid="cart-badge"]');
    // Badge should either not exist or show 0
    const visible = await badge.isVisible().catch(() => false);
    if (visible) {
      const text = await badge.textContent();
      expect(text?.trim()).toBe('0');
    }
  });
});
