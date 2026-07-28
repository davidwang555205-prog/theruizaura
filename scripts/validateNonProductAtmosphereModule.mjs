import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const dir = await mkdtemp(join(tmpdir(), "theruizaura-atmosphere-module-"));
const entry = join(dir, "entry.ts");
const bundle = join(dir, "bundle.mjs");
await writeFile(entry, `export * from ${JSON.stringify(resolve(root, "src/non-product-atmosphere/index.ts"))};\n`);
await build({ entryPoints: [entry], bundle: true, outfile: bundle, format: "esm", platform: "node", target: "node20", logLevel: "silent" });
const module = await import(`${pathToFileURL(bundle).href}?v=${Date.now()}`);
const { buildNonProductAtmospherePlan, buildAtmosphereRepairPrompt, NON_PRODUCT_ATMOSPHERE_COUNTS, NON_PRODUCT_ATMOSPHERE_ASPECT_RATIOS, NON_PRODUCT_ATMOSPHERE_CONTENT_TYPE, NON_PRODUCT_ATMOSPHERE_PROVIDER } = module;
const failures = [];
const fail = (message) => failures.push(message);
const forbiddenPositive = /(?<!do not )\bshow (?:the uploaded product|any sneaker|any shoe|any footwear)|(?<!do not )\bgenerate (?:a )?(?:person|model)|(?<!do not )\buse on-foot styling/i;

if (NON_PRODUCT_ATMOSPHERE_CONTENT_TYPE !== "non_product_atmosphere") fail("content type is not isolated");
if (NON_PRODUCT_ATMOSPHERE_PROVIDER !== "image2") fail("provider is not Image2 only");
if (JSON.stringify(NON_PRODUCT_ATMOSPHERE_COUNTS) !== JSON.stringify([1, 3, 5, 8])) fail("quantity registry is not 1/3/5/8");
if (JSON.stringify(NON_PRODUCT_ATMOSPHERE_ASPECT_RATIOS) !== JSON.stringify(["4:5", "9:16", "1:1"])) fail("aspect ratio registry is not 4:5/9:16/1:1");

for (const quantity of NON_PRODUCT_ATMOSPHERE_COUNTS) {
  const plan = buildNonProductAtmospherePlan({ quantity, generationNonce: 2, referenceImageCount: 4, referenceAssetIds: ["task-ref-a", "task-ref-b"], taskId: "task-a", season: "秋", aspectRatio: "4:5" });
  if (plan.images.length !== quantity) fail(`${quantity}: wrong plan count`);
  if (plan.contentType !== "non_product_atmosphere" || plan.provider !== "image2") fail(`${quantity}: wrong plan identity`);
  if (plan.referenceImageCount !== 4) fail(`${quantity}: reference count not preserved`);
  if (plan.productEchoProfile.prohibitedDirections.length === 0) fail(`${quantity}: missing Product Echo prohibitions`);
  if (plan.aspectRatio !== "4:5") fail(`${quantity}: default portrait aspect ratio not preserved`);
  if (plan.sceneSelectionMode !== "AUTO_CONTROLLED_RANDOM" || !plan.curationSeed) fail(`${quantity}: controlled curation metadata missing`);
  if (plan.productEchoProfile.sourceMode !== "CURRENT_TASK_REFERENCE_ONLY" || JSON.stringify(plan.referenceAssetIds) !== JSON.stringify(["task-ref-a", "task-ref-b"])) fail(`${quantity}: current task reference provenance not preserved`);
  if (plan.images.some((image) => image.promptPackage.generationCount !== 1 || !image.promptPackage.standaloneImage || image.promptPackage.continuityMode !== "STYLE_ONLY_CONTINUITY")) fail(`${quantity}: single-card isolation package missing`);
  if (plan.images.some((image) => !image.productResponsiveProfile || !image.visualGrammar || !image.prompt.includes("PRODUCT-RESPONSIVE VISUAL GRAMMAR") || !image.prompt.includes("PRODUCT AND BRAND RESPONSIBILITY") || !image.prompt.includes("AVOID GENERIC BRAND TEMPLATE"))) fail(`${quantity}: product-responsive grammar contract missing`);
  if (new Set(plan.images.map((image) => image.slot.sceneId)).size !== quantity) fail(`${quantity}: duplicate scene slots`);
  if (new Set(plan.images.map((image) => image.prompt)).size !== quantity) fail(`${quantity}: duplicate prompts`);
  for (const image of plan.images) {
    const prompt = image.prompt;
    for (const required of ["THERUIZ AURA", "Quiet Warm Luxury", "visual_echo_extraction_only", "Use only the actual product reference images attached", "Do not use a website-uploaded reference image", "vertical portrait composition", "Do not show the uploaded product", "Do not show any sneaker", "Do not show any person", "Product Echo", "Do not create a centered hero object", "Image2 only"]) {
      if (!prompt.includes(required)) fail(`${quantity}/${image.index}: missing ${required}`);
    }
    if (prompt.includes("Use uploaded Product Truth reference images")) fail(`${quantity}/${image.index}: copied Prompt still depends on website upload wording`);
    if (/[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/.test(prompt)) fail(`${quantity}/${image.index}: Chinese leakage`);
    if (forbiddenPositive.test(prompt)) fail(`${quantity}/${image.index}: positive forbidden rendering instruction`);
    if (image.productVisibility !== "forbidden" || image.footwearVisibility !== "forbidden" || image.personVisibility !== "forbidden") fail(`${quantity}/${image.index}: visibility contract not forbidden`);
    if (image.modelGeneration !== "disabled" || image.outfitGeneration !== "disabled" || image.onFootGeneration !== "disabled") fail(`${quantity}/${image.index}: disabled generation contract not preserved`);
  }
}

let missingSourceBlocked = false;
try { buildNonProductAtmospherePlan({ quantity: 1 }); } catch (error) { missingSourceBlocked = error?.code === "PRODUCT_ECHO_SOURCE_MISSING"; }
if (!missingSourceBlocked) fail("missing current reference source did not fail closed");
const previewPlan = buildNonProductAtmospherePlan({ quantity: 1, previewWithoutReference: true, taskId: "preview" });
if (previewPlan.referenceAssetIds.length !== 0 || !previewPlan.images[0].prompt.includes("actual reference image attached in the external Image2 tool")) fail("reference-free preview contract failed");
const first = buildNonProductAtmospherePlan({ quantity: 3, generationNonce: 0, referenceAssetIds: ["task-ref-a"] });
const second = buildNonProductAtmospherePlan({ quantity: 3, generationNonce: 1, referenceAssetIds: ["task-ref-b"] });
if (first.images[0].slot.sceneId === second.images[0].slot.sceneId) fail("regenerated batch did not rotate scene slot");
if (first.curationSeed === second.curationSeed) fail("regenerated batch did not create a new curation seed");
const sameSeedA = buildNonProductAtmospherePlan({ quantity: 3, generationNonce: 7, taskId: "seed-task", referenceAssetIds: ["seed-ref"] });
const sameSeedB = buildNonProductAtmospherePlan({ quantity: 3, generationNonce: 7, taskId: "seed-task", referenceAssetIds: ["seed-ref"] });
if (sameSeedA.curationSeed !== sameSeedB.curationSeed || sameSeedA.images.map((image) => image.sceneFingerprint.id).join(",") !== sameSeedB.images.map((image) => image.sceneFingerprint.id).join(",")) fail("same seed is not reproducible");
const cooled = buildNonProductAtmospherePlan({ quantity: 1, taskId: "cooldown-task", referenceAssetIds: ["cooldown-ref"], recentVariationHistory: [sameSeedA.images[0].variationSignature] });
if (cooled.images[0].sceneFingerprint.id === sameSeedA.images[0].sceneFingerprint.id) fail("cross-task scene cooldown did not apply");
if (first.productEchoProfile.primaryEchoColor.includes("burgundy") || first.productEchoProfile.primaryEchoColor.includes("ivory")) fail("Product Echo profile contains a hardcoded validation color");
const seasonalMarkers = { 春: "soft spring daylight", 夏: "breathable summer light", 秋: "mellow autumn daylight", 冬: "soft winter light" };
for (const season of ["春", "夏", "秋", "冬"]) {
  const seasonalPlan = buildNonProductAtmospherePlan({ quantity: 1, season, referenceAssetIds: ["task-ref-season"] });
  if (!seasonalPlan.images[0].prompt.includes(seasonalMarkers[season])) fail(`${season}: missing seasonal prompt line`);
}
const summer = buildNonProductAtmospherePlan({ quantity: 1, season: "夏", referenceAssetIds: ["task-ref-summer"] });
const winter = buildNonProductAtmospherePlan({ quantity: 1, season: "冬", referenceAssetIds: ["task-ref-winter"] });
if (summer.images[0].prompt === winter.images[0].prompt) fail("season controls do not change the final Prompt");
for (const aspectRatio of NON_PRODUCT_ATMOSPHERE_ASPECT_RATIOS) {
  const ratioPlan = buildNonProductAtmospherePlan({ quantity: 1, aspectRatio, referenceAssetIds: ["task-ref-ratio"] });
  if (!ratioPlan.images[0].prompt.includes(`standalone ${aspectRatio} portrait photograph`)) fail(`${aspectRatio}: aspect ratio missing from Prompt`);
}
const threeCard = buildNonProductAtmospherePlan({ quantity: 3, referenceAssetIds: ["three-card-ref"], taskId: "three-card-task" });
const threeChannels = threeCard.images.map((image) => image.productEchoRoute.primaryChannel);
if (new Set(threeChannels).size !== 3 || threeChannels.includes("RESTRAINED_HUE")) fail("three-card channel routing is not non-hue and unique");
if (threeCard.images.some((image) => image.productEchoRoute.currentTaskReferenceIds[0] !== "three-card-ref" || !image.productEchoRoute.antiLiteralMappingPassed)) fail("channel route provenance or anti-literal policy failed");
if (threeCard.images.some((image) => image.sceneObjectSelection.selectionSource !== "SCENE_AND_LIFE_TRACE_ONLY" || !image.sceneObjectSelection.colorIndependentSelection)) fail("scene object selection is not color-independent");
if (threeCard.images.some((image) => image.prompt.includes("yellow flower") || image.prompt.includes("red flower") || image.prompt.includes("blue book"))) fail("color-to-object mapping leaked into Prompt");
if (new Set(threeCard.images.map((image) => image.sceneFingerprint.id)).size !== 3) fail("three-card scene IDs are not independent");
if (threeCard.images.some((image) => image.promptPackage.referenceAssetIds[0] !== "three-card-ref" || image.promptPackage.reusePreviousGeneratedImage || image.promptPackage.reusePreviousConversation)) fail("three-card reference isolation contract failed");
if (threeCard.images.some((image) => !image.prompt.includes("No collage") || !image.prompt.includes("No triptych") || !image.prompt.includes("No split panels"))) fail("three-card standalone output contract failed");
if (threeCard.images.some((image) => !image.prompt.includes("Do not choose flowers, books, cups, textiles, paper") || !image.prompt.includes("Do not add a new object solely to carry the product's hue") || !image.prompt.includes("Do not create a literal color-matching prop"))) fail("anti-literal Prompt contract failed");
const repair = buildAtmosphereRepairPrompt({ errorType: "SCENE_MISMATCH", archetype: threeCard.images[0].slot.sceneId === "ENTRYWAY_DEPARTURE" ? { id: "ENTRYWAY_DEPARTURE", locationLock: "a real apartment entryway threshold", requiredSpatialCues: ["entrance door", "threshold floor transition"], forbiddenSpatialCues: ["bedroom", "bed"], allowedObjects: ["folded tote"], cameraDirection: "low", lifeTraceDirection: "set down", indoorOutdoor: "threshold", dominantPlane: "doorway", cameraHeight: "low", depthPattern: "corridor", dominantObject: "folded tote" } : threeCard.images[0].sceneFingerprint });
if (!repair.includes("SCENE_MISMATCH") || !repair.includes("current task's actual product reference image") || repair.length >= threeCard.images[0].prompt.length) fail("repair Prompt contract failed");

if (failures.length) {
  console.error(`Non-product atmosphere module failed: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Non-product atmosphere module passed: identity, Product Echo, visibility, quantity, uniqueness, isolation and Active Visual System inheritance.");
}
await rm(dir, { recursive: true, force: true });
