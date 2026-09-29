import type {
  CommercialFinalExecutionCheck,
  CommercialFinalExecutionDiagnostic,
  CommercialFinalExecutionPlan,
} from "./types";

function diagnosticCodes(plan: CommercialFinalExecutionPlan) {
  return new Set(plan.validation.diagnostics.map((entry) => entry.code));
}

function check(
  id: CommercialFinalExecutionCheck["id"],
  label: string,
  passed: boolean,
  reason: string
): CommercialFinalExecutionCheck {
  return {
    id,
    label,
    status: passed ? "PASS" : "FAIL",
    reason,
  };
}

export function validateCommercialFinalExecutionPlan(
  plan: CommercialFinalExecutionPlan
): CommercialFinalExecutionPlan {
  const diagnostics: CommercialFinalExecutionDiagnostic[] = [
    ...plan.validation.diagnostics,
  ];
  const codes = diagnosticCodes({ ...plan, validation: { ...plan.validation, diagnostics } });
  const ensureDiagnostic = (
    code: CommercialFinalExecutionDiagnostic["code"],
    layer: CommercialFinalExecutionDiagnostic["layer"],
    message: string
  ) => {
    if (codes.has(code)) return;
    diagnostics.push({ code, layer, message });
    codes.add(code);
  };

  const visibilityNormalized =
    plan.productVisibility.timeline.length === plan.physicalState.eventContracts.length
    && plan.productVisibility.timeline.every((beat) => beat.takeIndex >= 0)
    && !codes.has("VISIBILITY_CONFLICT");
  if (!visibilityNormalized) {
    ensureDiagnostic(
      "VISIBILITY_CONFLICT",
      "product-visibility",
      "Product visibility is not normalized one-to-one across the physical beats."
    );
  }

  const revealConsistent =
    plan.productVisibility.revealContract.compatible
    && !codes.has("REVEAL_CONFLICT");
  if (!revealConsistent) {
    ensureDiagnostic(
      "REVEAL_CONFLICT",
      "reveal",
      "The reveal contract is inconsistent with the normalized product visibility timeline."
    );
  }

  const resourcesDeclared =
    plan.device.resourceBindings.every((binding) => binding.resolved)
    && Boolean(plan.signature.resourceId)
    && !codes.has("UNDECLARED_PHYSICAL_RESOURCE");
  if (!resourcesDeclared) {
    ensureDiagnostic(
      "UNDECLARED_PHYSICAL_RESOURCE",
      "physical-resources",
      "At least one executable device or signature resource is not declared in the physical resource registry."
    );
  }

  const deviceResourceExists =
    plan.device.resourceBindings.length > 0
    && plan.device.resourceBindings.some((binding) => binding.resolved)
    && !codes.has("DEVICE_RESOURCE_MISSING");
  if (!deviceResourceExists) {
    ensureDiagnostic(
      "DEVICE_RESOURCE_MISSING",
      "device",
      "The device contract contains no resolved physical resource."
    );
  }

  const signatureEvidencePresent =
    Boolean(plan.signature.resourceId)
    && plan.signature.requiredVisibleEvidence.length > 0
    && !codes.has("SIGNATURE_VISIBLE_EVIDENCE_MISSING");
  if (!signatureEvidencePresent) {
    ensureDiagnostic(
      "SIGNATURE_VISIBLE_EVIDENCE_MISSING",
      "signature",
      "The signature contract lacks a declared resource or required visible evidence."
    );
  }

  const cameraCompatible =
    plan.camera.compatibilityStatus === "COMPATIBLE"
    && !codes.has("DEVICE_CAMERA_INCOMPATIBLE");
  if (!cameraCompatible) {
    ensureDiagnostic(
      "DEVICE_CAMERA_INCOMPATIBLE",
      "camera",
      "The Director Concept is incompatible with the executable Camera Plan."
    );
  }

  const takeCompatible =
    plan.device.resourceBindings.every((binding) => binding.takeIndex >= 0)
    && plan.signature.takeIndex >= 0
    && !codes.has("DEVICE_TAKE_INCOMPATIBLE")
    && !codes.has("INVALID_TAKE_COVERAGE");
  if (!takeCompatible) {
    ensureDiagnostic(
      "DEVICE_TAKE_INCOMPATIBLE",
      "take-structure",
      "The device or signature contract does not map into the executable TakePlan."
    );
  }

  const endingMatchesFinalState =
    plan.ending.finalImage.trim().length > 0
    && !codes.has("ENDING_STATE_CONFLICT")
    && !codes.has("ENDING_SUBJECT_EXIT")
    && !codes.has("ENDING_NEW_ACTION");
  if (!endingMatchesFinalState) {
    ensureDiagnostic(
      "ENDING_STATE_CONFLICT",
      "ending",
      "The selected ending image does not match the final structured character/world state."
    );
  }

  const completedActionNotReplayed = !codes.has("COMPLETED_ACTION_REPLAY");
  if (!completedActionNotReplayed) {
    ensureDiagnostic(
      "COMPLETED_ACTION_REPLAY",
      "ending",
      "The ending replays a completed single-use action."
    );
  }

  const endingHasNoNewEntity = !codes.has("ENDING_NEW_ENTITY");
  if (!endingHasNoNewEntity) {
    ensureDiagnostic(
      "ENDING_NEW_ENTITY",
      "ending",
      "The ending introduces an undeclared physical entity."
    );
  }

  const noFiveShotChronologyReintroduction =
    !codes.has("FIVE_SHOT_CHRONOLOGY_REINTRODUCTION")
    && plan.takeStructure.beatWindows.length === plan.physicalState.eventContracts.length;
  if (!noFiveShotChronologyReintroduction) {
    ensureDiagnostic(
      "FIVE_SHOT_CHRONOLOGY_REINTRODUCTION",
      "take-structure",
      "The production projection reintroduces five physical shots instead of TakePlan chronology."
    );
  }

  const filmLinePostProductionOnly =
    (!plan.ending.filmLine.value
      || (plan.ending.filmLine.postProductionOnly && plan.ending.filmLine.endingImagePreserved))
    && !codes.has("FILM_LINE_AUTHORITY_LEAK");
  if (!filmLinePostProductionOnly) {
    ensureDiagnostic(
      "FILM_LINE_AUTHORITY_LEAK",
      "film-line",
      "The film line is not constrained to post-production overlay behavior."
    );
  }

  const checks: CommercialFinalExecutionCheck[] = [
    check(
      "visibility_normalized",
      "One normalized Product Visibility state per beat",
      visibilityNormalized,
      visibilityNormalized
        ? "Every physical beat has one normalized visibility state."
        : "Visibility normalization or beat coverage failed."
    ),
    check(
      "reveal_contract_consistent",
      "Reveal Contract consistency",
      revealConsistent,
      revealConsistent
        ? "The reveal contract agrees with the visibility timeline."
        : "The reveal contract conflicts with the visibility timeline."
    ),
    check(
      "physical_resources_declared",
      "Declared physical resources",
      resourcesDeclared,
      resourcesDeclared
        ? "Every executable device and signature resource is declared."
        : "At least one executable physical resource is undeclared."
    ),
    check(
      "device_resource_exists",
      "Device resource exists",
      deviceResourceExists,
      deviceResourceExists
        ? "The device contract resolves to at least one declared resource."
        : "The device contract has no resolved resource."
    ),
    check(
      "signature_visible_evidence",
      "Signature visible evidence",
      signatureEvidencePresent,
      signatureEvidencePresent
        ? "The signature contract carries a resource and visible evidence."
        : "The signature contract lacks resource or visible evidence."
    ),
    check(
      "device_camera_compatible",
      "Device / Camera compatibility",
      cameraCompatible,
      cameraCompatible
        ? "The Camera Plan can execute the selected Director Concept."
        : "The Camera Plan conflicts with the Director Concept."
    ),
    check(
      "device_take_compatible",
      "Device / Take compatibility",
      takeCompatible,
      takeCompatible
        ? "Device and signature beat bindings map into TakePlan."
        : "Device or signature beat binding is outside TakePlan."
    ),
    check(
      "ending_matches_final_state",
      "Ending matches final state",
      endingMatchesFinalState,
      endingMatchesFinalState
        ? "The ending is compatible with the final structured state."
        : "The ending changes or contradicts the final structured state."
    ),
    check(
      "completed_action_not_replayed",
      "Completed action not replayed",
      completedActionNotReplayed,
      completedActionNotReplayed
        ? "The ending does not replay a completed single-use action."
        : "The ending replays a completed action."
    ),
    check(
      "ending_has_no_new_entity",
      "Ending has no new entity",
      endingHasNoNewEntity,
      endingHasNoNewEntity
        ? "The ending uses only declared physical resources."
        : "The ending introduces an undeclared entity."
    ),
    check(
      "no_five_shot_chronology_reintroduction",
      "No five-shot chronology reintroduction",
      noFiveShotChronologyReintroduction,
      noFiveShotChronologyReintroduction
        ? "The projection remains TakePlan-based."
        : "The projection reintroduces five physical shots."
    ),
    check(
      "film_line_post_production_only",
      "Film Line remains post-production only",
      filmLinePostProductionOnly,
      filmLinePostProductionOnly
        ? "The film line is a post-production overlay only."
        : "The film line leaks into generated world state."
    ),
  ];

  const failed = checks.some((entry) => entry.status === "FAIL");
  const status = failed ? "BLOCKED" : "VALID";
  return {
    ...plan,
    status,
    validation: {
      status,
      checks,
      diagnostics,
    },
  };
}
