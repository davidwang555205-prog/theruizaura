import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { openNarrativeWorkspace } from "./helpers/immersiveNarrative";

const viewports = [
  [1600, 1000],
  [1280, 800],
  [390, 844],
] as const;

for (const [width, height] of viewports) {
  test(`Immersive Narrative final UI ${width}`, async ({ page }) => {
    await openNarrativeWorkspace(page, width, height);
    const directory = path.join(process.cwd(), "artifacts", "narrative-planner");
    fs.mkdirSync(directory, { recursive: true });
    await page.screenshot({
      path: path.join(directory, `immersive-narrative-${width}.png`),
      fullPage: true,
    });
  });
}

test("Immersive Narrative fails closed before an invalid scene library", async ({ page }) => {
  await openNarrativeWorkspace(page, 1280, 800);
  await page.getByLabel("Available Scene Library").fill("");
  await page.getByRole("button", { name: "生成代入感视频脚本" }).click();
  await expect(page.getByTestId("script-summary")).toHaveText("无法生成脚本");
  await expect(page.getByText(/EMPTY_SCENE_LIBRARY|requires at least one available scene/i).first()).toBeVisible();
  const directory = path.join(process.cwd(), "artifacts", "narrative-planner");
  fs.mkdirSync(directory, { recursive: true });
  await page.screenshot({
    path: path.join(directory, "immersive-narrative-blocked-1280.png"),
    fullPage: true,
  });
});

test("Topic dropdown contains all 13 official topics and each resolves", async ({ page }) => {
  await openNarrativeWorkspace(page, 1280, 800);
  const topics = [
    "下班回家", "周末独处", "出门办事", "等朋友", "午后咖啡", "逛书店", "采购归来",
    "接孩子后", "周末散步", "午餐之后", "城市闲逛", "傍晚回家", "短途出行",
  ];
  const topicSelect = page.getByLabel("Topic");
  await expect(topicSelect.locator("option")).toHaveCount(13);
  await expect(topicSelect.locator("option")).toHaveText(topics);
  for (const topic of topics) {
    await topicSelect.selectOption({ label: topic });
    await page.getByRole("button", { name: /生成代入感/ }).first().click();
    await expect(page.getByTestId("scene-resolution-status"), `${topic} should resolve`).toHaveText("SCENE_RESOLUTION_APPROVED");
    await expect(page.getByTestId("product-presence-status"), `${topic} should approve product presence`).toHaveText("PRODUCT_PRESENCE_APPROVED");
    await expect(page.getByTestId("sound-world-status"), `${topic} should approve Sound World`).toHaveText("SOUND_WORLD_APPROVED");
    await expect(page.getByTestId("camera-narrative-status"), `${topic} should approve Camera Narrative`).toHaveText("CAMERA_NARRATIVE_APPROVED");
    await expect(page.getByTestId("camera-execution-status"), `${topic} should approve Camera Execution`).toHaveText("CAMERA_EXECUTION_APPROVED");
  }
});

test("Character Profile Catalog dropdowns expose 6 age and 3 appearance options", async ({ page }) => {
  await openNarrativeWorkspace(page, 1280, 800);
  const ageSelect = page.getByLabel("年龄阶段");
  const appearanceSelect = page.getByLabel("人物外观");
  await expect(ageSelect.locator("option")).toHaveCount(6);
  await expect(appearanceSelect.locator("option")).toHaveCount(3);
  await expect(page.getByTestId("character-profile-status")).toHaveText("CHARACTER_PROFILE_APPROVED");
  await ageSelect.selectOption({ label: "48–55｜从容成熟" });
  await appearanceSelect.selectOption({ label: "拉丁美裔" });
  await page.getByRole("button", { name: /生成代入感/ }).first().click();
  await expect(page.getByTestId("character-profile-status")).toHaveText("CHARACTER_PROFILE_APPROVED");
  await expect(page.getByTestId("scene-resolution-status")).toHaveText("SCENE_RESOLUTION_APPROVED");
  await expect(page.getByTestId("camera-narrative-status")).toHaveText("CAMERA_NARRATIVE_APPROVED");
  await expect(page.getByTestId("camera-execution-status")).toHaveText("CAMERA_EXECUTION_APPROVED");
});
