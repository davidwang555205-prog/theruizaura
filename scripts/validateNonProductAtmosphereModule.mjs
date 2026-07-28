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
const internalLeak = /curationSeed|candidateScores|analysisVersion|provenance|history|0\.5|softMaterialWeight|CARRIER DIVERSITY LOCK|PRODUCT AND BRAND RESPONSIBILITY|Provider boundary|website-uploaded|soft spring daylight|warm afternoon sunlight/i;

if (NON_PRODUCT_ATMOSPHERE_CONTENT_TYPE !== "non_product_atmosphere") fail("content type is not isolated");
if (NON_PRODUCT_ATMOSPHERE_PROVIDER !== "image2") fail("provider is not Image2 only");
if (JSON.stringify(NON_PRODUCT_ATMOSPHERE_COUNTS) !== JSON.stringify([1, 3, 5, 8])) fail("quantity registry changed");
if (JSON.stringify(NON_PRODUCT_ATMOSPHERE_ASPECT_RATIOS) !== JSON.stringify(["4:5", "9:16", "1:1"])) fail("aspect ratio registry changed");

for (const quantity of NON_PRODUCT_ATMOSPHERE_COUNTS) {
  const plan = buildNonProductAtmospherePlan({ quantity, generationNonce: 2, referenceImageCount: 4, referenceAssetIds: ["task-ref-a", "task-ref-b"], taskId: "task-a", season: "秋", aspectRatio: "4:5" });
  if (plan.images.length !== quantity || plan.provider !== "image2") fail(`${quantity}: identity/count`);
  if (new Set(plan.images.map((image) => image.prompt)).size !== quantity) fail(`${quantity}: duplicate prompts`);
  for (const image of plan.images) {
    const prompt = image.prompt;
    if (!prompt.includes("Generate exactly one standalone 4:5 portrait photograph")) fail(`${quantity}/${image.index}: output contract`);
    if (!prompt.includes("THERUIZ AURA") || !prompt.includes("currently attached product reference")) fail(`${quantity}/${image.index}: brand/reference direction`);
    if (!prompt.includes("No product or footwear.") || !prompt.includes("No person, body part") || !prompt.includes("No collage, triptych")) fail(`${quantity}/${image.index}: canonical negatives`);
    if (/[㐀-䶿一-鿿豈-﫿]/.test(prompt)) fail(`${quantity}/${image.index}: Chinese leakage`);
    if (internalLeak.test(prompt)) fail(`${quantity}/${image.index}: internal or placeholder leakage`);
    const words = prompt.trim().split(/\s+/).filter(Boolean).length;
    if (words < 150 || words > 320) fail(`${quantity}/${image.index}: word budget ${words}`);
    if ((prompt.match(/No product or footwear\./g) ?? []).length !== 1) fail(`${quantity}/${image.index}: duplicate negatives`);
    if (image.promptPackage.generationCount !== 1 || image.promptPackage.reusePreviousConversation || image.promptPackage.reusePreviousGeneratedImage) fail(`${quantity}/${image.index}: isolated generation contract`);
  }
}

let blocked = false;
try { buildNonProductAtmospherePlan({ quantity: 1 }); } catch (error) { blocked = error?.code === "PRODUCT_ECHO_SOURCE_MISSING"; }
if (!blocked) fail("missing reference did not fail closed");
const preview = buildNonProductAtmospherePlan({ quantity: 1, previewWithoutReference: true, taskId: "preview" });
if (preview.referenceAssetIds.length !== 0 || preview.images[0].prompt.includes("website-uploaded")) fail("reference-free preview contract");
const a = buildNonProductAtmospherePlan({ quantity: 3, generationNonce: 7, taskId: "seed-task", referenceAssetIds: ["seed-ref"] });
const b = buildNonProductAtmospherePlan({ quantity: 3, generationNonce: 7, taskId: "seed-task", referenceAssetIds: ["seed-ref"] });
if (a.curationSeed !== b.curationSeed || a.images.map((image) => image.sceneFingerprint.id).join(",") !== b.images.map((image) => image.sceneFingerprint.id).join(",")) fail("same seed is not reproducible");
const cooled = buildNonProductAtmospherePlan({ quantity: 1, taskId: "cooldown-task", referenceAssetIds: ["cooldown-ref"], recentVariationHistory: [a.images[0].variationSignature] });
if (cooled.images[0].sceneFingerprint.id === a.images[0].sceneFingerprint.id) fail("cross-task cooldown did not apply");
if (a.productEchoProfile.primaryEchoColor.includes("burgundy") || a.productEchoProfile.primaryEchoColor.includes("ivory")) fail("validation fixture color leaked");
if (a.images.some((image) => image.prompt.includes("0.5") || image.prompt.includes("mixed") || image.prompt.includes("balanced"))) fail("placeholder profile leaked");

if (failures.length) { console.error(`Non-product atmosphere module failed: ${failures.length}`); for (const failure of failures) console.error(`FAIL: ${failure}`); process.exitCode = 1; } else console.log("Non-product atmosphere compact Image2 Prompt compiler passed.");
await rm(dir, { recursive: true, force: true });
