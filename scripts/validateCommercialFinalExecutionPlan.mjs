import { readFile, writeFile } from "node:fs/promises";
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
const nonces = [0, 1, 2];
const concepts = Object.keys(api.COMMERCIAL_DIRECTOR_CONCEPT_CATALOG);

function reference(mode, label) {
  if (mode === "confirmed") {
    return {
      referenceSetId: `final-plan-confirmed-${label}`,
      taskId: "commercial-final-execution-plan-phase-a",
      sourceType: "current_task_reference_set",
      confirmationStatus: "confirmed",
      confirmedReferenceCount: 2,
      confirmedAssetIds: ["front", "side"],
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
  }
  return {
    referenceSetId: `final-plan-zero-${label}`,
    taskId: "commercial-final-execution-plan-phase-a",
    sourceType: "current_task_reference_set",
    confirmationStatus: "incomplete",
    confirmedReferenceCount: 0,
    confirmedAssetIds: [],
    coverage: [],
    missingCoverage: coverage,
    referencePlanReady: false,
    productTruthMode: "reference_bound",
    productTruth: null,
  };
}

function request(intent, concept, nonce, mode) {
  const label = `${intent}-${concept}-${nonce}-${mode}`;
  return {
    commercialIntent: intent,
    directorConceptOverride: concept,
    generationNonce: nonce,
    characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 自然 / 克制",
    duration: 15,
    reference: reference(mode, label),
  };
}

function diagnosticsByCategory(plan) {
  const categories = {
    visibility: new Set(["VISIBILITY_CONFLICT", "REVEAL_CONFLICT"]),
    undeclaredResource: new Set([
      "UNDECLARED_PHYSICAL_RESOURCE",
      "DEVICE_RESOURCE_MISSING",
      "SIGNATURE_VISIBLE_EVIDENCE_MISSING",
    ]),
    deviceCamera: new Set(["DEVICE_CAMERA_INCOMPATIBLE"]),
    take: new Set([
      "DEVICE_TAKE_INCOMPATIBLE",
      "INVALID_TAKE_COVERAGE",
      "FIVE_SHOT_CHRONOLOGY_REINTRODUCTION",
    ]),
    ending: new Set([
      "ENDING_STATE_CONFLICT",
      "ENDING_NEW_ENTITY",
      "ENDING_NEW_ACTION",
      "ENDING_SUBJECT_EXIT",
      "COMPLETED_ACTION_REPLAY",
    ]),
  };
  const result = {
    visibility: false,
    undeclaredResource: false,
    deviceCamera: false,
    take: false,
    ending: false,
    other: false,
  };
  for (const diagnostic of plan.validation.diagnostics) {
    let matched = false;
    for (const [category, codes] of Object.entries(categories)) {
      if (codes.has(diagnostic.code)) {
        result[category] = true;
        matched = true;
      }
    }
    if (!matched) result.other = true;
  }
  return result;
}

const cases = [];
let generated = 0;
let valid = 0;
let blocked = 0;
let plannerBlocked = 0;
const reasonCounts = {
  visibility: 0,
  undeclaredResource: 0,
  deviceCamera: 0,
  take: 0,
  ending: 0,
  other: 0,
};
const byConcept = {};

for (const intent of intents) {
  for (const concept of concepts) {
    if (!api.COMMERCIAL_DIRECTOR_CONCEPT_CATALOG[concept].compatibleIntents.includes(intent)) continue;
    for (const nonce of nonces) {
      for (const mode of ["zero", "confirmed"]) {
        if (mode === "confirmed" && nonce !== 0) continue;
        const input = request(intent, concept, nonce, mode);
        const first = api.runCommercialV14Pipeline(input);
        if (first.status !== "GENERATED") {
          plannerBlocked += 1;
          byConcept[concept] ??= { generated: 0, valid: 0, blocked: 0, plannerBlocked: 0 };
          byConcept[concept].plannerBlocked += 1;
          cases.push({
            intent,
            concept,
            nonce,
            referenceMode: mode,
            status: "PLANNER_BLOCKED",
            code: first.code,
            reason: first.reason,
            diagnostics: first.diagnostics,
          });
          continue;
        }
        const second = api.runCommercialV14Pipeline(input);
        assert(second.status === "GENERATED", `${intent}/${concept}/${nonce}/${mode}: rerun blocked.`);
        assert(
          stableStringify(first.plan.finalExecutionPlan) === stableStringify(second.plan.finalExecutionPlan),
          `${intent}/${concept}/${nonce}/${mode}: final execution plan is not deterministic.`
        );

        const finalPlan = first.plan.finalExecutionPlan;
        assert(finalPlan.status === finalPlan.validation.status, `${intent}/${concept}/${nonce}/${mode}: final plan status mismatch.`);
        assert(finalPlan.validation.checks.length === 12, `${intent}/${concept}/${nonce}/${mode}: validation check set changed.`);
        assert(finalPlan.productVisibility.timeline.length === first.plan.basePlan.shotArchitecture.shots.length, `${intent}/${concept}/${nonce}/${mode}: visibility timeline length mismatch.`);
        assert(finalPlan.productVisibility.timeline.every((beat) => beat.normalizedState), `${intent}/${concept}/${nonce}/${mode}: normalized visibility state missing.`);
        assert(finalPlan.takeStructure.beatWindows.length === first.plan.basePlan.shotArchitecture.shots.length, `${intent}/${concept}/${nonce}/${mode}: beat windows mismatch.`);
        assert(finalPlan.device.resourceBindings.length === 5, `${intent}/${concept}/${nonce}/${mode}: device binding count mismatch.`);
        assert(finalPlan.physicalResources.length > 0, `${intent}/${concept}/${nonce}/${mode}: physical resource registry empty.`);
        assert(
          stableStringify(first.plan.v14CompiledText) === stableStringify(second.plan.v14CompiledText)
            && stableStringify(first.plan.presentation.presentationScript) === stableStringify(second.plan.presentation.presentationScript),
          `${intent}/${concept}/${nonce}/${mode}: production output is not deterministic.`
        );

        generated += 1;
        const reasonCategories = diagnosticsByCategory(finalPlan);
        if (finalPlan.status === "VALID") {
          valid += 1;
        } else {
          blocked += 1;
          for (const [category, present] of Object.entries(reasonCategories)) {
            if (present) reasonCounts[category] += 1;
          }
        }
        byConcept[concept] ??= { generated: 0, valid: 0, blocked: 0, plannerBlocked: 0 };
        byConcept[concept].generated += 1;
        byConcept[concept][finalPlan.status === "VALID" ? "valid" : "blocked"] += 1;

        cases.push({
          intent,
          concept,
          nonce,
          referenceMode: mode,
          status: finalPlan.status,
          validationStatus: finalPlan.validation.status,
          diagnosticCodes: [...new Set(finalPlan.validation.diagnostics.map((entry) => entry.code))],
          reasonCategories,
          normalizedVisibility: finalPlan.productVisibility.timeline.map((beat) => ({
            beat: beat.beatIndex + 1,
            state: beat.normalizedState,
            presence: beat.sourcePresence,
            legacyLevel: beat.sourceLegacyLevel,
          })),
          revealContract: finalPlan.productVisibility.revealContract,
          unresolvedResources: finalPlan.device.resourceBindings
            .filter((binding) => !binding.resolved)
            .map((binding) => ({ beat: binding.beatIndex + 1, carrier: binding.carrier })),
          cameraStatus: finalPlan.camera.compatibilityStatus,
          candidateEndingAccepted: finalPlan.ending.candidateAccepted,
          candidateEndingImage: finalPlan.ending.candidateImage,
          finalEndingImage: finalPlan.ending.finalImage,
          endingRejectionReasons: finalPlan.ending.rejectionReasons,
          productionPromptLength: first.plan.v14CompiledText.length,
        });
      }
    }
  }
}

const outputPath = process.env.COMMERCIAL_FINAL_PLAN_OUTPUT
  ?? join(tmpdir(), "commercial-final-execution-plan-phase-a-matrix.json");
await writeFile(
  outputPath,
  `${JSON.stringify({
    schemaVersion: "commercial-film/final-execution-plan-validation-v1",
    generated,
    valid,
    blocked,
    plannerBlocked,
    reasonCounts,
    byConcept,
    cases,
  }, null, 2)}\n`
);

const coreBaselinePath = resolve(projectRoot, "src", "commercial-film", "v1.5-continuity-baseline.json");
const coreBaseline = JSON.parse(await readFile(coreBaselinePath, "utf8"));
const protectedPaths = coreBaseline.protectedSources.map((entry) => entry.path);

console.log("COMMERCIAL FINAL EXECUTION PLAN FORCED/SHADOW VALIDATION PASS:", JSON.stringify({
  generated,
  valid,
  blocked,
  plannerBlocked,
  reasonCounts,
  byConcept,
  output: outputPath,
  protectedPaths,
  productionBindingChanged: false,
}, null, 2));
