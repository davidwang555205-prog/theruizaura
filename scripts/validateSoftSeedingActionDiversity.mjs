import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-action-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");

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
  generationNonce: 0
};

const counts = [3, 5, 8];
const variantOffsets = [0, 1, 17];

function normalizedWords(text) {
  const ignored = new Set([
    "series", "variation", "use", "with", "and", "the", "one", "a", "an", "to", "of", "in", "from",
    "keep", "show", "action", "mirror", "material", "still", "life", "atmosphere", "studio"
  ]);
  return new Set(
    text
      .toLowerCase()
      .match(/[a-z]+/g)
      ?.filter((word) => word.length > 3 && !ignored.has(word)) ?? []
  );
}

function jaccard(first, second) {
  const intersection = [...first].filter((word) => second.has(word)).length;
  const union = new Set([...first, ...second]).size;
  return union ? intersection / union : 0;
}

try {
  await writeFile(
    entryPath,
    `export { generateSoftSeedingContent, softSeedingTopicOptions } from ${JSON.stringify(
      resolve(projectRoot, "src/utils/generateSoftSeedingContent.ts")
    )};\nexport { personActionLibrary, PERSON_ACTION_LIBRARY_EXPECTED_COUNT } from ${JSON.stringify(
      resolve(projectRoot, "src/data/personActionLibrary.ts")
    )};\nexport { personActionSemanticDistance, selectDiversePersonActions } from ${JSON.stringify(
      resolve(projectRoot, "src/utils/selectDiverseSeriesActions.ts")
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
    generateSoftSeedingContent,
    softSeedingTopicOptions,
    personActionLibrary,
    PERSON_ACTION_LIBRARY_EXPECTED_COUNT,
    personActionSemanticDistance,
    selectDiversePersonActions
  } = await import(
    `${pathToFileURL(bundlePath).href}?v=${Date.now()}`
  );
  const failures = [];
  let checkedSets = 0;
  let checkedImages = 0;

  const actionIds = personActionLibrary.map((action) => action.id);
  const actionDirectives = personActionLibrary.map((action) => action.directive);
  if (
    personActionLibrary.length !== 300 ||
    PERSON_ACTION_LIBRARY_EXPECTED_COUNT !== 300 ||
    new Set(actionIds).size !== 300 ||
    new Set(actionDirectives).size !== 300 ||
    personActionLibrary.some((action) =>
      !action.id || !action.diversityFamily || !action.bodyOrientation || !action.footwork ||
      !action.movementPhase || !action.handTask || !action.framing || !action.poseType
    )
  ) {
    failures.push({
      libraryCount: personActionLibrary.length,
      uniqueIds: new Set(actionIds).size,
      uniqueDirectives: new Set(actionDirectives).size,
      message: "The person action library must contain 300 unique, fully tagged actions."
    });
  }

  for (const topic of softSeedingTopicOptions) {
    for (const imageCount of counts) {
      for (const variantOffset of variantOffsets) {
        checkedSets += 1;
        const content = generateSoftSeedingContent({
          baseParams: { ...baseParams, generationNonce: variantOffset * 13 },
          topic,
          imageCount,
          variantOffset,
          date: new Date("2026-07-20T12:00:00+08:00")
        });
        checkedImages += content.images.length;

        const keys = content.images.map((image) => image.params.seriesActionKey).filter(Boolean);
        const families = content.images.map((image) => image.params.seriesActionFamily).filter(Boolean);
        const directives = content.images.map((image) => image.params.seriesActionDirective).filter(Boolean);
        const promptCoverage = content.images.every((image) =>
          /(?:Person action lock:|Series (?:action|mirror|material-action|still-life|atmosphere) variation:|Studio action variation:)/i.test(image.prompt)
        );
        const directiveSets = content.images
          .filter((image) => !["产品上脚图", "对镜穿搭图", "生活场景图"].includes(image.params.imageType))
          .map((image) => normalizedWords(image.params.seriesActionDirective));
        let maxSimilarity = 0;
        for (let first = 0; first < directiveSets.length; first += 1) {
          for (let second = first + 1; second < directiveSets.length; second += 1) {
            maxSimilarity = Math.max(maxSimilarity, jaccard(directiveSets[first], directiveSets[second]));
          }
        }

        const peoplePoseTypes = content.images
          .filter((image) => ["产品上脚图", "对镜穿搭图", "生活场景图"].includes(image.params.imageType))
          .map((image) => image.params.seriesPoseType)
          .filter(Boolean);
        const selectedPersonActions = content.images
          .filter((image) => ["产品上脚图", "对镜穿搭图", "生活场景图"].includes(image.params.imageType))
          .map((image) => personActionLibrary.find((action) => action.id === image.params.seriesActionKey))
          .filter(Boolean);
        let minimumPersonDistance = Number.POSITIVE_INFINITY;
        for (let first = 0; first < selectedPersonActions.length; first += 1) {
          for (let second = first + 1; second < selectedPersonActions.length; second += 1) {
            minimumPersonDistance = Math.min(
              minimumPersonDistance,
              personActionSemanticDistance(selectedPersonActions[first], selectedPersonActions[second])
            );
          }
        }
        const requiresPoseCategoryChange = topic !== "棚内上新拍摄" && peoplePoseTypes.length >= 3;

        if (
          content.images.length !== imageCount ||
          keys.length !== imageCount ||
          families.length !== imageCount ||
          new Set(keys).size !== imageCount ||
          directives.length !== imageCount ||
          new Set(directives).size !== imageCount ||
          !promptCoverage ||
          maxSimilarity >= 0.72 ||
          (selectedPersonActions.length >= 2 && minimumPersonDistance < 8) ||
          (requiresPoseCategoryChange && new Set(peoplePoseTypes).size < 2)
        ) {
          failures.push({
            topic,
            imageCount,
            variantOffset,
            outputCount: content.images.length,
            uniqueActionKeys: new Set(keys).size,
            actionFamilies: families,
            uniqueDirectives: new Set(directives).size,
            promptCoverage,
            maxSimilarity: Number(maxSimilarity.toFixed(3)),
            uniquePeoplePoseTypes: new Set(peoplePoseTypes).size,
            minimumPersonDistance
          });
        }
      }
    }
  }

  let stressCheckedSets = 0;
  const stressCards = Array.from({ length: 8 }, () => ({
    imageType: "生活场景图",
    scenePreference: "自动匹配"
  }));
  for (let index = 0; index < 10000; index += 1) {
    const selected = selectDiversePersonActions({
      cards: stressCards,
      topic: "生活场景软种草",
      variantIndex: index % 97,
      generationNonce: index * 31
    }).filter(Boolean);
    stressCheckedSets += 1;
    let minimumDistance = Number.POSITIVE_INFINITY;
    for (let first = 0; first < selected.length; first += 1) {
      for (let second = first + 1; second < selected.length; second += 1) {
        minimumDistance = Math.min(minimumDistance, personActionSemanticDistance(selected[first], selected[second]));
      }
    }
    if (selected.length !== 8 || new Set(selected.map((action) => action.id)).size !== 8 || minimumDistance < 8) {
      failures.push({ stressIndex: index, selected: selected.map((action) => action.id), minimumDistance });
      break;
    }
  }

  if (failures.length) {
    console.error("Soft-seeding action diversity validation failed:", JSON.stringify(failures, null, 2));
    process.exitCode = 1;
  } else {
    console.log(
      `Soft-seeding action diversity passed: 300 unique tagged actions, ${checkedSets} generated sets / ${checkedImages} prompts, and ${stressCheckedSets} eight-image stress sets.`
    );
  }
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
