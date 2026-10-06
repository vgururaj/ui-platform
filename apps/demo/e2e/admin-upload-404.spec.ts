import { expect, test } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loginAs(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill('password');
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('home-page')).toBeVisible();
}

test('viewer is redirected from admin to access (requirePermission)', async ({ page }) => {
  await loginAs(page, 'viewer@demo.local');
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/access/);
  await expect(page.getByTestId('access-page')).toBeVisible();
});

test('admin can open admin page', async ({ page }) => {
  await loginAs(page, 'admin@demo.local');
  await page.goto('/admin');
  await expect(page.getByTestId('admin-page')).toBeVisible();
});

test('upload progress reaches success', async ({ page }) => {
  await loginAs(page, 'user@demo.local');
  await page.goto('/uploads');
  await expect(page.getByTestId('uploads-page')).toBeVisible();

  const fixture = path.join(__dirname, 'fixtures/sample.txt');
  await page.getByTestId('file-dropzone').locator('input[type="file"]').setInputFiles(fixture);
  await expect(page.getByTestId('upload-status')).toContainText(/Uploading|Upload successful/);
  await expect(page.getByTestId('upload-status')).toHaveText('Upload successful', {
    timeout: 10_000,
  });
});

test('unknown route shows 404', async ({ page }) => {
  await loginAs(page, 'admin@demo.local');
  await page.goto('/this-route-does-not-exist');
  await expect(page.getByTestId('not-found')).toBeVisible();
  await expect(page.getByText('404')).toBeVisible();
});
