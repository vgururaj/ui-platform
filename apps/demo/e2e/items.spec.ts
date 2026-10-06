import { expect, test } from '@playwright/test';

async function loginAs(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill('password');
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('home-page')).toBeVisible();
}

test.describe('items', () => {
  test('search filters results via URL', async ({ page }) => {
    await loginAs(page, 'admin@demo.local');
    await page.goto('/items');
    await expect(page.getByTestId('items-page')).toBeVisible();
    await page.getByTestId('items-search').fill('Item 01');
    await expect(page).toHaveURL(/q=Item[+%20]01|q=Item%2001/);
    await expect(page.getByTestId('items-row')).toHaveCount(1);
  });

  test('pagination updates page query', async ({ page }) => {
    await loginAs(page, 'admin@demo.local');
    await page.goto('/items?pageSize=5');
    await expect(page.getByTestId('items-page-label')).toContainText('Page 1');
    await page.getByTestId('items-next').click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByTestId('items-page-label')).toContainText('Page 2');
  });
});
