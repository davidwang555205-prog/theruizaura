import { build } from "esbuild";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-sound-world-validation-"));
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
  { topic: "采购归来", scenes: [{ id: "scene-grocery", label: "精品超市 / 日常采购" }, { id: "scene-entry", label: "归家玄关" }] },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertSoundApproved(result, label) {
  assert(result.status === "SOUND_WORLD_APPROVED", `${label} expected SOUND_WORLD_APPROVED, received ${result.status}: ${result.failureReasons?.join(" | ") ?? "no reason"}`);
  assert(Object.values(result.qc).every((gate) => gate.status === "PASS"), `${label} failed a Sound World QC gate`);
}

function assertFailed(result, code) {
  assert(result.status === "SOUND_WORLD_FAILED", `Expected SOUND_WORLD_FAILED, received ${result.status}`);
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
    SOUND_WORLD_RULES,
    buildSoundWorldInput,
    buildProductPresenceInput,
    buildSceneResolverInput,
    compileSeedanceVideoScript,
    compileSoftSeedingThemeVideoScript,
    generatePromptRuntime,
    generateSoftSeedingContent,
    lifestyleSoftSeedingScenePool,
    planImmersiveNarrative,
    planProductPresence,
    planSoundWorld,
    resolveNarrativeScenes,
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  assert(lifestyleSoftSeedingScenePool.length === 39, `Scene Library changed from 39 to ${lifestyleSoftSeedingScenePool.length}`);
  assert(SOUND_WORLD_RULES.length === 13, `Expected thirteen Sound World rules, received ${SOUND_WORLD_RULES.length}`);

  const results = [];
  const soundInputs = new Map();
  const presenceOutputs = new Map();
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
    const productPresence = planProductPresence(buildProductPresenceInput(plan, sceneResolution, scenario.topic));
    assert(productPresence.status === "PRODUCT_PRESENCE_APPROVED", `${scenario.topic} Product Presence failed`);
    const soundInput = buildSoundWorldInput(plan, sceneResolution, productPresence, scenario.topic);
    soundInputs.set(scenario.topic, soundInput);
    presenceOutputs.set(scenario.topic, productPresence);
    const soundWorld = planSoundWorld(soundInput);
    assertSoundApproved(soundWorld, scenario.topic);
    assert(soundWorld.moments.length === 5, `${scenario.topic} Sound World must contain five moments`);
    assert(soundWorld.moments.every((moment) => moment.dominantSound === "ENVIRONMENT" || moment.dominantSound === "HUMAN" || moment.dominantSound === "OBJECT" || moment.dominantSound === "FOOTWEAR" || moment.dominantSound === "SILENCE"), `${scenario.topic} contains an invalid dominant sound`);
    const cueCounts = soundWorld.moments.map((moment) => moment.environment.length + moment.human.length + moment.object.length + moment.footwear.length);
    assert(cueCounts.every((count) => count <= 4), `${scenario.topic} exceeded the Sound Density limit`);
    results.push({ topic: scenario.topic, dominant: soundWorld.moments.map((moment) => moment.dominantSound), status: soundWorld.status });
  }

  const returnHomeSound = planSoundWorld(soundInputs.get("下班回家"));
  assert(returnHomeSound.moments[4].dominantSound === "SILENCE", "Return-home ending must allow a silence-led resolution");
  assert(returnHomeSound.moments[4].silenceLevel === "PRONOUNCED", "Return-home ending must expose pronounced quiet");

  const cafeSound = planSoundWorld(soundInputs.get("咖啡馆"));
  const cafePresence = presenceOutputs.get("咖啡馆");
  const readableWithoutFootwear = cafePresence.curve.findIndex((moment) => moment.presence === "READABLE" && cafeSound.moments[moment.momentIndex].footwear.length === 0);
  assert(readableWithoutFootwear >= 0, "READABLE must not force footwear sound");

  const inventedRule = {
    topic: "下班回家",
    label: "Invented event validation",
    dominantBaseline: ["ENVIRONMENT", "ENVIRONMENT", "ENVIRONMENT", "ENVIRONMENT", "SILENCE"],
    description: "Validation-only invented-event rule.",
    cuePalette: { ENVIRONMENT: ["phone ringing in the hallway"] },
  };
  const invented = planSoundWorld(soundInputs.get("下班回家"), { rules: [inventedRule] });
  assertFailed(invented, "INVENTED_EVENT");
  assert(invented.qc.no_invented_event.status === "FAIL", "Invented event did not fail No Invented Event");

  const materialRule = {
    topic: "下班回家",
    label: "Material contradiction validation",
    dominantBaseline: ["FOOTWEAR", "FOOTWEAR", "FOOTWEAR", "FOOTWEAR", "FOOTWEAR"],
    description: "Validation-only material contradiction rule.",
    cuePalette: { FOOTWEAR: ["wet gravel underfoot"] },
  };
  const materialMismatch = planSoundWorld(soundInputs.get("下班回家"), { rules: [materialRule] });
  assertFailed(materialMismatch, "PHYSICAL_SOUND_MISMATCH");
  assert(materialMismatch.qc.scene_physically_consistent.status === "FAIL", "Material contradiction did not fail Scene Physically Consistent");

  const overdesignRule = {
    topic: "下班回家",
    label: "Overdesign validation",
    dominantBaseline: ["ENVIRONMENT", "ENVIRONMENT", "ENVIRONMENT", "ENVIRONMENT", "ENVIRONMENT"],
    description: "Validation-only overdesign rule.",
    cuePalette: { ENVIRONMENT: ["transition whoosh"] },
  };
  const overdesigned = planSoundWorld(soundInputs.get("下班回家"), { rules: [overdesignRule] });
  assertFailed(overdesigned, "SOUND_OVERDESIGN");
  assert(overdesigned.qc.no_overdesign.status === "FAIL", "Overdesign did not fail No Overdesign");

  const mutatedInput = clone(soundInputs.get("下班回家"));
  mutatedInput.productPresenceCurve[0].originalWhatHappens = "A different action.";
  const mutated = planSoundWorld(mutatedInput);
  assertFailed(mutated, "NARRATIVE_NOT_PRESERVED");
  assert(mutated.qc.narrative_preserved.status === "FAIL", "Narrative mutation did not fail Narrative Preserved");

  assertFailed(planSoundWorld({ ...soundInputs.get("下班回家"), productPresenceStatus: "PRODUCT_PRESENCE_FAILED" }), "PRODUCT_PRESENCE_NOT_APPROVED");
  assertFailed(planSoundWorld({ ...soundInputs.get("下班回家"), narrativeStatus: "BLOCKED" }), "NARRATIVE_NOT_APPROVED");
  assertFailed(planSoundWorld({ ...soundInputs.get("下班回家"), sceneResolutionStatus: "SCENE_RESOLUTION_FAILED" }), "SCENE_RESOLUTION_NOT_APPROVED");
  assertFailed(planSoundWorld({ ...soundInputs.get("下班回家"), resolvedMoments: soundInputs.get("下班回家").resolvedMoments.slice(0, 3) }), "INVALID_MOMENT_COUNT");

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

  console.log("Sound World V1 validation passed:", JSON.stringify({
    sceneLibraryCount: lifestyleSoftSeedingScenePool.length,
    results,
    silenceEnding: returnHomeSound.moments[4],
    readableWithoutFootwear: {
      topic: "咖啡馆",
      momentIndex: readableWithoutFootwear,
      presence: cafePresence.curve[readableWithoutFootwear].presence,
      footwear: cafeSound.moments[readableWithoutFootwear].footwear,
    },
    failureCases: ["NARRATIVE_NOT_APPROVED", "SCENE_RESOLUTION_NOT_APPROVED", "PRODUCT_PRESENCE_NOT_APPROVED", "INVALID_MOMENT_COUNT", "INVENTED_EVENT", "PHYSICAL_SOUND_MISMATCH", "SOUND_OVERDESIGN", "NARRATIVE_NOT_PRESERVED"],
    backwardCompatibility: "PASS",
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
