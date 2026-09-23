import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-director-concept-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const intents = ["URBAN_MOTION", "DAILY_STYLING", "QUIET_LUXURY", "PRODUCT_CRAFT", "NEW_ARRIVAL"];
const concepts = [
  "STATIC_CAMERA_FILM",
  "PARTIAL_OBSCURATION",
  "EDGE_OF_FRAME",
  "THRESHOLD_CHAIN",
  "REFLECTION_WORLD",
  "LIGHT_REVEAL",
  "WORLD_MOVES_SUBJECT_SETTLES",
  "REPEATED_GESTURE",
];
const coverage = ["silhouette", "toe_structure", "side_panel_structure", "heel_structure", "outsole_profile", "color_blocking", "material_evidence"];
const reference = {
  referenceSetId: "director-concept-reference-set",
  taskId: "director-concept-task",
  sourceType: "current_task_reference_set",
  confirmationStatus: "confirmed",
  confirmedReferenceCount: 3,
  confirmedAssetIds: ["front", "side", "material"],
  coverage,
  missingCoverage: [],
  referencePlanReady: true,
  productTruthMode: "reference_bound",
  productTruth: { coverage, status: "draft", referenceEvidenceBound: true, productTruthMode: "reference_bound" },
};
const previousCompactLength = {
  URBAN_MOTION: 6939,
  DAILY_STYLING: 6650,
  QUIET_LUXURY: 6776,
  PRODUCT_CRAFT: 6770,
  NEW_ARRIVAL: 6668,
};

function request(intent, nonce = 0, overrides = {}) {
  return {
    commercialIntent: intent,
    characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 自然 / 克制",
    duration: 15,
    generationNonce: nonce,
    reference,
    ...overrides,
  };
}

function normalizedExecutionBody(text) {
  return text
    .split("[SOUND WORLD]")[0]
    .replace(/Use the footwear reference images[\s\S]*?(?=\n\n|$)/i, "")
    .replace(/Age:.*\nVisible appearance:.*\nWorld:.*\n/im, "")
    .replace(/\s+/g, " ")
    .trim();
}

try {
  await writeFile(entryPath, `export * from ${JSON.stringify(resolve(projectRoot, "src/commercial-film/index.ts"))};\n`);
  await build({ entryPoints: [entryPath], bundle: true, format: "esm", platform: "node", outfile: bundlePath, logLevel: "silent" });
  const { COMMERCIAL_DIRECTOR_CONCEPT_CATALOG, runCommercialFilmPipeline } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  const naturalReach = new Set();
  for (const intent of intents) {
    for (let nonce = 0; nonce < 12; nonce += 1) {
      const outcome = runCommercialFilmPipeline(request(intent, nonce));
      assert(outcome.status === "GENERATED", `${intent} nonce ${nonce} was blocked: ${outcome.status === "BLOCKED" ? outcome.diagnostics.join(" | ") : ""}`);
      naturalReach.add(outcome.plan.directorConcept.concept);
    }
  }
  assert(naturalReach.size === 8, `Only ${naturalReach.size}/8 Director Concepts were naturally reachable.`);

  const conceptResults = [];
  let deterministicFailures = 0;
  let heroReleaseFailures = 0;
  let graphicCompositionFailures = 0;
  let pseudoLuxuryFailures = 0;
  let productDisconnectFailures = 0;
  let leakageFailures = 0;
  let promptLengthFailures = 0;
  for (const concept of concepts) {
    const outcome = runCommercialFilmPipeline(request("QUIET_LUXURY", 0, { directorConceptOverride: concept }));
    assert(outcome.status === "GENERATED", `${concept} was blocked: ${outcome.status === "BLOCKED" ? outcome.diagnostics.join(" | ") : ""}`);
    const plan = outcome.plan;
    assert(plan.directorConcept.concept === concept, `${concept} override did not bind`);
    assert(Object.values(plan.directorConcept.qc).every((gate) => gate.status === "PASS"), `${concept} failed Director Concept QC.`);
    assert(plan.directorConcept.shots.filter((shot) => shot.contribution !== "REST").length >= 3, `${concept} did not govern enough shots.`);
    assert(new Set(plan.directorConcept.shots.map((shot) => shot.conceptRule)).size >= 3, `${concept} mechanically repeats one rule.`);
    assert(plan.directorConcept.shots[3].heroConvergence, `${concept} does not converge at HERO.`);
    assert(plan.directorConcept.shots[4].releaseConvergence, `${concept} does not converge at RELEASE.`);
    assert(plan.directorConcept.shots.every((shot) => (
      shot.graphicComposition.negativeSpace
      && shot.graphicComposition.asymmetricWeight
      && shot.graphicComposition.frameWithinFrame
      && shot.graphicComposition.foregroundLayer
      && shot.graphicComposition.deepPlane
      && shot.graphicComposition.edgePlacement
      && shot.graphicComposition.geometricDivision
    )), `${concept} lacks graphic composition realization.`);
    assert(!/\b(?:camera moves closer|shoe fills frame|full-shoe beauty shot)\b/i.test(outcome.modelFacingScript.compiledText), `${concept} falls back to product magnification.`);
    assert(!concepts.some((token) => new RegExp(`\\b${token}\\b`).test(outcome.modelFacingScript.compiledText)), `${concept} leaked a Director Concept enum.`);
    const rerun = runCommercialFilmPipeline(request("QUIET_LUXURY", 0, { directorConceptOverride: concept }));
    if (rerun.status !== "GENERATED" || rerun.modelFacingScript.compiledText !== outcome.modelFacingScript.compiledText) deterministicFailures += 1;
    if (outcome.plan.directorConcept.qc.pseudo_luxury_device.status === "FAIL") pseudoLuxuryFailures += 1;
    if (outcome.plan.directorConcept.qc.director_concept_product_disconnect.status === "FAIL") productDisconnectFailures += 1;
    if (outcome.modelFacingScript.compiledText.length > previousCompactLength.QUIET_LUXURY * 1.25) promptLengthFailures += 1;
    conceptResults.push({
      concept,
      label: plan.directorConcept.label,
      contributions: plan.directorConcept.shots.map((shot) => shot.contribution),
      hero: plan.directorConcept.heroRule,
      release: plan.directorConcept.releaseRule,
      characterCount: outcome.modelFacingScript.compiledText.length,
    });
  }

  const quietVariants = ["STATIC_CAMERA_FILM", "LIGHT_REVEAL", "PARTIAL_OBSCURATION"].map((concept) => {
    const outcome = runCommercialFilmPipeline(request("QUIET_LUXURY", 0, { directorConceptOverride: concept }));
    assert(outcome.status === "GENERATED", `${concept} Quiet Luxury variant was blocked.`);
    return normalizedExecutionBody(outcome.modelFacingScript.compiledText);
  });
  assert(new Set(quietVariants).size === 3, "Quiet Luxury Director Concept variants collapsed into the same execution language.");

  assert(Object.keys(COMMERCIAL_DIRECTOR_CONCEPT_CATALOG).length === 8, "Director Concept catalog must contain eight concepts.");
  assert(deterministicFailures === 0, `${deterministicFailures} Director Concept determinism failures remain.`);
  assert(heroReleaseFailures === 0, `${heroReleaseFailures} HERO/RELEASE convergence failures remain.`);
  assert(graphicCompositionFailures === 0, `${graphicCompositionFailures} graphic composition failures remain.`);
  assert(pseudoLuxuryFailures === 0, `${pseudoLuxuryFailures} pseudo-luxury failures remain.`);
  assert(productDisconnectFailures === 0, `${productDisconnectFailures} product disconnect failures remain.`);
  assert(leakageFailures === 0, `${leakageFailures} internal leakage failures remain.`);
  assert(promptLengthFailures === 0, `${promptLengthFailures} Director Concept prompt-size failures remain.`);

  console.log("COMMERCIAL FILM V1.3 DIRECTOR CONCEPT VALIDATION PASS:", JSON.stringify({
    stage: "COMMERCIAL_DIRECTOR_CONCEPT_V1_3",
    directorConceptsReachable: naturalReach.size,
    deterministicFailures,
    heroReleaseFailures,
    graphicCompositionFailures,
    pseudoLuxuryFailures,
    productDisconnectFailures,
    internalLeakage: leakageFailures,
    promptLengthFailures,
    quietLuxuryVariantDistinctness: new Set(quietVariants).size,
    conceptResults,
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
