import { expect, type Page } from "@playwright/test";

export const qcLabels = [
  "One Story",
  "One Event",
  "Causality",
  "Physical Reality",
  "No Performance",
  "State Visibility",
  "Location Logic",
  "Natural Ending",
  "Spatial Continuity",
  "State Progression",
  "Micro Event Consequence",
  "No Semantic Loop",
  "Goal Completion",
  "Resolved Ending",
];

export const sceneQcLabels = [
  "All Moments Resolved",
  "Location Continuity",
  "Narrative Preserved",
  "No Scene Invention",
  "Scene Sequence Spatially Continuous",
  "No Origin / Execution Confusion",
  "No Unannounced Location Jump",
];

export const productPresenceQcLabels = [
  "Narrative Preserved",
  "Product Not Forced",
  "Sufficient Product Evidence",
  "No Overexposure",
];

export const soundWorldQcLabels = [
  "Narrative Preserved",
  "Scene Physically Consistent",
  "No Invented Event",
  "No Overdesign",
];

export const cameraNarrativeQcLabels = [
  "Narrative Preserved",
  "Role Motivated By Action",
  "No Product Driven Camera",
  "No Overdirection",
];

export const cameraExecutionQcLabels = [
  "Physical Action Preserved",
  "Camera Role Preserved",
  "No Product-Driven Action",
  "No Product-Only Camera Motivation",
  "No Impossible Follow",
  "No Body / Camera Collision",
  "No Perspective Abuse",
  "No Random Lens Jump",
  "No Unmotivated Reframe",
  "Moment Continuity",
  "Natural Ending",
];

export async function generateScript(page: Page) {
  await page.getByRole("button", { name: /生成代入感/ }).first().click();
  const output = page.getByTestId("director-script-output");
  await expect(output).toBeVisible();
  await expect(output).toContainText("CREATIVE IDEA");
  await expect(output).toContainText("FILM STRUCTURE");
  await expect(output).toContainText("TAKE 1 —");
  await expect(output).toContainText("GLOBAL SOUND");
  await expect(output).toContainText("ENDING");
  return output;
}

export async function openNarrativeWorkspace(page: Page, width: number, height: number) {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await page.locator("button").filter({ hasText: "沉浸叙事" }).first().click();
  await expect(page.getByRole("heading", { name: "代入感视频脚本" })).toBeVisible();
  await expect(page.getByTestId("duration-value")).toHaveText("15 秒 · V1 固定基准");
  await generateScript(page);

  await page.getByTestId("debug-toggle").click();
  const debug = page.getByTestId("debug-panel");
  await expect(debug).toBeVisible();
  const output = page.getByTestId("narrative-plan-output");
  await expect(output).toBeVisible();
  await expect(output).toContainText("[NARRATIVE CORE]");
  await expect(output).toContainText("[MOMENT CHAIN]");
  await expect(output).toContainText("APPROVED FOR SCENE RESOLUTION");
  for (const label of qcLabels) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByTestId("character-profile-status")).toHaveText("CHARACTER_PROFILE_APPROVED");
  await expect(page.getByTestId("scene-resolution-status")).toHaveText("SCENE_RESOLUTION_APPROVED");
  for (const label of sceneQcLabels) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByTestId("product-presence-status")).toHaveText("PRODUCT_PRESENCE_APPROVED");
  for (const label of productPresenceQcLabels) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByTestId("sound-world-status")).toHaveText("SOUND_WORLD_APPROVED");
  for (const label of soundWorldQcLabels) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByTestId("camera-narrative-status")).toHaveText("CAMERA_NARRATIVE_APPROVED");
  for (const label of cameraNarrativeQcLabels) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByTestId("camera-execution-status")).toHaveText("CAMERA_EXECUTION_APPROVED");
  for (const label of cameraExecutionQcLabels) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
  expect(pageErrors, `Immersive Narrative ${width} page errors`).toEqual([]);
}
