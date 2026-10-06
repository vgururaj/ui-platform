import { expect, test } from '@playwright/test';

test.describe('auth', () => {
  test('login failure shows error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@demo.local');
    await page.getByLabel(/password/i).fill('wrong-password');
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('login-error')).toBeVisible();
  });

  test('login success lands on home', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@demo.local');
    await page.getByLabel(/password/i).fill('password');
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('home-page')).toBeVisible();
  });

  test('logout returns to login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@demo.local');
    await page.getByLabel(/password/i).fill('password');
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('home-page')).toBeVisible();
    await page.getByTestId('user-menu').click();
    await page.getByTestId('logout-button').click();
    await expect(page.getByTestId('login-page')).toBeVisible();
  });
});
