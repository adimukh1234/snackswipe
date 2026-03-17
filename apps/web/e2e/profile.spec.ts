import { test, expect } from '@playwright/test';

test.describe('Profile page — unauthenticated', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile');
  });

  test('shows Profile header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible({ timeout: 5000 });
  });

  test('shows welcome message when not signed in', async ({ page }) => {
    await expect(page.getByText('Welcome to CRAVE')).toBeVisible({ timeout: 5000 });
  });

  test('shows Login / Sign Up button when not signed in', async ({ page }) => {
    await expect(page.getByRole('button', { name: /login|sign up/i })).toBeVisible({ timeout: 5000 });
  });
});
