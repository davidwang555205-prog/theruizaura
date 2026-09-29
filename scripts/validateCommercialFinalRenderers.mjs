import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { loadCommercialV13Api, stableStringify } from "./commercialV13Harness.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const api = await loadCommercialV13Api(projectRoot);
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
const intents = [
  "URBAN_MOTION",
  "DAILY_STYLING",
  "QUIET_LUXURY",
  "PRODUCT_CRAFT",
  "NEW_ARRIVAL",
];
const concepts = Object.keys(api.COMMERCIAL_DIRECTOR_CONCEPT_CATALOG);

function reference(mode, label) {
  return mode === "confirmed"
    ? {
      referenceSetId: `renderer-confirmed-${label}`, taskId: "commercial-final-renderers",
      sourceType: "current_task_reference_set", confirmationStatus: "confirmed",
      confirmedReferenceCount: 2, confirmedAssetIds: ["front", "side"],
      coverage, missingCoverage: [], referencePlanReady: true,
      productTruthMode: "reference_bound",
      productTruth: { coverage, status: "draft", referenceEvidenceBound: true, productTruthMode: "reference_bound" },
    }
    : {
      referenceSetId: `renderer-zero-${label}`, taskId: "commercial-final-renderers",
      sourceType: "current_task_reference_set", confirmationStatus: "incomplete",
      confirmedReferenceCount: 0, confirmedAssetIds: [], coverage: [],
      missingCoverage: coverage, referencePlanReady: false,
      productTruthMode: "reference_bound", productTruth: null,
    };
}

function request(input) {
  return {
    commercialIntent: input.intent,
    directorConceptOverride: input.concept,
    generationNonce: input.nonce,
    characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 自然 / 克制",
    duration: 15,
    reference: reference(input.mode, `${input.intent}-${input.concept ?? "auto"}-${input.nonce}-${input.mode}`),
  };
}

function assertRendered(outcome, label) {
  assert(outcome.status === "GENERATED", `${label}: expected generated, received ${outcome.code}`);
  const plan = outcome.plan;
  assert(plan.finalExecutionPlan.status === "VALID", `${label}: final plan is BLOCKED`);
  assert(plan.renderValidation.status === "VALID", `${label}: render validation failed`);
  assert(plan.directorScript.status === "GENERATED", `${label}: director renderer missing`);
  assert(plan.seedancePrompt.status === "GENERATED", `${label}: seedance renderer missing`);
  assert(!/\bV1\.[345]\b/.test(plan.directorScript.text), `${label}: internal version leaked into director script`);
  assert(!/\bV1\.[345]\b/.test(plan.seedancePrompt.text), `${label}: internal version leaked into seedance prompt`);
  assert(!/\bSHOT\s+\d+\s*[—:-]/i.test(plan.seedancePrompt.text), `${label}: legacy SHOT heading leaked`);
  assert(!/\[V1\.4 CREATIVE DIRECTING\]/.test(plan.seedancePrompt.text), `${label}: post-compiler authority leaked`);
  assert(!/logo animation|brand end card|generated lettering/i.test(plan.seedancePrompt.text), `${label}: generated branding instruction leaked`);
  assert(
    plan.directorScript.schemaVersion === "commercial-film/final-renderers-v1"
      && plan.seedancePrompt.schemaVersion === "commercial-film/final-renderers-v1",
    `${label}: renderer schema missing`
  );
  return plan;
}

const autoCases = [];
let autoComplete = 0;
for (const intent of intents) {
  for (let nonce = 0; nonce < 5; nonce += 1) {
    for (const mode of ["zero", "confirmed"]) {
      const label = `AUTO ${intent}/${nonce}/${mode}`;
      const outcome = api.runCommercialV14Pipeline(request({ intent, nonce, mode }));
      const plan = assertRendered(outcome, label);
      assert(
        stableStringify(plan.renderValidation) === stableStringify(
          api.runCommercialV14Pipeline(request({ intent, nonce, mode })).plan.renderValidation
        ),
        `${label}: renderer output is not deterministic`
      );
      autoComplete += 1;
      autoCases.push({
        intent,
        nonce,
        mode,
        effectiveConcept: outcome.plan.authorityConsolidation.effectiveDirectorConceptId,
        directorChars: plan.directorScript.text.length,
        seedanceChars: plan.seedancePrompt.charCount,
        takeCount: plan.seedancePrompt.takeCount,
        revealBeat: plan.seedancePrompt.revealBeatIndex + 1,
      });
    }
  }
}

let forcedCompatible = 0;
for (const intent of intents) {
  for (const concept of concepts) {
    for (const nonce of [0, 1, 2]) {
      const label = `FORCED ${intent}/${concept}/${nonce}`;
      const outcome = api.runCommercialV14Pipeline(request({ intent, nonce, mode: "zero", concept }));
      if (outcome.status === "BLOCKED") continue;
      assertRendered(outcome, label);
      forcedCompatible += 1;
    }
  }
}

const golden = [
  { id: "A", label: "QUIET_LUXURY + REFLECTION_WORLD", input: { intent: "QUIET_LUXURY", concept: "REFLECTION_WORLD", nonce: 0, mode: "zero" } },
  { id: "B", label: "STATIC_CAMERA_FILM compatible", input: { intent: "QUIET_LUXURY", nonce: 2, mode: "zero" } },
  { id: "C", label: "PRODUCT_CRAFT compatible", input: { intent: "PRODUCT_CRAFT", nonce: 0, mode: "zero" } },
  { id: "D", label: "THRESHOLD_CHAIN compatible", input: { intent: "NEW_ARRIVAL", concept: "THRESHOLD_CHAIN", nonce: 0, mode: "zero" } },
  { id: "E", label: "LIGHT_REVEAL compatible", input: { intent: "QUIET_LUXURY", concept: "LIGHT_REVEAL", nonce: 1, mode: "zero" } },
  { id: "F", label: "REPEATED_GESTURE compatible", input: { intent: "PRODUCT_CRAFT", concept: "REPEATED_GESTURE", nonce: 0, mode: "zero" } },
];
for (const item of golden) {
  const outcome = api.runCommercialV14Pipeline(request(item.input));
  assertRendered(outcome, `GOLDEN ${item.id} ${item.label}`);
}

const outputPath = process.env.COMMERCIAL_RENDERER_OUTPUT
  ?? join(tmpdir(), "commercial-final-renderer-validation.json");
await writeFile(outputPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  autoCases,
  autoComplete,
  forcedCompatible,
  golden: golden.map((entry) => entry.id),
}, null, 2)}\n`);

console.log("COMMERCIAL FINAL RENDERER VALIDATION PASS:", JSON.stringify({
  autoCases: autoComplete,
  autoRenderValid: autoComplete,
  forcedCompatible,
  forcedRenderValid: forcedCompatible,
  golden: golden.length,
  output: outputPath,
}, null, 2));
