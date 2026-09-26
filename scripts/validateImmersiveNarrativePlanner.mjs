import { build } from "esbuild";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-narrative-planner-validation-"));
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
    { id: "scene-hall", label: "公寓走廊" },
    { id: "scene-entry", label: "归家玄关" },
    { id: "scene-kitchen", label: "厨房" },
  ],
};

function baseInput(overrides = {}) {
  return {
    topic: "下班回家",
    characterProfile: "32岁左右成熟女性",
    season: "秋",
    lifestyleFeeling: "安静 / 克制",
    duration: 15,
    availableSceneLibrary: sceneLibrary.returnHome,
    ...overrides,
  };
}

function assertApproved(plan, label) {
  const failedGates = Object.values(plan.qc).filter((gate) => gate.status === "FAIL");
  assert(plan.status === "APPROVED_FOR_SCENE_RESOLUTION", `${label} must be approved for scene resolution${failedGates.length ? `; failed: ${failedGates.map((gate) => `${gate.label} (${gate.reason})`).join(", ")}` : ""}`);
  assert(plan.momentCount === 5, `${label} must contain five moments`);
  assert(plan.moments.map((moment) => moment.purpose).join("|") === "establish_state|approach_trigger|micro_event|response|after_state", `${label} must preserve the standard five-moment purpose sequence`);
  assert(Object.values(plan.qc).every((gate) => gate.status === "PASS"), `${label} failed at least one Narrative QC gate`);
  assert(plan.compiledText.includes("[NARRATIVE CORE]"), `${label} is missing the Narrative Core section`);
  assert(plan.compiledText.includes("[MOMENT CHAIN]"), `${label} is missing the Moment Chain section`);
  assert(plan.compiledText.includes("[NARRATIVE QC]"), `${label} is missing the Narrative QC section`);
  assert(plan.compiledText.includes("APPROVED FOR SCENE RESOLUTION"), `${label} is missing the approval handoff status`);
  assert(!/\b(?:camera|lens|focal length|framing|lighting|close-up|wide shot)\b/i.test(plan.compiledText), `${label} leaked camera-language ownership`);
  assert(!/\b(?:product protection|sneaker|shoe|footwear|reference mapping|seedance)\b/i.test(plan.compiledText), `${label} leaked downstream execution ownership`);
  assert(!/\b(?:look at the camera|smile at the camera|fashion pose|runway walk|show the shoes?)\b/i.test(plan.compiledText), `${label} contains performative behavior`);
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
    NarrativePlannerError,
    compileSeedanceVideoScript,
    compileSoftSeedingThemeVideoScript,
    generatePromptRuntime,
    generateSoftSeedingContent,
    parseSceneLibraryText,
    planImmersiveNarrative,
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  const returnHome = planImmersiveNarrative(baseInput());
  assertApproved(returnHome, "Return-home plan");
  assert(returnHome.moments.every((moment) => sceneLibrary.returnHome.some((scene) => scene.id === moment.sceneId)), "Return-home plan invented a scene outside the available library");
  assert(/misses the key on the first touch.*finds the key.*unlocks the door/i.test(returnHome.moments[2].whatHappens), "Return-home key interaction is not completed in one Micro Event");
  assert(returnHome.moments[4].whatHappens.includes("玄关"), "Return-home after-state did not use the available interior scene");
  assert(JSON.stringify(returnHome) === JSON.stringify(planImmersiveNarrative(baseInput())), "Narrative Planner output is not deterministic for identical input");

  const plans = [
    planImmersiveNarrative(baseInput({ topic: "出门", availableSceneLibrary: sceneLibrary.departure })),
    planImmersiveNarrative(baseInput({ topic: "周末书店", availableSceneLibrary: sceneLibrary.bookstore })),
    planImmersiveNarrative(baseInput({ topic: "等人", availableSceneLibrary: sceneLibrary.waiting })),
    planImmersiveNarrative(baseInput({ topic: "买咖啡", availableSceneLibrary: sceneLibrary.cafe })),
    planImmersiveNarrative(baseInput({ topic: "采购归来", availableSceneLibrary: sceneLibrary.errand })),
  ];
  plans.forEach((plan, index) => assertApproved(plan, `Archetype plan ${index + 2}`));

  const parsedScenes = parseSceneLibraryText("电梯\n公寓走廊\n公寓门口\n玄关\n电梯");
  assert(parsedScenes.length === 4, "Scene library parser did not remove duplicate labels");
  assert(parsedScenes.every((scene) => scene.id.startsWith("scene-") && scene.label.length > 0), "Scene library parser returned an invalid scene item");

  for (const [code, input] of [
    ["INVALID_DURATION", baseInput({ duration: 10 })],
    ["MISSING_TOPIC", baseInput({ topic: " " })],
    ["MISSING_CHARACTER_PROFILE", baseInput({ characterProfile: "" })],
    ["MISSING_LIFESTYLE_FEELING", baseInput({ lifestyleFeeling: "" })],
    ["EMPTY_SCENE_LIBRARY", baseInput({ availableSceneLibrary: [] })],
    ["UNSUPPORTED_TOPIC", baseInput({ topic: "机场转机" })],
  ]) {
    let thrown = null;
    try {
      planImmersiveNarrative(input);
    } catch (error) {
      thrown = error;
    }
    assert(thrown instanceof NarrativePlannerError, `Expected ${code} to throw NarrativePlannerError`);
    assert(thrown.code === code, `Expected ${code} but received ${thrown.code}`);
  }

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
  assert(!imagePrompt.prompt.includes("[NARRATIVE CORE]"), "Narrative Planner leaked into the existing Image Prompt runtime");
  assert(!seedanceVideoScript.script.includes("[NARRATIVE CORE]"), "Narrative Planner leaked into the existing Seedance compiler");
  assert(seedanceVideoScript.filmSpec.beats.length === 4, "Existing 15-second Seedance rhythm changed");
  assert(!unifiedThemeVideoScript.script.includes("[NARRATIVE CORE]"), "Narrative Planner leaked into the unified Lifestyle video script");

  const actualHashes = {
    imagePrompt: hash(imagePrompt.prompt),
    lifestyleJson: hash(JSON.stringify(lifestyleContent)),
    seedanceVideoScript: hash(seedanceVideoScript.script),
    unifiedThemeVideoScript: hash(unifiedThemeVideoScript.script),
  };
  for (const [key, actual] of Object.entries(actualHashes)) {
    const expected = BACKWARD_COMPATIBILITY_HASHES[key];
    if (expected === "CAPTURE") {
      console.log(`[capture] ${key}: ${actual}`);
    } else {
      assert(actual === expected, `Backward compatibility hash changed for ${key}`);
    }
  }

  console.log("Immersive Narrative Planner V1 legacy regression passed: original six archetype compatibility, five-moment causality, eight QC gates, 15-second continuity, scene-library containment, deterministic output, and no Lifestyle/Seedance runtime mutation. The 13-topic expansion is covered by validate:narrative-topic-pipeline.");
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
