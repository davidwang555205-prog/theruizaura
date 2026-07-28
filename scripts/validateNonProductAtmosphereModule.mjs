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
const { buildNonProductAtmospherePlan, NON_PRODUCT_ATMOSPHERE_COUNTS, NON_PRODUCT_ATMOSPHERE_ASPECT_RATIOS, NON_PRODUCT_ATMOSPHERE_CONTENT_TYPE, NON_PRODUCT_ATMOSPHERE_PROVIDER } = module;
const failures = [];
const fail = (message) => failures.push(message);
const forbiddenPositive = /(?<!do not )\bshow (?:the uploaded product|any sneaker|any shoe|any footwear)|(?<!do not )\bgenerate (?:a )?(?:person|model)|(?<!do not )\buse on-foot styling/i;

if (NON_PRODUCT_ATMOSPHERE_CONTENT_TYPE !== "non_product_atmosphere") fail("content type is not isolated");
if (NON_PRODUCT_ATMOSPHERE_PROVIDER !== "image2") fail("provider is not Image2 only");
if (JSON.stringify(NON_PRODUCT_ATMOSPHERE_COUNTS) !== JSON.stringify([1, 3, 5, 8])) fail("quantity registry is not 1/3/5/8");
if (JSON.stringify(NON_PRODUCT_ATMOSPHERE_ASPECT_RATIOS) !== JSON.stringify(["4:5", "9:16", "1:1"])) fail("aspect ratio registry is not 4:5/9:16/1:1");

for (const quantity of NON_PRODUCT_ATMOSPHERE_COUNTS) {
  const plan = buildNonProductAtmospherePlan({ quantity, generationNonce: 2, referenceImageCount: 4, season: "秋", aspectRatio: "4:5" });
  if (plan.images.length !== quantity) fail(`${quantity}: wrong plan count`);
  if (plan.contentType !== "non_product_atmosphere" || plan.provider !== "image2") fail(`${quantity}: wrong plan identity`);
  if (plan.referenceImageCount !== 4) fail(`${quantity}: reference count not preserved`);
  if (plan.productEchoProfile.prohibitedDirections.length === 0) fail(`${quantity}: missing Product Echo prohibitions`);
  if (plan.aspectRatio !== "4:5") fail(`${quantity}: default portrait aspect ratio not preserved`);
  if (new Set(plan.images.map((image) => image.slot.sceneId)).size !== quantity) fail(`${quantity}: duplicate scene slots`);
  if (new Set(plan.images.map((image) => image.prompt)).size !== quantity) fail(`${quantity}: duplicate prompts`);
  for (const image of plan.images) {
    const prompt = image.prompt;
    for (const required of ["THERUIZ AURA", "Quiet Warm Luxury", "visual_echo_extraction_only", "Use the actual reference image attached in the external image-generation tool", "Do not use a website-uploaded reference image", "Output format: 4:5 portrait-ready composition", "vertical portrait composition", "Do not show the uploaded product", "Do not show any sneaker", "Do not show any person", "Product Echo", "Do not create a centered hero object", "Image2 only"]) {
      if (!prompt.includes(required)) fail(`${quantity}/${image.index}: missing ${required}`);
    }
    if (prompt.includes("Use uploaded Product Truth reference images")) fail(`${quantity}/${image.index}: copied Prompt still depends on website upload wording`);
    if (/[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/.test(prompt)) fail(`${quantity}/${image.index}: Chinese leakage`);
    if (forbiddenPositive.test(prompt)) fail(`${quantity}/${image.index}: positive forbidden rendering instruction`);
    if (image.productVisibility !== "forbidden" || image.footwearVisibility !== "forbidden" || image.personVisibility !== "forbidden") fail(`${quantity}/${image.index}: visibility contract not forbidden`);
    if (image.modelGeneration !== "disabled" || image.outfitGeneration !== "disabled" || image.onFootGeneration !== "disabled") fail(`${quantity}/${image.index}: disabled generation contract not preserved`);
  }
}

const first = buildNonProductAtmospherePlan({ quantity: 8, generationNonce: 0 });
const second = buildNonProductAtmospherePlan({ quantity: 8, generationNonce: 1 });
if (first.images[0].slot.sceneId === second.images[0].slot.sceneId) fail("regenerated batch did not rotate scene slot");
if (first.productEchoProfile.primaryEchoColor.includes("burgundy") || first.productEchoProfile.primaryEchoColor.includes("ivory")) fail("Product Echo profile contains a hardcoded validation color");
const seasonalMarkers = { 春: "soft spring daylight", 夏: "breathable summer light", 秋: "mellow autumn daylight", 冬: "soft winter light" };
for (const season of ["春", "夏", "秋", "冬"]) {
  const seasonalPlan = buildNonProductAtmospherePlan({ quantity: 1, season });
  if (!seasonalPlan.images[0].prompt.includes(seasonalMarkers[season])) fail(`${season}: missing seasonal prompt line`);
}
const summer = buildNonProductAtmospherePlan({ quantity: 1, season: "夏" });
const winter = buildNonProductAtmospherePlan({ quantity: 1, season: "冬" });
if (summer.images[0].prompt === winter.images[0].prompt) fail("season controls do not change the final Prompt");
for (const aspectRatio of NON_PRODUCT_ATMOSPHERE_ASPECT_RATIOS) {
  const ratioPlan = buildNonProductAtmospherePlan({ quantity: 1, aspectRatio });
  if (!ratioPlan.images[0].prompt.includes(`Output format: ${aspectRatio} portrait-ready composition`)) fail(`${aspectRatio}: aspect ratio missing from Prompt`);
}

if (failures.length) {
  console.error(`Non-product atmosphere module failed: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Non-product atmosphere module passed: identity, Product Echo, visibility, quantity, uniqueness, isolation and Active Visual System inheritance.");
}
await rm(dir, { recursive: true, force: true });
