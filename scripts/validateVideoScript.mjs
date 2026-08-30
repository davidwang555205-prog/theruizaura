import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-video-script-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const baseParams = {
  imageType: "生活场景图",
  modelChoice: "30–45岁客户画像模特",
  modelContinuity: "新人物",
  shoe: "自定义",
  customShoe: "",
  season: "秋",
  scenePreference: "通勤上班",
  garmentTypePreference: "自动匹配",
  studioLaunchAnglePreference: "自动匹配",
  studioLaunchPreset: "auto",
  studioWardrobePreference: "auto",
  stillLifeStyle: "与主视觉统一",
  extraRequirement: "Keep the pace calm.",
  generationNonce: 0,
  selectedProductTruth: { referenceEvidenceBound: true, structuredFactsExtracted: false, productTruthMode: "reference_bound" },
  referencePlan: { referencePlanReady: true, order: ["internal-a", "internal-b"] },
};

function assertContinuous(beats, duration) {
  assert(beats[0].startSecond === 0, `${duration}s script must start at zero`);
  assert(beats.at(-1).endSecond === duration, `${duration}s script must end at its declared duration`);
  beats.slice(1).forEach((beat, index) => assert(beat.startSecond === beats[index].endSecond, `${duration}s beat timing must be continuous`));
}

try {
  await writeFile(
    entryPath,
    `export * from ${JSON.stringify(resolve(projectRoot, "src/video-script/compileSeedanceVideoScript.ts"))};\n` +
    `export * from ${JSON.stringify(resolve(projectRoot, "src/video-script/compileSeedanceVideoScriptBatch.ts"))};\n` +
    `export { generateSoftSeedingContent } from ${JSON.stringify(resolve(projectRoot, "src/utils/generateSoftSeedingContent.ts"))};\n` +
    `export { buildNonProductAtmospherePlan } from ${JSON.stringify(resolve(projectRoot, "src/non-product-atmosphere/index.ts"))};\n` +
    `export { generatePromptRuntime } from ${JSON.stringify(resolve(projectRoot, "src/prompt-engine/runtime.ts"))};\n`
  );
  await build({ entryPoints: [entryPath], bundle: true, format: "esm", platform: "node", outfile: bundlePath, logLevel: "silent" });
  const {
    buildNonProductAtmospherePlan,
    compileAtmosphereVideoScriptBatch,
    compileSeedanceVideoScript,
    compileSoftSeedingVideoScriptBatch,
    formatVideoScriptBatch,
    generatePromptRuntime,
    generateSoftSeedingContent,
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  const ten = compileSeedanceVideoScript({ params: baseParams, duration: 10 });
  const fifteen = compileSeedanceVideoScript({ params: baseParams, duration: 15 });

  assert(ten.filmSpec.rhythm === "independent_three_beat", "10s must use its independent three-beat rhythm");
  assert(ten.filmSpec.beats.length === 3, "10s must contain exactly three beats");
  assert(fifteen.filmSpec.rhythm === "independent_four_beat", "15s must use its independent four-beat rhythm");
  assert(fifteen.filmSpec.beats.length === 4, "15s must contain exactly four beats");
  assertContinuous(ten.filmSpec.beats, 10);
  assertContinuous(fifteen.filmSpec.beats, 15);
  assert(ten.filmSpec.beats.every((beat) => beat.id.startsWith("10s-")), "10s beat identities must be duration-specific");
  assert(fifteen.filmSpec.beats.every((beat) => beat.id.startsWith("15s-")), "15s beat identities must be duration-specific");

  for (const output of [ten, fifteen]) {
    for (const section of ["[SCENE SPEC]", "[FILM SPEC]", "[BRAND VISUAL / DIRECTING RULES]", "[MOTION]", "[CAMERA]", "[PRODUCT PROTECTION]", "[REFERENCE MAPPING]"]) {
      assert(output.script.includes(section), `Video script is missing ${section}`);
    }
    assert(output.script.includes("Use the uploaded footwear references as the only product source."), "Product source is not reference-bound");
    assert(output.script.includes("No API request has been sent."), "Manual execution status is missing");
    assert(!/internal-a|internal-b/.test(output.script), "Internal reference ids leaked into the copied script");
    assert(!/confidence|diagnostics|providerExecutionReady|productionReady/.test(output.script), "Internal readiness or diagnostics leaked into the copied script");
    const productSection = output.script.split("[PRODUCT PROTECTION]")[1]?.split("[REFERENCE MAPPING]")[0] ?? "";
    assert(!/\b(leather|suede|mesh|canvas|knit|nubuck)\b/i.test(productSection), "Unconfirmed product material leaked into Product Protection");
    assert(/Quiet Warm Luxury/.test(output.script), "Video script lost the Brand Visual positioning");
    assert(/low-saturation/.test(output.script) && /natural asymmetry/.test(output.script), "Video script lost Brand Visual directing rules");
  }

  const imageRuntime = generatePromptRuntime(baseParams);
  assert(ten.filmSpec.scene.selectedOutfitLine === imageRuntime.selectedOutfitLine, "Video wardrobe must equal the Image Runtime selected outfit");
  assert(ten.script.includes(imageRuntime.selectedOutfitLine), "Resolved wardrobe did not reach the copied video script");
  assert(/commute|office entrance|business district/i.test(ten.filmSpec.scene.resolvedLocationDirection), "Commute scene semantics did not reach SceneSpec");
  assert(/15s-product-evidence/.test(fifteen.script), "15s script is missing the independent Product Evidence beat");
  assert(/structuredFactsExtracted|internal-a|internal-b/.test(fifteen.script) === false, "Internal truth or reference fields leaked into Product Evidence output");
  assert(/silhouette, proportions, and visible structural relationships/.test(fifteen.script), "15s Product Evidence beat does not fail closed for unextracted facts");

  const cafeParams = { ...baseParams, scenePreference: "咖啡店门口", season: "春", garmentTypePreference: "裙装", generationNonce: 28 };
  const cafeImage = generatePromptRuntime(cafeParams);
  const cafeVideo = compileSeedanceVideoScript({ params: cafeParams, duration: 10 });
  assert(cafeVideo.filmSpec.scene.selectedOutfitLine === cafeImage.selectedOutfitLine, "Cafe video wardrobe drifted from Image Runtime");
  assert(/cafe|coffee|storefront/i.test(`${cafeVideo.filmSpec.scene.resolvedLocationDirection} ${cafeVideo.filmSpec.scene.resolvedActionDirection}`), "Cafe directing context is generic or missing");
  assert(cafeVideo.filmSpec.scene.resolvedActionDirection !== ten.filmSpec.scene.resolvedActionDirection, "Cafe and commute actions collapsed to the same direction");

  const studioParams = {
    ...baseParams,
    imageType: "产品上脚图",
    scenePreference: "棚内上新拍摄",
    season: "冬",
    garmentTypePreference: "裤装",
    studioLaunchAnglePreference: "3/4侧前方上脚角度",
    generationNonce: 29,
  };
  const studioImage = generatePromptRuntime(studioParams);
  const studioVideo = compileSeedanceVideoScript({ params: studioParams, duration: 15 });
  assert(studioVideo.filmSpec.scene.selectedOutfitLine === studioImage.selectedOutfitLine, "Studio video wardrobe drifted from Image Runtime");
  assert(studioVideo.filmSpec.scene.studioContext?.anglePreference === "3/4侧前方上脚角度", "Studio angle preference was lost");
  assert(/3\/4 front-side/i.test(studioVideo.filmSpec.scene.studioContext?.angleDirection ?? ""), "Resolved studio angle direction was lost");
  assert(Boolean(studioVideo.filmSpec.scene.studioContext?.resolvedPreset), "Resolved studio preset was lost");

  const atmosphere = compileSeedanceVideoScript({ params: { ...baseParams, imageType: "非产品氛围图" }, duration: 10 });
  assert(!atmosphere.filmSpec.productProtection.enabled, "Non-product atmosphere must not enable product protection");
  assert(atmosphere.filmSpec.beats.every((beat) => beat.productPriority === "none"), "Non-product atmosphere must not introduce a product hero beat");
  assert(atmosphere.filmSpec.referenceMapping.mode === "not_applicable", "Non-product atmosphere must not require product reference mapping");

  for (const count of [1, 3, 5, 8]) {
    const softContent = generateSoftSeedingContent({
      baseParams,
      imageCount: count,
      topic: count === 8 ? "棚内上新拍摄" : "生活场景软种草",
      variantOffset: count,
    });
    const scripts = compileSoftSeedingVideoScriptBatch(softContent.images, 10);
    assert(softContent.images.length === count, `Xiaohongshu ${count}-card mode did not return ${count} image plans`);
    assert(scripts.length === count, `Xiaohongshu ${count}-card mode did not return ${count} video scripts`);
    scripts.forEach((script, index) => {
      const source = softContent.images[index];
      assert(script.filmSpec.scene.season === source.params.season, "Xiaohongshu video season drifted from its image card");
      assert(script.filmSpec.scene.scene === source.params.scenePreference, "Xiaohongshu video scene drifted from its image card");
      assert(script.filmSpec.scene.selectedOutfitLine === generatePromptRuntime(source.params).selectedOutfitLine, "Xiaohongshu video outfit was reselected outside the image runtime decision");
    });
    assert(formatVideoScriptBatch(scripts).match(/SEEDANCE 2\.5 — MANUAL VIDEO SCRIPT/g)?.length === count, "Formatted Xiaohongshu batch lost a script");
  }

  for (const count of [1, 3, 5, 8]) {
    const plan = buildNonProductAtmospherePlan({
      quantity: count,
      generationNonce: count,
      referenceImageCount: 0,
      referenceAssetIds: [],
      taskId: "preview",
      previewWithoutReference: true,
      season: "秋",
      aspectRatio: "4:5",
    });
    const scripts = compileAtmosphereVideoScriptBatch(plan, "秋", 15);
    assert(scripts.length === count, `Atmosphere ${count}-card mode did not return ${count} video scripts`);
    scripts.forEach((script, index) => {
      const source = plan.images[index];
      assert(script.filmSpec.scene.scene === source.slot.sceneLabel, "Atmosphere scene label drifted from the resolved card");
      assert(script.script.includes(source.sceneResolution.resolvedArchetypeId), "Atmosphere archetype did not reach the video script");
      assert(script.script.includes(source.sceneResolution.resolvedVariantId), "Atmosphere variant did not reach the video script");
      assert(script.script.includes(source.sceneVariantContent.primaryTrace), "Atmosphere life trace did not reach the video script");
      assert(script.script.includes(source.productPresenceMode), "Atmosphere product presence mode did not reach the video script");
      assert(script.filmSpec.beats.some((beat) => beat.id === "15s-atmosphere-evidence"), "Atmosphere 15s script is missing its independent evidence beat");
      assert(!script.filmSpec.beats.some((beat) => beat.id === "15s-product-evidence"), "Atmosphere script retained a product-evidence beat");
      assert(script.filmSpec.beats.every((beat) => beat.productPriority === "none"), "Atmosphere script introduced product priority");
      assert(!/keep the product stable/i.test(script.script), "Atmosphere script retained product-only action language");
      assert(/person-free/i.test(script.script), "Atmosphere script lost the no-person rule");
    });
  }

  const stalePlanA = buildNonProductAtmospherePlan({ quantity: 1, generationNonce: 40, referenceAssetIds: [], previewWithoutReference: true, season: "春" });
  const stalePlanB = buildNonProductAtmospherePlan({ quantity: 1, generationNonce: 41, referenceAssetIds: [], previewWithoutReference: true, season: "春" });
  const staleScriptA = compileAtmosphereVideoScriptBatch(stalePlanA, "春", 10)[0];
  const staleScriptB = compileAtmosphereVideoScriptBatch(stalePlanB, "春", 10)[0];
  assert(staleScriptA.sourceId !== staleScriptB.sourceId, "Regenerated atmosphere plans must not share a stale video source id");
  assert(staleScriptA.script !== staleScriptB.script, "Regenerated atmosphere plans must produce current resolved video semantics");

  console.log("Seedance2.5 manual video script validation passed: Prompt Builder plus Xiaohongshu/atmosphere 1/3/5/8 batches, independent rhythms, reference-bound protection, atmosphere semantics, stale-plan separation, and no runtime leakage.");
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
