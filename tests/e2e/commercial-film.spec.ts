import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { runCommercialFilmPipeline } from "../../src/commercial-film";

const samplePng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z7i8AAAAASUVORK5CYII=",
  "base64"
);

function canonicalCommercialScript(intent: "URBAN_MOTION" | "DAILY_STYLING" | "QUIET_LUXURY" | "PRODUCT_CRAFT" | "NEW_ARRIVAL") {
  const coverage = [
    "silhouette",
    "toe_structure",
    "side_panel_structure",
    "heel_structure",
    "outsole_profile",
    "color_blocking",
    "material_evidence",
  ] as const;
  const outcome = runCommercialFilmPipeline({
    commercialIntent: intent,
    characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 克制 / 自然",
    duration: 15,
    generationNonce: 1,
    reference: {
      referenceSetId: "e2e-canonical-reference-set",
      taskId: "current-local-task",
      sourceType: "current_task_reference_set",
      confirmationStatus: "confirmed",
      confirmedReferenceCount: 1,
      confirmedAssetIds: ["e2e-reference"],
      coverage: [...coverage],
      missingCoverage: [],
      referencePlanReady: true,
      productTruthMode: "reference_bound",
      productTruth: {
        coverage: [...coverage],
        status: "draft",
        referenceEvidenceBound: true,
        productTruthMode: "reference_bound",
      } as never,
    },
  });
  if (outcome.status !== "GENERATED") {
    throw new Error(`canonical Commercial Film pipeline blocked: ${outcome.diagnostics.join(" | ")}`);
  }
  return outcome.modelFacingScript.compiledText;
}

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
    await expect(page.getByTestId("commercial-duration-value")).toHaveText("15 秒 · V1 固定五镜头");
    await expect(page.getByTestId("commercial-debug-panel")).toHaveCount(0);

    await intent.selectOption("PRODUCT_CRAFT");
    await page.getByTestId("commercial-generate").click();
    const output = page.getByTestId("commercial-script-output");
    const directorOutput = page.getByTestId("commercial-director-script-output");
    await expect(directorOutput).toBeVisible();
    await expect(output).toHaveCount(0);
    const directorScript = (await directorOutput.textContent()) ?? "";
    expect(directorScript).not.toBe(canonicalCommercialScript("PRODUCT_CRAFT"));
    await expect(page.getByTestId("commercial-production-label")).toHaveText("Commercial Film · V1.4 · Production Script");
    expect(directorScript).toContain("CREATIVE PROPOSITION");
    expect(directorScript).toContain("DIRECTOR CONCEPT");
    expect(directorScript).toContain("CINEMATIC DEVICE");
    expect(directorScript).toContain("SIGNATURE MOMENT");
    expect(directorScript).toContain("FILM ARC");
    expect(directorScript).toContain("ENDING IMAGE");
    expect(directorScript).toContain("BRAND-SIGN-OFF");
    expect(directorScript).toContain("Brand Mark: THERUIZ AURA");
    expect(directorScript).toContain("SEEDANCE EXECUTION DIRECTION");
    expect(directorScript).toContain("SHOT 1 — ");
    expect(directorScript).toContain("SHOT 5 — ");
    expect(directorScript).not.toContain("SHOT 1 — WORLD");
    expect(directorScript).not.toContain("FILM STRUCTURE");
    expect(directorScript).not.toMatch(/\b(?:QC|validator|enum|source id|primitive id)\b/i);
    expect(directorScript).not.toContain("COMMERCIAL EXPRESSION");
    expect(directorScript).not.toContain("PRIVATE_MOMENT");
    expect(directorScript).not.toContain("PREPARATION_CONTEXT");

    await page.getByTestId("commercial-technical-toggle").click();
    await expect(output).toBeVisible();
    const script = (await output.textContent()) ?? "";
    expect(script).not.toBe(canonicalCommercialScript("PRODUCT_CRAFT"));
    expect(script).toContain("[V1.4 CREATIVE DIRECTING]");
    expect(script).toContain("Brand sign-off: hold");
    expect(script).toContain("Brand mark: THERUIZ AURA is applied in post");
    expect(script).toContain("do not render brand lettering");
    expect(script).toContain("SEEDANCE — COMMERCIAL FILM");
    for (let shot = 1; shot <= 5; shot += 1) {
      expect(script).toContain(`SHOT ${shot} — `);
    }
    expect(script).toContain("[FILM IDEA]");
    expect(script).toContain("[CHARACTER / WORLD]");
    expect(script).toContain("[TIMING]");
    expect(script).toContain("[SOUND WORLD]");
    expect(script).toContain("[VISUAL LOOK]");
    expect(script).toContain("[GLOBAL PRODUCT PROTECTION]");
    expect(script).toContain("[NEGATIVES]");
    expect(script).toContain("Ending:");
    expect(script).not.toContain("[COMMERCIAL PLAN]");
    expect(script).not.toContain("[NARRATIVE CORE]");
    expect(script).not.toMatch(/\b(?:walking|transition|standing|turning|on-foot)-\d{3}\b/i);
    expect(script).not.toMatch(/\b(?:QC|validator|enum|source id|primitive id)\b/i);
    for (const internalValue of [
      "PRIVATE_MOMENT",
      "CITY_JOURNEY",
      "EVERYDAY_MOVEMENT",
      "STATE_TRANSITION",
      "SENSORY_LIFE",
      "SINGLE_IDEA",
      "OBSERVE",
      "FOLLOW",
      "WITHHOLD",
      "REVEAL",
      "ACTION_CUT",
      "MATCH_MOVEMENT",
      "SENSORY_INSERT",
      "DELAYED_REVEAL",
      "THRESHOLD",
      "REFLECTION",
      "REPETITION",
    ]) {
      expect(script).not.toContain(internalValue);
    }

    await page.getByTestId("commercial-copy-director").click();
    const directorClipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(directorClipboard).toBe(directorScript);
    expect(directorClipboard).toContain("BRAND-SIGN-OFF");
    await page.getByTestId("commercial-copy-seedance").click();
    const seedanceClipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(seedanceClipboard).toBe(script);
    expect(seedanceClipboard).toContain("[V1.4 CREATIVE DIRECTING]");

    await page.getByTestId("commercial-legacy-panel").locator("summary").click();
    const legacyDirectorScript = (await page.getByTestId("commercial-legacy-director-script").textContent()) ?? "";
    expect(legacyDirectorScript).toContain("SHOT 1 — WORLD");
    expect(legacyDirectorScript).toContain("FILM STRUCTURE");
    const legacySeedancePrompt = (await page.getByTestId("commercial-legacy-seedance").textContent()) ?? "";
    expect(legacySeedancePrompt).toBe(canonicalCommercialScript("PRODUCT_CRAFT"));
    await page.getByTestId("commercial-legacy-copy-seedance").click();
    const legacyClipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(legacyClipboard).toBe(canonicalCommercialScript("PRODUCT_CRAFT"));

    await expect(page.getByTestId("commercial-debug-panel")).toHaveCount(0);
    await page.getByTestId("commercial-debug-toggle").click();
    await expect(page.getByTestId("commercial-debug-panel")).toBeVisible();
    await expect(page.getByTestId("commercial-production-provenance").getByText("mainDirectorScriptSource")).toBeVisible();
    await expect(page.getByTestId("commercial-production-provenance").getByText("mainSeedancePromptSource")).toBeVisible();
    await expect(page.getByTestId("commercial-production-provenance").getByText("LEGACY_FROZEN_BASELINE")).toBeVisible();
    await expect(page.getByTestId("commercial-debug-panel").getByRole("heading", { name: "Creative Story Spine" })).toBeVisible();
    await expect(page.getByTestId("commercial-debug-panel").getByRole("heading", { name: "Creative Direction" })).toBeVisible();
    await expect(page.getByTestId("commercial-debug-panel").getByRole("heading", { name: "Director Concept" })).toBeVisible();
    await expect(page.getByTestId("commercial-debug-panel").getByRole("heading", { name: "V1.4 Creative Directing" })).toBeVisible();
    await expect(page.getByTestId("commercial-debug-panel").getByRole("heading", { name: "V1.3 Visual Acceptance" })).toBeVisible();
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
