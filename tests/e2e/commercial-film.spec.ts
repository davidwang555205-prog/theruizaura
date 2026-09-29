import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const samplePng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z7i8AAAAASUVORK5CYII=",
  "base64"
);

async function openCommercialFilm(page: Page, width = 1280, height = 800) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await page.locator("button").filter({ hasText: "品牌广告片" }).first().click();
  await expect(page.getByRole("heading", { name: "品牌广告片" })).toBeVisible();
}

async function confirmProductReference(page: Page) {
  await page.locator("button").filter({ hasText: "Prompt 构建器" }).first().click();
  await page.locator('input[type="file"]').first().setInputFiles({
    name: "commercial-reference.png",
    mimeType: "image/png",
    buffer: samplePng,
  });
  const roleSelect = page.getByLabel("commercial-reference.png 参考角色");
  await expect(roleSelect).toBeVisible();
  await roleSelect.selectOption("primary_product_reference");
  await page.locator("button").filter({ hasText: "品牌广告片" }).first().click();
  await expect(page.getByTestId("commercial-reference-status")).toHaveText("OPTIONAL / READY");
}

test.describe("Commercial Film V1", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("reference=0 generates a complete external-reference commercial script", async ({ page }) => {
    await openCommercialFilm(page);
    await expect(page.getByTestId("commercial-reference-status")).toHaveText("OPTIONAL / READY");
    await page.getByTestId("commercial-generate").click();
    await expect(page.getByTestId("commercial-director-script-output")).toBeVisible();
    await page.getByTestId("commercial-technical-toggle").click();
    await expect(page.getByTestId("commercial-script-output")).toBeVisible();
    const script = (await page.getByTestId("commercial-script-output").textContent()) ?? "";
    expect(script).toContain("Use the footwear reference images uploaded in the external video generation tool as the only source of truth for the product. Do not invent or alter product details not supported by those references.");
    expect(script).not.toContain("PRODUCT_REFERENCE_REQUIRED");
    expect(script).not.toContain("REFERENCE_CONFIRMATION_REQUIRED");
    expect(page.getByTestId("commercial-blocked")).toHaveCount(0);
  });

  test("five fixed intents, generate, view, copy, and collapsed debug", async ({ page }) => {
    await openCommercialFilm(page, 1600, 1000);
    await confirmProductReference(page);

    const intent = page.getByTestId("commercial-intent");
    await expect(intent.locator("option")).toHaveCount(5);
    await expect(page.getByTestId("commercial-duration-value")).toHaveText("15 秒 · Final Execution Plan");
    await expect(page.getByTestId("commercial-debug-panel")).toHaveCount(0);

    await intent.selectOption("PRODUCT_CRAFT");
    await page.getByTestId("commercial-generate").click();
    const output = page.getByTestId("commercial-script-output");
    const directorOutput = page.getByTestId("commercial-director-script-output");
    await expect(directorOutput).toBeVisible();
    await expect(output).toHaveCount(0);
    const directorScript = (await directorOutput.textContent()) ?? "";
    await expect(page.getByTestId("commercial-production-label")).toHaveText("Commercial Film · Production Script");
    expect(directorScript).toContain("Format: Commercial Film");
    expect(directorScript).toContain("CREATIVE PROPOSITION");
    expect(directorScript).toContain("DIRECTOR CONCEPT");
    expect(directorScript).toContain("SIGNATURE MOMENT");
    expect(directorScript).toContain("TAKE / BEAT EXECUTION");
    expect(directorScript).toContain("BEAT 1");
    expect(directorScript).toContain("ENDING IMAGE");
    expect(directorScript).not.toContain("SHOT 1 —");
    expect(directorScript).not.toMatch(/\bV1\.[345]\b/);
    expect(directorScript).not.toContain("THERUIZ AURA");

    await page.getByTestId("commercial-technical-toggle").click();
    await expect(output).toBeVisible();
    const script = (await output.textContent()) ?? "";
    expect(script).toContain("SEEDANCE — COMMERCIAL FILM");
    expect(script).toContain("[TAKE CHRONOLOGY]");
    expect(script).toContain("[PRODUCT VISIBILITY / REVEAL]");
    expect(script).toContain("[CAMERA AUTHORITY]");
    expect(script).toContain("[ENDING]");
    expect(script).not.toContain("[V1.4 CREATIVE DIRECTING]");
    expect(script).not.toContain("First complete direct product view");
    expect(script).not.toContain("SHOT 1 —");
    expect(script).not.toMatch(/\bV1\.[345]\b/);
    expect(script).not.toMatch(/\b(?:QC|validator|enum|stateContract|entityId|takeIndex)\b/);
    expect(script).not.toMatch(/\b(?:logo animation|brand end card|generated lettering)\b/i);
    await expect(page.getByTestId("commercial-script-summary")).toContainText(/Take|Takes/);
    await expect(page.getByTestId("commercial-script-summary")).toContainText("Beats");

    await page.getByTestId("commercial-copy-director").click();
    const directorClipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(directorClipboard).toBe(directorScript);
    await page.getByTestId("commercial-copy-seedance").click();
    const seedanceClipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(seedanceClipboard).toBe(script);

    await page.getByTestId("commercial-legacy-panel").locator("summary").click();
    await expect(page.getByTestId("commercial-legacy-panel")).toContainText("Legacy / Frozen Baseline");

    await expect(page.getByTestId("commercial-debug-panel")).toHaveCount(0);
    await page.getByTestId("commercial-debug-toggle").click();
    await expect(page.getByTestId("commercial-debug-panel")).toBeVisible();
    await expect(page.getByTestId("commercial-production-provenance").getByText("FINAL_EXECUTION_PLAN").first()).toBeVisible();
    await expect(page.getByTestId("commercial-production-provenance").getByText("CONSOLIDATED")).toBeVisible();
    await expect(page.getByTestId("commercial-production-provenance").getByText("VALID", { exact: true })).toBeVisible();
    await expect(page.getByTestId("commercial-production-provenance").getByText("LEGACY_FROZEN_BASELINE")).toBeVisible();
    await expect(page.getByTestId("commercial-debug-panel").getByRole("heading", { name: "Creative Story Spine" })).toBeVisible();
    await expect(page.getByTestId("commercial-debug-panel").getByRole("heading", { name: "Creative Direction" })).toBeVisible();
    await expect(page.getByTestId("commercial-debug-panel").getByRole("heading", { name: "Director Concept" })).toBeVisible();
    await expect(page.getByTestId("commercial-debug-panel").getByRole("heading", { name: "Creative Directing" })).toBeVisible();
    await expect(page.getByTestId("commercial-debug-panel").getByRole("heading", { name: "Visual Acceptance" })).toBeVisible();
    await expect(page.getByTestId("visual-acceptance-panel").getByText("case-01")).toBeVisible();
    await expect(page.getByTestId("visual-acceptance-panel").getByText("Script Status: COMMERCIAL_EXECUTION_VALIDATED").first()).toBeVisible();
    await expect(page.getByTestId("visual-acceptance-panel").getByText("Visual Status: NOT_REVIEWED").first()).toBeVisible();
    await expect(page.getByTestId("commercial-debug-panel").getByRole("heading", { name: "Event Spine / Timing" })).toBeVisible();
    await expect(page.getByTestId("commercial-debug-panel").getByRole("heading", { name: "Commercial QC" })).toBeVisible();
    await expect(page.getByTestId("commercial-debug-panel").getByRole("heading", { name: "Commercial Story QC" })).toBeVisible();
    await expect(page.getByTestId("commercial-debug-panel").getByRole("heading", { name: "Shot Story Functions" })).toBeVisible();
    await expect(page.getByTestId("commercial-debug-panel").getByRole("heading", { name: "Action Source Audit" })).toBeVisible();
    await expect(page.getByTestId("commercial-debug-panel").getByRole("heading", { name: "Internal Commercial Plan" })).toBeVisible();
  });

  test("Commercial Film remains an independent category and does not require Narrative", async ({ page }) => {
    await page.goto("/");
    await page.locator("button").filter({ hasText: "品牌广告片" }).first().click();
    await expect(page.getByRole("heading", { name: "品牌广告片" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "代入感视频脚本" })).toHaveCount(0);
    await page.locator("button").filter({ hasText: "沉浸叙事" }).first().click();
    await expect(page.getByRole("heading", { name: "代入感视频脚本" })).toBeVisible();
  });

  for (const [width, height] of [[1600, 1000], [1280, 800], [390, 844]] as const) {
    test(`Commercial Film responsive ${width}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await openCommercialFilm(page, width, height);
      await confirmProductReference(page);
      await page.getByTestId("commercial-generate").click();
      await expect(page.getByTestId("commercial-director-script-output")).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
      const directory = path.join(process.cwd(), "artifacts", "commercial-film");
      fs.mkdirSync(directory, { recursive: true });
      await page.screenshot({ path: path.join(directory, `commercial-film-${width}.png`), fullPage: true });
      expect(errors, `Commercial Film ${width} page errors`).toEqual([]);
    });
  }
});
