import { resolve } from 'node:path';
import { loadCommercialV13Api, stableStringify } from './commercialV13Harness.mjs';

const api = await loadCommercialV13Api(resolve(import.meta.dirname, '..'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const reference = {
  referenceSetId: 'creative-execution-regression', taskId: 'creative-execution-regression',
  sourceType: 'current_task_reference_set', confirmationStatus: 'confirmed',
  confirmedReferenceCount: 2, confirmedAssetIds: ['front', 'side'],
  coverage: ['silhouette', 'toe_structure', 'side_panel_structure', 'heel_structure', 'outsole_profile', 'color_blocking', 'material_evidence'],
  missingCoverage: [], referencePlanReady: true, productTruthMode: 'reference_bound',
  productTruth: { coverage: ['silhouette', 'toe_structure', 'side_panel_structure', 'heel_structure', 'outsole_profile', 'color_blocking', 'material_evidence'], status: 'draft', referenceEvidenceBound: true, productTruthMode: 'reference_bound' },
};

function request(intent, concept) {
  return {
    commercialIntent: intent,
    directorConceptOverride: concept,
    generationNonce: 0,
    characterSelection: { ageProfileId: 'age_33_37', appearanceGroupId: 'asian' },
    season: '秋',
    lifestyleFeeling: '安静 / 自然 / 克制',
    duration: 15,
    reference,
  };
}

function run(intent, concept) {
  const input = request(intent, concept);
  const outcome = api.runCommercialV14Pipeline(input);
  const base = api.runCommercialFilmPipeline(input);
  assert(base.status === 'GENERATED', `${intent}/${concept}: base pipeline blocked`);
  if (outcome.status === 'BLOCKED') {
    assert(
      [
        'DIRECTOR_CONCEPT_RESOURCE_INCOMPATIBLE',
        'DIRECTOR_CONCEPT_CAMERA_INCOMPATIBLE',
        'DIRECTOR_CONCEPT_EVENT_INCOMPATIBLE',
        'FINAL_EXECUTION_PLAN_BLOCKED',
        'CREATIVE_DIRECTING_FAILED',
      ].includes(outcome.code),
      `${intent}/${concept}: unexpected blocked code ${outcome.code}`
    );
    assert(outcome.diagnostics.length > 0, `${intent}/${concept}: blocked outcome has no diagnostics`);
    return { outcome, base };
  }
  assert(outcome.plan.canonicalCompiledText === base.modelFacingScript.compiledText, `${intent}/${concept}: canonical text changed`);
  assert(
    stableStringify(outcome.plan.basePlan.continuity.takePlan) === stableStringify(base.plan.continuity.takePlan),
    `${intent}/${concept}: Take Plan changed`
  );
  return { outcome, base };
}

function assertValidFinalPlan(result, label) {
  const plan = result.outcome.plan;
  const finalPlan = plan.finalExecutionPlan;
  assert(finalPlan.schemaVersion === 'commercial-film/final-execution-plan-v1', `${label}: final plan schema missing`);
  assert(finalPlan.status === 'VALID', `${label}: generated production output has BLOCKED Final Plan`);
  assert(finalPlan.status === finalPlan.validation.status, `${label}: final plan status mismatch`);
  assert(finalPlan.validation.checks.length === 12, `${label}: final plan validation check count changed`);
  assert(finalPlan.productVisibility.timeline.length === 5, `${label}: normalized visibility timeline is not five beats`);
  assert(
    finalPlan.productVisibility.timeline.every((beat) => Boolean(beat.normalizedState)),
    `${label}: normalized visibility state missing`
  );
  assert(finalPlan.productVisibility.revealContract, `${label}: reveal contract missing`);
  assert(finalPlan.takeStructure.beatWindows.length === 5, `${label}: beat windows missing`);
  assert(finalPlan.device.resourceBindings.length === 5, `${label}: device resource bindings missing`);
  assert(
    finalPlan.device.resourceBindings.every((binding) => binding.resolved),
    `${label}: unresolved executable resource remains`
  );
  assert(finalPlan.source.productionCompiledText === plan.v14CompiledText, `${label}: final plan production source diverged`);
  return finalPlan;
}

const quietReflection = run('QUIET_LUXURY', 'REFLECTION_WORLD');
if (quietReflection.outcome.status === 'BLOCKED') {
  assert(
    quietReflection.outcome.code === 'DIRECTOR_CONCEPT_RESOURCE_INCOMPATIBLE',
    'QUIET_LUXURY/REFLECTION_WORLD blocked for the wrong reason'
  );
  console.log('PASS QUIET_LUXURY/REFLECTION_WORLD: no executable reflective resource, explicit BLOCK');
} else {
  const finalPlan = assertValidFinalPlan(quietReflection, 'QUIET_LUXURY/REFLECTION_WORLD');
  assert(
    finalPlan.signature.resourceId === 'condition:scene:window-glass',
    'QUIET_LUXURY/REFLECTION_WORLD must use the declared scene-world window glass resource'
  );
  assert(
    finalPlan.device.resourceBindings.every((binding) => binding.resourceId === finalPlan.signature.resourceId),
    'QUIET_LUXURY/REFLECTION_WORLD must keep one declared reflective resource across the device arc'
  );
  console.log('PASS QUIET_LUXURY/REFLECTION_WORLD: declared window glass resource and Final Renderer');
}

for (const intent of ['DAILY_STYLING', 'PRODUCT_CRAFT', 'URBAN_MOTION', 'NEW_ARRIVAL']) {
  const result = run(intent, 'REFLECTION_WORLD');
  if (result.outcome.status === 'BLOCKED') {
    assert(
      result.outcome.code === 'DIRECTOR_CONCEPT_RESOURCE_INCOMPATIBLE'
      || result.outcome.code === 'DIRECTOR_CONCEPT_CAMERA_INCOMPATIBLE',
      `${intent}/REFLECTION_WORLD blocked for an unexpected reason`
    );
    console.log(`PASS ${intent}/REFLECTION_WORLD: explicit ${result.outcome.code}`);
    continue;
  }
  const finalPlan = assertValidFinalPlan(result, `${intent}/REFLECTION_WORLD`);
  assert(
    new Set(result.outcome.plan.creativeTreatment.deviceArc.map((beat) => beat.deviceCarrier)).size === 1,
    `${intent}: reflection carrier overload`
  );
  assert(
    finalPlan.signature.resourceId === finalPlan.device.resourceId,
    `${intent}: signature and device resource differ`
  );
  console.log(`PASS ${intent}/REFLECTION_WORLD: ${finalPlan.signature.resourceId}`);
}

for (const concept of ['PARTIAL_OBSCURATION', 'LIGHT_REVEAL', 'WORLD_MOVES_SUBJECT_SETTLES', 'THRESHOLD_CHAIN']) {
  const result = run('QUIET_LUXURY', concept);
  if (result.outcome.status === 'BLOCKED') {
    assert(
      result.outcome.code === 'DIRECTOR_CONCEPT_RESOURCE_INCOMPATIBLE'
      || result.outcome.code === 'DIRECTOR_CONCEPT_CAMERA_INCOMPATIBLE',
      `QUIET_LUXURY/${concept}: unexpected blocked code`
    );
    console.log(`PASS QUIET_LUXURY/${concept}: explicit ${result.outcome.code}`);
    continue;
  }
  const plan = result.outcome.plan;
  assertValidFinalPlan(result, `QUIET_LUXURY/${concept}`);
  assert(plan.v14CompiledText.includes('[CREATIVE DEVICE — PHYSICAL EXECUTION]'), `${concept}: production binding absent`);
  assert(plan.presentation.presentationScript.includes('Visual:'), `${concept}: director script absent`);
  console.log(`PASS QUIET_LUXURY/${concept}: production output and base identity`);
}
