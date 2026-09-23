import { build } from "esbuild";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-scene-resolver-validation-"));
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

const sceneLibrary = {
  returnHome: [
    { id: "scene-elevator", label: "电梯" },
    { id: "scene-corridor", label: "公寓走廊" },
    { id: "scene-door", label: "公寓门口" },
    { id: "scene-entry", label: "玄关" },
  ],
  departure: [
    { id: "scene-entry", label: "玄关" },
    { id: "scene-door", label: "公寓门口" },
    { id: "scene-street", label: "楼外街边" },
  ],
  bookstore: [
    { id: "scene-storefront", label: "书店外观" },
    { id: "scene-entrance", label: "书店入口" },
    { id: "scene-inside", label: "店内门廊" },
  ],
  waiting: [
    { id: "scene-waiting", label: "等人长椅" },
    { id: "scene-entrance", label: "入口" },
    { id: "scene-street", label: "街边" },
  ],
  cafe: [
    { id: "scene-cafe-entry", label: "咖啡馆入口" },
    { id: "scene-counter", label: "咖啡馆柜台" },
    { id: "scene-cafe-inside", label: "咖啡馆室内" },
  ],
  errand: [
    { id: "scene-street", label: "超市出口街边" },
    { id: "scene-door", label: "公寓门口" },
    { id: "scene-errand-entry", label: "归家玄关" },
  ],
};

function plannerInput(topic, availableSceneLibrary) {
  return {
    topic,
    characterProfile: "32岁左右成熟女性",
    season: "秋",
    lifestyleFeeling: "安静 / 克制",
    duration: 15,
    availableSceneLibrary,
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertFailed(result, code) {
  assert(result.status === "SCENE_RESOLUTION_FAILED", `Expected SCENE_RESOLUTION_FAILED, received ${result.status}`);
  assert(result.failureReasons?.some((reason) => reason.startsWith(`${code}:`)), `Expected failure code ${code}, received ${result.failureReasons?.join(" | ") ?? "none"}`);
}

try {
  await writeFile(
    entryPath,
    `export * from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/index.ts"))};\n` +
    `export { compileSeedanceVideoScript } from ${JSON.stringify(resolve(projectRoot, "src/video-script/compileSeedanceVideoScript.ts"))};\n` +
    `export { compileSoftSeedingThemeVideoScript } from ${JSON.stringify(resolve(projectRoot, "src/video-script/compileSeedanceThemeVideoScript.ts"))};\n` +
    `export { generateSoftSeedingContent } from ${JSON.stringify(resolve(projectRoot, "src/utils/generateSoftSeedingContent.ts"))};\n` +
    `export { generatePromptRuntime } from ${JSON.stringify(resolve(projectRoot, "src/prompt-engine/runtime.ts"))};\n`
  );
  await build({ entryPoints: [entryPath], bundle: true, format: "esm", platform: "node", outfile: bundlePath, logLevel: "silent" });
  const {
    CURRENT_LOCATION_WORLDS,
    CURRENT_SCENE_RESOLUTION_RULES,
    buildSceneResolverInput,
    compileSeedanceVideoScript,
    compileSoftSeedingThemeVideoScript,
    generatePromptRuntime,
    generateSoftSeedingContent,
    planImmersiveNarrative,
    resolveNarrativeScenes,
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  const returnHomePlan = planImmersiveNarrative(plannerInput("下班回家", sceneLibrary.returnHome));
  const returnHomeInput = buildSceneResolverInput(returnHomePlan, "下班回家");
  const approved = resolveNarrativeScenes(returnHomeInput);
  assert(approved.status === "SCENE_RESOLUTION_APPROVED", `Return-home resolution failed: ${approved.failureReasons?.join(" | ") ?? "unknown"}`);
  assert(approved.locationWorld?.id === "HOME_ARRIVAL", "Return-home resolution did not select HOME_ARRIVAL");
  assert(approved.resolvedMoments.length === 5, "Return-home resolution must resolve all five moments");
  assert(approved.resolvedMoments.every((moment) => moment.sceneId === "lifestyle-returning-home"), "Return-home resolution invented a scene");
  assert(Object.values(approved.qc).every((gate) => gate.status === "PASS"), "Approved resolution did not pass all four Scene Resolver QC gates");
  approved.resolvedMoments.forEach((moment, index) => {
    assert(moment.originalWhatHappens === returnHomePlan.moments[index].whatHappens, "Scene Resolver changed What Happens");
    assert(moment.originalPurpose === returnHomePlan.moments[index].purposeLabel, "Scene Resolver changed Purpose");
  });

  const fourMomentInput = clone(returnHomeInput);
  fourMomentInput.moments = fourMomentInput.moments.filter((moment) => moment.purpose !== "response");
  const fourMomentResolution = resolveNarrativeScenes(fourMomentInput);
  assert(fourMomentResolution.status === "SCENE_RESOLUTION_APPROVED", "Four-moment Narrative must remain resolvable");
  assert(fourMomentResolution.resolvedMoments.length === 4, "Four-moment resolution lost a moment");

  const coverage = [
    ["下班回家", sceneLibrary.returnHome, "SCENE_RESOLUTION_APPROVED"],
    ["出门", sceneLibrary.departure, "SCENE_RESOLUTION_APPROVED"],
    ["周末书店", sceneLibrary.bookstore, "SCENE_RESOLUTION_APPROVED"],
    ["等人", sceneLibrary.waiting, "SCENE_RESOLUTION_APPROVED"],
    ["咖啡馆", sceneLibrary.cafe, "SCENE_RESOLUTION_APPROVED"],
    ["采购归来", sceneLibrary.errand, "SCENE_RESOLUTION_APPROVED"],
  ];
  const coverageSummary = [];
  for (const [topic, scenes, expectedStatus] of coverage) {
    const plan = planImmersiveNarrative(plannerInput(topic, scenes));
    const failedNarrativeGates = Object.values(plan.qc).filter((gate) => gate.status === "FAIL").map((gate) => gate.label);
    assert(
      plan.status === "APPROVED_FOR_SCENE_RESOLUTION",
      `${topic} Planner must be approved before Scene Resolver coverage${failedNarrativeGates.length ? `; failed: ${failedNarrativeGates.join(", ")}; location: ${plan.qc.location_logic.reason}` : ""}`
    );
    const resolution = resolveNarrativeScenes(buildSceneResolverInput(plan, topic));
    assert(resolution.status === expectedStatus, `${topic} expected ${expectedStatus}, received ${resolution.status}`);
    if (resolution.status === "SCENE_RESOLUTION_FAILED") {
      assert(Boolean(resolution.failureReasons?.length), `${topic} failed without a failure reason`);
    }
    coverageSummary.push({ topic, status: resolution.status, world: resolution.locationWorld?.id ?? null });
    if (topic === "出门") {
      assert(resolution.resolvedMoments.at(-1)?.sceneId === "lifestyle-residential-building-exit", "Leaving-home resolution did not use the residential building exit scene");
    }
    if (topic === "周末书店") {
      assert(resolution.resolvedMoments.at(-1)?.sceneId === "lifestyle-bookstore-interior", "Bookstore resolution did not use the interior scene");
    }
    if (topic === "采购归来") {
      assert(resolution.resolvedMoments.at(-1)?.sceneId === "lifestyle-home-errand-entry", "Errand resolution did not use the home errand entry scene");
    }
  }

  assertFailed(
    resolveNarrativeScenes({ ...returnHomeInput, narrativeStatus: "BLOCKED" }),
    "NARRATIVE_NOT_APPROVED"
  );

  const missingLibrary = resolveNarrativeScenes(returnHomeInput, { sceneLibrary: [] });
  assertFailed(missingLibrary, "SCENE_ID_NOT_FOUND");
  assert(missingLibrary.qc.no_scene_invention.status === "FAIL", "Missing Scene Library ids must fail No Scene Invention");

  const forbiddenLocation = clone(returnHomeInput);
  forbiddenLocation.moments[3].whatHappens = "She pauses outside a bookstore before returning home.";
  const mutationRequired = resolveNarrativeScenes(forbiddenLocation);
  assertFailed(mutationRequired, "NARRATIVE_MUTATION_REQUIRED");
  assert(mutationRequired.qc.narrative_preserved.status === "FAIL", "A narrative rewrite requirement must fail Narrative Preserved");

  const crossWorld = clone(returnHomeInput);
  crossWorld.moments[3].whatHappens = "She crosses into a grassland picnic before returning home.";
  const crossWorldResult = resolveNarrativeScenes(crossWorld);
  assertFailed(crossWorldResult, "NARRATIVE_MUTATION_REQUIRED");

  const returnHomeRule = CURRENT_SCENE_RESOLUTION_RULES.find((rule) => rule.topics.includes("after_work_home"));
  assert(Boolean(returnHomeRule), "Return-home resolver rule is missing");
  const brokenRule = {
    ...returnHomeRule,
    sceneAssignments: {
      ...returnHomeRule.sceneAssignments,
      response: "lifestyle-grassland-picnic",
    },
  };
  const brokenRuleResult = resolveNarrativeScenes(returnHomeInput, {
    rules: [brokenRule],
    locationWorlds: CURRENT_LOCATION_WORLDS,
  });
  assertFailed(brokenRuleResult, "LOCATION_WORLD_MISMATCH");

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

  console.log("Narrative Scene Resolver V1 validation passed:", JSON.stringify({
    coverage: coverageSummary,
    approvedMoments: approved.resolvedMoments.length,
    fourMomentResolution: fourMomentResolution.status,
    failureCases: ["NARRATIVE_NOT_APPROVED", "SCENE_ID_NOT_FOUND", "NARRATIVE_MUTATION_REQUIRED", "LOCATION_WORLD_MISMATCH"],
    backwardCompatibility: "PASS",
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
