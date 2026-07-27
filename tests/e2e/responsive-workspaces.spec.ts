import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const viewports = [
  [1600, 1000], [1440, 900], [1280, 800], [1024, 768], [768, 1024], [390, 844],
] as const;

async function observe(page: Page, name: string, width: number, height: number) {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error' || /warning/i.test(message.text())) errors.push(`${message.type()}: ${message.text()}`); });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  await page.setViewportSize({ width, height });
  await page.goto('/');
  await expect(page.getByText('THERUIZ AURA', { exact: false }).first()).toBeVisible();
  await expect(page.locator('button').first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
  expect(errors, `${name} ${width} console/page errors`).toEqual([]);
  const dir = path.join(process.cwd(), 'artifacts/ui-redesign');
  fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: path.join(dir, `${name}-${width}.png`), fullPage: true });
}

for (const [width, height] of viewports) {
  test(`Founder Workbench responsive ${width}`, async ({ page }) => {
    await observe(page, 'founder-workbench', width, height);
    await expect(page.getByRole('heading', { name: 'Founder' })).toBeVisible();
    await page.getByRole('button', { name: /Prompt 构建器/ }).click();
    await expect(page.getByText('最终英文提示词')).toBeVisible();
  });

  test(`Generation Workspace responsive ${width}`, async ({ page }) => {
    await observe(page, 'generation-workspace', width, height);
    await page.getByRole('button', { name: /Prompt 构建器/ }).click();
    await expect(page.getByText('最终英文提示词')).toBeVisible();
    await expect(page.getByText('API 尚未接入', { exact: false })).toBeVisible();
    await expect(page.getByText('上传参考图')).toBeVisible();
    await page.screenshot({ path: path.join(process.cwd(), 'artifacts/ui-redesign', `generation-workspace-${width}.png`), fullPage: true });
  });

  test(`Xiaohongshu Workspace responsive ${width}`, async ({ page }) => {
    await observe(page, 'xiaohongshu-workspace', width, height);
    await page.locator('button').filter({ hasText: '小红书内容' }).first().click();
    await expect(page.getByRole('heading', { name: '每日小红书内容' })).toBeVisible();
    await expect(page.getByText('配图卡片')).toBeVisible();
    await page.getByRole('button', { name: '生成小红书内容' }).click();
    await expect(page.getByText('标题')).toBeVisible();
    await page.screenshot({ path: path.join(process.cwd(), 'artifacts/ui-redesign', `xiaohongshu-workspace-${width}.png`), fullPage: true });
  });
}
