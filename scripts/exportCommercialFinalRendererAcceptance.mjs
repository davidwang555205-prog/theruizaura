import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadCommercialV13Api, stableStringify } from "./commercialV13Harness.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const outputRoot = resolve(projectRoot, "artifacts", "commercial-final-renderer-acceptance");
const api = await loadCommercialV13Api(projectRoot);
const coverage = [
  "silhouette",
  "toe_structure",
  "side_panel_structure",
  "heel_structure",
  "outsole_profile",
  "color_blocking",
  "material_evidence",
];

function reference(mode, label) {
  return mode === "confirmed"
    ? {
      referenceSetId: `renderer-pack-confirmed-${label}`, taskId: "commercial-final-renderer-acceptance",
      sourceType: "current_task_reference_set", confirmationStatus: "confirmed",
      confirmedReferenceCount: 2, confirmedAssetIds: ["front", "side"],
      coverage, missingCoverage: [], referencePlanReady: true,
      productTruthMode: "reference_bound",
      productTruth: { coverage, status: "draft", referenceEvidenceBound: true, productTruthMode: "reference_bound" },
    }
    : {
      referenceSetId: `renderer-pack-zero-${label}`, taskId: "commercial-final-renderer-acceptance",
      sourceType: "current_task_reference_set", confirmationStatus: "incomplete",
      confirmedReferenceCount: 0, confirmedAssetIds: [], coverage: [],
      missingCoverage: coverage, referencePlanReady: false,
      productTruthMode: "reference_bound", productTruth: null,
    };
}

function request(testCase) {
  return {
    commercialIntent: testCase.intent,
    directorConceptOverride: testCase.concept,
    generationNonce: testCase.nonce,
    characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 自然 / 克制",
    duration: 15,
    reference: reference(testCase.referenceMode, testCase.slug),
  };
}

const cases = [
  { slug: "auto-urban-motion", intent: "URBAN_MOTION", nonce: 0, referenceMode: "zero", label: "AUTO" },
  { slug: "auto-daily-styling", intent: "DAILY_STYLING", nonce: 0, referenceMode: "zero", label: "AUTO" },
  { slug: "auto-quiet-luxury", intent: "QUIET_LUXURY", nonce: 0, referenceMode: "zero", label: "AUTO" },
  { slug: "auto-product-craft", intent: "PRODUCT_CRAFT", nonce: 0, referenceMode: "zero", label: "AUTO" },
  { slug: "auto-new-arrival", intent: "NEW_ARRIVAL", nonce: 0, referenceMode: "zero", label: "AUTO" },
  {
    slug: "forced-quiet-luxury-reflection-world",
    intent: "QUIET_LUXURY",
    concept: "REFLECTION_WORLD",
    nonce: 0,
    referenceMode: "zero",
    label: "FORCED_COMPATIBLE",
  },
];

const manifestCases = [];
for (const testCase of cases) {
  const outcome = api.runCommercialV14Pipeline(request(testCase));
  if (outcome.status !== "GENERATED") {
    throw new Error(`${testCase.slug} is not renderable: ${outcome.code} ${outcome.reason}`);
  }
  if (outcome.plan.finalExecutionPlan.status !== "VALID" || outcome.plan.renderValidation.status !== "VALID") {
    throw new Error(`${testCase.slug} failed Final Plan or Render validation.`);
  }
  const directory = resolve(outputRoot, testCase.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "director-script.txt"), `${outcome.plan.directorScript.text}\n`);
  await writeFile(resolve(directory, "seedance-prompt.txt"), `${outcome.plan.seedancePrompt.text}\n`);
  await writeFile(resolve(directory, "final-execution-plan.json"), `${JSON.stringify(outcome.plan.finalExecutionPlan, null, 2)}\n`);
  await writeFile(resolve(directory, "creative-treatment.json"), `${JSON.stringify(outcome.plan.creativeTreatment, null, 2)}\n`);
  await writeFile(resolve(directory, "render-validation.json"), `${JSON.stringify(outcome.plan.renderValidation, null, 2)}\n`);
  manifestCases.push({
    slug: testCase.slug,
    label: testCase.label,
    intent: testCase.intent,
    concept: outcome.plan.authorityConsolidation.effectiveDirectorConceptId,
    nonce: testCase.nonce,
    takeCount: outcome.plan.finalExecutionPlan.takeStructure.takes.length,
    beatCount: outcome.plan.finalExecutionPlan.beats.length,
    revealBeat: outcome.plan.finalExecutionPlan.productVisibility.revealContract.revealBeatIndex + 1,
    directorChars: outcome.plan.directorScript.text.length,
    seedanceChars: outcome.plan.seedancePrompt.charCount,
    finalPlanStatus: outcome.plan.finalExecutionPlan.status,
    renderValidationStatus: outcome.plan.renderValidation.status,
  });
}

await writeFile(resolve(outputRoot, "manifest.json"), `${JSON.stringify({
  schemaVersion: "commercial-film/final-renderer-acceptance-v1",
  generatedAt: new Date().toISOString(),
  providerExecution: "NOT_RUN",
  visualStatus: "READY_FOR_REAL_SEEDANCE_E2E",
  cases: manifestCases,
}, null, 2)}\n`);

console.log("COMMERCIAL FINAL RENDERER ACCEPTANCE PACK EXPORTED:", JSON.stringify({
  output: outputRoot,
  cases: manifestCases.length,
  autoCases: manifestCases.filter((entry) => entry.label === "AUTO").length,
  forcedCompatibleCases: manifestCases.filter((entry) => entry.label === "FORCED_COMPATIBLE").length,
  providerExecution: "NOT_RUN",
  visualStatus: "READY_FOR_REAL_SEEDANCE_E2E",
}, null, 2));
