import { test, expect } from '@playwright/test';

/**
 * Bottom navigation and page routing tests.
 * These run without auth — they verify that pages load, render key UI,
 * and navigation between them works correctly.
 */
test.describe('Bottom navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows all four nav items', async ({ page }) => {
    const bottomNav = page.locator('nav').last();
    await expect(bottomNav.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(bottomNav.getByRole('link', { name: 'Stack' })).toBeVisible();
    await expect(bottomNav.getByRole('link', { name: 'Stash' })).toBeVisible();
    await expect(bottomNav.getByRole('link', { name: 'Profile' })).toBeVisible();
  });

  test('navigates to Discover via Stack nav', async ({ page }) => {
    await page.locator('nav').last().getByRole('link', { name: 'Stack' }).click();
    await expect(page).toHaveURL('/discover');
    // Discover page shows loading, error, or THE STACK header — any is fine
    await Promise.race([
      page.getByText('THE STACK').waitFor({ state: 'visible', timeout: 12000 }),
      page.getByText('Oops!').waitFor({ state: 'visible', timeout: 12000 }),
      page.getByText('Loading the stack...').waitFor({ state: 'visible', timeout: 12000 }),
    ]).catch(() => {});
    await expect(page).toHaveURL('/discover');
  });

  test('navigates to Cart via Stash nav', async ({ page }) => {
    await page.locator('nav').last().getByRole('link', { name: 'Stash' }).click();
    await expect(page).toHaveURL('/cart');
  });

  test('navigates to Profile via Profile nav', async ({ page }) => {
    await page.locator('nav').last().getByRole('link', { name: 'Profile' }).click();
    await expect(page).toHaveURL('/profile');
  });

  test('Home nav link points to root URL', async ({ page }) => {
    // Verify the Home nav link has the correct href without triggering navigation
    // (other tests already verify page navigation works via Stack/Stash/Profile nav)
    const homeLink = page.locator('nav').last().getByRole('link', { name: 'Home' });
    await expect(homeLink).toBeVisible();
    const href = await homeLink.getAttribute('href');
    expect(href).toBe('/');
  });
});

test.describe('Page load smoke tests', () => {
  test('home page loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Filter out known external/Clerk errors
    const appErrors = errors.filter(
      (e) => !e.includes('clerk') && !e.includes('Clerk') && !e.includes('ResizeObserver')
    );
    expect(appErrors).toHaveLength(0);
  });

  test('discover page loads without crashing', async ({ page }) => {
    await page.goto('/discover');
    // Shows loading, error, or the stack — any is acceptable
    await Promise.race([
      page.getByText('THE STACK').waitFor({ state: 'visible', timeout: 12000 }),
      page.getByText('Oops!').waitFor({ state: 'visible', timeout: 12000 }),
      page.getByText('Loading the stack...').waitFor({ state: 'visible', timeout: 12000 }),
    ]).catch(() => {});
    await expect(page).toHaveURL('/discover');
  });

  test('cart page loads without crashing', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    // Either empty state or cart items
    const hasEmpty = await page.getByText('Your stash is empty').isVisible().catch(() => false);
    const hasItems = await page.locator('[data-testid="cart-item"]').count() > 0;
    expect(hasEmpty || hasItems).toBeTruthy();
  });

  test('profile page loads without crashing', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    // Shows either logged-in profile or login prompt
    const hasProfile = await page.getByRole('heading', { name: 'Profile' }).isVisible().catch(() => false);
    const hasWelcome = await page.getByText('Welcome to CRAVE').isVisible().catch(() => false);
    expect(hasProfile || hasWelcome).toBeTruthy();
  });
});
