import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-aw26-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

try {
  await writeFile(
    entryPath,
    `export * from ${JSON.stringify(resolve(projectRoot, "src/data/theruizAuraWardrobeLibrary.ts"))};\n` +
    `export { choosePerSceneOutfitLine } from ${JSON.stringify(resolve(projectRoot, "src/utils/choosePerSceneOutfitLine.ts"))};\n` +
    `export { generatePromptRuntime } from ${JSON.stringify(resolve(projectRoot, "src/prompt-engine/runtime.ts"))};\n`
  );
  await build({
    entryPoints: [entryPath],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile: bundlePath,
    logLevel: "silent"
  });

  const {
    aw26OutfitPresets,
    aw26ProductionBrandNames,
    buildAw26Mix,
    choosePerSceneOutfitLine,
    generatePromptRuntime,
    selectAw26Preset,
    theruizAuraWardrobeLibrary,
    validateWardrobeCombination
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  assert(theruizAuraWardrobeLibrary.length === 34, "AW26 wardrobe must contain 34 structured items");
  assert(new Set(theruizAuraWardrobeLibrary.map((entry) => entry.id)).size === 34, "AW26 item ids must be unique");
  assert(
    theruizAuraWardrobeLibrary.every((entry) =>
      entry.category && entry.season.length && entry.silhouette && entry.material && entry.color &&
      entry.warmth && entry.formality && entry.scene_compatibility.length &&
      entry.person_state_compatibility.length && entry.role && entry.footwear_visibility &&
      entry.compatible_tops.length && entry.compatible_bottoms.length && entry.compatible_outerwear.length
    ),
    "Every AW26 item must expose the complete compatibility contract"
  );
  assert(
    !theruizAuraWardrobeLibrary.some((entry) => /hotel|酒店/i.test(JSON.stringify(entry))),
    "Retired hotel contexts must not return through AW26 metadata"
  );

  assert(aw26OutfitPresets.length === 30, "AW26 must contain exactly 30 presets");
  assert(new Set(aw26OutfitPresets.map((entry) => entry.id)).size === 30, "AW26 preset ids must be unique");
  for (const preset of aw26OutfitPresets) {
    const items = preset.item_ids.map((id) => theruizAuraWardrobeLibrary.find((entry) => entry.id === id)).filter(Boolean);
    assert(items.length === preset.item_ids.length, `${preset.id} references a missing item`);
    const scene = preset.scene_compatibility[0];
    const personState = preset.person_state_compatibility[0];
    assert(scene && personState, `${preset.id} has no compatible runtime context`);
    assert(
      validateWardrobeCombination(items, { season: "winter", scene, personState, shoe: "Cloud Dancer" }).valid,
      `${preset.id} violates wardrobe constraints`
    );
  }

  const byId = (id) => theruizAuraWardrobeLibrary.find((entry) => entry.id === id);
  const conflict = validateWardrobeCombination(
    [byId("aw26-blouse-victorian"), byId("aw26-jacket-tweed"), byId("aw26-shawl-greige"), byId("aw26-trouser-charcoal")].filter(Boolean),
    { season: "winter", scene: "commute", personState: "professional", shoe: "Cloud Dancer" }
  );
  assert(
    !conflict.valid && conflict.reasons.includes("more than one hero fashion element") && conflict.reasons.includes("high-conflict fashion elements"),
    "High-conflict fashion combination was not rejected"
  );
  const personMismatch = validateWardrobeCombination(
    [byId("aw26-jacket-shearling")].filter(Boolean),
    { season: "winter", scene: "weekendCityWalk", personState: "professional", shoe: "Cloud Dancer" }
  );
  assert(!personMismatch.valid && personMismatch.reasons.includes("person-state mismatch"), "Person-state mismatch was not rejected");

  const mixed = buildAw26Mix({
    season: "autumn",
    scene: "commute",
    personState: "professional",
    shoe: "Cloud Dancer",
    nonce: 7,
    coreBasics: { top: "white cotton shirt", bottom: "dark straight denim" }
  });
  assert(mixed?.source_layers.join("+") === "core+aw26_upgrade", "Mix mode must use Core Basics + AW26 Upgrade");
  assert(mixed?.items.length === 1, "Mix mode may add only one AW26 upgrade item");

  const colorfulPreset = selectAw26Preset({
    season: "autumn",
    scene: "weekendCityWalk",
    personState: "relaxed",
    shoe: "Lemon",
    nonce: 13
  });
  assert(colorfulPreset, "Colorful-shoe preset selection returned no safe candidate");
  assert(colorfulPreset.items.every((entry) => entry.color_family !== "muted_accent"), "Colorful shoes must force neutral AW26 clothing");
  const colorfulMix = buildAw26Mix({
    season: "autumn",
    scene: "weekendCityWalk",
    personState: "relaxed",
    shoe: "Lemon",
    nonce: 4,
    coreBasics: { top: "muted blue shirt", bottom: "berry-brown trousers" }
  });
  assert(colorfulMix, "Colorful-shoe mix returned no safe candidate");
  assert(/ivory fine-gauge knit.*charcoal straight trousers/i.test(colorfulMix.prompt_line), "Colorful-shoe mix did not neutralize its Core Basics");
  assert(!/muted blue|berry-brown/i.test(colorfulMix.prompt_line), "Colorful-shoe mix leaked a colored Core garment");

  const directModes = [0, 1, 2].map((generationNonce) => choosePerSceneOutfitLine({
    scenePreference: "通勤上班",
    season: "autumn",
    shoe: "Cloud Dancer",
    imageType: "产品上脚图",
    garmentTypePreference: "自动匹配",
    generationNonce
  }));
  assert(directModes[0].selectedOutfitId?.startsWith("aw26-preset-"), "Preset mode is not reachable from the main selector");
  assert(directModes[1].selectedOutfitId?.startsWith("aw26-mix-"), "Core + AW26 mix mode is not reachable from the main selector");
  assert(directModes[2].selectedOutfitId?.startsWith("combo-autumn-"), "Original Core combinatorial wardrobe is no longer reachable");

  const baseParams = {
    imageType: "生活场景图",
    modelChoice: "30–45岁客户画像模特",
    modelContinuity: "新人物",
    shoe: "Cloud Dancer 云舞者",
    customShoe: "",
    season: "秋",
    scenePreference: "通勤上班",
    garmentTypePreference: "自动匹配",
    studioLaunchAnglePreference: "自动匹配",
    studioLaunchPreset: "auto",
    studioWardrobePreference: "auto",
    stillLifeStyle: "与主视觉统一",
    extraRequirement: ""
  };
  const runtimeModes = [0, 1, 2].map((generationNonce) => generatePromptRuntime({ ...baseParams, generationNonce }));
  assert(runtimeModes.every((runtime) => runtime.selectedOutfitLine && runtime.prompt.includes(runtime.selectedOutfitLine)), "Runtime lost a selected wardrobe line");
  assert(runtimeModes[0].selectedOutfitLine.includes("commercial visual focus"), "Preset mode did not reach production Prompt");
  assert(runtimeModes[1].selectedOutfitLine.includes("Core Basics"), "Mix mode did not reach production Prompt");

  const productionText = [
    ...aw26OutfitPresets.map((entry) => entry.prompt_line),
    mixed?.prompt_line ?? "",
    colorfulPreset.prompt_line,
    colorfulMix.prompt_line,
    ...runtimeModes.map((entry) => entry.prompt)
  ].join(" ");
  for (const brandName of aw26ProductionBrandNames) {
    assert(!productionText.includes(brandName), `Production Prompt leaks inspiration brand: ${brandName}`);
  }

  console.log("AW26 wardrobe validation passed: 34 items, 30 presets, main-selector preset/mix/core reachability, conflict rejection, person-state compatibility, colorful-shoe neutrality, runtime Prompt binding, and brand redaction.");
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
