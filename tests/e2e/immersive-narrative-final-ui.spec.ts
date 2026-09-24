import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { generateScript } from "./helpers/immersiveNarrative";
import { DEFAULT_CHARACTER_SELECTION } from "../../src/immersive-narrative/character-profile";
import { parseSceneLibraryText } from "../../src/immersive-narrative/planner";
import { runImmersiveNarrativePipeline } from "../../src/immersive-narrative/pipeline";
import { defaultSceneLabelsForTopic } from "../../src/immersive-narrative/topic-catalog";

async function openFinalUi(page: Page, width = 1280, height = 800) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await page.locator("button").filter({ hasText: "沉浸叙事" }).first().click();
  await expect(page.getByRole("heading", { name: "代入感视频脚本" })).toBeVisible();
}

// Canonical artifact for the same request the UI builds, computed through the
// shared pipeline (Phase 8 Seedance Compiler), never re-assembled in the test.
function canonicalFinalScript(topicLabel: string) {
  const outcome = runImmersiveNarrativePipeline({
    topic: topicLabel,
    characterSelection: DEFAULT_CHARACTER_SELECTION,
    season: "秋",
    lifestyleFeeling: "安静 / 克制",
    availableSceneLibrary: parseSceneLibraryText(defaultSceneLabelsForTopic(topicLabel).join("\n")),
  });
  if (outcome.status !== "GENERATED") {
    throw new Error(`pipeline blocked for ${topicLabel}: ${outcome.diagnostics.join(" | ")}`);
  }
  return outcome.presentation.presentationScript;
}

test.describe("final script binding", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  for (const topic of ["逛书店", "城市闲逛", "傍晚回家"]) {
    test(`${topic}: preview / view / copy all read the Seedance Compiler output`, async ({ page }) => {
      await openFinalUi(page);
      await page.getByLabel("Topic").selectOption({ label: topic });
      await page.getByRole("button", { name: /生成代入感/ }).first().click();

      const canonical = canonicalFinalScript(topic);
      const preview = (await page.getByTestId("director-script-output").textContent()) ?? "";
      expect(preview).toBe(canonical);

      await page.getByRole("button", { name: "查看完整脚本" }).click();
      const expanded = (await page.getByTestId("director-script-output").textContent()) ?? "";
      expect(expanded).toBe(canonical);
      await page.getByRole("button", { name: "收起脚本" }).click();

      await page.getByRole("button", { name: "复制导演脚本" }).click();
      const clipboard = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboard).toBe(canonical);

      for (const marker of [
        "CREATIVE IDEA",
        "DIRECTOR CONCEPT",
        "CINEMATIC DEVICE",
        "FILM STRUCTURE",
        "TAKE 1 —",
        "GLOBAL SPATIAL ROUTE",
        "GLOBAL VISUAL LOOK",
        "GLOBAL SOUND",
        "GLOBAL PRODUCT PROTECTION",
        "GLOBAL NEGATIVES",
        "ENDING",
        "SEEDANCE EXECUTION",
      ]) {
        expect(clipboard).toContain(marker);
      }
      for (let moment = 1; moment <= 5; moment += 1) {
        expect(clipboard).toContain(`MOMENT ${moment} —`);
      }
      expect(clipboard).toContain("What happens:");
      expect(clipboard).toContain("Body:");
      expect(clipboard).toContain("Camera:");
      expect(clipboard).toContain("Sound:");
      expect(clipboard).not.toContain("[TIMELINE]");
      expect(clipboard).not.toContain("[NARRATIVE CORE]");
      expect(clipboard).not.toContain("[MOMENT CHAIN]");
      expect(clipboard).not.toContain("[NARRATIVE QC]");
      expect(clipboard).not.toContain("APPROVED FOR SCENE RESOLUTION");
      expect(clipboard).not.toContain("CORRECT_UNSUPPORTED");
      expect(clipboard.endsWith("APPROVED FOR SCENE RESOLUTION")).toBe(false);

      if (topic === "傍晚回家") {
        expect(clipboard).not.toContain("CORRECT_UNSUPPORTED");
        expect(clipboard).toContain("Nothing else happens in this moment");
      }

      await page.getByTestId("debug-toggle").click();
      const planner = (await page.getByTestId("narrative-plan-output").textContent()) ?? "";
      expect(planner).toContain("[NARRATIVE CORE]");
      expect(planner).toContain("[MOMENT CHAIN]");
      expect(planner).toContain("[NARRATIVE QC]");
      expect(planner).toContain("APPROVED FOR SCENE RESOLUTION");
      expect(clipboard).not.toBe(planner);
    });
  }
});

test("final user UI exposes only the six primary controls and one primary action", async ({ page }) => {
  await openFinalUi(page);
  await expect(page.getByLabel("Topic")).toBeVisible();
  await expect(page.getByLabel("年龄阶段")).toBeVisible();
  await expect(page.getByLabel("人物外观")).toBeVisible();
  await expect(page.getByLabel("Season")).toBeVisible();
  await expect(page.getByLabel("Lifestyle Feeling")).toBeVisible();
  await expect(page.getByTestId("duration-value")).toHaveText("15 秒 · V1 固定基准");
  await expect(page.getByRole("button", { name: "生成代入感视频脚本" })).toBeVisible();
  await expect(page.getByText("尚未生成脚本。", { exact: true })).toBeVisible();
  await expect(page.getByTestId("debug-panel")).toHaveCount(0);
});

test("generating produces one complete script with view, copy, and regenerate actions", async ({ page }) => {
  await openFinalUi(page);
  await page.getByRole("button", { name: "生成代入感视频脚本" }).click();
  const output = page.getByTestId("director-script-output");
  await expect(output).toBeVisible();
  const script = (await output.textContent()) ?? "";
  expect(script).toContain("CREATIVE IDEA");
  for (const section of [
    "DIRECTOR CONCEPT",
    "CINEMATIC DEVICE",
    "FILM STRUCTURE",
    "GLOBAL SPATIAL ROUTE",
    "GLOBAL VISUAL LOOK",
    "GLOBAL SOUND",
    "GLOBAL PRODUCT PROTECTION",
    "GLOBAL NEGATIVES",
    "ENDING",
  ]) {
    expect(script).toContain(section);
  }
  expect(script).not.toMatch(/api key|endpoint|\bcredential\b|model id/i);
  for (let moment = 1; moment <= 5; moment += 1) {
    const start = script.indexOf(`MOMENT ${moment} —`);
    expect(start, `Moment ${moment} block`).toBeGreaterThan(-1);
    const next = moment < 5 ? script.indexOf(`MOMENT ${moment + 1} —`) : script.indexOf("\nENDING\n", start);
    const block = script.slice(start, next);
    for (const label of ["What happens:", "Body:", "Camera:", "Sound:"]) {
      expect(block, `Moment ${moment} ${label}`).toContain(label);
    }
  }

  await page.getByRole("button", { name: "查看完整脚本" }).click();
  const fullyVisible = await output.evaluate((element) => element.scrollHeight <= element.clientHeight + 2);
  expect(fullyVisible).toBe(true);
  await page.getByRole("button", { name: "收起脚本" }).click();

  await page.getByRole("button", { name: "复制导演脚本" }).click();
  await expect(page.getByRole("status").first()).toContainText("已复制导演脚本");

  await page.getByRole("button", { name: "重新生成", exact: true }).click();
  await expect(output).toContainText("CREATIVE IDEA");
  const directory = path.join(process.cwd(), "artifacts", "narrative-planner");
  fs.mkdirSync(directory, { recursive: true });
  await page.screenshot({ path: path.join(directory, "immersive-narrative-final-ui.png"), fullPage: true });
});

test("debug stays collapsed by default and exposes every internal surface on demand", async ({ page }) => {
  await openFinalUi(page);
  await page.getByRole("button", { name: "生成代入感视频脚本" }).click();
  await expect(page.getByTestId("debug-panel")).toHaveCount(0);
  await page.getByTestId("debug-toggle").click();
  const debug = page.getByTestId("debug-panel");
  await expect(debug).toBeVisible();
  for (const heading of [
    "Character Profile",
    "Narrative Planner",
    "Scene Resolver",
    "Product Presence",
    "Sound World",
    "Camera Narrative Role",
    "Physical Action",
    "Camera Execution",
    "Compiler Diagnostics",
  ]) {
    await expect(debug.getByRole("heading", { name: heading })).toBeVisible();
  }
  await expect(debug.getByText("Eligibility Trace", { exact: false }).first()).toBeVisible();
  const directory = path.join(process.cwd(), "artifacts", "narrative-planner");
  fs.mkdirSync(directory, { recursive: true });
  await page.screenshot({ path: path.join(directory, "immersive-narrative-debug.png"), fullPage: true });
});

test("honest unsupported Moments stay visible and are never faked", async ({ page }) => {
  await openFinalUi(page);
  await page.getByLabel("Topic").selectOption({ label: "下班回家" });
  await page.getByRole("button", { name: /生成代入感/ }).first().click();
  const script = (await page.getByTestId("director-script-output").textContent()) ?? "";
  expect(script).not.toContain("CORRECT_UNSUPPORTED");
  expect(script).toContain("continues the same quiet search inside the bag");
  await expect(page.getByTestId("camera-execution-status")).toHaveCount(0);
  await page.getByTestId("debug-toggle").click();
  await expect(page.getByTestId("camera-execution-status")).toHaveText("CAMERA_EXECUTION_APPROVED");
  await expect(page.getByTestId("physical-action-status")).toContainText("4/5 MATCHED");
  await expect(page.getByTestId("internal-script-output")).toContainText("[GLOBAL INTENT]");
});

test("the execution prompt stays a separate, copyable artifact", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openFinalUi(page);
  await page.getByRole("button", { name: "生成代入感视频脚本" }).click();
  await expect(page.getByTestId("execution-prompt-summary")).toContainText("EXECUTABLE");
  await page.getByRole("button", { name: "查看执行提示词" }).click();
  const prompt = page.getByTestId("execution-prompt-output");
  await expect(prompt).toContainText("SEEDANCE — IMMERSIVE NARRATIVE EXECUTION SCRIPT");
  await expect(prompt).toContainText("[TIMELINE]");
  await page.getByRole("button", { name: "复制执行提示词" }).click();
  await expect(page.getByRole("status").first()).toContainText("已复制执行提示词");
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard.startsWith("SEEDANCE — IMMERSIVE NARRATIVE EXECUTION SCRIPT")).toBe(true);
  const director = (await page.getByTestId("director-script-output").textContent()) ?? "";
  expect(clipboard).not.toBe(director);
  expect(clipboard).toContain("[TIMELINE]");
});

for (const [width, height] of [[1600, 1000], [1280, 800], [390, 844]] as const) {
  test(`final user UI responsive ${width}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await openFinalUi(page, width, height);
    await generateScript(page);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    const directory = path.join(process.cwd(), "artifacts", "narrative-planner");
    fs.mkdirSync(directory, { recursive: true });
    await page.screenshot({ path: path.join(directory, `immersive-narrative-final-ui-${width}.png`), fullPage: true });
    expect(errors, `final UI ${width} page errors`).toEqual([]);
  });
}
