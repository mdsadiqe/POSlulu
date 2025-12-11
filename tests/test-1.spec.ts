import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://shop.lululemon.com/c/we-made-too-much/n18mhd');
  await page.getByTitle('Close').click();
  await page.getByTestId('nav-desktop').getByRole('link', { name: 'We Made Too Much' }).click();
  await page.getByTestId('nav-desktop-search').click();
  await page.getByTestId('nav-desktop-search').fill('p1234152');
  await page.getByTestId('nav-desktop-search').press('Enter');
});