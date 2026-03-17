import { test, expect } from '@playwright/test';
import { setupClerkTestingToken } from '@clerk/testing/playwright';

/**
 * Checkout tests require a signed-in Clerk user.
 *
 * setupClerkTestingToken() bypasses Clerk's bot detection, but the user must also
 * actually sign in (e.g., via clerk.signIn()) for the middleware-protected /checkout
 * page to render. These tests are skipped until a test-user sign-in flow is wired up.
 *
 * To enable: add clerk.signIn({ emailAddress: '<test-user>' }) in beforeEach, or use
 * storageState saved from a manual sign-in.
 */
test.describe('Checkout flow', () => {
  test.skip(
    !process.env.CLERK_TEST_USER_EMAIL,
    'Skipped: requires CLERK_TEST_USER_EMAIL env var and a signed-in test user'
  );

  test.beforeEach(async ({ page }) => {
    // Inject Clerk test token for authenticated flows
    await setupClerkTestingToken({ page });
    // Seed a cart item in localStorage
    await page.goto('/');
    await page.evaluate(() => {
      const cartItem = {
        dishId: 'test-dish-id',
        name: 'Test Dish',
        price: 299,
        imageUrl: '',
        partnerName: 'Test Restaurant',
        partnerId: 'test-partner-id',
        quantity: 1,
      };
      localStorage.setItem('crave-cart', JSON.stringify({ state: { items: [cartItem] }, version: 0 }));
    });
    await page.goto('/checkout');
  });

  test('shows delivery address step first', async ({ page }) => {
    await expect(page.getByText('Delivery Address')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your street address')).toBeVisible();
  });

  test('validates empty address fields', async ({ page }) => {
    await page.getByRole('button', { name: /continue to payment/i }).click();
    await expect(page.getByText(/please fill all address fields/i)).toBeVisible();
  });

  test('validates 6-digit pincode', async ({ page }) => {
    await page.getByPlaceholder('Enter your street address').fill('123 Test St');
    await page.getByPlaceholder('City').fill('Mumbai');
    await page.getByPlaceholder('110001').fill('123'); // invalid pincode
    await page.getByRole('button', { name: /continue to payment/i }).click();
    await expect(page.getByText(/valid 6-digit pincode/i)).toBeVisible();
  });

  test('proceeds to payment step with valid address', async ({ page }) => {
    await page.getByPlaceholder('Enter your street address').fill('123 Test Street');
    await page.getByPlaceholder('City').fill('Mumbai');
    await page.getByPlaceholder('110001').fill('400001');
    await page.getByRole('button', { name: /continue to payment/i }).click();
    await expect(page.getByText('Payment Method')).toBeVisible();
  });

  test('shows UPI, Card and COD payment options', async ({ page }) => {
    await page.getByPlaceholder('Enter your street address').fill('123 Test Street');
    await page.getByPlaceholder('City').fill('Mumbai');
    await page.getByPlaceholder('110001').fill('400001');
    await page.getByRole('button', { name: /continue to payment/i }).click();
    await expect(page.getByText('UPI')).toBeVisible();
    await expect(page.getByText('Credit/Debit Card')).toBeVisible();
    await expect(page.getByText('Cash on Delivery')).toBeVisible();
  });

  test('UPI payment shows Pay button with total amount', async ({ page }) => {
    await page.getByPlaceholder('Enter your street address').fill('123 Test Street');
    await page.getByPlaceholder('City').fill('Mumbai');
    await page.getByPlaceholder('110001').fill('400001');
    await page.getByRole('button', { name: /continue to payment/i }).click();

    // UPI is selected by default — button should show "Pay ₹..."
    await expect(page.getByRole('button', { name: /pay ₹/i })).toBeVisible();
  });

  test('COD payment shows Place Order button with total amount', async ({ page }) => {
    await page.getByPlaceholder('Enter your street address').fill('123 Test Street');
    await page.getByPlaceholder('City').fill('Mumbai');
    await page.getByPlaceholder('110001').fill('400001');
    await page.getByRole('button', { name: /continue to payment/i }).click();

    // Select COD
    await page.getByText('Cash on Delivery').click();
    // COD button shows "Place Order · ₹X" (not "Pay ₹X")
    await expect(page.getByRole('button', { name: /place order/i })).toBeVisible();
  });
});
