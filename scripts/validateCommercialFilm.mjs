import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-commercial-film-validation-"));
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

const confirmedReference = {
  referenceSetId: "commercial-validation-reference-set",
  taskId: "commercial-validation-task",
  sourceType: "current_task_reference_set",
  confirmationStatus: "confirmed",
  confirmedReferenceCount: 2,
  confirmedAssetIds: ["asset-front", "asset-side"],
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

try {
  await writeFile(
    entryPath,
    `export * from ${JSON.stringify(resolve(projectRoot, "src/commercial-film/index.ts"))};\n` +
    `export { personActionLibrary, PERSON_ACTION_LIBRARY_EXPECTED_COUNT } from ${JSON.stringify(resolve(projectRoot, "src/data/personActionLibrary.ts"))};\n`
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
    COMMERCIAL_SHOT_ROLES,
    PERSON_ACTION_LIBRARY_EXPECTED_COUNT,
    auditCommercialActionSource,
    personActionLibrary,
    runCommercialFilmPipeline,
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  assert(personActionLibrary.length === 318, "Existing Action Library is no longer 318.");
  assert(PERSON_ACTION_LIBRARY_EXPECTED_COUNT === 318, "Existing Action Library expected count changed.");

  let generatedCount = 0;
  let validatedCount = 0;
  let totalShots = 0;
  let readableShotCount = 0;
  let heroShotCount = 0;
  let detailShotCount = 0;
  let timelineFailures = 0;
  let determinismFailures = 0;
  const perIntent = [];

  for (const intent of intents) {
    const request = {
      commercialIntent: intent,
      characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "asian" },
      season: "秋",
      lifestyleFeeling: "安静 / 克制 / 自然",
      duration: 15,
      reference: confirmedReference,
    };
    const outcome = runCommercialFilmPipeline(request);
    assert(outcome.status === "GENERATED", `${intent} was blocked: ${outcome.status === "BLOCKED" ? outcome.diagnostics.join(" | ") : ""}`);
    generatedCount += 1;
    const plan = outcome.plan;
    const script = outcome.modelFacingScript;
    assert(plan.status === "APPROVED_FOR_COMMERCIAL_EXECUTION", `${intent} plan was not approved.`);
    assert(plan.duration === 15, `${intent} changed the fixed duration.`);
    assert(plan.shotArchitecture.shots.length === 5, `${intent} does not contain five shots.`);
    assert(plan.shotArchitecture.shotRoles.join("|") === COMMERCIAL_SHOT_ROLES.join("|"), `${intent} changed the fixed shot role order.`);
    assert(plan.productVisibilityPlan.readableShotIndexes.length >= 2, `${intent} does not expose readable product shots.`);
    assert(plan.shotArchitecture.shots[1].productVisibility === "PRODUCT_READABLE", `${intent} WEAR shot is not PRODUCT_READABLE.`);
    assert(plan.shotArchitecture.shots[3].productVisibility === "PRODUCT_HERO", `${intent} HERO shot is not PRODUCT_HERO.`);
    assert(plan.shotArchitecture.shots[2].productMessageDimension, `${intent} DETAIL shot has no reference-backed dimension.`);
    assert(plan.productMessage.supportedDimensions.every((dimension) => coverage.includes(dimension.coverage)), `${intent} invented an unsupported product message dimension.`);
    assert(plan.sceneWorld.sceneIds.length > 0 && plan.sceneWorld.spatialAnchors.length >= 5, `${intent} lost the shared scene world or spatial anchors.`);
    assert(plan.cameraPlan.shots.length === 5, `${intent} camera plan does not cover five shots.`);
    assert(plan.soundPlan.policy.music === "NONE" && plan.soundPlan.policy.voiceover === "NONE" && plan.soundPlan.policy.dialogue === "NONE", `${intent} added music, voiceover, or dialogue.`);
    assert(Object.values(plan.qc).every((gate) => gate.status === "PASS"), `${intent} failed Commercial QC.`);
    assert(outcome.executionValidation.status === "COMMERCIAL_EXECUTION_VALIDATED", `${intent} commercial execution compiler failed.`);
    assert(script.compiledText.startsWith("SEEDANCE — COMMERCIAL FILM"), `${intent} final script header is wrong.`);
    assert(!/\[NARRATIVE CORE\]|\[MOMENT CHAIN\]|\[NARRATIVE QC\]|APPROVED FOR SCENE RESOLUTION/.test(script.compiledText), `${intent} narrative system leaked into Commercial Film.`);
    assert(!/\b(?:walking|transition|standing|turning|on-foot|seated|studio-[a-z-]+|mirror-[a-z-]+)-\d{3}\b/i.test(script.compiledText), `${intent} leaked an Action ID.`);
    assert(!/\b(?:QC|validator|enum|source id|primitive id)\b/i.test(script.compiledText), `${intent} leaked internal QC or validator language.`);
    assert(!/\b(?:logo animation|packshot|brand end card)\b/i.test(script.compiledText.split("[NEGATIVES]")[0]), `${intent} placed a branding end card before the negative rules.`);
    assert(!script.compiledText.includes("THERUIZ AURA"), `${intent} leaked the brand name into the execution body.`);

    const timing = script.diagnostics.timelineCoverage;
    const durations = plan.shotArchitecture.shots.map((shot) => shot.timeRange.durationSeconds);
    if (!(timing.startSecond === 0
      && timing.endSecond === 15
      && timing.contiguous
      && new Set(durations).size > 1
      && durations.every((duration) => duration >= 1 && duration <= 5))) {
      timelineFailures += 1;
    }
    const rerun = runCommercialFilmPipeline(request);
    if (rerun.status !== "GENERATED" || rerun.modelFacingScript.compiledText !== script.compiledText) {
      determinismFailures += 1;
    }
    assert(rerun.status === "GENERATED" && rerun.modelFacingScript.compiledText === script.compiledText, `${intent} compiler output is not deterministic.`);

    validatedCount += 1;
    totalShots += plan.shotArchitecture.shots.length;
    readableShotCount += plan.productVisibilityPlan.readableShotIndexes.length;
    heroShotCount += plan.shotArchitecture.shots.filter((shot) => shot.role === "HERO").length;
    detailShotCount += plan.shotArchitecture.shots.filter((shot) => shot.role === "DETAIL" && shot.productMessageDimension).length;
    perIntent.push({
      intent,
      rhythm: plan.cameraRhythm,
      productHeadline: plan.productMessage.headline,
      shots: plan.shotArchitecture.shots.map((shot) => `${shot.role}:${shot.productVisibility}`),
    });
  }

  const noReference = runCommercialFilmPipeline({
    commercialIntent: "URBAN_MOTION",
    characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 克制",
    duration: 15,
    reference: {
      ...confirmedReference,
      referenceSetId: "empty-reference-set",
      confirmedReferenceCount: 0,
      confirmedAssetIds: [],
      coverage: [],
      missingCoverage: coverage,
      referencePlanReady: false,
      confirmationStatus: "incomplete",
      productTruth: null,
    },
  });
  assert(noReference.status === "GENERATED", `Reference=0 did not generate Commercial Film: ${noReference.status === "BLOCKED" ? noReference.diagnostics.join(" | ") : ""}`);
  assert(noReference.plan.referenceState.status === "REFERENCE_READY", "Reference=0 did not resolve to REFERENCE_READY.");
  assert(noReference.plan.productMessage.externalReferenceRequired === true, "Reference=0 did not select external reference mode.");
  assert(
    noReference.modelFacingScript.compiledText.includes("Use the footwear reference images uploaded in the external video generation tool as the only source of truth for the product. Do not invent or alter product details not supported by those references."),
    "Reference=0 script is missing generic external product-protection language."
  );
  assert(!/\b(?:burgundy|ivory|leather|suede|mesh|outsole construction|logo detail)\b/i.test(noReference.modelFacingScript.compiledText), "Reference=0 script invented an exact product fact.");

  const incompleteReference = runCommercialFilmPipeline({
    commercialIntent: "DAILY_STYLING",
    characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 克制",
    duration: 15,
    reference: {
      ...confirmedReference,
      referenceSetId: "incomplete-reference-set",
      confirmationStatus: "incomplete",
      confirmedReferenceCount: 0,
      confirmedAssetIds: [],
      coverage: [],
      referencePlanReady: false,
    },
  });
  assert(incompleteReference.status === "GENERATED", `Unconfirmed reference did not generate Commercial Film: ${incompleteReference.status === "BLOCKED" ? incompleteReference.diagnostics.join(" | ") : ""}`);
  assert(incompleteReference.plan.referenceState.status === "REFERENCE_READY", "Unconfirmed reference did not resolve to REFERENCE_READY.");
  assert(incompleteReference.modelFacingScript.compiledText.includes("Use the footwear reference images uploaded in the external video generation tool as the only source of truth for the product."), "Unconfirmed reference script is missing external-reference protection.");

  const actionAudit = auditCommercialActionSource();
  assert(actionAudit.existingActionLibraryCount === 318, "Commercial Action audit changed the Existing Action Library count.");
  assert(actionAudit.reusedExistingActions >= 3, "Commercial Action Registry is not reusing existing Actions.");
  assert(actionAudit.commercialOnlyPrimitives === 2, "Commercial-only primitive count changed unexpectedly.");
  assert(COMMERCIAL_INTENT_CATALOG.length === 5, `Commercial Intent catalog contains ${COMMERCIAL_INTENT_CATALOG.length} entries.`);
  assert(validatedCount === 5, `${validatedCount}/5 Commercial Intents validated.`);
  assert(timelineFailures === 0, `${timelineFailures} full-timeline failures remain.`);
  assert(determinismFailures === 0, `${determinismFailures} deterministic compilation failures remain.`);

  console.log("COMMERCIAL FILM V1 VALIDATION PASS:", JSON.stringify({
    stage: "COMMERCIAL_FILM_PLANNER_V1",
    commercialIntents: COMMERCIAL_INTENT_CATALOG.length,
    generatedCount,
    validatedCount,
    totalShots,
    readableShotCount,
    heroShotCount,
    detailShotCount,
    referenceZeroGeneration: noReference.status,
    referenceIncompleteGeneration: incompleteReference.status,
    timelineFailures,
    determinismFailures,
    existingActionLibraryCount: actionAudit.existingActionLibraryCount,
    reusedExistingActions: actionAudit.reusedExistingActions,
    commercialOnlyPrimitives: actionAudit.commercialOnlyPrimitives,
    perIntent,
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
