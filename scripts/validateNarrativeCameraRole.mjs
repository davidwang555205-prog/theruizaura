import { build } from "esbuild";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-camera-role-validation-"));
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertApproved(result, label) {
  assert(result.status === "CAMERA_NARRATIVE_APPROVED", `${label} expected CAMERA_NARRATIVE_APPROVED, received ${result.status}: ${result.failureReasons?.join(" | ") ?? "no reason"}`);
  assert(Object.values(result.qc).every((gate) => gate.status === "PASS"), `${label} failed a Camera Narrative QC gate`);
}

function assertFailed(result, code) {
  assert(result.status === "CAMERA_NARRATIVE_FAILED", `Expected CAMERA_NARRATIVE_FAILED, received ${result.status}`);
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
    NARRATIVE_TOPIC_CATALOG,
    buildCameraNarrativeInput,
    buildProductPresenceInput,
    buildSceneResolverInput,
    buildSoundWorldInput,
    compileSeedanceVideoScript,
    compileSoftSeedingThemeVideoScript,
    generatePromptRuntime,
    generateSoftSeedingContent,
    lifestyleSoftSeedingScenePool,
    planCameraNarrative,
    planImmersiveNarrative,
    planProductPresence,
    planSoundWorld,
    resolveNarrativeScenes,
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  assert(lifestyleSoftSeedingScenePool.length === 39, `Scene Library changed from 39 to ${lifestyleSoftSeedingScenePool.length}`);
  const normalResults = [];
  const inputs = new Map();

  for (const topic of NARRATIVE_TOPIC_CATALOG) {
    const plan = planImmersiveNarrative({
      topic: topic.label,
      characterProfile: "32岁左右成熟女性",
      season: "秋",
      lifestyleFeeling: "安静 / 克制",
      duration: 15,
      availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({
        id: `camera-scene-${topic.id}-${index + 1}`,
        label,
      })),
    });
    const scene = resolveNarrativeScenes(buildSceneResolverInput(plan, topic.label));
    const product = planProductPresence(buildProductPresenceInput(plan, scene, topic.label));
    const sound = planSoundWorld(buildSoundWorldInput(plan, scene, product, topic.label));
    const cameraInput = buildCameraNarrativeInput(plan, scene, product, sound);
    inputs.set(topic.id, cameraInput);
    const camera = planCameraNarrative(cameraInput);
    assertApproved(camera, topic.label);
    assert(camera.moments.length === 5, `${topic.label} Camera Role must contain five moments`);
    assert(camera.moments.filter((moment) => moment.role === "PARTIAL_OBSERVATION").length <= 1, `${topic.label} used too many PARTIAL_OBSERVATION roles`);
    camera.moments.forEach((moment, index) => {
      assert(moment.momentIndex === index, `${topic.label} Camera Role changed Moment order`);
      assert(["OBSERVER", "FOLLOWER", "WAITING_CAMERA", "AFTER_ACTION", "PARTIAL_OBSERVATION"].includes(moment.role), `${topic.label} emitted an invalid Camera Role`);
      assert(moment.cameraIntent.followsSubjectMovement === (moment.role === "FOLLOWER"), `${topic.label} emitted inconsistent FOLLOWER intent`);
      assert(moment.cameraIntent.cameraPreExistsInSpace === (moment.role === "WAITING_CAMERA" || moment.role === "AFTER_ACTION"), `${topic.label} emitted inconsistent pre-existing camera intent`);
      assert(moment.cameraIntent.allowsPartialBodyObservation === (moment.role === "PARTIAL_OBSERVATION"), `${topic.label} emitted inconsistent partial-observation intent`);
    });
    normalResults.push({ topic: topic.label, roles: camera.moments.map((moment) => moment.role), status: camera.status });
  }

  const returnHome = planCameraNarrative(inputs.get("after_work_home"));
  assert(returnHome.moments.at(-1).role === "AFTER_ACTION", "Return-home ending should allow AFTER_ACTION");

  const activeEndingRule = {
    topicId: "city_wandering",
    label: "Forced active ending validation",
    baseline: ["WAITING_CAMERA", "FOLLOWER", "FOLLOWER", "OBSERVER", "AFTER_ACTION"],
    description: "Validation-only forced AFTER_ACTION rule.",
    forceAfterAction: true,
  };
  const activeEnding = planCameraNarrative(inputs.get("city_wandering"), { rules: [activeEndingRule] });
  assertFailed(activeEnding, "AFTER_ACTION_CONFLICT");
  assert(activeEnding.qc.role_motivated_by_action.status === "FAIL", "Active ending conflict did not fail Role Motivated By Action");

  const productDrivenRule = {
    topicId: "after_work_home",
    label: "Product driven validation",
    baseline: ["WAITING_CAMERA", "FOLLOWER", "OBSERVER", "OBSERVER", "AFTER_ACTION"],
    description: "Validation-only product-driven role rule.",
    productDriven: true,
  };
  const productDriven = planCameraNarrative(inputs.get("after_work_home"), { rules: [productDrivenRule] });
  assertFailed(productDriven, "PRODUCT_DRIVEN_CAMERA");
  assert(productDriven.qc.no_product_driven_camera.status === "FAIL", "Product-driven camera did not fail its QC gate");

  const partialProductRule = {
    topicId: "after_work_home",
    label: "Product close-up validation",
    baseline: ["WAITING_CAMERA", "FOLLOWER", "OBSERVER", "OBSERVER", "AFTER_ACTION"],
    description: "Validation-only product close-up rule.",
    partialObservationPurpose: "product",
  };
  const partialProduct = planCameraNarrative(inputs.get("after_work_home"), { rules: [partialProductRule] });
  assertFailed(partialProduct, "PARTIAL_OBSERVATION_PRODUCT_CLOSEUP");

  const overdirectionRule = {
    topicId: "after_work_home",
    label: "Overdirection validation",
    baseline: ["WAITING_CAMERA", "FOLLOWER", "PARTIAL_OBSERVATION", "OBSERVER", "AFTER_ACTION"],
    description: "Validation-only overdirection rule.",
    overdirected: true,
  };
  const overdirected = planCameraNarrative(inputs.get("after_work_home"), { rules: [overdirectionRule] });
  assertFailed(overdirected, "CAMERA_OVERDIRECTION");
  assert(overdirected.qc.no_overdirection.status === "FAIL", "Overdirection did not fail No Overdirection");

  const mutatedInput = clone(inputs.get("after_work_home"));
  mutatedInput.soundMoments[0].originalWhatHappens = "A different action.";
  const mutated = planCameraNarrative(mutatedInput);
  assertFailed(mutated, "NARRATIVE_NOT_PRESERVED");
  assert(mutated.qc.narrative_preserved.status === "FAIL", "Narrative mutation did not fail Narrative Preserved");

  assertFailed(planCameraNarrative({ ...inputs.get("after_work_home"), soundWorldStatus: "SOUND_WORLD_FAILED" }), "SOUND_WORLD_NOT_APPROVED");
  assertFailed(planCameraNarrative({ ...inputs.get("after_work_home"), productPresenceStatus: "PRODUCT_PRESENCE_FAILED" }), "PRODUCT_PRESENCE_NOT_APPROVED");

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

  console.log("Camera Narrative Role V1 validation passed:", JSON.stringify({
    sceneLibraryCount: lifestyleSoftSeedingScenePool.length,
    normalResults,
    endingAfterAction: returnHome.moments.at(-1).role,
    failureCases: ["AFTER_ACTION_CONFLICT", "PRODUCT_DRIVEN_CAMERA", "PARTIAL_OBSERVATION_PRODUCT_CLOSEUP", "CAMERA_OVERDIRECTION", "NARRATIVE_NOT_PRESERVED", "SOUND_WORLD_NOT_APPROVED", "PRODUCT_PRESENCE_NOT_APPROVED"],
    backwardCompatibility: "PASS",
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
