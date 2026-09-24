import { build } from "esbuild";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-product-presence-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const hash = (value) => createHash("sha256").update(value).digest("hex");

const BACKWARD_COMPATIBILITY_HASHES = {
  imagePrompt: "49ef0cde2ee07106579c7bddd5eca30d67ef484197e299316338dbf65183296d",
  lifestyleJson: "5871f2cfd79734cc0e18d27ec9795b19ef71b16ebd9786d790186142ac6fbfe3",
  seedanceVideoScript: "f6417d81b7ec1d02ff9ca5d2bb9b160e50d3cad4f3261dfe2b3b5594d86f0e0f",
  unifiedThemeVideoScript: "a58c32a00f58061aa2c45463401228cc0f7518704d5f26ed7b45fb417061afbb",
};

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
  extraRequirement: "Keep the visual tone calm while all movement remains real-time.",
  generationNonce: 0,
  selectedProductTruth: { referenceEvidenceBound: true, structuredFactsExtracted: false, productTruthMode: "reference_bound" },
  referencePlan: { referencePlanReady: true, order: ["internal-a", "internal-b"] },
};

const scenarios = [
  { topic: "下班回家", scenes: [{ id: "scene-elevator", label: "电梯" }, { id: "scene-corridor", label: "公寓走廊" }, { id: "scene-door", label: "公寓门口" }, { id: "scene-entry", label: "玄关" }] },
  { topic: "出门", scenes: [{ id: "scene-entry", label: "玄关" }, { id: "scene-door", label: "公寓门口" }, { id: "scene-outside", label: "住宅楼外" }] },
  { topic: "周末书店", scenes: [{ id: "scene-storefront", label: "书店 / 杂志店门口" }, { id: "scene-inside", label: "书店 / 杂志店内" }] },
  { topic: "等人", scenes: [{ id: "scene-office", label: "写字楼门口" }] },
  { topic: "咖啡馆", scenes: [{ id: "scene-cafe", label: "咖啡馆内" }] },
  { topic: "采购归来", scenes: [{ id: "scene-hall", label: "公寓走廊" }, { id: "scene-entry", label: "归家玄关" }] },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertApproved(result, label) {
  assert(result.status === "PRODUCT_PRESENCE_APPROVED", `${label} expected PRODUCT_PRESENCE_APPROVED, received ${result.status}: ${result.failureReasons?.join(" | ") ?? "no reason"}`);
  assert(Object.values(result.qc).every((gate) => gate.status === "PASS"), `${label} failed a Product Presence QC gate`);
}

function assertFailed(result, code) {
  assert(result.status === "PRODUCT_PRESENCE_FAILED", `Expected PRODUCT_PRESENCE_FAILED, received ${result.status}`);
  assert(result.failureReasons?.some((reason) => reason.startsWith(`${code}:`)), `Expected failure code ${code}, received ${result.failureReasons?.join(" | ") ?? "none"}`);
}

try {
  await writeFile(
    entryPath,
    `export * from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/index.ts"))};\n` +
    `export { lifestyleSoftSeedingScenePool } from ${JSON.stringify(resolve(projectRoot, "src/data/lifestyleSoftSeedingScenePool.ts"))};\n` +
    `export { compileSeedanceVideoScript } from ${JSON.stringify(resolve(projectRoot, "src/video-script/compileSeedanceVideoScript.ts"))};\n` +
    `export { compileSoftSeedingThemeVideoScript } from ${JSON.stringify(resolve(projectRoot, "src/video-script/compileSeedanceThemeVideoScript.ts"))};\n` +
    `export { generateSoftSeedingContent } from ${JSON.stringify(resolve(projectRoot, "src/utils/generateSoftSeedingContent.ts"))};\n` +
    `export { generatePromptRuntime } from ${JSON.stringify(resolve(projectRoot, "src/prompt-engine/runtime.ts"))};\n`
  );
  await build({ entryPoints: [entryPath], bundle: true, format: "esm", platform: "node", outfile: bundlePath, logLevel: "silent" });
  const {
    PRODUCT_PRESENCE_RULES,
    buildProductPresenceInput,
    buildSceneResolverInput,
    compileSeedanceVideoScript,
    compileSoftSeedingThemeVideoScript,
    generatePromptRuntime,
    generateSoftSeedingContent,
    lifestyleSoftSeedingScenePool,
    planImmersiveNarrative,
    planProductPresence,
    resolveNarrativeScenes,
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  assert(lifestyleSoftSeedingScenePool.length === 39, `Scene Library changed from 39 to ${lifestyleSoftSeedingScenePool.length}`);
  assert(PRODUCT_PRESENCE_RULES.length === 13, `Expected thirteen Product Presence baselines, received ${PRODUCT_PRESENCE_RULES.length}`);

  const results = [];
  const inputsByTopic = new Map();
  for (const scenario of scenarios) {
    const plan = planImmersiveNarrative({
      topic: scenario.topic,
      characterProfile: "32岁左右成熟女性",
      season: "秋",
      lifestyleFeeling: "安静 / 克制",
      duration: 15,
      availableSceneLibrary: scenario.scenes,
    });
    assert(plan.status === "APPROVED_FOR_SCENE_RESOLUTION", `${scenario.topic} Narrative Planner failed`);
    const sceneResolution = resolveNarrativeScenes(buildSceneResolverInput(plan, scenario.topic));
    assert(sceneResolution.status === "SCENE_RESOLUTION_APPROVED", `${scenario.topic} Scene Resolution failed`);
    const input = buildProductPresenceInput(plan, sceneResolution, scenario.topic);
    inputsByTopic.set(scenario.topic, input);
    const result = planProductPresence(input);
    assertApproved(result, scenario.topic);
    assert(result.curve.length === sceneResolution.resolvedMoments.length, `${scenario.topic} curve lost a Moment`);
    assert(result.curve.every((moment, index) => moment.sceneId === sceneResolution.resolvedMoments[index].sceneId), `${scenario.topic} curve changed a Scene`);
    assert(result.curve.every((moment, index) => moment.originalWhatHappens === sceneResolution.resolvedMoments[index].originalWhatHappens), `${scenario.topic} curve changed What Happens`);
    const heroCount = result.curve.filter((moment) => moment.presence === "HERO").length;
    const strongCount = result.curve.filter((moment) => moment.presence === "READABLE" || moment.presence === "HERO").length;
    assert(heroCount <= 1, `${scenario.topic} overexposed with ${heroCount} HERO moments`);
    assert(strongCount <= 3, `${scenario.topic} overexposed with ${strongCount} READABLE/HERO moments`);
    results.push({ topic: scenario.topic, presence: result.curve.map((moment) => moment.presence), status: result.status });
  }

  const bookstoreResult = planProductPresence(inputsByTopic.get("周末书店"));
  const bookstoreHeroCount = bookstoreResult.curve.filter((moment) => moment.presence === "HERO").length;
  const bookstoreReadableCount = bookstoreResult.curve.filter((moment) => moment.presence === "READABLE").length;
  assert(bookstoreHeroCount === 0 && bookstoreReadableCount === 2, "Bookstore must pass without HERO using exactly two READABLE moments");

  const heroInput = clone(inputsByTopic.get("下班回家"));
  heroInput.moments[3].originalWhatHappens = "She takes one measured step across the pavement and continues at the same pace.";
  const heroResult = planProductPresence(heroInput, {
    rules: [{
      topic: "下班回家",
      label: "Natural hero validation",
      baseline: ["INCIDENTAL", "READABLE", "READABLE", "HERO", "ABSENT"],
      description: "Validation-only rule proving HERO can remain when the action naturally supports it.",
    }],
  });
  assertApproved(heroResult, "Natural HERO case");
  assert(heroResult.curve[3].presence === "HERO", "Natural walking HERO was incorrectly downgraded");

  const overexposedInput = inputsByTopic.get("下班回家");
  const overexposed = planProductPresence(overexposedInput, {
    rules: [{
      topic: "下班回家",
      label: "Overexposure validation",
      baseline: ["HERO", "HERO", "READABLE", "READABLE", "READABLE"],
      description: "Validation-only overexposure rule.",
    }],
  });
  assertFailed(overexposed, "PRODUCT_OVEREXPOSED");
  assert(overexposed.qc.no_overexposure.status === "FAIL", "Overexposure curve did not fail No Overexposure");

  const forcedInput = clone(inputsByTopic.get("等人"));
  forcedInput.moments[3].originalWhatHappens = "She steps one foot forward to show the sneaker while waiting.";
  const forced = planProductPresence(forcedInput);
  assertFailed(forced, "PRODUCT_FORCED");
  assert(forced.qc.product_not_forced.status === "FAIL", "Forced product action did not fail Product Not Forced");

  assertFailed(planProductPresence({ ...inputsByTopic.get("下班回家"), narrativeStatus: "BLOCKED" }), "NARRATIVE_NOT_APPROVED");
  assertFailed(planProductPresence({ ...inputsByTopic.get("下班回家"), sceneResolutionStatus: "SCENE_RESOLUTION_FAILED" }), "SCENE_RESOLUTION_NOT_APPROVED");
  assertFailed(planProductPresence(inputsByTopic.get("下班回家"), {
    rules: [{ topic: "下班回家", label: "Invalid level", baseline: ["INVALID", "READABLE", "READABLE", "READABLE", "ABSENT"], description: "Invalid test rule." }],
  }), "INVALID_PRESENCE_LEVEL");
  assertFailed(planProductPresence({ ...inputsByTopic.get("下班回家"), moments: inputsByTopic.get("下班回家").moments.slice(0, 3) }), "INVALID_MOMENT_COUNT");

  const imagePrompt = generatePromptRuntime(baseParams);
  const lifestyleContent = generateSoftSeedingContent({
    baseParams,
    imageCount: 5,
    topic: "生活场景软种草",
    contentCategory: "natural_life",
    captureStyle: "standard",
    variantOffset: 7,
  });
  const seedanceVideoScript = compileSeedanceVideoScript({ params: baseParams, duration: 15 });
  const unifiedThemeVideoScript = compileSoftSeedingThemeVideoScript({
    images: lifestyleContent.images,
    topic: lifestyleContent.topic,
    duration: 15,
  });
  const actualHashes = {
    imagePrompt: hash(imagePrompt.prompt),
    lifestyleJson: hash(JSON.stringify(lifestyleContent)),
    seedanceVideoScript: hash(seedanceVideoScript.script),
    unifiedThemeVideoScript: hash(unifiedThemeVideoScript.script),
  };
  for (const [key, actual] of Object.entries(actualHashes)) {
    assert(actual === BACKWARD_COMPATIBILITY_HASHES[key], `Backward compatibility hash changed for ${key}`);
  }

  console.log("Product Presence Curve V1 validation passed:", JSON.stringify({
    sceneLibraryCount: lifestyleSoftSeedingScenePool.length,
    results,
    noHeroCase: { topic: "周末书店", presence: bookstoreResult.curve.map((moment) => moment.presence) },
    naturalHeroCase: heroResult.curve.map((moment) => moment.presence),
    failureCases: ["NARRATIVE_NOT_APPROVED", "SCENE_RESOLUTION_NOT_APPROVED", "INVALID_PRESENCE_LEVEL", "INVALID_MOMENT_COUNT", "PRODUCT_OVEREXPOSED", "PRODUCT_FORCED"],
    backwardCompatibility: "PASS",
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
