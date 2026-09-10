import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const directory = await mkdtemp(join(tmpdir(), "theruizaura-lifestyle-taxonomy-"));
const entry = join(directory, "entry.ts");
const bundle = join(directory, "bundle.mjs");
const failures = [];
let checks = 0;
const expect = (condition, message, evidence) => {
  checks += 1;
  if (!condition) failures.push({ message, evidence });
};

const baseParams = {
  imageType: "生活场景图", modelChoice: "30–45岁客户画像模特", modelContinuity: "新人物",
  shoe: "自定义", customShoe: "上传参考鞋款", season: "秋", scenePreference: "自动匹配",
  garmentTypePreference: "自动匹配", studioLaunchAnglePreference: "自动匹配", studioLaunchPreset: "auto",
  studioWardrobePreference: "auto", stillLifeStyle: "与主视觉统一", extraRequirement: "", generationNonce: 19,
  productTruthAssetIds: ["reference-overall"],
  referencePlan: {
    provider: "image2", referenceSetId: "set-taxonomy", assetIds: ["reference-overall"], order: ["reference-overall"],
    orderedAssets: [{ assetId: "reference-overall", roles: ["overall_structure"], priority: 1, required: true, coverage: ["silhouette"], reason: "confirmed reference", cardApplicability: "all" }],
    referencePlanReady: true, manualExecutionReady: true, providerExecutionReady: false, diagnostics: []
  },
  selectedProductTruth: {
    confidence: "Medium", source: "current_task_uploaded_images", evidence: [{ id: "reference-overall", name: "overall", role: "overall_structure" }],
    missingEvidence: [], taskProductTruthId: "truth-taxonomy", referenceSetId: "set-taxonomy", sourceType: "uploaded_reference_set",
    productCategory: "footwear", version: "v1", status: "draft", productTruthMode: "reference_bound", referenceEvidenceBound: true,
    structuredFactsExtracted: false, manualExecutionReady: true, providerExecutionReady: false, productionReady: false,
    facts: {}, factEvidence: {}, coverage: ["silhouette", "material_evidence"], missingCoverage: [], createdAt: "2026-09-10T00:00:00.000Z"
  }
};

try {
  await writeFile(entry, [
    `export { generateSoftSeedingContent, softSeedingTopicOptions } from ${JSON.stringify(resolve(root, "src/utils/generateSoftSeedingContent.ts"))};`,
    `export { lifestyleSoftSeedingScenePool } from ${JSON.stringify(resolve(root, "src/data/lifestyleSoftSeedingScenePool.ts"))};`,
    `export { setPromptEngineConfig } from ${JSON.stringify(resolve(root, "src/prompt-engine/promptFeatureFlags.ts"))};`
  ].join("\n"));
  await build({ entryPoints: [entry], bundle: true, outfile: bundle, format: "esm", platform: "node", target: "node20", logLevel: "silent" });
  const { generateSoftSeedingContent, softSeedingTopicOptions, lifestyleSoftSeedingScenePool, setPromptEngineConfig } = await import(`${pathToFileURL(bundle).href}?v=${Date.now()}`);
  setPromptEngineConfig({ mode: "new" });

  expect(softSeedingTopicOptions.length === 8, "The existing eight-topic architecture must remain intact.", softSeedingTopicOptions);
  expect(new Set(lifestyleSoftSeedingScenePool.map((scene) => scene.contentCategory)).size === 2, "Lifestyle pool must expose exactly two content categories.");
  expect(lifestyleSoftSeedingScenePool.every((scene) => scene.contentCategory && scene.supportedCaptureStyles?.length), "Every lifestyle scene requires explicit category and capture support.");
  expect(!lifestyleSoftSeedingScenePool.some((scene) => scene.family === "brand_process"), "Lifestyle pool must not retain formal brand-process or studio duplicate cards.");
  expect(lifestyleSoftSeedingScenePool.every((scene) => !/雨天|rainy|wet pavement/i.test(JSON.stringify(scene))), "Lifestyle taxonomy must stay rain-free.");

  for (const season of ["春", "夏", "秋", "冬"]) {
    for (const imageCount of [1, 3, 5, 8]) {
      for (const contentCategory of ["natural_life", "urban_commute"]) {
        for (const captureStyle of ["standard", "telephoto_candid"]) {
          const content = generateSoftSeedingContent({ baseParams: { ...baseParams, season }, topic: "生活场景软种草", imageCount, contentCategory, captureStyle, date: new Date("2026-09-10T00:00:00.000Z"), variantOffset: 7 });
          const ids = content.images.map((image) => image.name);
          expect(content.images.length === imageCount, `${season}/${imageCount}/${contentCategory}/${captureStyle}: wrong card count`, ids);
          expect(content.images.every((image) => image.params.contentCategory === contentCategory), `${season}/${imageCount}/${contentCategory}/${captureStyle}: category leaked`, content.images.map((image) => image.params.contentCategory));
          expect(new Set(ids).size === ids.length, `${season}/${imageCount}/${contentCategory}/${captureStyle}: duplicated scene card`, ids);
          expect(content.images.every((image) => !/雨天|rainy|wet pavement/i.test(`${image.name} ${image.prompt}`)), `${season}/${imageCount}/${contentCategory}/${captureStyle}: rainy output`);
          expect(content.images.every((image) => !/\b(null|undefined)\b/i.test(image.prompt)), `${season}/${imageCount}/${contentCategory}/${captureStyle}: unresolved value`);
          if (captureStyle === "telephoto_candid") {
            for (const image of content.images) {
              const cameraMatches = image.prompt.match(/Camera profile \(telephoto-candid\):/g) ?? [];
              expect(cameraMatches.length === 1, `Telephoto must emit exactly one telephoto camera profile for ${image.name}`, image.prompt);
              expect(!/Camera profile \((?:stabilized|shoe-safe)\):/.test(image.prompt), `Telephoto must not emit a competing shoe camera profile for ${image.name}`, image.prompt);
              expect(!/站姐|fansite|paparazzi|celebrity airport|celebrity street photo/i.test(image.prompt), `Telephoto prompt uses prohibited framing language for ${image.name}`, image.prompt);
              expect(!/Direct eye contact may appear|eyes briefly meeting the camera|camera-facing performance|straight-ahead relaxed pause/i.test(image.prompt), `Telephoto prompt retained direct-camera gaze language for ${image.name}`, image.prompt);
              expect(/off-camera|rather than the lens|never toward the lens/i.test(image.prompt), `Telephoto prompt lost directional gaze protection for ${image.name}`, image.prompt);
              expect(!/scene continuity/i.test(image.prompt), `Unscoped scene continuity leaked into ${image.name}`, image.prompt);
              expect(!/raised foot|extended foot|sole toward|low angle|foreground foot|close to camera/i.test(image.params.seriesActionDirective ?? ""), `Telephoto selected a high-risk shoe action for ${image.name}`, image.params.seriesActionDirective);
              expect(/uploaded reference set|uploaded footwear references/i.test(image.prompt), `Telephoto lost Product Truth binding for ${image.name}`, image.prompt);
              expect(image.params.referencePlan?.order?.join(",") === "reference-overall", `Telephoto lost Reference Plan order for ${image.name}`, image.params.referencePlan);
              expect(/complete readable sneaker|complete sneaker/i.test(image.prompt), `Telephoto lost footwear visibility protection for ${image.name}`, image.prompt);
            }
          }
        }
      }
    }
  }

  const legacy = generateSoftSeedingContent({ baseParams, topic: "生活场景软种草", imageCount: 5, date: new Date("2026-09-10T00:00:00.000Z"), variantOffset: 3 });
  const standard = generateSoftSeedingContent({ baseParams, topic: "生活场景软种草", imageCount: 5, captureStyle: "standard", date: new Date("2026-09-10T00:00:00.000Z"), variantOffset: 3 });
  expect(legacy.images.map((image) => image.prompt).join("\n") === standard.images.map((image) => image.prompt).join("\n"), "Undefined capture style must retain standard legacy output.");
  for (const topic of softSeedingTopicOptions.filter((topic) => topic !== "生活场景软种草")) {
    const content = generateSoftSeedingContent({ baseParams, topic, imageCount: 3, contentCategory: "urban_commute", captureStyle: "telephoto_candid", date: new Date("2026-09-10T00:00:00.000Z") });
    expect(content.images.every((image) => !image.params.captureStyle && !image.params.contentCategory), `${topic}: lifestyle fields must not affect another topic.`);
  }

  const samples = [
    ["natural_life", "standard"], ["natural_life", "telephoto_candid"], ["urban_commute", "standard"], ["urban_commute", "telephoto_candid"]
  ].map(([contentCategory, captureStyle]) => {
    const content = generateSoftSeedingContent({ baseParams, topic: "生活场景软种草", imageCount: 1, contentCategory, captureStyle, date: new Date("2026-09-10T00:00:00.000Z"), variantOffset: 11 });
    const image = content.images[0];
    return { contentCategory, captureStyle, scene: image.params.scenePreference, actionId: image.params.seriesActionKey, words: image.prompt.split(/\s+/).length, camera: image.prompt.match(/Camera profile \([^)]*\)/)?.[0] };
  });
  if (failures.length) {
    console.error("Lifestyle taxonomy validation failed:", JSON.stringify({ checks, failures: failures.slice(0, 30), samples }, null, 2));
    process.exitCode = 1;
  } else {
    console.log("Lifestyle taxonomy validation passed:", JSON.stringify({ checks, sceneCount: lifestyleSoftSeedingScenePool.length, samples }, null, 2));
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}
