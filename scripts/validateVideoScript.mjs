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
  assert(Boolean(studioImage.selectedOutfitLine), "Studio Image Runtime must still resolve its existing image wardrobe");
  assert(studioVideo.filmSpec.scene.selectedOutfitLine === studioVideo.filmSpec.scene.studioContext?.resolvedWardrobeLine, "Studio video must use its resolved studio wardrobe as the single wardrobe authority");
  assert((studioVideo.script.match(/^- Resolved wardrobe:/gm) ?? []).length === 1, "Studio video must render exactly one resolved wardrobe");
  assert(!/Studio wardrobe resolution:/.test(studioVideo.script), "Studio video rendered a competing wardrobe source");
  assert(studioVideo.filmSpec.scene.studioContext?.anglePreference === "3/4侧前方上脚角度", "Studio angle preference was lost");
  assert(/3\/4 front-side/i.test(studioVideo.filmSpec.scene.studioContext?.angleDirection ?? ""), "Resolved studio angle direction was lost");
  assert(studioVideo.filmSpec.scene.studioContext?.shotIndex === 7, "Manual 3/4 studio angle did not resolve to the matching on-foot video action role");
  assert(/few degrees|outsole/i.test(studioVideo.filmSpec.scene.resolvedActionDirection), "Manual 3/4 studio angle retained a front-reference action");
  assert(Boolean(studioVideo.filmSpec.scene.studioContext?.resolvedPreset), "Resolved studio preset was lost");
  assert(!/pavement|doorway|column|wall edge|glass panel|flowers|cafe|street/i.test(studioVideo.script), "Studio video retained non-studio scene language");

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
      const expectedOutfit = script.filmSpec.scene.studioContext?.resolvedWardrobeLine
        ?? generatePromptRuntime(source.params).selectedOutfitLine;
      assert(script.filmSpec.scene.selectedOutfitLine === expectedOutfit, "Xiaohongshu video outfit was reselected outside its authoritative image/studio runtime decision");
    });
    assert(formatVideoScriptBatch(scripts).match(/SEEDANCE 2\.5 — MANUAL VIDEO SCRIPT/g)?.length === count, "Formatted Xiaohongshu batch lost a script");
  }

  for (const count of [3, 5, 8]) {
    const studioContent = generateSoftSeedingContent({
      baseParams: { ...baseParams, season: "秋", generationNonce: 140 + count },
      imageCount: count,
      topic: "棚内上新拍摄",
      variantOffset: count,
    });
    for (const duration of [10, 15]) {
      const scripts = compileSoftSeedingVideoScriptBatch(studioContent.images, duration);
      assert(scripts.length === count, `Studio ${count}-card ${duration}s mode lost a script`);
      scripts.forEach((script, index) => {
        const scene = script.filmSpec.scene;
        const studio = scene.studioContext;
        assert(Boolean(studio), "Studio batch script lost studio context");
        assert(studio?.seriesImageCount === count, "Studio batch script lost the selected series count");
        assert(studio?.seriesImageIndex === index, "Studio batch script lost the selected series index");
        assert(scene.selectedOutfitLine === studio?.resolvedWardrobeLine, "Studio batch emitted competing wardrobe decisions");
        assert((script.script.match(/^- Resolved wardrobe:/gm) ?? []).length === 1, "Studio batch must render exactly one wardrobe line");
        assert(!/Studio wardrobe resolution:/.test(script.script), "Studio batch rendered a second wardrobe source");
        assert(script.script.includes(`shot ${index + 1} of ${count}`), "Studio script angle text lost the selected count");
        for (const otherCount of [3, 5, 8].filter((value) => value !== count)) {
          assert(!script.script.includes(`shot ${index + 1} of ${otherCount}`), "Studio script retained another series count");
        }
        if (index === 0) {
          assert(script.script.includes(`shots 2–${count}`), "Studio reference card retained a stale continuation range");
        }
        if (count !== 8) {
          assert(!/shots 2–8|all eight cards/i.test(script.script), "Studio non-eight-card mode retained eight-card language");
        }
        assert(!/pavement|doorway|column|wall edge|glass panel|flowers|cafe|street/i.test(script.script), "Studio batch retained non-studio scene language");
        assert((script.script.match(/Primary camera move:/g) ?? []).length === 1, "Studio script must declare exactly one primary camera move");
        assert(!/slow push|slow push-in|very slow, natural-perspective entry|refine the framing gradually/i.test(script.script), "Studio script retained push-in or zoom-led evidence language");
        if (duration === 15) {
          const evidenceBeat = script.filmSpec.beats.find((beat) => beat.id === "15s-studio-product-evidence");
          const finalBeat = script.filmSpec.beats.find((beat) => beat.id === "15s-studio-brand-resolve");
          assert(Boolean(evidenceBeat), "Studio 15s script lost its independent Product Evidence phase");
          assert(/foot|shoe|heel|ankle|outsole|weight/i.test(evidenceBeat?.action ?? ""), "Studio Product Evidence is not produced through a physical foot or weight state");
          assert(/rather than camera enlargement/i.test(evidenceBeat?.purpose ?? ""), "Studio Product Evidence did not reject camera-led enlargement");
          assert(/last 1\.5 seconds/i.test(`${finalBeat?.action} ${finalBeat?.camera}`), "Studio final hold duration is not explicit");
          if ((studio?.shotIndex ?? 0) <= 3) {
            assert(/full-body|near-full-body/i.test(finalBeat?.action ?? ""), "Studio full-body card did not preserve person and outfit hierarchy through the final frame");
          }
        }
      });
    }
  }

  const sceneTruthTopics = ["生活场景软种草", "穿搭解决方案"];
  const sceneMarkers = [
    ["写字楼门口", /写字楼门口|office entrance|business district/i],
    ["咖啡店门口", /咖啡店门口|cafe storefront|coffee shop entrance/i],
    ["咖啡馆内", /咖啡馆内|cafe interior/i],
    ["美术馆", /美术馆|art museum|gallery/i],
    ["入户镜前", /入户镜前|entryway mirror/i],
    ["书店 / 杂志店门口", /书店|杂志店|bookstore|magazine shop/i],
    ["花店 / 买花", /花店|买花|flower shop/i],
    ["城市街角 / 安静街区", /城市街角|安静街区|quiet city|street corner/i],
  ];
  for (const topic of sceneTruthTopics) {
    for (const count of [1, 3, 5, 8]) {
      for (const variantOffset of [0, 7, 19]) {
        const input = { baseParams: { ...baseParams, generationNonce: 60 + variantOffset }, imageCount: count, topic, variantOffset };
        const content = generateSoftSeedingContent(input);
        const rerun = generateSoftSeedingContent({ ...input, baseParams: { ...input.baseParams, generationNonce: input.baseParams.generationNonce + 97 } });
        assert(
          JSON.stringify(content.images.map((image) => image.params.scenePreference)) === JSON.stringify(rerun.images.map((image) => image.params.scenePreference)),
          `${topic} ${count}-card scene truth must not be rerolled independently from its curated draft`
        );
        const scripts = compileSoftSeedingVideoScriptBatch(content.images, 10);
        scripts.forEach((script, index) => {
          const image = content.images[index];
          assert(script.filmSpec.scene.scene === image.params.scenePreference, `${topic} video scene drifted from its authoritative image-card scene`);
          assert(script.sourceLabel === image.name, `${topic} video label drifted from its authoritative image-card label`);
          const detectedLabelScenes = sceneMarkers.filter(([, pattern]) => pattern.test(image.name)).map(([scene]) => scene);
          assert(
            detectedLabelScenes.length === 0 || detectedLabelScenes.includes(image.params.scenePreference),
            `${topic} card label names a different location from its authoritative scene: ${image.name} -> ${image.params.scenePreference}`
          );
          assert(
            /single authoritative location/i.test(image.params.extraRequirement),
            `${topic} card is missing the single-authoritative-location guard`
          );
        });
      }
    }
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

  console.log("Seedance2.5 manual video script validation passed: Prompt Builder plus Xiaohongshu/atmosphere 1/3/5/8 batches, authoritative lifestyle/styling scenes, independent rhythms, reference-bound protection, atmosphere semantics, stale-plan separation, and no runtime leakage.");
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
