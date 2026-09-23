import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-commercial-creative-direction-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const coverage = [
  "silhouette",
  "toe_structure",
  "side_panel_structure",
  "heel_structure",
  "outsole_profile",
  "color_blocking",
  "material_evidence",
];

const reference = {
  referenceSetId: "creative-direction-reference-set",
  taskId: "creative-direction-task",
  sourceType: "current_task_reference_set",
  confirmationStatus: "confirmed",
  confirmedReferenceCount: 3,
  confirmedAssetIds: ["front", "side", "material"],
  coverage,
  missingCoverage: [],
  referencePlanReady: true,
  productTruthMode: "reference_bound",
  productTruth: {
    coverage,
    status: "draft",
    referenceEvidenceBound: true,
    productTruthMode: "reference_bound",
  },
};

const intents = [
  "URBAN_MOTION",
  "DAILY_STYLING",
  "QUIET_LUXURY",
  "PRODUCT_CRAFT",
  "NEW_ARRIVAL",
];

const creativeModes = [
  "PRIVATE_MOMENT",
  "CITY_JOURNEY",
  "EVERYDAY_MOVEMENT",
  "STATE_TRANSITION",
  "SENSORY_LIFE",
  "SINGLE_IDEA",
];

const cameraBehaviors = [
  "OBSERVE",
  "FOLLOW",
  "WAIT",
  "DISCOVER",
  "PASS_BY",
  "GROUND_OBSERVATION",
  "DETAIL_INTERRUPTION",
  "WITHHOLD",
  "REVEAL",
];

const editLogics = [
  "ACTION_CUT",
  "MATCH_MOVEMENT",
  "SENSORY_INSERT",
  "DELAYED_REVEAL",
];

const motifs = ["THRESHOLD", "LIGHT", "REFLECTION", "SHADOW", "LINE", "REPETITION"];
const cutMotivations = [
  "ACTION_COMPLETION",
  "ACTION_CONTINUATION",
  "VISUAL_MATCH",
  "ATTENTION_SHIFT",
  "SPATIAL_TRANSITION",
  "PRODUCT_DISCOVERY",
  "EMOTIONAL_RELEASE",
];

const brandNames = [
  "Miu Miu",
  "Prada",
  "Ferragamo",
  "Tod's",
  "Loewe",
  "Gucci",
  "Bottega Veneta",
  "Dior",
];

function requestFor(intent, nonce = 0, overrides = {}) {
  return {
    commercialIntent: intent,
    characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 自然 / 克制",
    duration: 15,
    reference,
    generationNonce: nonce,
    ...overrides,
  };
}

function assertLeakageFree(text, label) {
  const enumTokens = [
    ...creativeModes,
    ...cameraBehaviors,
    ...editLogics,
    ...motifs,
    ...cutMotivations,
    "URBAN_MOTION",
    "DAILY_STYLING",
    "QUIET_LUXURY",
    "PRODUCT_CRAFT",
    "NEW_ARRIVAL",
    "EFFORTLESSNESS",
    "CONFIDENCE",
    "COMFORT",
    "VERSATILITY",
    "QUIET_REFINEMENT",
    "EVERYDAY_EASE",
    "SELF_POSSESSION",
    "LIGHTNESS",
    "BELONGING",
    "UNFORCED_STYLE",
    "IMMEDIATE",
    "PROGRESSIVE",
    "DELAYED",
    "ABSENT",
    "IMPLIED",
    "PARTIAL",
    "SECONDARY",
    "CLEAR",
    "ESTABLISH",
    "INVITE",
    "DISCOVER",
    "CONFIRM",
    "RESOLVE",
  ];
  const leaked = enumTokens.filter((token) => new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text));
  assert(leaked.length === 0, `${label} leaked internal enum values: ${leaked.join(", ")}.`);
  for (const phrase of [
    "dramatic function",
    "audience desire",
    "story spine",
    "product meaning",
    "reveal strategy",
    "creative mode",
    "camera behavior",
    "edit logic",
    "visual motif",
    "cut motivation",
  ]) {
    assert(!text.toLowerCase().includes(phrase), `${label} leaked internal phrase "${phrase}".`);
  }
  assert(!/\b(?:QC|validator|enum|source id|primitive id)\b/i.test(text), `${label} leaked compiler or validation language.`);
  assert(!/\b(?:standing|walking|transition|turning|garment-task|scene-interaction|environment-response|on-foot|seated|studio-[a-z-]+|mirror-[a-z-]+)-\d{3}\b/i.test(text), `${label} leaked an Action ID.`);
  for (const brand of brandNames) {
    assert(!new RegExp(brand, "i").test(text), `${label} leaked a named brand: ${brand}.`);
  }
}

function distributionValid(direction) {
  const counts = new Map();
  direction.cameraBehaviorByShot.forEach((behavior) => counts.set(behavior, (counts.get(behavior) ?? 0) + 1));
  return new Set(direction.cameraBehaviorByShot).size >= 3
    && Math.max(...counts.values()) <= 2
    && direction.shotDirections.find((shot) => shot.shotRole === "HERO")?.cameraBehavior !== "WITHHOLD";
}

function cutChainValid(direction) {
  const motivations = direction.shotDirections.map((shot) => shot.cutMotivation);
  return motivations.length === 5
    && motivations.every(Boolean)
    && motivations[0] === "SPATIAL_TRANSITION"
    && motivations[4] === "EMOTIONAL_RELEASE";
}

function revealCompatible(plan) {
  const spine = plan.creativeSpine;
  const presence = spine.productPresenceByShot;
  if (spine.revealStrategy === "IMMEDIATE") {
    return !plan.creativeDirection.cameraBehaviorByShot.includes("WITHHOLD")
      && presence.slice(0, 2).includes("CLEAR");
  }
  if (spine.revealStrategy === "PROGRESSIVE") {
    const firstClear = presence.indexOf("CLEAR");
    return firstClear >= 1 && firstClear <= 3 && presence[3] === "CLEAR";
  }
  return presence[3] === "CLEAR"
    && !presence.slice(0, 2).includes("CLEAR")
    && presence.filter((value) => value === "ABSENT").length <= 1;
}

function productProtectionValid(plan) {
  return plan.shotArchitecture.shots[1].productVisibility === "PRODUCT_READABLE"
    && plan.shotArchitecture.shots[2].productVisibility === "PRODUCT_DETAIL"
    && plan.shotArchitecture.shots[3].productVisibility === "PRODUCT_HERO"
    && plan.creativeSpine.productPresenceByShot[2] !== "ABSENT"
    && plan.creativeSpine.productPresenceByShot[3] === "CLEAR"
    && plan.creativeSpine.productPresenceByShot.filter((value) => value === "CLEAR").length <= 3;
}

function resultSummary(outcome) {
  const direction = outcome.plan.creativeDirection;
  const spine = outcome.plan.creativeSpine;
  return {
    creativePremise: spine.premise.text,
    creativeMode: direction.creativeMode,
    humanSituation: spine.humanSituation.label,
    revealStrategy: spine.revealStrategy,
    primaryEditLogic: direction.primaryEditLogic,
    secondaryEditLogic: direction.secondaryEditLogic,
    visualMotif: direction.visualMotif,
    shots: direction.shotDirections.map((shot) => ({
      shotRole: shot.shotRole,
      dramaticFunction: spine.shotFunctions[shot.shotIndex].dramaticFunction,
      cameraBehavior: shot.cameraBehavior,
      humanAction: outcome.plan.shotArchitecture.shots[shot.shotIndex].action.physicalActionLine,
      productVisibility: spine.productPresenceByShot[shot.shotIndex],
      cutMotivation: shot.cutMotivation,
      continuity: shot.movementContinuity,
      viewerAttentionTarget: shot.viewerAttentionTarget,
    })),
    releaseClosure: (() => {
      const releaseDirection = direction.shotDirections.find((shot) => shot.shotRole === "RELEASE");
      const releaseStory = spine.shotFunctions.find((shot) => shot.shotRole === "RELEASE");
      return {
        closureFunction: releaseStory?.narrativePurpose,
        whatItResolves: releaseStory?.continuityFromPrevious,
        cutMotivation: releaseDirection?.cutMotivation,
        cameraBehavior: releaseDirection?.cameraBehavior,
        whyItDoesNotIntroduceNewGrammar: releaseDirection?.cameraNarrativeReason,
        visualMotifContribution: releaseDirection?.visualMotifContribution,
      };
    })(),
  };
}

try {
  await writeFile(
    entryPath,
    `export * from ${JSON.stringify(resolve(projectRoot, "src/commercial-film/index.ts"))};\n`
  );
  await build({
    entryPoints: [entryPath],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile: bundlePath,
    logLevel: "silent",
  });
  const {
    COMMERCIAL_CAMERA_BEHAVIOR_CATALOG,
    COMMERCIAL_CREATIVE_MODE_CATALOG,
    COMMERCIAL_EDIT_LOGIC_CATALOG,
    COMMERCIAL_VISUAL_MOTIFS,
    runCommercialFilmPipeline,
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  const intentModeMatrix = {};
  const naturallyReachedModes = new Set();
  const naturallyReachedBehaviors = new Set();
  const naturallyReachedEdits = new Set();
  const naturallyReachedMotifs = new Set();
  const naturallyReachedCuts = new Set();
  let generatedCount = 0;
  let qcFailures = 0;
  let distributionFailures = 0;
  let cutFailures = 0;
  let revealFailures = 0;
  let productProtectionFailures = 0;
  let leakageFailures = 0;
  let determinismFailures = 0;
  let nonceDiversityFailures = 0;
  let heroCompletionFailures = 0;
  let releaseRevealFailures = 0;
  let releaseSensoryFailures = 0;
  let releaseGrammarFailures = 0;
  let heroReleaseDuplicationFailures = 0;
  let releaseBeautyShotFailures = 0;
  let releaseUnrelatedLocationFailures = 0;
  const nonceFailures = [];
  const translatedBehaviors = new Set();
  const translatedEditLogics = new Set();

  for (const intent of intents) {
    intentModeMatrix[intent] = {};
    const modesSeen = new Set();
    const behaviorSets = new Set();
    for (let nonce = 0; nonce < 12; nonce += 1) {
      const request = requestFor(intent, nonce);
      const outcome = runCommercialFilmPipeline(request);
      assert(outcome.status === "GENERATED", `${intent} nonce ${nonce} was blocked: ${outcome.status === "BLOCKED" ? outcome.diagnostics.join(" | ") : ""}`);
      generatedCount += 1;
      const direction = outcome.plan.creativeDirection;
      const spine = outcome.plan.creativeSpine;
      modesSeen.add(direction.creativeMode);
      behaviorSets.add(direction.cameraBehaviorByShot.join("|"));
      naturallyReachedModes.add(direction.creativeMode);
      direction.cameraBehaviorByShot.forEach((behavior) => naturallyReachedBehaviors.add(behavior));
      naturallyReachedEdits.add(direction.primaryEditLogic);
      if (direction.secondaryEditLogic) naturallyReachedEdits.add(direction.secondaryEditLogic);
      if (direction.visualMotif) naturallyReachedMotifs.add(direction.visualMotif);
      direction.shotDirections.forEach((shot) => naturallyReachedCuts.add(shot.cutMotivation));
      direction.cameraBehaviorByShot.forEach((behavior) => {
        if (outcome.modelFacingScript.compiledText.includes(COMMERCIAL_CAMERA_BEHAVIOR_CATALOG[behavior].productionLine)) {
          translatedBehaviors.add(behavior);
        }
      });
      direction.shotDirections.forEach((shot) => {
        if (
          outcome.modelFacingScript.compiledText.includes(shot.editEntry)
          || outcome.modelFacingScript.compiledText.includes(shot.editExit)
        ) {
          translatedEditLogics.add(shot.editLogic);
        }
      });
      if (Object.values(direction.qc).some((gate) => gate.status === "FAIL")) qcFailures += 1;
      if (!distributionValid(direction)) distributionFailures += 1;
      if (!cutChainValid(direction)) cutFailures += 1;
      if (!revealCompatible(outcome.plan)) revealFailures += 1;
      if (!productProtectionValid(outcome.plan)) productProtectionFailures += 1;
      const firstClearIndex = spine.productPresenceByShot.indexOf("CLEAR");
      const releaseDirection = direction.shotDirections.find((shot) => shot.shotRole === "RELEASE");
      const heroComplete = firstClearIndex >= 0
        && firstClearIndex <= 3
        && spine.productPresenceByShot[3] === "CLEAR";
      if (!heroComplete) {
        heroCompletionFailures += 1;
        nonceFailures.push(`${intent} nonce ${nonce}: HERO did not complete product comprehension.`);
      }
      const releaseRevealSafe = firstClearIndex <= 3
        && releaseDirection?.cameraBehavior !== "WITHHOLD"
        && releaseDirection?.cameraBehavior !== "REVEAL"
        && releaseDirection?.cameraBehavior !== "DETAIL_INTERRUPTION";
      if (!releaseRevealSafe) {
        releaseRevealFailures += 1;
        nonceFailures.push(`${intent} nonce ${nonce}: RELEASE inherits unfinished reveal.`);
      }
      const sensoryReleaseSafe = ![direction.primaryEditLogic, direction.secondaryEditLogic].includes("SENSORY_INSERT")
        || (
          !releaseDirection?.editEntry.toLowerCase().includes("sensory observation")
          && !releaseDirection?.editExit.toLowerCase().includes("sensory observation")
        );
      if (!sensoryReleaseSafe) {
        releaseSensoryFailures += 1;
        nonceFailures.push(`${intent} nonce ${nonce}: RELEASE introduces unfinished sensory grammar.`);
      }
      const releaseGrammarSafe = releaseDirection?.cutMotivation === "EMOTIONAL_RELEASE"
        && releaseDirection?.cameraBehavior !== "GROUND_OBSERVATION"
        && releaseDirection?.cameraBehavior !== "WITHHOLD"
        && releaseDirection?.cameraBehavior !== "REVEAL"
        && releaseDirection?.cameraBehavior !== "DETAIL_INTERRUPTION"
        && (!direction.visualMotif || Boolean(releaseDirection?.visualMotifContribution));
      if (!releaseGrammarSafe) {
        releaseGrammarFailures += 1;
        nonceFailures.push(`${intent} nonce ${nonce}: RELEASE introduces a new or incomplete visual grammar.`);
      }
      const heroDirection = direction.shotDirections.find((shot) => shot.shotRole === "HERO");
      const heroReleaseDuplicate = heroDirection?.cameraBehavior === releaseDirection?.cameraBehavior
        && heroDirection?.cutMotivation === releaseDirection?.cutMotivation;
      if (heroReleaseDuplicate) {
        heroReleaseDuplicationFailures += 1;
        nonceFailures.push(`${intent} nonce ${nonce}: HERO and RELEASE duplicate directorial function.`);
      }
      if (direction.qc.release_as_extra_beauty_shot.status === "FAIL") {
        releaseBeautyShotFailures += 1;
        nonceFailures.push(`${intent} nonce ${nonce}: RELEASE behaves as an extra beauty shot.`);
      }
      const releaseStory = spine.shotFunctions.find((shot) => shot.shotRole === "RELEASE");
      const releaseLocationSafe = releaseStory?.continuityFromPrevious.includes("shot 4")
        && direction.qc.location_continuity_weak.status === "PASS";
      if (!releaseLocationSafe) {
        releaseUnrelatedLocationFailures += 1;
        nonceFailures.push(`${intent} nonce ${nonce}: RELEASE introduces an unrelated location.`);
      }
      try {
        assertLeakageFree(outcome.modelFacingScript.compiledText, `${intent} nonce ${nonce}`);
      } catch {
        leakageFailures += 1;
      }
      const rerun = runCommercialFilmPipeline(request);
      if (rerun.status !== "GENERATED"
        || JSON.stringify(rerun.plan.creativeDirection) !== JSON.stringify(direction)
        || rerun.modelFacingScript.compiledText !== outcome.modelFacingScript.compiledText) {
        determinismFailures += 1;
      }
      assert(rerun.status === "GENERATED", `${intent} nonce ${nonce} rerun was blocked.`);
      assert(JSON.stringify(rerun.plan.creativeDirection) === JSON.stringify(direction), `${intent} nonce ${nonce} direction is not deterministic.`);
      assert(rerun.modelFacingScript.compiledText === outcome.modelFacingScript.compiledText, `${intent} nonce ${nonce} final text is not deterministic.`);
      assert(spine.revealStrategy === outcome.plan.creativeSpine.revealStrategy, `${intent} nonce ${nonce} changed Reveal Strategy.`);
    }
    if (modesSeen.size < 2) nonceDiversityFailures += 1;
    if (behaviorSets.size < 2) nonceDiversityFailures += 1;
    for (const mode of creativeModes) {
      const overrideRequest = requestFor(intent, 0, { creativeModeOverride: mode });
      const overrideOutcome = runCommercialFilmPipeline(overrideRequest);
      if (overrideOutcome.status === "GENERATED" && overrideOutcome.plan.creativeDirection.creativeMode === mode) {
        intentModeMatrix[intent][mode] = modesSeen.has(mode) ? "REACHABLE" : "VALID_BUT_NOT_SELECTED_IN_TEST_SET";
      } else {
        intentModeMatrix[intent][mode] = "INVALID_COMBINATION";
      }
    }
  }

  const requiredCases = [
    {
      name: "CASE A - PRIVATE MOMENT / DELAYED",
      intent: "QUIET_LUXURY",
      overrides: { creativeModeOverride: "PRIVATE_MOMENT", creativeCase: "HUMAN_FIRST", visualMotifOverride: "SHADOW" },
      expected: (plan) => plan.creativeDirection.creativeMode === "PRIVATE_MOMENT" && plan.creativeSpine.revealStrategy === "DELAYED",
    },
    {
      name: "CASE B - CITY JOURNEY / MATCH MOVEMENT",
      intent: "URBAN_MOTION",
      overrides: { creativeModeOverride: "CITY_JOURNEY", primaryEditLogicOverride: "MATCH_MOVEMENT", visualMotifOverride: "THRESHOLD" },
      expected: (plan) => plan.creativeDirection.creativeMode === "CITY_JOURNEY" && plan.creativeDirection.primaryEditLogic === "MATCH_MOVEMENT",
    },
    {
      name: "CASE C - EVERYDAY MOVEMENT / ACTION CUT",
      intent: "DAILY_STYLING",
      overrides: { creativeModeOverride: "EVERYDAY_MOVEMENT", primaryEditLogicOverride: "ACTION_CUT", visualMotifOverride: "LINE" },
      expected: (plan) => plan.creativeDirection.creativeMode === "EVERYDAY_MOVEMENT" && plan.creativeDirection.primaryEditLogic === "ACTION_CUT",
    },
    {
      name: "CASE D - STATE TRANSITION / PROGRESSIVE",
      intent: "NEW_ARRIVAL",
      overrides: { creativeModeOverride: "STATE_TRANSITION", creativeCase: "PROGRESSIVE_DISCOVERY", visualMotifOverride: "LIGHT" },
      expected: (plan) => plan.creativeDirection.creativeMode === "STATE_TRANSITION" && plan.creativeSpine.revealStrategy === "PROGRESSIVE",
    },
    {
      name: "CASE E - SENSORY LIFE / SENSORY INSERT",
      intent: "PRODUCT_CRAFT",
      overrides: { creativeModeOverride: "SENSORY_LIFE", primaryEditLogicOverride: "SENSORY_INSERT", visualMotifOverride: "REFLECTION" },
      expected: (plan) => plan.creativeDirection.creativeMode === "SENSORY_LIFE" && plan.creativeDirection.primaryEditLogic === "SENSORY_INSERT",
    },
    {
      name: "CASE F - SINGLE IDEA / REPETITION",
      intent: "PRODUCT_CRAFT",
      overrides: { creativeModeOverride: "SINGLE_IDEA", primaryEditLogicOverride: "MATCH_MOVEMENT", visualMotifOverride: "REPETITION" },
      expected: (plan) => plan.creativeDirection.creativeMode === "SINGLE_IDEA" && plan.creativeDirection.visualMotif === "REPETITION",
    },
  ];

  const caseResults = [];
  const modeSemanticSignatures = new Set();
  for (const testCase of requiredCases) {
    const outcome = runCommercialFilmPipeline(requestFor(testCase.intent, 0, testCase.overrides));
    assert(outcome.status === "GENERATED", `${testCase.name} was blocked: ${outcome.status === "BLOCKED" ? outcome.diagnostics.join(" | ") : ""}`);
    assert(testCase.expected(outcome.plan), `${testCase.name} did not satisfy its expected direction contract.`);
    assert(Object.values(outcome.plan.creativeDirection.qc).every((gate) => gate.status === "PASS"), `${testCase.name} failed Creative Direction QC.`);
    assertLeakageFree(outcome.modelFacingScript.compiledText, testCase.name);
    const release = outcome.plan.creativeDirection.shotDirections.find((shot) => shot.shotRole === "RELEASE");
    const releaseStory = outcome.plan.creativeSpine.shotFunctions.find((shot) => shot.shotRole === "RELEASE");
    assert(Boolean(release), `${testCase.name} has no RELEASE direction.`);
    assert(Boolean(releaseStory), `${testCase.name} has no RELEASE Story Spine.`);
    assert(releaseStory.continuityFromPrevious.includes("shot 4"), `${testCase.name} releases without Shot 4 continuity.`);
    assert(release?.cutMotivation === "EMOTIONAL_RELEASE", `${testCase.name} release has no emotional release cut.`);
    assert(release?.cameraBehavior !== "REVEAL" && release?.cameraBehavior !== "DETAIL_INTERRUPTION", `${testCase.name} release introduces a new strongest camera grammar.`);
    modeSemanticSignatures.add([
      outcome.plan.creativeDirection.creativeMode,
      outcome.plan.creativeDirection.cameraBehaviorByShot.join("|"),
      outcome.plan.creativeDirection.primaryEditLogic,
      outcome.plan.creativeDirection.secondaryEditLogic ?? "NONE",
      outcome.plan.creativeDirection.visualMotif ?? "NONE",
    ].join("::"));
    caseResults.push({
      case: testCase.name,
      ...resultSummary(outcome),
      finalCompiledText: outcome.modelFacingScript.compiledText,
    });
  }

  const zeroReferenceDirection = runCommercialFilmPipeline(requestFor("QUIET_LUXURY", 0, {
    reference: {
      ...reference,
      referenceSetId: "zero-reference-creative-direction-set",
      confirmationStatus: "incomplete",
      confirmedReferenceCount: 0,
      confirmedAssetIds: [],
      coverage: [],
      missingCoverage: coverage,
      referencePlanReady: false,
      productTruth: null,
    },
  }));
  assert(zeroReferenceDirection.status === "GENERATED", "Zero-reference Creative Direction generation was blocked.");
  assert(Object.values(zeroReferenceDirection.plan.creativeDirection.qc).every((gate) => gate.status === "PASS"), "Zero-reference Creative Direction failed QC.");
  assertLeakageFree(zeroReferenceDirection.modelFacingScript.compiledText, "Zero-reference Creative Direction");
  assert(zeroReferenceDirection.modelFacingScript.compiledText.includes("Use the footwear reference images uploaded in the external video generation tool as the only source of truth for the product."), "Zero-reference Creative Direction output lacks external-reference protection.");

  assert(Object.keys(COMMERCIAL_CREATIVE_MODE_CATALOG).length === 6, "Creative Mode catalog does not contain six modes.");
  assert(COMMERCIAL_VISUAL_MOTIFS.length === 6, "Visual Motif catalog does not contain six motifs.");
  assert(naturallyReachedModes.size === 6, `Only ${naturallyReachedModes.size}/6 Creative Modes were naturally reachable.`);
  assert(naturallyReachedBehaviors.size === 9, `Only ${naturallyReachedBehaviors.size}/9 Camera Behaviors were naturally reachable.`);
  assert(naturallyReachedEdits.size === 4, `Only ${naturallyReachedEdits.size}/4 Edit Logics were naturally reachable.`);
  assert(naturallyReachedCuts.size === 7, `Only ${naturallyReachedCuts.size}/7 Cut Motivations were naturally reachable.`);
  assert(naturallyReachedMotifs.size >= 3, `Only ${naturallyReachedMotifs.size} Visual Motifs were reachable in the nonce test set.`);
  assert(translatedBehaviors.size === 9, `Only ${translatedBehaviors.size}/9 Camera Behaviors were translated into final execution text.`);
  assert(translatedEditLogics.size === 4, `Only ${translatedEditLogics.size}/4 Edit Logics were translated into final execution text.`);
  assert(modeSemanticSignatures.size === 6, `Only ${modeSemanticSignatures.size}/6 required Creative Mode cases produced distinct direction structures.`);
  assert(generatedCount === intents.length * 12, `${generatedCount} nonce cases generated.`);
  assert(qcFailures === 0, `${qcFailures} Creative Direction QC failures remain.`);
  assert(distributionFailures === 0, `${distributionFailures} Camera Behavior distribution failures remain.`);
  assert(cutFailures === 0, `${cutFailures} cut-chain failures remain.`);
  assert(revealFailures === 0, `${revealFailures} Reveal Strategy conflicts remain.`);
  assert(productProtectionFailures === 0, `${productProtectionFailures} Product Protection failures remain.`);
  assert(leakageFailures === 0, `${leakageFailures} internal leakage cases remain.`);
  assert(determinismFailures === 0, `${determinismFailures} determinism failures remain.`);
  assert(nonceDiversityFailures === 0, `${nonceDiversityFailures} nonce diversity failures remain.`);
  assert(heroCompletionFailures === 0, `${heroCompletionFailures} HERO completion failures remain.`);
  assert(releaseRevealFailures === 0, `${releaseRevealFailures} unfinished RELEASE reveal failures remain.`);
  assert(releaseSensoryFailures === 0, `${releaseSensoryFailures} unfinished RELEASE sensory failures remain.`);
  assert(releaseGrammarFailures === 0, `${releaseGrammarFailures} RELEASE grammar failures remain.`);
  assert(heroReleaseDuplicationFailures === 0, `${heroReleaseDuplicationFailures} HERO/RELEASE duplication failures remain.`);
  assert(releaseBeautyShotFailures === 0, `${releaseBeautyShotFailures} RELEASE beauty-shot failures remain.`);
  assert(releaseUnrelatedLocationFailures === 0, `${releaseUnrelatedLocationFailures} RELEASE unrelated-location failures remain.`);

  const behaviorTranslationChecks = [...naturallyReachedBehaviors].map((behavior) => ({
    behavior,
    productionLine: COMMERCIAL_CAMERA_BEHAVIOR_CATALOG[behavior].productionLine,
  }));
  const editTranslationChecks = [...naturallyReachedEdits].map((edit) => ({
    edit,
    productionLine: COMMERCIAL_EDIT_LOGIC_CATALOG[edit].productionLine,
  }));

  console.log("COMMERCIAL FILM V1.2 CREATIVE DIRECTION VALIDATION PASS:", JSON.stringify({
    stage: "COMMERCIAL_CREATIVE_DIRECTION_V1_2",
    categoryBoundary: {
      commercialFilmIndependent: true,
      narrativeModified: false,
      existingActionsModified: false,
    },
    creativeModes: {
      reachable: [...naturallyReachedModes],
      matrix: intentModeMatrix,
    },
    cameraBehaviors: {
      reachable: [...naturallyReachedBehaviors],
      translated: [...translatedBehaviors],
      translationChecks: behaviorTranslationChecks,
    },
    editLogics: {
      reachable: [...naturallyReachedEdits],
      translated: [...translatedEditLogics],
      translationChecks: editTranslationChecks,
    },
    revealCompatibility: {
      checked: generatedCount,
      failures: revealFailures,
    },
    visualMotifs: {
      reachable: [...naturallyReachedMotifs],
      optional: true,
      failures: 0,
    },
    cutMotivations: {
      reachable: [...naturallyReachedCuts],
      failures: cutFailures,
    },
    productProtection: {
      failures: productProtectionFailures,
    },
    internalLeakage: leakageFailures,
    determinismFailures,
    nonceDiversityFailures,
    heroCompletionFailures,
    releaseRevealFailures,
    releaseSensoryFailures,
    releaseGrammarFailures,
    heroReleaseDuplicationFailures,
    releaseBeautyShotFailures,
    releaseUnrelatedLocationFailures,
    failedNonceCases: nonceFailures,
    zeroReferenceGeneration: zeroReferenceDirection.status,
    creativeModeSemanticSignatures: modeSemanticSignatures.size,
    generatedCases: generatedCount,
    requiredCases: caseResults,
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
