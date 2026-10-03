import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-commercial-creative-spine-validation-"));
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
  referenceSetId: "creative-spine-reference-set",
  taskId: "creative-spine-task",
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

const cases = [
  { name: "CASE A — PRODUCT FORWARD", intent: "DAILY_STYLING", creativeCase: "PRODUCT_FORWARD", expectedReveal: "IMMEDIATE" },
  { name: "CASE B — PROGRESSIVE DISCOVERY", intent: "PRODUCT_CRAFT", creativeCase: "PROGRESSIVE_DISCOVERY", expectedReveal: "PROGRESSIVE" },
  { name: "CASE C — HUMAN-FIRST", intent: "QUIET_LUXURY", creativeCase: "HUMAN_FIRST", expectedReveal: "DELAYED" },
];

function requestFor(intent, creativeCase) {
  return {
    commercialIntent: intent,
    characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 自然 / 克制",
    duration: 15,
    reference,
    creativeCase,
  };
}

function assertFinalLeakageFree(text, label) {
  const enumLeak = /\b(?:URBAN_MOTION|DAILY_STYLING|QUIET_LUXURY|PRODUCT_CRAFT|NEW_ARRIVAL|EFFORTLESSNESS|CONFIDENCE|COMFORT|VERSATILITY|QUIET_REFINEMENT|EVERYDAY_EASE|SELF_POSSESSION|LIGHTNESS|BELONGING|UNFORCED_STYLE|IMMEDIATE|PROGRESSIVE|DELAYED|CLEAR|SECONDARY|PARTIAL|IMPLIED|ABSENT|ESTABLISH|INVITE|DISCOVER|CONFIRM|RESOLVE)\b/.test(text);
  assert(!enumLeak, `${label} leaked an internal Creative Spine enum.`);
  for (const phrase of ["dramatic function", "audience desire", "story spine", "product meaning", "reveal strategy"]) {
    assert(!text.toLowerCase().includes(phrase), `${label} leaked the internal phrase "${phrase}".`);
  }
  assert(!/\b(?:QC|validator|enum|source id|primitive id)\b/i.test(text), `${label} leaked compiler or validation language.`);
  assert(!/\b(?:walking|transition|standing|turning|on-foot|seated|studio-[a-z-]+|mirror-[a-z-]+)-\d{3}\b/i.test(text), `${label} leaked an Action ID.`);
}

function assertProductAuthority(plan, label) {
  const referenceCoverage = new Set(plan.referenceState.coverage);
  const supportedCoverage = new Set(plan.productMessage.supportedDimensions.map((dimension) => dimension.coverage));
  const expression = plan.shotArchitecture.shots.find((shot) => (
    ["PRODUCT_READABLE", "PRODUCT_HERO"].includes(shot.productVisibility)
    && plan.creativeSpine.productPresenceByShot[shot.shotIndex] === "CLEAR"
    && Boolean(shot.productMessageDimension)
    && referenceCoverage.has(shot.productMessageDimension)
    && supportedCoverage.has(shot.productMessageDimension)
  ));
  assert(expression, `${label} has no actual CLEAR expression beat bound to confirmed supported coverage.`);
  if (plan.creativeSpine.productRole === "HERO") {
    assert(expression.productVisibility === "PRODUCT_HERO", `${label} selected HERO without an explicit PRODUCT_HERO expression.`);
  }
  for (const shot of plan.shotArchitecture.shots.filter((entry) => entry.productVisibility === "PRODUCT_DETAIL")) {
    assert(Boolean(shot.event.productDetailRelationship?.trim()), `${label} DETAIL beat has no event/product relationship.`);
    assert(Boolean(shot.productMessageDimension) && referenceCoverage.has(shot.productMessageDimension) && supportedCoverage.has(shot.productMessageDimension), `${label} DETAIL beat is not bound to confirmed supported coverage.`);
  }
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
    COMMERCIAL_INTENT_CATALOG,
    runCommercialFilmPipeline,
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  const intentResults = [];
  let storyQcFailures = 0;
  let continuityFailures = 0;
  let determinismFailures = 0;
  let productMeaningFailures = 0;
  let productReadabilityFailures = 0;

  for (const intent of intents) {
    const request = requestFor(intent);
    const outcome = runCommercialFilmPipeline(request);
    assert(outcome.status === "GENERATED", `${intent} was blocked: ${outcome.status === "BLOCKED" ? outcome.diagnostics.join(" | ") : ""}`);
    const spine = outcome.plan.creativeSpine;
    assert(spine.premise.text.trim().length > 0, `${intent} has no Creative Premise.`);
    assert(spine.premise.sourceFacts.length > 0, `${intent} Premise has no source facts.`);
    assert(spine.humanSituation.id, `${intent} has no Human Situation.`);
    assert(spine.audienceDesire.id, `${intent} has no Audience Desire.`);
    assert(spine.productMeaning.meaning.trim().length > 0, `${intent} has no Product Meaning.`);
    assert(["IMMEDIATE", "PROGRESSIVE", "DELAYED"].includes(spine.revealStrategy), `${intent} has an invalid Reveal Strategy.`);
    assert(spine.shotFunctions.length === 5, `${intent} does not have five dramatic assignments.`);
    assert(spine.shotFunctions.map((shot) => shot.shotRole).join("|") === "WORLD|WEAR|DETAIL|HERO|RELEASE", `${intent} changed shot-role order.`);
    assert(Object.values(spine.qc).every((gate) => gate.status === "PASS"), `${intent} failed Commercial Story QC.`);
    assert(spine.productMeaning.supportingCoverage.every((item) => coverage.includes(item)), `${intent} Product Meaning uses unsupported coverage.`);
    assertProductAuthority(outcome.plan, intent);
    assert(["CONTRAST_SHIFT", "PURSUIT_RELEASE", "WITHHOLD_REVEAL", "RITUAL_COMPLETION", "WORLD_OBSERVES_SUBJECT", "ICONIC_IMAGE"].includes(spine.advertisingStructure), `${intent} has no supported advertising structure.`);
    assert(["INHABITED", "DISCOVERED", "REVEALED", "HERO"].includes(spine.productRole), `${intent} has no product role.`);
    assert(outcome.plan.shotArchitecture.shots.some((shot) => shot.productVisibility === "PRODUCT_READABLE" || shot.productVisibility === "PRODUCT_HERO"), `${intent} has no readable product beat.`);
    if (["INHABITED", "DISCOVERED"].includes(spine.productRole)) {
      assert(!outcome.plan.shotArchitecture.shots.some((shot) => ["PRODUCT_DETAIL", "PRODUCT_HERO", "BRAND_RELEASE"].includes(shot.productVisibility)), `${intent} escalated a ${spine.productRole} product role through the legacy shot template.`);
    }
    assert(outcome.plan.productVisibilityPlan.presenceByShot.some((presence, index) => presence === "CLEAR" && index > 0), `${intent} lost a clear later worn-product view.`);
    assertFinalLeakageFree(outcome.modelFacingScript.compiledText, `${intent} final script`);

    const rerun = runCommercialFilmPipeline(request);
    if (rerun.status !== "GENERATED"
      || JSON.stringify(rerun.plan.creativeSpine) !== JSON.stringify(spine)
      || rerun.modelFacingScript.compiledText !== outcome.modelFacingScript.compiledText) {
      determinismFailures += 1;
    }
    assert(rerun.status === "GENERATED", `${intent} deterministic rerun was blocked.`);
    assert(JSON.stringify(rerun.plan.creativeSpine) === JSON.stringify(spine), `${intent} Creative Spine is not deterministic.`);
    assert(rerun.modelFacingScript.compiledText === outcome.modelFacingScript.compiledText, `${intent} final script is not deterministic.`);

    if (spine.failureReasons?.length) storyQcFailures += spine.failureReasons.length;
    if (spine.shotFunctions.some((shot, index) => (
      (index > 0 && !shot.continuityFromPrevious.includes(`shot ${index}`))
      || (index < 4 && !shot.continuityToNext.includes(`shot ${index + 2}`))
    ))) continuityFailures += 1;
    if (spine.productMeaning.supportingCoverage.some((item) => !coverage.includes(item))) productMeaningFailures += 1;
    if (!outcome.plan.shotArchitecture.shots.some((shot) => shot.productVisibility === "PRODUCT_READABLE" || shot.productVisibility === "PRODUCT_HERO")) productReadabilityFailures += 1;

    intentResults.push({
      intent,
      premise: spine.premise.text,
      humanSituation: spine.humanSituation.label,
      audienceDesire: spine.audienceDesire.label,
      revealStrategy: spine.revealStrategy,
      advertisingStructure: spine.advertisingStructure,
      productRole: spine.productRole,
      arc: spine.arc.join(" → "),
      storyQc: Object.values(spine.qc).every((gate) => gate.status === "PASS") ? "PASS" : "FAIL",
      shots: spine.shotFunctions.map((shot) => ({
        role: shot.shotRole,
        dramaticFunction: shot.dramaticFunction,
        productPresence: shot.productPresenceDesign,
        continuityFromPrevious: shot.continuityFromPrevious,
      })),
    });
  }

  const nonceVariation = Object.fromEntries(intents.map((intent) => {
    const nonceOutcomes = [0, 1, 2].map((generationNonce) => runCommercialFilmPipeline({
      ...requestFor(intent),
      generationNonce,
    }));
    assert(nonceOutcomes.every((outcome) => outcome.status === "GENERATED"), `${intent} nonce matrix contains a blocked case.`);
    const structures = nonceOutcomes.map((outcome) => outcome.plan.creativeSpine.advertisingStructure);
    assert(new Set(structures).size === 3, `${intent} did not rotate across three compatible advertising structures.`);
    const repeat = runCommercialFilmPipeline({ ...requestFor(intent), generationNonce: 1 });
    assert(repeat.status === "GENERATED" && repeat.plan.creativeSpine.advertisingStructure === structures[1], `${intent} nonce selection is not deterministic.`);
    return [intent, structures];
  }));

  const caseResults = [];
  for (const testCase of cases) {
    const outcome = runCommercialFilmPipeline(requestFor(testCase.intent, testCase.creativeCase));
    assert(outcome.status === "GENERATED", `${testCase.name} did not compile.`);
    const spine = outcome.plan.creativeSpine;
    assert(spine.revealStrategy === testCase.expectedReveal, `${testCase.name} expected ${testCase.expectedReveal}, received ${spine.revealStrategy}.`);
    assert(spine.premise.text.trim().length > 0, `${testCase.name} has no premise.`);
    assert(spine.shotFunctions.length === 5, `${testCase.name} does not have five shots.`);
    assert(Object.values(spine.qc).every((gate) => gate.status === "PASS"), `${testCase.name} failed Story QC.`);
    assertProductAuthority(outcome.plan, testCase.name);
    assertFinalLeakageFree(outcome.modelFacingScript.compiledText, `${testCase.name} final script`);
    const firstClear = spine.productPresenceByShot.indexOf("CLEAR");
    assert(firstClear >= 0 && firstClear <= 3, `${testCase.name} does not reach its authorized product expression before the ending beat.`);
    if (testCase.creativeCase === "PRODUCT_FORWARD") assert(firstClear <= 1, "PRODUCT_FORWARD must express the product early under IMMEDIATE reveal.");
    if (testCase.creativeCase === "PROGRESSIVE_DISCOVERY") assert(firstClear > 0 && spine.revealStrategy === "PROGRESSIVE", "PROGRESSIVE_DISCOVERY must order its reveal after initial context.");
    if (testCase.creativeCase === "HUMAN_FIRST") assert(firstClear > 0 && spine.revealStrategy === "DELAYED", "HUMAN_FIRST must preserve initial context before delayed product clarity.");
    caseResults.push({
      case: testCase.name,
      creativePremise: spine.premise.text,
      humanSituation: spine.humanSituation.label,
      audienceDesire: spine.audienceDesire.label,
      productMeaning: spine.productMeaning.meaning,
      revealStrategy: spine.revealStrategy,
      shots: spine.shotFunctions.map((shot) => ({
        role: shot.shotRole,
        dramaticFunction: shot.dramaticFunction,
        narrativePurpose: shot.narrativePurpose,
        productNarrativeRole: shot.productNarrativeRole,
        productPresenceDesign: shot.productPresenceDesign,
        continuityFromPrevious: shot.continuityFromPrevious,
      })),
      finalCompiledText: outcome.modelFacingScript.compiledText,
    });
  }

  const zeroReferenceSpine = runCommercialFilmPipeline({
    ...requestFor("URBAN_MOTION"),
    reference: {
      ...reference,
      referenceSetId: "zero-reference-creative-spine-set",
      confirmationStatus: "incomplete",
      confirmedReferenceCount: 0,
      confirmedAssetIds: [],
      coverage: [],
      missingCoverage: coverage,
      referencePlanReady: false,
      productTruth: null,
    },
  });
  assert(zeroReferenceSpine.status === "BLOCKED", "Zero-reference Creative Spine must be blocked by the Commercial Hard Floor.");

  assert(COMMERCIAL_INTENT_CATALOG.length === 5, `Creative Spine validator expected 5 intents, found ${COMMERCIAL_INTENT_CATALOG.length}.`);
  assert(storyQcFailures === 0, `${storyQcFailures} Story QC failures remain.`);
  assert(continuityFailures === 0, `${continuityFailures} continuity failures remain.`);
  assert(determinismFailures === 0, `${determinismFailures} deterministic failures remain.`);
  assert(productMeaningFailures === 0, `${productMeaningFailures} unsupported Product Meaning failures remain.`);
  assert(productReadabilityFailures === 0, `${productReadabilityFailures} product-readability failures remain.`);

    console.log("COMMERCIAL FILM ADVERTISING CREATIVE SPINE VALIDATION PASS:", JSON.stringify({
    stage: "COMMERCIAL_CREATIVE_STORY_SPINE_V1_1",
    allIntents: intentResults.length,
    storyQcFailures,
    continuityFailures,
    determinismFailures,
    productMeaningFailures,
    productReadabilityFailures,
    zeroReferenceGeneration: zeroReferenceSpine.status,
    nonceVariation,
    intentResults,
    conceptualCases: caseResults,
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
