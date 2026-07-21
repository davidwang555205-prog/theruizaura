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
    `export { buildCombinatorialOutfit, combinatorialOutfitPools, getCombinatorialOutfitCapacity } from ${JSON.stringify(
      resolve(projectRoot, "src/data/combinatorialOutfitLibrary.ts")
    )};\nexport { choosePerSceneOutfitLine } from ${JSON.stringify(
      resolve(projectRoot, "src/utils/choosePerSceneOutfitLine.ts")
    )};\nexport { generateSoftSeedingContent } from ${JSON.stringify(
      resolve(projectRoot, "src/utils/generateSoftSeedingContent.ts")
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
    generateSoftSeedingContent
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
      const personOutfits = content.images
        .filter((image) => ["产品上脚图", "对镜穿搭图", "生活场景图"].includes(image.params.imageType))
        .map((image) => image.prompt.match(/Style her in [^.]+\./)?.[0])
        .filter(Boolean);
      if (personOutfits.length >= 2 && new Set(personOutfits).size !== 1) {
        failures.push({ season, imageCount, message: "Multi-image set did not keep one locked outfit." });
      }
    }
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
