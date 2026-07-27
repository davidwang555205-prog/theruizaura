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
  const prompts = await page.locator('pre[data-testid^="prompt-"]').allTextContents();
  expect(prompts).toHaveLength(13);
  for (const prompt of prompts) {
    expect(prompt.trim().length).toBeGreaterThan(0);
    expect(prompt).not.toMatch(/[\u3400-\u9fff]/);
    for (const field of ['burgundy and ivory', 'low-cut silhouette', 'rounded toe box', 'slim brown outsole', 'side panels', 'heel counter', 'tongue', 'white laces', 'stitching', 'material contrast', 'original proportions']) expect(prompt).toContain(field);
  }
  expect(errors).toEqual([]);
});

test('A2 B3 C1 copy complete prompts and reference plans', async ({ page, context }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error' || /warning/i.test(message.text())) errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:4173' });
  await page.goto('/');
  await page.getByRole('button', { name: /视觉母体验证/ }).click();
  for (const id of ['A2', 'B3', 'C1']) {
    const prompt = page.getByTestId(`prompt-${id}`);
    await prompt.locator('xpath=..').locator('summary').click();
    const expected = await prompt.textContent();
    await page.getByRole('button', { name: `${id} 复制完整 Prompt` }).click();
    await expect(page.getByRole('status')).toContainText('Prompt 已复制');
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(expected);
    await page.getByRole('button', { name: `${id} 复制 Reference Plan` }).click();
    await expect(page.getByRole('status')).toContainText('Reference Plan 已复制');
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('Reference Plan: PT-01, PT-02, PT-03, PT-04');
  }
  expect(errors).toEqual([]);
});

test('clipboard failure uses compatible fallback and visible feedback', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error' || /warning/i.test(message.text())) errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('blocked'); } } });
    document.execCommand = () => true;
  });
  await page.goto('/');
  await page.getByRole('button', { name: /视觉母体验证/ }).click();
  await page.getByRole('button', { name: 'A2 复制完整 Prompt' }).click();
  await expect(page.getByRole('status')).toContainText('Prompt 已复制（兼容模式）');
  expect(errors).toEqual([]);
});
