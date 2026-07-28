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
  const expectedActiveMarkers: Record<string, string> = { A1: 'daily-life', A2: 'walking near a café or doorway', A3: 'interior-daily', B3: 'official-studio', B4: 'three-quarter studio', C1: 'clean side-view', C2: 'on-foot', C3: 'paired-product', C4: 'material-craft', C5: 'True overhead top-down view' };
  for (const [id, marker] of Object.entries(expectedActiveMarkers)) {
    const prompt = await page.getByTestId(`prompt-${id}`).textContent();
    expect(prompt).toContain(marker);
  }
  const themePrompts = await page.locator('pre[data-testid^="theme-prompt-"]').allTextContents();
  expect(themePrompts).toHaveLength(8);
  for (const prompt of themePrompts) {
    expect(prompt.trim().length).toBeGreaterThan(0);
    expect(prompt).not.toMatch(/[\u3400-\u9fff]/);
    expect(prompt).toContain('Product Truth lock:');
    expect(prompt).toContain('burgundy and ivory');
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

test('user-facing soft-seeding prompts use active registry routing for display and copy', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:4173' });
  await page.goto('/');
  await page.getByRole('button', { name: /▧ 小红书内容/ }).click();

  const samples = [
    { topic: '生活场景软种草', topicId: 'lifestyle_soft_seeding', count: 3, role: 'A1', marker: 'Active Prompt Registry: image2-cmp-01-new-v1.' },
    { topic: '穿搭解决方案', topicId: 'styling_solution', count: 5, role: 'A1', marker: 'Active Prompt Registry:' },
    { topic: '棚内上新拍摄', topicId: 'studio_launch_shoot', count: 5, role: 'B3', marker: 'Active Prompt Registry:' },
    { topic: '材质工艺认知', topicId: 'material_craft_education', count: 3, role: 'C4', marker: 'Active Prompt Registry:' },
    { topic: '秋冬配色实验室', topicId: 'autumn_winter_color_lab', count: 5, role: 'C3', marker: 'Active Prompt Registry:' },
    { topic: '产品开发幕后', topicId: 'product_development_behind_the_scenes', count: 3, role: 'C4', marker: 'Active Prompt Registry:' },
    { topic: '品牌审美观点', topicId: 'brand_aesthetic_viewpoint', count: 5, role: 'A2', marker: 'Active Prompt Registry:' },
    { topic: '上新活动转化', topicId: 'launch_conversion', count: 5, role: 'B3', marker: 'Active Prompt Registry:' }
  ];

  for (const sample of samples) {
    await page.getByLabel('内容主题').selectOption({ label: sample.topic });
    await page.getByLabel('配图数量').selectOption(String(sample.count));
    await page.getByRole('button', { name: '生成小红书内容' }).click();
    const prompts = page.locator('[data-testid^="soft-prompt-"]');
    await expect(prompts).toHaveCount(sample.count);
    const firstPrompt = await prompts.nth(0).textContent();
    const provenance = page.getByTestId('provenance-0');
    await expect(provenance).toContainText(sample.topic);
    await expect(provenance).toContainText('场景：');
    await expect(provenance).toContainText('图片类型：');
    await expect(provenance).toContainText('图片序列：第 1 张，共 ' + sample.count + ' 张');
    expect(await provenance.textContent()).not.toContain('任务上下文：');
    expect(firstPrompt).toContain(sample.marker);
    expect(firstPrompt).toMatch(/Topic responsibility: [a-z0-9_]+ \([a-z -]+\)/);
    expect(firstPrompt).toContain(`image 1 of ${sample.count}`);
    expect(firstPrompt).toContain('Image2 provider boundary');
    expect(firstPrompt).toContain('Product Truth protection');
    const allPrompts = await prompts.allTextContents();
    for (const prompt of allPrompts) {
      expect(prompt).not.toMatch(/theme validation|visual validation case|burgundy and ivory/i);
      expect(prompt).toContain('provider boundary: use Image2 only');
    }
    if (sample.topic === '产品开发幕后') expect(allPrompts.join('\n')).toContain('image2-cmp-09-repaired_new-v1');
    if (sample.topic === '品牌审美观点') expect(allPrompts.join('\n')).toContain('image2-cmp-02-old-v1');
    await page.getByRole('button', { name: '复制这张 Prompt' }).first().click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(firstPrompt);
    await page.getByRole('button', { name: '复制全部生图 Prompt' }).click();
    const allCopied = await page.evaluate(() => navigator.clipboard.readText());
    expect(allCopied).toContain(firstPrompt ?? '');
    expect(allCopied.split(/\n\nImage \d+:\n/).length).toBe(sample.count);
  }
});

test('unmapped structured fields fail closed before entering the English Prompt', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const module = await import('/src/visual-system/englishPromptMappings.ts');
    try {
      module.mapEnglishPromptField('scene', '未登记场景');
      return 'NO_ERROR';
    } catch (error) {
      return error instanceof Error ? error.message : String(error);
    }
  });
  expect(result).toContain('ENGLISH_PROMPT_MAPPING_MISSING');
});
