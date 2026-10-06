import { expect, test } from '@playwright/test';

async function loginAs(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill('password');
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('home-page')).toBeVisible();
}

test('access page shows Can hide/disable for viewer', async ({ page }) => {
  await loginAs(page, 'viewer@demo.local');
  await page.goto('/access');
  await expect(page.getByTestId('access-page')).toBeVisible();
  await expect(page.getByTestId('can-hide-fallback')).toBeVisible();
  await expect(page.getByTestId('can-disable-delete')).toBeDisabled();
});

test('viewer forms page is gated without posts:write', async ({ page }) => {
  await loginAs(page, 'viewer@demo.local');
  await page.goto('/forms');
  await expect(page.getByTestId('forms-page')).toBeVisible();
  await expect(page.getByTestId('forms-forbidden')).toBeVisible();
});

test('locale switcher toggles language label', async ({ page }) => {
  await loginAs(page, 'admin@demo.local');
  const switcher = page.getByTestId('locale-switcher');
  await expect(switcher).toBeVisible();
  const before = await switcher.innerText();
  await switcher.click();
  await expect(switcher).not.toHaveText(before);
});

test('theme toggle updates aria-label', async ({ page }) => {
  await loginAs(page, 'admin@demo.local');
  const toggle = page.getByTestId('theme-toggle');
  const before = await toggle.getAttribute('aria-label');
  await toggle.click();
  await expect(toggle).not.toHaveAttribute('aria-label', before ?? '');
});

test('settings page can set dark theme', async ({ page }) => {
  await loginAs(page, 'admin@demo.local');
  await page.goto('/settings');
  await expect(page.getByTestId('settings-page')).toBeVisible();
  await page.getByTestId('theme-dark').click();
  await expect(page.locator('html')).toHaveClass(/dark/);
});
