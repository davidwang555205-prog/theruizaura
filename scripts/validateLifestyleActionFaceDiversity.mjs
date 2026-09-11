import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const directory = await mkdtemp(join(tmpdir(), "theruizaura-lifestyle-action-face-"));
const entry = join(directory, "entry.ts");
const bundle = join(directory, "bundle.mjs");
const failures = [];
let checks = 0;

const expect = (condition, message, evidence) => {
  checks += 1;
  if (!condition) failures.push({ message, evidence });
};

const baseParams = {
  imageType: "生活场景图",
  modelChoice: "30–45岁客户画像模特",
  modelContinuity: "新人物",
  shoe: "自定义",
  customShoe: "上传参考鞋款",
  season: "秋",
  scenePreference: "自动匹配",
  garmentTypePreference: "自动匹配",
  studioLaunchAnglePreference: "自动匹配",
  studioLaunchPreset: "auto",
  studioWardrobePreference: "auto",
  stillLifeStyle: "与主视觉统一",
  extraRequirement: "",
  generationNonce: 19,
  productTruthAssetIds: ["reference-overall"],
  referencePlan: {
    provider: "image2",
    referenceSetId: "set-action-face",
    assetIds: ["reference-overall"],
    order: ["reference-overall"],
    orderedAssets: [{
      assetId: "reference-overall",
      roles: ["overall_structure"],
      priority: 1,
      required: true,
      coverage: ["silhouette"],
      reason: "confirmed reference",
      cardApplicability: "all"
    }],
    referencePlanReady: true,
    manualExecutionReady: true,
    providerExecutionReady: false,
    diagnostics: []
  },
  selectedProductTruth: {
    confidence: "Medium",
    source: "current_task_uploaded_images",
    evidence: [{ id: "reference-overall", name: "overall", role: "overall_structure" }],
    missingEvidence: [],
    taskProductTruthId: "truth-action-face",
    referenceSetId: "set-action-face",
    sourceType: "uploaded_reference_set",
    productCategory: "footwear",
    version: "v1",
    status: "draft",
    productTruthMode: "reference_bound",
    referenceEvidenceBound: true,
    structuredFactsExtracted: false,
    manualExecutionReady: true,
    providerExecutionReady: false,
    productionReady: false,
    facts: {},
    factEvidence: {},
    coverage: ["silhouette", "material_evidence"],
    missingCoverage: [],
    createdAt: "2026-09-11T00:00:00.000Z"
  }
};

const sceneActionLeakPatterns = [
  /\bshort natural walking step\b/i,
  /\bshort natural step or quiet pause\b/i,
  /\bsmall natural step\b/i,
  /\bnatural walking posture or a short waiting pause\b/i,
  /\bshort safe step\b/i,
  /\bcompact walking step\b/i,
  /\bshort natural stride\b/i,
  /\bcompact step or soft standing pause\b/i,
  /\bnatural standing pause or short walk\b/i,
  /\bwalking or standing moment\b/i,
  /\bgallery walking or standing moment\b/i,
  /\bsmall natural garment adjustment\b/i,
  /\bsmall clothing adjustment\b/i,
  /\bsubtle turn toward a friend\b/i,
  /\bnatural seated posture\b/i,
  /\bsit-to-stand or settling pause\b/i
];

const noWalkingScenePreferences = new Set([
  "朋友午餐",
  "咖啡馆内",
  "窗边阅读",
  "衣帽间 / 更衣角",
  "健身房内",
  "停车场到电梯口",
  "楼下便利店 / 咖啡外带"
]);

try {
  await writeFile(entry, [
    `export { generateSoftSeedingContent } from ${JSON.stringify(resolve(root, "src/utils/generateSoftSeedingContent.ts"))};`,
    `export { personActionLibrary, PERSON_ACTION_LIBRARY_EXPECTED_COUNT } from ${JSON.stringify(resolve(root, "src/data/personActionLibrary.ts"))};`,
    `export { selectDiversePersonActions } from ${JSON.stringify(resolve(root, "src/utils/selectDiverseSeriesActions.ts"))};`,
    `export { setPromptEngineConfig } from ${JSON.stringify(resolve(root, "src/prompt-engine/promptFeatureFlags.ts"))};`
  ].join("\n"));

  await build({
    entryPoints: [entry],
    bundle: true,
    outfile: bundle,
    format: "esm",
    platform: "node",
    target: "node20",
    logLevel: "silent"
  });

  const {
    generateSoftSeedingContent,
    personActionLibrary,
    PERSON_ACTION_LIBRARY_EXPECTED_COUNT,
    selectDiversePersonActions,
    setPromptEngineConfig
  } = await import(`${pathToFileURL(bundle).href}?v=${Date.now()}`);

  setPromptEngineConfig({ mode: "new" });
  expect(PERSON_ACTION_LIBRARY_EXPECTED_COUNT >= 300, "Action library unexpectedly shrank.", PERSON_ACTION_LIBRARY_EXPECTED_COUNT);

  const scenarios = [
    ["natural_life", "standard"],
    ["urban_commute", "standard"],
    ["natural_life", "telephoto_candid"],
    ["urban_commute", "telephoto_candid"]
  ];

  for (const [contentCategory, captureStyle] of scenarios) {
    for (const variantOffset of [0, 1, 7, 19, 31]) {
      const content = generateSoftSeedingContent({
        baseParams: { ...baseParams, generationNonce: 100 + variantOffset * 17 },
        topic: "生活场景软种草",
        imageCount: 5,
        contentCategory,
        captureStyle,
        date: new Date("2026-09-11T00:00:00.000Z"),
        variantOffset
      });

      const actions = content.images
        .map((image) => personActionLibrary.find((action) => action.id === image.params.seriesActionKey))
        .filter(Boolean);
      const actionIds = actions.map((action) => action.id);
      const actionFamilies = actions.map((action) => action.diversityFamily);
      const visualLegFamilies = actions.map((action) => action.visualLegPoseFamily);
      const handTasks = actions.map((action) => action.handTask);
      const movementPhases = actions.map((action) => action.movementPhase);
      const orientations = actions.map((action) => action.bodyOrientation);
      const visualSignatures = actions.map((action) => [
        action.diversityFamily,
        action.poseType,
        action.bodyOrientation,
        action.movementPhase,
        action.handTask,
        action.visualLegPoseFamily
      ].join("|"));

      const label = `${contentCategory}/${captureStyle}/variant-${variantOffset}`;
      expect(content.images.length === 5, `${label}: expected five cards.`, content.images.map((image) => image.name));
      expect(actions.length === 5, `${label}: all five cards need person actions.`, content.images.map((image) => image.params.seriesActionKey));
      expect(new Set(actionIds).size === 5, `${label}: action ids repeated.`, actionIds);
      expect(new Set(visualSignatures).size === 5, `${label}: full visual action signatures repeated.`, visualSignatures);
      expect(new Set(actionFamilies).size >= 4, `${label}: too many cards reuse the same action semantic family.`, actionFamilies);
      expect(new Set(visualLegFamilies).size === 5, `${label}: five-card leg silhouettes are not visually distinct.`, visualLegFamilies);
      expect(new Set(handTasks).size >= 3, `${label}: hand tasks are too repetitive.`, handTasks);
      expect(handTasks.filter((task) => task === "pocketEdge").length <= 1, `${label}: pocket-edge cue repeats and may collapse into the same visible pose.`, handTasks);
      expect(new Set(movementPhases).size >= 3, `${label}: movement phases are too repetitive.`, movementPhases);
      expect(new Set(orientations).size >= 2, `${label}: body orientation is too repetitive.`, orientations);

      const faceVariationIds = [];
      for (const image of content.images) {
        const locks = [...image.prompt.matchAll(/Face variation lock for this card \(([^)]+)\):/g)];
        expect(locks.length === 1, `${label}/${image.name}: expected exactly one structured Face Variation Lock.`, image.prompt);
        if (locks[0]?.[1]) faceVariationIds.push(locks[0][1]);
        expect(!/Head-and-face beat for this card:/i.test(image.prompt), `${label}/${image.name}: legacy face beat still competes with the structured face lock.`, image.prompt);
        expect(
          /do not reuse the previous face-visible card's gaze target, eyelid tension, mouth state, or head angle/i.test(image.prompt),
          `${label}/${image.name}: face anti-repeat boundary missing.`,
          image.prompt
        );
        expect(
          !sceneActionLeakPatterns.some((pattern) => pattern.test(image.prompt)),
          `${label}/${image.name}: scene-level action language still competes with the action planner.`,
          image.prompt
        );
        expect((image.prompt.match(/Person action lock:/g) ?? []).length === 1, `${label}/${image.name}: expected one primary Person action lock.`, image.prompt);
        expect(!/\b(undefined|null)\b/i.test(image.prompt), `${label}/${image.name}: unresolved token in prompt.`, image.prompt);

        const action = personActionLibrary.find((item) => item.id === image.params.seriesActionKey);
        if (action && noWalkingScenePreferences.has(image.params.scenePreference)) {
          expect(action.poseType !== "walking", `${label}/${image.name}: stationary/social scene received a walking pose.`, { scene: image.params.scenePreference, action });
          expect(!["forward", "diagonal", "lateral"].includes(action.travelDirection), `${label}/${image.name}: stationary/social scene received travel movement.`, { scene: image.params.scenePreference, action });
        }

        if (captureStyle === "telephoto_candid") {
          expect(!/camera acknowledgement|eye contact with the lens/i.test(locks[0]?.[0] ?? ""), `${label}/${image.name}: telephoto face lock became camera-aware.`, locks[0]?.[0]);
          expect(/off-camera|rather than the lens|never toward the lens|no eye contact with the lens|no camera awareness|outside the frame/i.test(image.prompt), `${label}/${image.name}: telephoto gaze boundary missing.`, image.prompt);
        } else if (locks[0]?.[1] !== "lifestyle-face-camera-acknowledgement") {
          expect(/off-camera|away from the lens|fully off-camera|outside the frame|never on the lens|do not acknowledge the camera|do not redirect the eyes toward the lens/i.test(locks[0]?.[0] ?? ""), `${label}/${image.name}: non-primary standard face beat may still drift back to camera acknowledgement.`, locks[0]?.[0]);
        }
      }

      expect(new Set(faceVariationIds).size === 5, `${label}: five cards reused a face-variation id.`, faceVariationIds);
    }
  }

  const compatibilityCards = [
    { imageType: "生活场景图", scenePreference: "朋友午餐" },
    { imageType: "生活场景图", scenePreference: "咖啡馆内" },
    { imageType: "生活场景图", scenePreference: "窗边阅读" },
    { imageType: "生活场景图", scenePreference: "衣帽间 / 更衣角" },
    { imageType: "生活场景图", scenePreference: "健身房内" }
  ];
  const compatibilityActions = selectDiversePersonActions({
    cards: compatibilityCards,
    topic: "生活场景软种草",
    variantIndex: 51,
    generationNonce: 511,
    captureStyle: "standard"
  });

  compatibilityActions.forEach((action, index) => {
    const scenePreference = compatibilityCards[index].scenePreference;
    expect(!!action, `compatibility/${scenePreference}: expected an action.`, action);
    if (!action) return;
    expect(action.poseType !== "walking", `compatibility/${scenePreference}: walking action leaked into a no-walking scene.`, action);
    expect(!["forward", "diagonal", "lateral"].includes(action.travelDirection), `compatibility/${scenePreference}: travel direction leaked into a no-walking scene.`, action);
  });

  if (failures.length) {
    console.error("Lifestyle action/face diversity validation failed:", JSON.stringify({ checks, failures: failures.slice(0, 50) }, null, 2));
    process.exitCode = 1;
  } else {
    console.log("Lifestyle action/face diversity validation passed:", JSON.stringify({ checks, scenarios: scenarios.length, variantsPerScenario: 5 }, null, 2));
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}
