import { test, expect } from '@playwright/test';

const CART_KEY = 'crave-cart';

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

test.describe('Discover Tab - Cart Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart before each test
    await page.goto('/');
    await page.evaluate((key) => localStorage.removeItem(key), CART_KEY);
  });

  test('CRAVE button adds dish to cart and shows toast', async ({ page }) => {
    await page.goto('/discover');
    await waitForDiscoverReady(page);

    // Check if dishes are loaded
    const hasDishes = await page.locator('[data-testid="dish-card"]').isVisible().catch(() => false);
    if (!hasDishes) {
      test.skip('No dishes available to test');
      return;
    }

    // Get the dish name before swiping
    const dishName = await page.locator('[data-testid="dish-card"] h2').first().textContent() || '';

    // Click CRAVE button
    await page.locator('[data-testid="btn-crave"]').click();

    // Verify toast appears
    await expect(page.getByText(/stashed!/)).toBeVisible({ timeout: 3000 });

    // Navigate to cart and verify item was added
    await page.goto('/cart');
    await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 5000 });

    // Verify cart badge shows 1 item
    await page.goto('/');
    const badge = page.locator('[data-testid="cart-badge"]');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('1');
  });

  test('PASS button skips dish without adding to cart', async ({ page }) => {
    await page.goto('/discover');
    await waitForDiscoverReady(page);

    const hasDishes = await page.locator('[data-testid="dish-card"]').isVisible().catch(() => false);
    if (!hasDishes) {
      test.skip('No dishes available to test');
      return;
    }

    // Click PASS button
    await page.locator('[data-testid="btn-pass"]').click();

    // Wait for card to be removed
    await page.waitForTimeout(500);

    // Navigate to cart - should still be empty
    await page.goto('/cart');
    await expect(page.getByText('Your stash is empty')).toBeVisible({ timeout: 5000 });

    // Cart badge should not be visible
    await page.goto('/');
    const badge = page.locator('[data-testid="cart-badge"]');
    await expect(badge).not.toBeVisible();
  });

  test('SUPER LIKE button adds dish to cart with different toast', async ({ page }) => {
    await page.goto('/discover');
    await waitForDiscoverReady(page);

    const hasDishes = await page.locator('[data-testid="dish-card"]').isVisible().catch(() => false);
    if (!hasDishes) {
      test.skip('No dishes available to test');
      return;
    }

    // Click SUPER LIKE button (the up chevron button)
    await page.locator('button:has(.lucide-chevron-up)').click();

    // Verify toast appears with super styling (darker background)
    await expect(page.getByText(/stashed!/)).toBeVisible({ timeout: 3000 });

    // Navigate to cart and verify item was added
    await page.goto('/cart');
    await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Multiple CRAVE clicks add multiple items to cart', async ({ page }) => {
    await page.goto('/discover');
    await waitForDiscoverReady(page);

    const hasDishes = await page.locator('[data-testid="dish-card"]').isVisible().catch(() => false);
    if (!hasDishes) {
      test.skip('No dishes available to test');
      return;
    }

    // Click CRAVE button twice (if there are at least 2 dishes)
    await page.locator('[data-testid="btn-crave"]').click();
    await page.waitForTimeout(800); // Wait for animation

    const hasSecondDish = await page.locator('[data-testid="dish-card"]').isVisible().catch(() => false);
    if (hasSecondDish) {
      await page.locator('[data-testid="btn-crave"]').click();
      await page.waitForTimeout(800);
    }

    // Navigate to cart
    await page.goto('/cart');
    const cartItems = page.locator('[data-testid="cart-item"]');
    await expect(cartItems.first()).toBeVisible({ timeout: 5000 });

    // Verify cart badge shows correct count
    await page.goto('/');
    const badge = page.locator('[data-testid="cart-badge"]');
    await expect(badge).toBeVisible();
    const count = hasSecondDish ? '2' : '1';
    await expect(badge).toContainText(count);
  });

  test('Cart header on discover page shows correct count', async ({ page }) => {
    await page.goto('/discover');
    await waitForDiscoverReady(page);

    const hasDishes = await page.locator('[data-testid="dish-card"]').isVisible().catch(() => false);
    if (!hasDishes) {
      test.skip('No dishes available to test');
      return;
    }

    // Initially cart should be empty
    const headerCart = page.locator('header a[href="/cart"]');
    const badge = headerCart.locator('span');
    await expect(badge).not.toBeVisible();

    // Add item to cart
    await page.locator('[data-testid="btn-crave"]').click();
    await page.waitForTimeout(500);

    // Cart badge should appear
    await expect(headerCart.locator('span')).toBeVisible({ timeout: 3000 });
  });

  test('Cart link from discover navigates to cart with items', async ({ page }) => {
    await page.goto('/discover');
    await waitForDiscoverReady(page);

    const hasDishes = await page.locator('[data-testid="dish-card"]').isVisible().catch(() => false);
    if (!hasDishes) {
      test.skip('No dishes available to test');
      return;
    }

    // Add item to cart
    await page.locator('[data-testid="btn-crave"]').click();
    await page.waitForTimeout(500);

    // Click cart link in header
    await page.locator('header a[href="/cart"]').click();

    // Should be on cart page with items
    await expect(page).toHaveURL('/cart');
    await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('The Stash')).toBeVisible();
  });

  test('Swipe gestures trigger actions correctly', async ({ page }) => {
    await page.goto('/discover');
    await waitForDiscoverReady(page);

    const hasDishes = await page.locator('[data-testid="dish-card"]').isVisible().catch(() => false);
    if (!hasDishes) {
      test.skip('No dishes available to test');
      return;
    }

    // Perform swipe right gesture (drag card to right)
    const card = page.locator('[data-testid="dish-card"]').first();
    const box = await card.boundingBox();
    if (!box) {
      test.skip('Could not get card bounding box');
      return;
    }

    // Swipe right (CRAVE)
    await card.dragTo(card, {
      sourcePosition: { x: box.width / 2, y: box.height / 2 },
      targetPosition: { x: box.width * 1.5, y: box.height / 2 },
    });

    // Wait for animation and verify toast
    await page.waitForTimeout(500);

    // Check if toast appeared or card was removed
    const toastVisible = await page.getByText(/stashed!/).isVisible().catch(() => false);
    const cardRemoved = await page.locator('[data-testid="dish-card"]').count() === 0;

    expect(toastVisible || cardRemoved).toBeTruthy();
  });

  test('Empty stack state shows reload button', async ({ page }) => {
    await page.goto('/discover');
    await waitForDiscoverReady(page);

    // First check if we're already at empty state
    const isEmpty = await page.getByText('Stack emptied!').isVisible().catch(() => false);

    if (!isEmpty) {
      // Swipe through all available dishes
      let hasDishes = await page.locator('[data-testid="dish-card"]').isVisible().catch(() => false);
      let attempts = 0;

      while (hasDishes && attempts < 30) {
        await page.locator('[data-testid="btn-crave"]').click();
        await page.waitForTimeout(300);
        hasDishes = await page.locator('[data-testid="dish-card"]').isVisible().catch(() => false);
        attempts++;
      }
    }

    // Check empty state
    const emptyStateVisible = await page.getByText('Stack emptied!').isVisible().catch(() => false);
    if (emptyStateVisible) {
      await expect(page.getByRole('button', { name: /reload stack/i })).toBeVisible();

      // Click reload and verify dishes load
      await page.getByRole('button', { name: /reload stack/i }).click();
      await page.waitForTimeout(2000);

      // Should show loading or new dishes
      const hasContent = await Promise.race([
        page.locator('[data-testid="dish-card"]').first().isVisible().catch(() => false),
        page.getByText('Loading the stack...').isVisible().catch(() => false),
        page.getByText('Stack emptied!').isVisible().catch(() => false),
      ]);
      expect(hasContent).toBeTruthy();
    } else {
      test.skip('Could not reach empty state');
    }
  });
});

test.describe('Discover Tab - Navigation Integration', () => {
  test('Bottom nav shows active state on discover', async ({ page }) => {
    await page.goto('/discover');
    await waitForDiscoverReady(page);

    // Check that Swipe nav item has active styling
    const swipeNav = page.locator('nav').getByText('Swipe').first();
    await expect(swipeNav).toBeVisible();

    // The active tab should have the lime color (#CCFF00)
    const color = await swipeNav.evaluate(el => getComputedStyle(el).color);
    expect(color).toContain('rgb(204, 255, 0)'); // #CCFF00 in RGB
  });

  test('Clicking cart in bottom nav from discover goes to cart', async ({ page }) => {
    await page.goto('/discover');
    await waitForDiscoverReady(page);

    // Click Cart in bottom nav
    const cartNav = page.locator('nav').getByText('Cart').first();
    await cartNav.click();

    await expect(page).toHaveURL('/cart');
  });

  test('Cart items persist when navigating between tabs', async ({ page }) => {
    await page.goto('/discover');
    await waitForDiscoverReady(page);

    const hasDishes = await page.locator('[data-testid="dish-card"]').isVisible().catch(() => false);
    if (!hasDishes) {
      test.skip('No dishes available to test');
      return;
    }

    // Add item
    await page.locator('[data-testid="btn-crave"]').click();
    await page.waitForTimeout(500);

    // Go to home
    await page.goto('/');
    await page.waitForTimeout(500);

    // Go to cart via bottom nav
    const cartNav = page.locator('nav').getByText('Cart').first();
    await cartNav.click();

    // Item should still be there
    await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 5000 });
  });
});
