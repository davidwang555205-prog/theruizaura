import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const dir = await mkdtemp(join(tmpdir(), "theruizaura-atmosphere-module-"));
const entry = join(dir, "entry.ts");
const bundle = join(dir, "bundle.mjs");
await writeFile(entry, `export * from ${JSON.stringify(resolve(root, "src/non-product-atmosphere/index.ts"))};\nexport { compilePrompt } from ${JSON.stringify(resolve(root, "src/prompt-engine/compilePrompt.ts"))};\n`);
await build({ entryPoints: [entry], bundle: true, outfile: bundle, format: "esm", platform: "node", target: "node20", logLevel: "silent" });
const module = await import(`${pathToFileURL(bundle).href}?v=${Date.now()}`);
const { buildNonProductAtmospherePlan, compilePrompt, resolveRequestedAtmosphereScene, selectSeasonCompatibleSceneCandidates, runSeasonConsistencyPromptQA, NON_PRODUCT_ATMOSPHERE_COUNTS, NON_PRODUCT_ATMOSPHERE_ASPECT_RATIOS, NON_PRODUCT_ATMOSPHERE_CONTENT_TYPE, NON_PRODUCT_ATMOSPHERE_PROVIDER, SEASON_SEMANTIC_PROFILES } = module;
const failures = [];
const fail = (message) => failures.push(message);
const internalLeak = /curationSeed|candidateScores|analysisVersion|provenance|history|0\.5|softMaterialWeight|CARRIER DIVERSITY LOCK|PRODUCT AND BRAND RESPONSIBILITY|Provider boundary|website-uploaded/i;

const promptInput = (season, scenePreference, overrides = {}) => ({
  brandId: "theruiz_aura", provider: "image2", imageType: "非产品氛围图", compositionMode: "atmosphere",
  scenePreference, season, modelChoice: "自动匹配", modelContinuity: "新人物", hasShoe: false,
  garmentTypePreference: "自动匹配", userExtraRequirement: "", isMultiImage: false, generationNonce: 0,
  ...overrides
});

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
    if (!prompt.includes("Product presence is optional") || !prompt.includes("No person, body part") || !prompt.includes("No collage, triptych")) fail(`${quantity}/${image.index}: canonical non-product-led policy`);
    if (image.productPresenceMode === "no_product" && !prompt.includes("No product or footwear.")) fail(`${quantity}/${image.index}: no-product mode leaked product presence`);
    if (image.productPresenceMode !== "no_product" && prompt.includes("No product or footwear.")) fail(`${quantity}/${image.index}: optional product mode was hard-forbidden`);
    if (/[㐀-䶿一-鿿豈-﫿]/.test(prompt)) fail(`${quantity}/${image.index}: Chinese leakage`);
    if (internalLeak.test(prompt)) fail(`${quantity}/${image.index}: internal or placeholder leakage`);
    const words = prompt.trim().split(/\s+/).filter(Boolean).length;
    if (words < 150 || words > 420) fail(`${quantity}/${image.index}: word budget ${words}`);
    if ((prompt.match(/No product or footwear\./g) ?? []).length > 1) fail(`${quantity}/${image.index}: duplicate negatives`);
    if (!image.seasonConsistencyQA.passed || !image.productDominanceQA.passed || !image.seasonConsistencyQA.manualReviewRequired || !image.productDominanceQA.manualReviewRequired) fail(`${quantity}/${image.index}: honest Prompt/manual QA contract`);
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

const matrix = [
  ["S1", "春", "dark", "no_product", "brand_neutral"], ["S2", "春", "dark", "subtle_supporting_presence", "material_translation"], ["S3", "春", "light", "lifestyle_trace_presence", "direct_accent"],
  ["U1", "夏", "brown", "no_product", "material_translation"], ["U2", "夏", "burgundy", "subtle_supporting_presence", "material_translation"], ["U3", "夏", "black", "lifestyle_trace_presence", "brand_neutral"],
  ["A1", "秋", "light", "no_product", "brand_neutral"], ["A2", "秋", "dark", "subtle_supporting_presence", "direct_accent"], ["A3", "秋", "burgundy", "lifestyle_trace_presence", "material_translation"],
  ["W1", "冬", "light", "no_product", "brand_neutral"], ["W2", "冬", "dark", "subtle_supporting_presence", "direct_accent"], ["W3", "冬", "black", "lifestyle_trace_presence", "material_translation"]
];
for (const [id, season, productPaletteClass, productPresenceMode, productPaletteEchoMode] of matrix) {
  const image = buildNonProductAtmospherePlan({ quantity: 1, generationNonce: 0, taskId: id, referenceAssetIds: [`${id}-ref`], season, productPaletteClass, productPresenceMode, productPaletteEchoMode }).images[0];
  const seasonId = { 春: "spring", 夏: "summer", 秋: "autumn", 冬: "winter" }[season];
  if (!image.prompt.includes(`SEASON AUTHORITY — ${seasonId}`)) fail(`${id}: season profile not compiled`);
  if (image.productPresenceMode !== productPresenceMode || image.productPaletteEchoMode !== productPaletteEchoMode) fail(`${id}: role or palette strategy changed unexpectedly`);
  if (!image.sceneObjectSelection.colorIndependentSelection) fail(`${id}: product palette selected scene objects`);
  if (image.seasonSemanticProfileId !== seasonId || !image.seasonGate.sceneCandidatePassed || !image.seasonGate.objectsFilteredBeforePrompt) fail(`${id}: season gate metadata missing`);
  if (!image.prompt.includes("ACTIVE VISUAL SYSTEM") || !image.seasonConsistencyQA.passed || !image.productDominanceQA.passed) fail(`${id}: AVS or full Prompt QA missing`);
  if (!["ENTRYWAY_DEPARTURE", "WARDROBE_MORNING", "HOTEL_TRAVEL"].includes(image.sceneFingerprint.id) && /Human trace:/i.test(image.prompt)) fail(`${id}: wardrobe trace entered a no-person scene`);
  if (/product (is|as) (the )?(hero|visual center|primary subject)/i.test(image.prompt)) fail(`${id}: product became dominant`);
  if (productPresenceMode === "no_product" && /preserve only the visible structure/i.test(image.prompt)) fail(`${id}: Product Truth expanded in no-product mode`);
}
for (const profile of Object.values(SEASON_SEMANTIC_PROFILES)) {
  if (!profile.allowedWardrobe.length || !profile.allowedMaterials.length || !profile.allowedObjects.length || !profile.allowedLifeMoments.length || !profile.lighting.length || !profile.spatialState.length || !profile.paletteGuidance.length || profile.conflictsWith.length < 10) fail(`${profile.id}: incomplete seasonal semantics`);
}
const summerDarkAccent = buildNonProductAtmospherePlan({ quantity: 1, taskId: "summer-dark-downgrade", referenceAssetIds: ["dark-ref"], season: "夏", productPaletteClass: "dark", productPresenceMode: "subtle_supporting_presence", productPaletteEchoMode: "direct_accent" }).images[0];
if (summerDarkAccent.productPaletteEchoMode !== "material_translation") fail("summer dark direct accent did not downgrade");
if (/wool coat|chunky sweater|fireplace|winter domestic mood/i.test(summerDarkAccent.prompt.split("Exclude conflicting seasonal semantics")[0])) fail("dark palette overrode summer semantics");

const conflictCases = [
  ["winter-amusement", "冬", "暑假游乐园", /summer amusement|park map|sun hat|paper wristband/i],
  ["summer-entryway", "夏", "玄关出门", /\bcoat\b|wool|thick knit|scarf/i],
  ["spring-mediterranean", "春", "海边度假", /Mediterranean|seaside|limestone promenade|coastal lane/i],
];
for (const [id, season, scenePreference, forbidden] of conflictCases) {
  const dedicated = buildNonProductAtmospherePlan({ quantity: 1, taskId: id, referenceAssetIds: [`${id}-ref`], season, scenePreference, productPresenceMode: "no_product", productPaletteEchoMode: "brand_neutral" }).images[0];
  const generic = compilePrompt(promptInput(season, scenePreference, { atmosphereProductPresenceMode: "no_product", atmosphereProductPaletteEchoMode: "brand_neutral" }));
  const dedicatedPositive = dedicated.prompt.split("Exclude conflicting seasonal semantics")[0];
  const genericPositive = generic.prompt.split("Exclude conflicting seasonal semantics")[0];
  if (forbidden.test(dedicatedPositive) || forbidden.test(genericPositive)) fail(`${id}: requested scene conflict leaked through a compiler path`);
  if (generic.prompt !== buildNonProductAtmospherePlan({ quantity: 1, taskId: "prompt-builder-0", previewWithoutReference: true, season, scenePreference, productPresenceMode: "no_product", productPaletteEchoMode: "brand_neutral" }).images[0].prompt) fail(`${id}: dedicated and generic compilers diverged`);
  if (!dedicated.seasonGate.requestedSceneRejected && id !== "summer-entryway") fail(`${id}: incompatible requested scene was not rejected`);
}

const winterCafe = buildNonProductAtmospherePlan({ quantity: 1, taskId: "winter-cafe", referenceAssetIds: ["winter-ref"], season: "冬", scenePreference: "咖啡店门口", productPresenceMode: "no_product" }).images[0];
if (/blanket|indoor reading|contained residential warmth|wool coat|thick knit/i.test(winterCafe.prompt)) fail("winter outdoor cafe inherited blanket, indoor, residential, or wardrobe defaults");
if (!/clear cold urban air/i.test(winterCafe.prompt)) fail("winter outdoor cafe lost outdoor spatial semantics");
if (/Human trace:/i.test(winterCafe.prompt) || /wool coat|thick knit|scarf/i.test(winterCafe.prompt)) fail("no-person outdoor scene received wardrobe instructions");
const winterWardrobe = buildNonProductAtmospherePlan({ quantity: 1, taskId: "winter-wardrobe", referenceAssetIds: ["winter-ref"], season: "冬", scenePreference: "居家衣帽间" }).images[0];
if ((winterWardrobe.prompt.match(/Human trace:/g) ?? []).length !== 1) fail("wardrobe scene did not receive exactly one justified human trace");

for (const prompt of [winterCafe.prompt, winterWardrobe.prompt]) {
  if (!prompt.includes("ACTIVE VISUAL SYSTEM") || prompt.indexOf("ACTIVE VISUAL SYSTEM") > prompt.indexOf("SEASON AUTHORITY")) fail("Active Visual System missing or ordered after season");
  if (/reference.+(?:determine|control).+(?:global|whole image|light temperature|seasonal feeling|material weight)/i.test(prompt)) fail("Product Echo escaped its local boundary");
}

const emptySections = { moduleDefinition: [], activeVisualSystem: [], seasonIdentity: ["SEASON AUTHORITY — summer"], positiveSeasonCues: [], scene: ["summer-safe scene"], productPresence: [], paletteEcho: [], productTruth: [], composition: [], negativeConstraints: ["Exclude conflicting seasonal semantics"] };
if (runSeasonConsistencyPromptQA({ ...emptySections, scene: ["summer-safe scene with a wool coat"] }, SEASON_SEMANTIC_PROFILES.summer).length === 0) fail("season QA did not inspect content after the negative/conflict section boundary");
if (resolveRequestedAtmosphereScene("暑假游乐园", "winter").sceneId !== "MATERIAL_LIGHT_SPACE" || !resolveRequestedAtmosphereScene("暑假游乐园", "winter").usedSeasonNeutralFallback) fail("incompatible requested scene did not fail closed");
if (resolveRequestedAtmosphereScene("未注册场景", "spring").sceneId !== "MATERIAL_LIGHT_SPACE") fail("unknown requested scene did not use neutral fallback");
const forcedEmpty = selectSeasonCompatibleSceneCandidates(["ENTRYWAY_DEPARTURE", "CAFE_FRONT"], { ...SEASON_SEMANTIC_PROFILES.summer, conflictsWith: [""] });
if (forcedEmpty.sceneIds.join(",") !== "MATERIAL_LIGHT_SPACE" || !forcedEmpty.usedSeasonNeutralFallback) fail("empty compatible candidate set reopened the unfiltered scene pool");

const unrelated = compilePrompt({ ...promptInput("夏", "玄关出门"), brandId: undefined, imageType: "产品静物图", compositionMode: "stillLife" });
if (/ACTIVE VISUAL SYSTEM|Non-Product-Led Atmosphere|SEASON AUTHORITY/.test(unrelated.prompt)) fail("atmosphere system polluted a non-THERUIZ or non-atmosphere prompt");
const unbrandedAtmosphere = compilePrompt({ ...promptInput("夏", "玄关出门"), brandId: undefined });
if (/ACTIVE VISUAL SYSTEM|Brand Visual Mother/.test(unbrandedAtmosphere.prompt)) fail("THERUIZ Active Visual System polluted an unbranded atmosphere prompt");

if (failures.length) { console.error(`Non-product atmosphere module failed: ${failures.length}`); for (const failure of failures) console.error(`FAIL: ${failure}`); process.exitCode = 1; } else console.log("Non-product atmosphere compact Image2 Prompt compiler passed.");
await rm(dir, { recursive: true, force: true });
