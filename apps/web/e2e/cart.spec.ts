import { test, expect } from '@playwright/test';

const CART_KEY = 'crave-cart';

function makeCartState(items: object[]) {
  return JSON.stringify({ state: { items }, version: 0 });
}

const SAMPLE_ITEM = {
  dishId: 'dish-1',
  name: 'Margherita Pizza',
  price: 299,
  imageUrl: '',
  partnerName: 'Pizza Palace',
  partnerId: 'partner-1',
  quantity: 1,
};

test.describe('Cart — empty state', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate((key) => localStorage.removeItem(key), CART_KEY);
    await page.goto('/cart');
  });

  test('shows stash empty message', async ({ page }) => {
    await expect(page.getByText('Your stash is empty')).toBeVisible({ timeout: 5000 });
  });

  test('shows Start Discovering link', async ({ page }) => {
    await expect(page.getByRole('link', { name: /start discovering/i })).toBeVisible();
  });

  test('cart badge not visible when cart is empty', async ({ page }) => {
    await page.goto('/');
    const badge = page.locator('[data-testid="cart-badge"]');
    await expect(badge).not.toBeVisible();
  });
});

test.describe('Cart — with items', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(
      ({ key, value }) => localStorage.setItem(key, value),
      { key: CART_KEY, value: makeCartState([SAMPLE_ITEM]) }
    );
    await page.goto('/cart');
  });

  test('shows item name and price', async ({ page }) => {
    await expect(page.getByText('Margherita Pizza')).toBeVisible({ timeout: 5000 });
    // Scope to cart-item to avoid matching the subtotal line which also shows ₹299
    await expect(
      page.locator('[data-testid="cart-item"]').first().getByText('₹299')
    ).toBeVisible();
  });

  test('shows restaurant name', async ({ page }) => {
    await expect(page.getByText('Pizza Palace')).toBeVisible();
  });

  test('shows bill details section', async ({ page }) => {
    await expect(page.getByText('Bill Details')).toBeVisible();
  });

  test('shows total amount in bill summary', async ({ page }) => {
    // Grand total = 299 (item) + 40 (delivery) + 5 (platform) + 299*0.05 (GST) = 358.95
    // Scope to bill details card (not the slide-to-pay CTA)
    await expect(page.getByText('₹358.95')).toBeVisible();
  });

  test('shows checkout CTA link', async ({ page }) => {
    await expect(page.locator('[data-testid="btn-checkout"]')).toBeVisible();
  });

  test('cart badge shows item count', async ({ page }) => {
    await page.goto('/');
    const badge = page.locator('[data-testid="cart-badge"]');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('1');
  });

  test('Clear button removes all items', async ({ page }) => {
    await page.getByRole('button', { name: /clear/i }).click();
    await expect(page.getByText('Your stash is empty')).toBeVisible({ timeout: 3000 });
  });

  test('cart item row is visible', async ({ page }) => {
    await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible();
  });
});
