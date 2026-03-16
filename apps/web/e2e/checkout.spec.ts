import { test, expect } from '@playwright/test';
import { setupClerkTestingToken } from '@clerk/testing/playwright';

test.describe('Checkout flow', () => {
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
      localStorage.setItem('zomagram-cart', JSON.stringify({ state: { items: [cartItem] }, version: 0 }));
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

  // RED: This test will fail until Razorpay is implemented
  test('initiates Razorpay for UPI payment', async ({ page }) => {
    await page.getByPlaceholder('Enter your street address').fill('123 Test Street');
    await page.getByPlaceholder('City').fill('Mumbai');
    await page.getByPlaceholder('110001').fill('400001');
    await page.getByRole('button', { name: /continue to payment/i }).click();

    // Select UPI
    await page.getByText('UPI').click();

    // Expect Razorpay checkout to be triggered (script loaded or modal opened)
    // This fails until Razorpay is integrated
    await expect(page.locator('[data-testid="razorpay-checkout"]')).toBeVisible({ timeout: 5000 });
  });

  test('COD payment places order without Razorpay', async ({ page }) => {
    await page.getByPlaceholder('Enter your street address').fill('123 Test Street');
    await page.getByPlaceholder('City').fill('Mumbai');
    await page.getByPlaceholder('110001').fill('400001');
    await page.getByRole('button', { name: /continue to payment/i }).click();

    // Select COD
    await page.getByText('Cash on Delivery').click();
    await expect(page.getByText(/pay ₹/i)).toBeVisible();
  });
});
