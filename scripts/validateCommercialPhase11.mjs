import { resolve } from "node:path";
import { loadCommercialV13Api } from "./commercialV13Harness.mjs";

const api = await loadCommercialV13Api(resolve(import.meta.dirname, ".."));
const intents = ["URBAN_MOTION", "DAILY_STYLING", "QUIET_LUXURY", "PRODUCT_CRAFT", "NEW_ARRIVAL"];
const nonces = {
  URBAN_MOTION: [0, 1, 2],
  DAILY_STYLING: [0, 1, 2],
  QUIET_LUXURY: [2, 1, 3],
  PRODUCT_CRAFT: [0, 1, 2],
  NEW_ARRIVAL: [0, 1, 2],
};
const coverage = ["silhouette", "toe_structure", "side_panel_structure", "heel_structure", "outsole_profile", "color_blocking", "material_evidence"];
const timeTolerance = 0.051;
const categories = {
  beat_start_state_conflict: [],
  beat_end_state_conflict: [],
  intra_beat_transition_boundary_conflict: [],
  world_route_execution_mismatch: [],
  beat_outside_take_range: [],
  take_beat_time_gap: [],
  take_beat_time_overlap: [],
  take_window_not_derived_from_beats: [],
  signature_event_not_in_execution: [],
  signature_state_change_not_in_execution: [],
  signature_resource_change_not_in_execution: [],
  creative_device_execution_mismatch: [],
};
const cases = [];

for (const intent of intents) {
  for (const [caseIndex, generationNonce] of nonces[intent].entries()) {
    const caseId = `${intent.toLowerCase()}-${caseIndex + 1}`;
    const reference = {
      referenceSetId: `commercial-phase11-${caseId}`,
      taskId: "commercial-phase11-gate",
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
    const outcome = api.runCommercialV14Pipeline({
      commercialIntent: intent,
      characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "asian" },
      season: "秋",
      lifestyleFeeling: "安静 / 自然 / 克制",
      duration: 15,
      generationNonce,
      reference,
    });
    if (outcome.status !== "GENERATED") {
      cases.push({ caseId, intent, generationNonce, status: "BLOCKED", code: outcome.code, diagnostics: outcome.diagnostics });
      for (const category of Object.keys(categories)) {
        if (outcome.diagnostics?.some((item) => item.startsWith(category))) categories[category].push(caseId);
      }
      continue;
    }

    const plan = outcome.plan.basePlan;
    const treatment = outcome.plan.creativeTreatment;
    const shots = plan.shotArchitecture.shots;
    const takes = plan.continuity.takePlan.takes;
    for (const take of takes) {
      const first = shots.find((shot) => shot.shotIndex === take.shotIndexes[0]);
      const last = shots.find((shot) => shot.shotIndex === take.shotIndexes.at(-1));
      if (!first || !last
        || Math.abs(take.startSecond - first.timeRange.startSecond) > timeTolerance
        || Math.abs(take.endSecond - last.timeRange.endSecond) > timeTolerance) {
        categories.take_window_not_derived_from_beats.push(caseId);
      }
      for (const shotIndex of take.shotIndexes) {
        const shot = shots.find((entry) => entry.shotIndex === shotIndex);
        if (!shot || shot.timeRange.startSecond < take.startSecond - timeTolerance || shot.timeRange.endSecond > take.endSecond + timeTolerance) {
          categories.beat_outside_take_range.push(caseId);
        }
      }
    }
    for (let index = 1; index < shots.length; index += 1) {
      const delta = shots[index].timeRange.startSecond - shots[index - 1].timeRange.endSecond;
      if (delta > timeTolerance) categories.take_beat_time_gap.push(caseId);
      if (delta < -timeTolerance) categories.take_beat_time_overlap.push(caseId);
    }

    for (const beat of plan.eventSpine.shots) {
      const effects = beat.stateContract.effects.filter((effect) => effect.attribute === "space" && effect.fromValue !== effect.toValue);
      if (!effects.length) continue;
      const step = plan.continuity.worldStateTimeline.find((entry) => entry.shotIndex === beat.shotIndex);
      const actionIds = beat.stateContract.effects.map((effect) => effect.actionId).filter(Boolean);
      for (const effect of effects) {
        const start = step?.before.attributes[effect.entityId]?.space;
        const end = step?.after.attributes[effect.entityId]?.space;
        if (start !== effect.fromValue) categories.beat_start_state_conflict.push(caseId);
        if (end !== effect.toValue) categories.beat_end_state_conflict.push(caseId);
        if (!actionIds.includes("CROSS_THRESHOLD")) categories.intra_beat_transition_boundary_conflict.push(caseId);
      }
    }
    const route = plan.continuity.worldStateTimeline.map((step) => {
      const character = step.after.attributes.character?.space ?? "";
      return character;
    });
    const declaredRoute = plan.eventSpine.shots.map((beat) => {
      const effect = beat.stateContract.effects.find((entry) => entry.entityId === "character" && entry.attribute === "space" && entry.fromValue !== entry.toValue);
      return effect?.toValue ?? null;
    });
    for (let index = 0; index < route.length; index += 1) {
      const expected = declaredRoute[index];
      if (expected && route[index] !== expected) categories.world_route_execution_mismatch.push(caseId);
      if (index > 0 && !expected && route[index] !== route[index - 1]) categories.world_route_execution_mismatch.push(caseId);
    }

    for (const code of [
      "SIGNATURE_EVENT_NOT_IN_EXECUTION",
      "SIGNATURE_STATE_CHANGE_NOT_IN_EXECUTION",
      "SIGNATURE_RESOURCE_CHANGE_NOT_IN_EXECUTION",
      "CREATIVE_DEVICE_EXECUTION_MISMATCH",
    ]) {
      if (treatment.qc.some((gate) => gate.code === code && gate.status === "FAIL")) categories[code.toLowerCase()].push(caseId);
    }
    cases.push({
      caseId,
      intent,
      generationNonce,
      status: "GENERATED",
      advertisingStructure: plan.creativeSpine.advertisingStructure,
      productRole: plan.creativeSpine.productRole,
      endingStrategy: plan.creativeSpine.endingImageStrategy,
      directorConcept: treatment.directorConceptId,
      eventKinds: plan.eventSpine.eventChain,
      takeWindows: takes.map((take) => [take.startSecond, take.endSecond]),
      beatWindows: shots.map((shot) => [shot.timeRange.startSecond, shot.timeRange.endSecond]),
    });
  }
}

const counts = Object.fromEntries(Object.entries(categories).map(([name, examples]) => [name, examples.length]));
const generated = cases.filter((item) => item.status === "GENERATED").length;
const blocked = cases.length - generated;
const pass = generated === 15 && blocked === 0 && Object.values(counts).every((count) => count === 0);
console.log(JSON.stringify({
  stage: "COMMERCIAL_PHASE_1_1_REGRESSION_GATE",
  status: pass ? "PASS" : "FAIL",
  generated,
  blocked,
  categories: counts,
  cases,
}, null, 2));
if (!pass) process.exitCode = 1;
