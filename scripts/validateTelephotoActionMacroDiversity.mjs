import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-telephoto-macro-action-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const failures = [];
let checks = 0;

const expect = (condition, message, evidence) => {
  checks += 1;
  if (!condition) failures.push({ message, evidence });
};

const noWalkingScenes = new Set([
  "朋友午餐",
  "咖啡馆内",
  "窗边阅读",
  "衣帽间 / 更衣角",
  "健身房内",
  "停车场到电梯口",
  "楼下便利店 / 咖啡外带"
]);

const sceneActionLeakPatterns = [
  /\bshort natural walking step\b/i,
  /\bshort natural step or quiet pause\b/i,
  /\bsmall natural step\b/i,
  /\bnatural walking posture or a short waiting pause\b/i,
  /\bshort safe step\b/i,
  /\bcompact walking step\b/i,
  /\bshort natural stride\b/i,
  /\bcompact step or soft standing pause\b/i,
  /\bnatural standing pause or short walk\b/i,
  /\bwalking or standing moment\b/i,
  /\bgallery walking or standing moment\b/i,
  /\bsmall natural garment adjustment\b/i,
  /\bsmall clothing adjustment\b/i,
  /\bsubtle turn toward a friend\b/i,
  /\bnatural seated posture\b/i,
  /\bsit-to-stand or settling pause\b/i,
  /\bparking-to-office walking transition\b/i,
  /\bstable posture\b/i
];

const repeatedPhraseLimits = [
  [/at least one sneaker/gi, "at least one sneaker"],
  [/same person identity/gi, "same person identity"],
  [/head angle, gaze direction, eyelid openness, brow height, and mouth shape/gi, "face difference fields"],
  [/do not repeat the same full-body pose/gi, "whole-body anti-repeat"],
  [/Shoe scale lock:/gi, "shoe scale lock"],
  [/Keep the same shoe-to-body scale in every image/gi, "shoe-scale continuity"],
  [/Face variation lock for this card/gi, "face variation lock"]
];

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

try {
  await writeFile(
    entryPath,
    `export { generateSoftSeedingContent } from ${JSON.stringify(
      resolve(projectRoot, "src/utils/generateSoftSeedingContent.ts")
    )};\nexport { personActionLibrary, PERSON_ACTION_LIBRARY_EXPECTED_COUNT } from ${JSON.stringify(
      resolve(projectRoot, "src/data/personActionLibrary.ts")
    )};\nexport { setPromptEngineConfig } from ${JSON.stringify(
      resolve(projectRoot, "src/prompt-engine/promptFeatureFlags.ts")
    )};\n`
  );

  await build({
    entryPoints: [entryPath],
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node20",
    outfile: bundlePath,
    logLevel: "silent"
  });

  const {
    generateSoftSeedingContent,
    personActionLibrary,
    PERSON_ACTION_LIBRARY_EXPECTED_COUNT,
    setPromptEngineConfig
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  setPromptEngineConfig({ mode: "new" });

  expect(
    personActionLibrary.length === PERSON_ACTION_LIBRARY_EXPECTED_COUNT &&
      personActionLibrary.every((action) => Boolean(action.macroActionGroup)),
    "Every action definition needs an explicit macroActionGroup.",
    personActionLibrary.filter((action) => !action.macroActionGroup).map((action) => action.id)
  );

  for (const captureStyle of ["standard", "telephoto_candid"]) {
    for (const contentCategory of ["natural_life", "urban_commute"]) {
      for (const season of ["春", "夏", "秋", "冬"]) {
        for (const imageCount of [3, 5, 8]) {
          for (let variantOffset = 0; variantOffset < 32; variantOffset += 1) {
            const label = `${captureStyle}/${contentCategory}/${season}/${imageCount}/variant-${variantOffset}`;
            const content = generateSoftSeedingContent({
              baseParams: { ...baseParams, season },
              topic: "生活场景软种草",
              imageCount,
              contentCategory,
              captureStyle,
              date: new Date("2026-09-19T00:00:00+08:00"),
              variantOffset
            });
            const actions = content.images
              .map((image) => personActionLibrary.find((action) => action.id === image.params.seriesActionKey))
              .filter(Boolean);
            const macroGroups = actions.map((action) => action.macroActionGroup);
            const visualLegFamilies = actions.map((action) => action.visualLegPoseFamily);
            const macroLegSignatures = actions.map((action) => `${action.macroActionGroup}|${action.visualLegPoseFamily}`);
            const faceVariationIds = content.images.map((image) =>
              image.prompt.match(/Face variation lock for this card \(([^)]+)\)/)?.[1] ?? null
            );
            const cameraGazeCount = faceVariationIds.filter((id) =>
              id === "lifestyle-face-camera-acknowledgement" ||
              id === "lifestyle-telephoto-face-camera-glance"
            ).length;

            expect(content.images.length === imageCount, `${label}: wrong image count.`, content.images.map((image) => image.name));
            expect(actions.length === imageCount, `${label}: missing person actions.`, content.images.map((image) => image.params.seriesActionKey));
            expect(cameraGazeCount === 1, `${label}: multi-image set must contain exactly one camera-gaze card.`, faceVariationIds);

            if (imageCount === 3) {
              expect(new Set(macroGroups).size === 3, `${label}: three-card macro groups repeat.`, macroGroups);
            }
            if (imageCount === 5) {
              expect(new Set(macroGroups).size >= 4, `${label}: five-card macro coverage is too narrow.`, macroGroups);
              expect(
                macroGroups.filter((group) => group === "standStill").length <= 2,
                `${label}: too many quiet standing cards.`,
                macroGroups
              );
            }
            if (imageCount === 8) {
              expect(new Set(macroGroups).size >= 5, `${label}: eight-card macro coverage is too narrow.`, macroGroups);
              if (captureStyle === "telephoto_candid") {
                const adjacentRepeat = macroGroups.slice(1).findIndex((group, index) => group === macroGroups[index]);
                expect(adjacentRepeat === -1, `${label}: adjacent telephoto cards reuse the same macro action.`, {
                  macroGroups,
                  adjacentRepeatIndex: adjacentRepeat + 1
                });
              }
            }

            expect(
              new Set(macroLegSignatures).size >= Math.min(actions.length, 6),
              `${label}: macro-action and leg silhouette repeat too much.`,
              macroLegSignatures
            );

            if (captureStyle === "telephoto_candid") {
              const hasWalkingCompatibleScene = content.images.some(
                (image) => image.params.imageType === "生活场景图" && !noWalkingScenes.has(image.params.scenePreference)
              );
              if (hasWalkingCompatibleScene) {
                expect(
                  macroGroups.includes("walkTransition"),
                  `${label}: a walking-compatible telephoto set lost its true movement card.`,
                  { scenes: content.images.map((image) => image.params.scenePreference), macroGroups }
                );
              }
              expect(
                macroGroups.some((group) => ["clothingTask", "environmentTask"].includes(group)),
                `${label}: telephoto set lacks a clothing or environment task.`,
                macroGroups
              );
              expect(
                macroGroups.some((group) => ["turnOrArrival", "onFootPlacement", "seatedOrGrounded"].includes(group)),
                `${label}: telephoto set lacks a turn, arrival, or grounded action.`,
                macroGroups
              );
            }

            for (const image of content.images) {
              expect(
                (image.prompt.match(/Person action lock:/g) ?? []).length === 1,
                `${label}/${image.name}: expected one primary action lock.`,
                image.prompt
              );
              expect(
                (image.prompt.match(/Leg action lock:/g) ?? []).length === 1,
                `${label}/${image.name}: expected one leg lock.`,
                image.prompt
              );
              expect(
                (image.prompt.match(/Visual leg-pose lock:/g) ?? []).length === 1,
                `${label}/${image.name}: expected one visual leg-pose lock.`,
                image.prompt
              );
              expect(
                /do not repeat the same full-body pose/i.test(image.prompt),
                `${label}/${image.name}: whole-body anti-repeat boundary missing.`,
                image.prompt
              );
              expect(
                /visibly different from every other face-visible card/i.test(image.prompt),
                `${label}/${image.name}: mandatory cross-card face difference boundary missing.`,
                image.prompt
              );
              expect(
                /Keep both eyes visibly open with clearly separated upper and lower eyelids/i.test(image.prompt),
                `${label}/${image.name}: open-eye boundary missing.`,
                image.prompt
              );
              expect(
                !/narrow the eyelids|lowered eyelid tension/i.test(image.prompt),
                `${label}/${image.name}: closed-eye language found.`,
                image.prompt
              );
              expect(
                /Shoe scale lock:/i.test(image.prompt),
                `${label}/${image.name}: explicit shoe-to-body scale lock missing.`,
                image.prompt
              );
              expect(
                /(?:full-figure framing, keep each sneaker|three-quarter framing, keep each sneaker|lower-body framing, keep each sneaker)/i.test(image.prompt),
                `${label}/${image.name}: framing-specific shoe scale guidance missing.`,
                image.prompt
              );
              const promptWordCount = (image.prompt.match(/\b[a-z][a-z'-]*\b/gi) ?? []).length;
              expect(
                promptWordCount <= 1500,
                `${label}/${image.name}: prompt keyword redundancy is too high.`,
                { promptWordCount }
              );
              for (const [pattern, phraseLabel] of repeatedPhraseLimits) {
                const count = (image.prompt.match(pattern) ?? []).length;
                expect(
                  count <= 1,
                  `${label}/${image.name}: duplicate authoritative phrase "${phraseLabel}".`,
                  { phrase: phraseLabel, count }
                );
              }
              expect(
                !sceneActionLeakPatterns.some((pattern) => pattern.test(image.prompt)),
                `${label}/${image.name}: scene-level action language still competes with the macro action plan.`,
                image.prompt
              );

              if (captureStyle === "telephoto_candid") {
                expect(
                  (image.prompt.match(/Camera profile \(telephoto-candid\):/g) ?? []).length === 1,
                  `${label}/${image.name}: telephoto camera profile count is wrong.`,
                  image.prompt
                );
                expect(
                  !/Camera profile \((?:stabilized|shoe-safe)\):/.test(image.prompt),
                  `${label}/${image.name}: competing non-telephoto camera profile found.`,
                  image.prompt
                );
                expect(
                  !/a mid-action moment/i.test(image.prompt),
                  `${label}/${image.name}: global mid-action instruction overrides the assigned action phase.`,
                  image.prompt
                );
                expect(
                  /Do not let telephoto compression enlarge or shrink the sneaker\. Keep both shoes at nearly the same camera distance and equal visible scale/i.test(image.prompt),
                  `${label}/${image.name}: telephoto shoe-scale protection missing.`,
                  image.prompt
                );
              }
            }
          }
        }
      }
    }
  }

  if (failures.length) {
    console.error("Telephoto macro-action validation failed:", JSON.stringify({ checks, failures: failures.slice(0, 80) }, null, 2));
    process.exitCode = 1;
  } else {
    console.log("Telephoto macro-action validation passed:", JSON.stringify({ checks }, null, 2));
  }
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
