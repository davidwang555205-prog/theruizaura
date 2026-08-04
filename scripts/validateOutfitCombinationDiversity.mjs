import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-outfit-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");

try {
  await writeFile(
    entryPath,
    `export { buildCombinatorialOutfit, combinatorialOutfitPools, getCombinatorialOutfitCapacity, getCombinatorialOutfitVisualDistance } from ${JSON.stringify(
      resolve(projectRoot, "src/data/combinatorialOutfitLibrary.ts")
    )};\nexport { choosePerSceneOutfitLine } from ${JSON.stringify(
      resolve(projectRoot, "src/utils/choosePerSceneOutfitLine.ts")
    )};\nexport { generateSoftSeedingContent } from ${JSON.stringify(
      resolve(projectRoot, "src/utils/generateSoftSeedingContent.ts")
    )};\nexport { generatePromptRuntime } from ${JSON.stringify(
      resolve(projectRoot, "src/prompt-engine/runtime.ts")
    )};\n`
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
    buildCombinatorialOutfit,
    choosePerSceneOutfitLine,
    combinatorialOutfitPools,
    getCombinatorialOutfitCapacity,
    getCombinatorialOutfitVisualDistance,
    generateSoftSeedingContent,
    generatePromptRuntime
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);
  const seasons = ["spring", "summer", "autumn", "winter"];
  const seasonLabels = { spring: "春", summer: "夏", autumn: "秋", winter: "冬" };
  const failures = [];
  const summary = {};

  const countUnique = (items) => new Set(items).size;

  for (const season of seasons) {
    const pool = combinatorialOutfitPools[season];
    const capacity = getCombinatorialOutfitCapacity(season);
    const outfits = Array.from({ length: 5000 }, (_, generationNonce) =>
      buildCombinatorialOutfit({ season, generationNonce, sceneKey: "weekendCityWalk" })
    );
    const ids = outfits.map((outfit) => outfit.id);
    const lines = outfits.map((outfit) => outfit.outfitLine);
    const firstEight = outfits.slice(0, 8);
    const firstEightDiversity = {
      tops: countUnique(firstEight.map((outfit) => outfit.topCategory)),
      bottoms: countUnique(firstEight.map((outfit) => outfit.bottomCategory)),
      layers: countUnique(firstEight.map((outfit) => outfit.outerLayerCategory ?? "no outer layer"))
    };
    const invalid = outfits.filter(
      (outfit) =>
        !outfit.topCategory ||
        !outfit.bottomCategory ||
        !outfit.outfitLine ||
        !outfit.season.includes(season) ||
        /floor-length|covering sneakers|multiple saturated/i.test(outfit.outfitLine)
    );

    summary[season] = {
      tops: pool.tops.length,
      bottoms: pool.bottoms.length,
      layers: pool.layers.length,
      capacity,
      sampled: outfits.length,
      uniqueIds: countUnique(ids),
      uniqueLines: countUnique(lines),
      firstEightDiversity
    };

    if (
      capacity < 5000 ||
      countUnique(ids) !== 5000 ||
      countUnique(lines) !== 5000 ||
      firstEightDiversity.tops < 6 ||
      firstEightDiversity.bottoms < 5 ||
      firstEightDiversity.layers < 6 ||
      invalid.length
    ) {
      failures.push({ season, ...summary[season], invalid: invalid.length });
    }

    const integratedSelections = Array.from({ length: 8 }, (_, generationNonce) =>
      choosePerSceneOutfitLine({
        scenePreference: "自动匹配",
        season,
        shoe: "Cloud Dancer",
        imageType: "产品上脚图",
        garmentTypePreference: "自动匹配",
        generationNonce
      })
    );
    const integratedIds = integratedSelections.map((selection) => selection.selectedOutfitId ?? "");
    if (
      integratedIds.some((id) => !id.startsWith(`combo-${season}-`)) ||
      countUnique(integratedIds) !== integratedIds.length
    ) {
      failures.push({
        season,
        integratedIds,
        message: "The main outfit selector did not use eight distinct combinatorial outfits."
      });
    }

    let previousOutfit = null;
    const crossSetSelections = Array.from({ length: 12 }, (_, generationNonce) => {
      const selected = buildCombinatorialOutfit({
        season,
        generationNonce,
        sceneKey: "weekendCityWalk",
        previousOutfitId: previousOutfit?.id
      });
      const visualDistance = previousOutfit
        ? getCombinatorialOutfitVisualDistance(previousOutfit, selected)
        : 4;
      previousOutfit = selected;
      return { selected, visualDistance };
    });
    if (crossSetSelections.slice(1).some(({ visualDistance }) => visualDistance < 3)) {
      failures.push({
        season,
        crossSetSelections: crossSetSelections.map(({ selected, visualDistance }) => ({
          id: selected.id,
          visualDistance,
          top: selected.topCategory,
          bottom: selected.bottomCategory,
          layer: selected.outerLayerCategory ?? "no outer layer",
          colorDirection: selected.colorDirection
        })),
        message: "Adjacent manual-workflow sets did not move far enough from the previous visual outfit cluster."
      });
    }

    let previousManualWorkflowId = null;
    let recentManualWorkflowIds = [];
    const manualWorkflowSamples = Array.from({ length: 4 }, (_, index) => {
      const content = generateSoftSeedingContent({
        baseParams: {
          imageType: "生活场景图",
          modelChoice: "30–45岁客户画像模特",
          modelContinuity: "新人物",
          shoe: "Cloud Dancer 云舞者",
          customShoe: "",
          season: seasonLabels[season],
          scenePreference: "自动匹配",
          garmentTypePreference: "自动匹配",
          studioLaunchAnglePreference: "自动匹配",
          stillLifeStyle: "与主视觉统一",
          extraRequirement: "",
          generationNonce: 730
        },
        topic: "生活场景软种草",
        imageCount: 3,
        variantOffset: index + 1,
        previousOutfitId: previousManualWorkflowId,
        recentOutfitIds: recentManualWorkflowIds,
        date: new Date("2026-07-20T12:00:00+08:00")
      });
      const firstPersonImage = content.images.find((image) =>
        ["产品上脚图", "对镜穿搭图", "生活场景图"].includes(image.params.imageType)
      );
      const sample = {
        outfitId: content.outfitRotationId,
        copiedPromptOutfit: firstPersonImage
          ? generatePromptRuntime(firstPersonImage.params).selectedOutfitLine ?? ""
          : ""
      };
      previousManualWorkflowId = content.outfitRotationId;
      if (content.outfitRotationId) {
        recentManualWorkflowIds = [
          content.outfitRotationId,
          ...recentManualWorkflowIds.filter((id) => id !== content.outfitRotationId)
        ].slice(0, 6);
      }
      return sample;
    });
    summary[season].manualWorkflowSamples = manualWorkflowSamples;
    if (
      manualWorkflowSamples.some((sample) => !sample.outfitId || !sample.copiedPromptOutfit) ||
      new Set(manualWorkflowSamples.map((sample) => sample.outfitId)).size !== manualWorkflowSamples.length ||
      new Set(manualWorkflowSamples.map((sample) => sample.copiedPromptOutfit)).size !== manualWorkflowSamples.length
    ) {
      failures.push({
        season,
        manualWorkflowSamples,
        message: "The copied manual-workflow Prompt did not rotate away from the previous set."
      });
    }

    for (const imageCount of [3, 5, 8]) {
      const content = generateSoftSeedingContent({
        baseParams: {
          imageType: "生活场景图",
          modelChoice: "30–45岁客户画像模特",
          modelContinuity: "新人物",
          shoe: "Cloud Dancer 云舞者",
          customShoe: "",
          season: seasonLabels[season],
          scenePreference: "自动匹配",
          garmentTypePreference: "自动匹配",
          studioLaunchAnglePreference: "自动匹配",
          stillLifeStyle: "与主视觉统一",
          extraRequirement: "",
          generationNonce: 730
        },
        topic: "生活场景软种草",
        imageCount,
        variantOffset: 4,
        date: new Date("2026-07-20T12:00:00+08:00")
      });
      const personImages = content.images.filter((image) =>
        ["产品上脚图", "对镜穿搭图", "生活场景图"].includes(image.params.imageType)
      );
      const personOutfits = personImages.map((image) => generatePromptRuntime(image.params).selectedOutfitLine ?? "");
      if (personOutfits.some((outfit) => !outfit)) {
        failures.push({ season, imageCount, message: "A person image is missing its structured outfit selection." });
      }
      if (personImages.some((image, index) => !image.prompt.includes(personOutfits[index]))) {
        failures.push({ season, imageCount, message: "A selected outfit is missing from the final copied prompt." });
      }
      if (personOutfits.length >= 2 && new Set(personOutfits).size !== 1) {
        failures.push({ season, imageCount, message: "Multi-image set did not keep one locked outfit." });
      }
    }
  }

  const baseParams = {
    imageType: "生活场景图",
    modelChoice: "30–45岁客户画像模特",
    modelContinuity: "新人物",
    shoe: "Cloud Dancer 云舞者",
    customShoe: "",
    season: "秋",
    scenePreference: "自动匹配",
    garmentTypePreference: "自动匹配",
    studioLaunchAnglePreference: "自动匹配",
    stillLifeStyle: "与主视觉统一",
    extraRequirement: "",
    generationNonce: 730
  };
  const personImageTypes = new Set(["产品上脚图", "对镜穿搭图", "生活场景图"]);
  const topics = [
    "生活场景软种草",
    "产品开发幕后",
    "秋冬配色实验室",
    "穿搭解决方案",
    "材质工艺认知",
    "品牌审美观点",
    "上新活动转化",
    "棚内上新拍摄"
  ];

  for (const topic of topics) {
    const content = generateSoftSeedingContent({
      baseParams,
      topic,
      imageCount: 5,
      variantOffset: 1,
      date: new Date("2026-07-20T12:00:00+08:00")
    });
    if (topic === "穿搭解决方案") {
      const faceVariationIds = content.images
        .map((image) => image.params.seriesFaceVariation?.id)
        .filter(Boolean);
      if (new Set(faceVariationIds).size !== faceVariationIds.length || faceVariationIds.length < 3) {
        failures.push({ topic, message: "Styling-solution face variation plan is missing or duplicated." });
      }
    }
    for (const image of content.images.filter((item) => personImageTypes.has(item.params.imageType))) {
      const selectedOutfit = generatePromptRuntime(image.params).selectedOutfitLine ?? "";
      if (!selectedOutfit || !image.prompt.includes(selectedOutfit)) {
        failures.push({ topic, image: image.name, message: "Final person prompt lost its structured outfit." });
      }
    }
  }

  for (const topic of [
    "生活场景软种草",
    "秋冬配色实验室",
    "穿搭解决方案",
    "品牌审美观点",
    "上新活动转化",
    "棚内上新拍摄"
  ]) {
    const setOutfits = Array.from({ length: 8 }, (_, index) => {
      const content = generateSoftSeedingContent({
        baseParams,
        topic,
        imageCount: 5,
        variantOffset: index + 1,
        date: new Date("2026-07-20T12:00:00+08:00")
      });
      const firstPersonImage = content.images.find((image) => personImageTypes.has(image.params.imageType));
      return firstPersonImage ? generatePromptRuntime(firstPersonImage.params).selectedOutfitLine ?? "" : "";
    });
    if (setOutfits.some((outfit) => !outfit)) {
      failures.push({ topic, message: "A regenerated set is missing its outfit selection." });
    }
    if (setOutfits.some((outfit, index) => index > 0 && outfit === setOutfits[index - 1])) {
      failures.push({ topic, message: "Adjacent regenerated sets repeated the same outfit." });
    }
  }

  const singlePromptOutfits = Array.from({ length: 8 }, (_, generationNonce) =>
    generatePromptRuntime({ ...baseParams, generationNonce })
  );
  if (singlePromptOutfits.some((runtime) => !runtime.selectedOutfitLine || !runtime.prompt.includes(runtime.selectedOutfitLine))) {
    failures.push({ message: "The single-image person runtime lost its structured outfit." });
  }
  if (singlePromptOutfits.some((runtime, index) =>
    index > 0 && runtime.selectedOutfitLine === singlePromptOutfits[index - 1].selectedOutfitLine
  )) {
    failures.push({ message: "Adjacent single-image regenerations repeated the same outfit." });
  }
  const stillLifeRuntime = generatePromptRuntime({
    ...baseParams,
    imageType: "产品静物图",
    scenePreference: "棚内上新拍摄"
  });
  if (stillLifeRuntime.selectedOutfitLine || stillLifeRuntime.compiled?.includedRuleIds.includes("styling-selected-outfit")) {
    failures.push({ message: "A non-person prompt received a person outfit rule." });
  }

  const manualGarmentSelection = choosePerSceneOutfitLine({
    scenePreference: "自动匹配",
    season: "spring",
    shoe: "Cloud Dancer",
    imageType: "产品上脚图",
    garmentTypePreference: "裙装",
    generationNonce: 12
  });
  const gymSelection = choosePerSceneOutfitLine({
    scenePreference: "自动匹配",
    season: "spring",
    shoe: "Cloud Dancer",
    imageType: "gym",
    garmentTypePreference: "自动匹配",
    generationNonce: 12
  });
  if (manualGarmentSelection.selectedOutfitId?.startsWith("combo-")) {
    failures.push({ message: "A manual garment preference must bypass the automatic combination pool." });
  }
  if (!gymSelection.selectedOutfitId || gymSelection.selectedOutfitId.startsWith("combo-")) {
    failures.push({ message: "Gym interior selection must keep its dedicated activewear logic." });
  }

  if (failures.length) {
    console.error("Outfit combination diversity validation failed:", JSON.stringify(failures, null, 2));
    process.exitCode = 1;
  } else {
    console.log("Outfit combination diversity passed:", JSON.stringify(summary, null, 2));
  }
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
