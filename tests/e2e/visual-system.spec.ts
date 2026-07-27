import { test, expect } from '@playwright/test';

test('internal visual system workspace exposes frozen mother, 13 anchors and validation cases', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error' || /warning/i.test(message.text())) errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: /视觉母体验证/ }).click();
  await expect(page.getByRole('heading', { name: '视觉母体验证工作台' })).toBeVisible();
  await expect(page.getByText('approved_frozen')).toBeVisible();
  await expect(page.locator('img[alt*="visual anchor"]')).toHaveCount(13);
  await expect(page.getByText('13 cases / validation only')).toBeVisible();
  expect(errors).toEqual([]);
});
