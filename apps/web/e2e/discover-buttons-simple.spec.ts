import { test, expect } from '@playwright/test';

test.describe('Discover Page - Button Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/discover');
    await page.locator('[data-testid="btn-crave"]').waitFor({ state: 'visible', timeout: 10000 });
  });

  test('CRAVE button removes dish from stack', async ({ page }) => {
    const initialDish = await page.locator('[data-testid="dish-card"] h2').first().textContent();

    await page.locator('[data-testid="btn-crave"]').click();
    await page.waitForTimeout(800);

    const dishCount = await page.locator('[data-testid="dish-card"]').count();
    expect(dishCount).toBeGreaterThan(0); // At least one dish should still be visible (from the stack)

    const newDish = await page.locator('[data-testid="dish-card"] h2').first().textContent();
    expect(newDish).not.toBe(initialDish);
  });

  test('PASS button removes dish from stack', async ({ page }) => {
    const initialDish = await page.locator('[data-testid="dish-card"] h2').first().textContent();

    await page.locator('[data-testid="btn-pass"]').click();
    await page.waitForTimeout(800);

    const newDish = await page.locator('[data-testid="dish-card"] h2').first().textContent();
    expect(newDish).not.toBe(initialDish);
  });

  test('SUPER LIKE button removes dish from stack', async ({ page }) => {
    const initialDish = await page.locator('[data-testid="dish-card"] h2').first().textContent();

    // SUPER LIKE button contains the chevron-up icon
    const superLikeBtn = page.locator('button:has(svg.lucide-chevron-up)').first();
    await superLikeBtn.click();
    await page.waitForTimeout(800);

    const newDish = await page.locator('[data-testid="dish-card"] h2').first().textContent().catch(() => null);

    // Either dish changed or stack is empty
    if (newDish !== null) {
      expect(newDish).not.toBe(initialDish);
    } else {
      // Stack should be empty
      const isEmpty = await page.getByText('Stack emptied!').isVisible().catch(() => false);
      expect(isEmpty).toBe(true);
    }
  });
});
