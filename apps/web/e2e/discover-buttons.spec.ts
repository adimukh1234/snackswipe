import { test, expect } from '@playwright/test';

/**
 * User Journey: Click action buttons on discover page
 * As a user, I want to click CRAVE/PASS/SUPER LIKE buttons
 * So that dishes are added to cart, skipped, or super-liked
 */

test.describe('Discover Page - Action Button Handlers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/discover');
    // Wait for page to be ready
    await page.locator('[data-testid="btn-crave"]').waitFor({ state: 'visible', timeout: 10000 });
  });

  test('CRAVE button adds dish to cart and shows toast', async ({ page }) => {
    // Arrange: Get initial dish and cart state
    const dishNameBefore = await page.locator('[data-testid="dish-card"] h2').first().textContent();
    const cartBefore = await page.evaluate(() => localStorage.getItem('crave-cart'));

    // Act: Click CRAVE button
    await page.locator('[data-testid="btn-crave"]').click();
    await page.waitForTimeout(600); // Wait for animations

    // Assert: Verify dish was removed from stack
    const dishNameAfter = await page.locator('[data-testid="dish-card"] h2').first().textContent();
    expect(dishNameAfter).not.toBe(dishNameBefore);

    // Assert: Verify toast appeared with success message
    await expect(page.getByText(/stashed!/i)).toBeVisible({ timeout: 5000 });

    // Assert: Verify cart updated in localStorage
    const cartAfter = await page.evaluate(() => localStorage.getItem('crave-cart'));
    expect(cartAfter).not.toBe(cartBefore);

    // Assert: Verify cart contains the dish
    const cartData = cartAfter ? JSON.parse(cartAfter) : null;
    expect(cartData).toBeTruthy();
    expect(cartData.items.length).toBeGreaterThan(0);
  });

  test('PASS button skips dish without adding to cart', async ({ page }) => {
    // Arrange: Get initial dish and cart state
    const dishNameBefore = await page.locator('[data-testid="dish-card"] h2').first().textContent();
    const cartBefore = await page.evaluate(() => localStorage.getItem('crave-cart'));

    // Act: Click PASS button
    await page.locator('[data-testid="btn-pass"]').click();
    await page.waitForTimeout(600); // Wait for animations

    // Assert: Verify dish was removed from stack
    const dishNameAfter = await page.locator('[data-testid="dish-card"] h2').first().textContent().catch(() => '');
    expect(dishNameAfter).not.toBe(dishNameBefore);

    // Assert: Verify NO toast appeared (only CRAVE/SUPER LIKE show toast)
    const hasToast = await page.getByText(/stashed!/i).count() > 0;
    expect(hasToast).toBe(false);

    // Assert: Verify cart was NOT updated
    const cartAfter = await page.evaluate(() => localStorage.getItem('crave-cart'));
    expect(cartAfter).toBe(cartBefore);
  });

  test('SUPER LIKE button adds dish to cart with special toast', async ({ page }) => {
    // Arrange: Get initial dish and cart state
    const dishNameBefore = await page.locator('[data-testid="dish-card"] h2').first().textContent();
    const cartBefore = await page.evaluate(() => localStorage.getItem('crave-cart'));

    // Act: Click SUPER LIKE button (chevron up icon, not PASS or CRAVE)
    const buttons = page.locator('button');
    const superLikeBtn = buttons.nth(1); // Middle button is SUPER LIKE
    console.log('Clicking SUPER LIKE button...');
    await superLikeBtn.click();
    await page.waitForTimeout(1000); // Wait for animations

    // Assert: Verify dish was removed from stack
    const hasDishes = await page.locator('[data-testid="dish-card"]').count() > 0;
    const hasEmpty = await page.getByText('Stack emptied!').isVisible().catch(() => false);
    const dishCardAfter = await page.locator('[data-testid="dish-card"] h2').first();
    const dishNameAfter = hasDishes ? await dishCardAfter.textContent() : null;

    if (!hasDishes && !hasEmpty) {
      throw new Error('Neither new dish nor empty state found after SUPER LIKE');
    }

    if (hasDishes) {
      expect(dishNameAfter).not.toBe(dishNameBefore);
    }

    // Assert: Verify toast appeared
    await expect(page.getByText(/stashed!/i)).toBeVisible({ timeout: 5000 });

    // Assert: Verify cart updated
    const cartAfter = await page.evaluate(() => localStorage.getItem('crave-cart'));
    expect(cartAfter).not.toBe(cartBefore);
  });

  test('All three buttons are visible and enabled', async ({ page }) => {
    const passBtn = page.locator('[data-testid="btn-pass"]');
    const craveBtn = page.locator('[data-testid="btn-crave"]');
    const superLikeBtn = page.locator('button:has(svg.lucide-chevron-up)');

    await expect(passBtn).toBeVisible();
    await expect(craveBtn).toBeVisible();
    await expect(superLikeBtn).toBeVisible();

    // Verify buttons are enabled (not disabled)
    await expect(passBtn).toBeEnabled();
    await expect(craveBtn).toBeEnabled();
    await expect(superLikeBtn).toBeEnabled();
  });

  test('Multiple button clicks work sequentially', async ({ page }) => {
    // Click CRAVE to add dish
    await page.locator('[data-testid="btn-crave"]').click();
    await page.waitForTimeout(600);
    await expect(page.getByText(/stashed!/i)).toBeVisible();

    // Dismiss toast and click PASS on next dish
    await page.waitForTimeout(2000);
    const dishBefore = await page.locator('[data-testid="dish-card"] h2').first().textContent();

    await page.locator('[data-testid="btn-pass"]').click();
    await page.waitForTimeout(600);

    const dishAfter = await page.locator('[data-testid="dish-card"] h2').first().textContent();
    expect(dishAfter).not.toBe(dishBefore);
  });
});
