import type {
  CommercialFilmPlan,
  CommercialQc,
  CommercialQcGate,
  CommercialQcGateId,
} from "./types";

export type CommercialQcInput = Omit<
  CommercialFilmPlan,
  "schemaVersion" | "plannerVersion" | "status" | "qc" | "failureReasons"
>;

const GATE_LABELS: Record<CommercialQcGateId, string> = {
  product_message_preserved: "Product Message Preserved",
  brand_mood_preserved: "Brand Mood Preserved",
  product_readability: "Product Readability",
  hero_moment_exists: "Hero Moment Exists",
  detail_supported_by_reference: "Detail Supported By Reference",
  continuity_state_consistent: "Continuity State Consistent",
  take_grouping_motivated: "Take Grouping Motivated",
  micro_decision_visible_consequence: "Micro Decision Visible Consequence",
  no_product_deformation: "No Product Deformation",
  no_product_identity_drift: "No Product Identity Drift",
  no_random_scene_jump: "No Random Scene Jump",
  no_random_character_reset: "No Random Character Reset",
  physical_reality: "Physical Reality",
  camera_continuity: "Camera Continuity",
  no_runway_pose: "No Runway Pose",
  no_shoe_modeling_pose: "No Shoe Modeling Pose",
  no_commercial_cliche_overload: "No Commercial Cliché Overload",
  natural_ending: "Natural Ending",
  full_15_second_timing: "Full 15s Timing",
  execution_specificity: "Execution Specificity",
  sound_world_context: "Sound World Context Binding",
  world_realism: "World Realism",
};

function gate(
  id: CommercialQcGateId,
  passed: boolean,
  reason: string
): CommercialQcGate {
  return {
    id,
    label: GATE_LABELS[id],
    status: passed ? "PASS" : "FAIL",
    reason,
  };
}

function executedActionText(input: CommercialQcInput) {
  return input.actionPlan.map((item) => item.physicalActionLine).join(" ");
}

function hasContiguousTiming(input: CommercialQcInput) {
  const shots = input.shotArchitecture.shots;
  if (shots.length !== 5) return false;
  if (shots[0]?.timeRange.startSecond !== 0) return false;
  if (shots[4]?.timeRange.endSecond !== 15) return false;
  return shots.every((shot, index) => {
    if (shot.timeRange.durationSeconds < 1 || shot.timeRange.durationSeconds > 5) return false;
    if (index === 0) return true;
    return shot.timeRange.startSecond === shots[index - 1]?.timeRange.endSecond;
  });
}

function hasDynamicTiming(input: CommercialQcInput) {
  const durations = input.shotArchitecture.shots.map((shot) => shot.timeRange.durationSeconds);
  return new Set(durations).size > 1;
}

export function runCommercialFilmQc(input: CommercialQcInput): {
  qc: CommercialQc;
  passed: boolean;
  failureReasons: string[];
} {
  const categoryOnlyIntentAllowed = [
    "QUIET_LUXURY",
    "URBAN_MOTION",
    "DAILY_STYLING",
    "NEW_ARRIVAL",
  ].includes(input.commercialIntent);
  const categoryOnlyProductContextAllowed = input.referenceState.confirmedReferenceCount === 0
    && categoryOnlyIntentAllowed
    && input.productMessage.brandDefaultProductContext?.brand === "THERUIZ AURA"
    && input.productMessage.brandDefaultProductContext.specificity === "CATEGORY_ONLY";
  const referenceCoverage = new Set(input.referenceState.coverage);
  const actionText = executedActionText(input);
  const referenceSourceBound =
    input.referenceState.status === "REFERENCE_READY"
    && (
      input.referenceState.confirmedReferenceCount > 0
      || categoryOnlyProductContextAllowed
    );
  const productMessagePreserved =
    input.productMessage.evidenceLines.length > 0
    && input.productMessage.supportedDimensions.every((dimension) => referenceCoverage.has(dimension.coverage))
    && input.productMessage.prohibitedClaims.length > 0;
  const dimensionIsReferenceBacked = (dimension: typeof input.productMessage.supportedDimensions[number]["coverage"] | null) => Boolean(
    dimension
    && referenceCoverage.has(dimension)
    && input.productMessage.supportedDimensions.some((supported) => supported.coverage === dimension)
  );
  const isCategoryOnlyEnvironmentalDetail = (shot: CommercialQcInput["shotArchitecture"]["shots"][number]) => {
    const relationship = shot.event.productDetailRelationship?.trim() ?? "";
    return categoryOnlyProductContextAllowed
      && shot.productMessageDimension === null
      && relationship.length > 0
      && !/\b(?:material|leather|grain|texture|stitch|seam|panel|sole|outsole|toe|heel|logo|color|construction|finish)\b/i.test(relationship);
  };
  const productExpressionShots = input.shotArchitecture.shots.filter((shot) => (
    (
      shot.productVisibility === "PRODUCT_READABLE"
      || shot.productVisibility === "PRODUCT_HERO"
      || (shot.role === "DETAIL" && shot.productVisibility === "PRODUCT_DETAIL" && isCategoryOnlyEnvironmentalDetail(shot))
    )
    && input.creativeSpine.productPresenceByShot[shot.shotIndex] === "CLEAR"
  ));
  const readableShot = productExpressionShots.find((shot) => (
    dimensionIsReferenceBacked(shot.productMessageDimension)
    || (input.productMessage.externalReferenceRequired && input.referenceState.confirmedReferenceCount > 0)
    || categoryOnlyProductContextAllowed
  ));
  const heroShot = input.shotArchitecture.shots.find((shot) => shot.role === "HERO");
  const releaseShot = input.shotArchitecture.shots.find((shot) => shot.role === "RELEASE");
  const readableProductShots = productExpressionShots;
  const readableActionText = readableProductShots.map((shot) => shot.action.physicalActionLine)
    .join(" ").replace(/\b(?:without|no)\s+(?:posing|a\s+pose|any\s+pose)\b/gi, " ");
  const readablePoseFree = !/\b(?:pose|poses|posed|posing)\b|\bpresents?\s+the\s+(?:shoe|product)\b|\bdisplays?\s+the\s+(?:shoe|product)\b|\bstops?\s+for\s+the\s+camera\b/i.test(readableActionText);
  const heroHoldMotivated = [...readableProductShots, ...(heroShot ? [heroShot] : [])]
    .every((shot) => shot.camera.movement !== "brief_hero_hold" || shot.event.actionContinuity === "SETTLES");
  const heroReadabilityReachable = Boolean(readableShot)
    && (categoryOnlyProductContextAllowed
      || input.creativeSpine.productRole !== "HERO"
      || productExpressionShots.some((shot) => shot.productVisibility === "PRODUCT_HERO" && (
        dimensionIsReferenceBacked(shot.productMessageDimension)
        || (input.productMessage.externalReferenceRequired && input.referenceState.confirmedReferenceCount > 0)
        || categoryOnlyProductContextAllowed
      )))
    && readablePoseFree
    && heroHoldMotivated;
  const continuityStateConsistent = input.continuity.status === "CONTINUOUS"
    && input.continuity.conflicts.length === 0;
  const takePlan = input.continuity.takePlan;
  const takeGroupingMotivated = takePlan.takes.length > 0
    && takePlan.takes.length <= 3
    && takePlan.failureReasons.length === 0
    && takePlan.takes.every((take) => take.shotIndexes.length > 0);
  const microDecisionValid = input.microDecision.status !== "MICRO_DECISION_FAILED";
  const microDecisionLine = input.microDecision.status === "MICRO_DECISION_NOT_DECLARED"
    ? "No Micro Decision contract is declared for this film."
    : microDecisionValid
      ? "The declared Micro Decision shows its visible consequence after the chosen action and does not restart it."
      : `The declared Micro Decision is not executable: ${input.microDecision.failureReasons.join(" | ")}`;
  const declaredDetailShots = input.shotArchitecture.shots.filter((shot) => shot.productVisibility === "PRODUCT_DETAIL");
  const detailSupported = declaredDetailShots.every((shot) => {
    const relationship = shot.event.productDetailRelationship?.trim() ?? "";
    return Boolean(relationship)
      && (dimensionIsReferenceBacked(shot.productMessageDimension) || isCategoryOnlyEnvironmentalDetail(shot));
  });
  const actionPhysical = input.actionPlan.length === 5
    && input.actionPlan.every((item) => (
      item.physicalActionLine.trim().length > 0
      && item.physicalConstraints.length > 0
      && item.prohibitedBehaviors.length > 0
    ));
  const sameSceneWorld = input.sceneWorld.sceneIds.length > 0
    && input.sceneWorld.spatialAnchors.length >= 5
    && input.shotArchitecture.shots.every((shot) => Boolean(shot.spatialAnchor));
  const continuity = input.shotArchitecture.shots.every((shot) => (
    shot.continuityLine.includes("same person")
    && shot.continuityLine.includes("same wardrobe")
    && shot.continuityLine.includes("same product")
    && shot.continuityLine.includes("same season")
  ));
  const cameraContinuity = input.cameraPlan.shots.length === 5
    && input.cameraPlan.continuity.oneLensFamily
    && input.cameraPlan.continuity.cameraSide === "established_scene_side"
    && input.cameraPlan.shots.every((shot) => shot.productReadabilityGuard.length > 0);
  const noRunway = !/\b(?:runway pose|fashion walk|catwalk)\b/i.test(actionText);
  const noShoeModeling = !/\b(?:toe pointing|shoe presentation stance|foot modeling pose|shoe-display gesture)\b/i.test(
    input.actionPlan.map((item) => item.physicalActionLine).join(" ")
  );
  const noClicheOverload =
    input.brandMood.prohibitedDirections.length >= 5
    && input.endingStrategy.prohibitedEndings.some((line) => /logo/i.test(line))
    && input.cameraPlan.restrictions.some((line) => /orbit/i.test(line));
  const releasePresence = releaseShot
    ? input.creativeSpine.productPresenceByShot[releaseShot.shotIndex]
    : "ABSENT";
  const endingProductRetained = releaseShot?.productVisibility === "BRAND_RELEASE"
    || (input.creativeSpine.productRole === "HERO" || input.creativeSpine.productRole === "REVEALED"
      ? releasePresence === "CLEAR"
      : input.creativeSpine.productRole === "DISCOVERED"
        ? ["PARTIAL", "SECONDARY", "CLEAR"].includes(releasePresence)
        : ["SECONDARY", "CLEAR"].includes(releasePresence));
  const naturalEnding = Boolean(releaseShot)
    && endingProductRetained
    && releaseShot?.storySpine.dramaticFunction === "RESOLVE"
    && input.eventSpine.shots[releaseShot?.shotIndex ?? -1]?.eventFunction === releaseShot?.event.eventFunction
    && input.eventSpine.endingGrammar.line.trim().length > 0
    && input.endingStrategy.grammar.id === input.eventSpine.endingGrammar.id
    && input.endingStrategy.grammar.line === input.eventSpine.endingGrammar.line
    && input.endingStrategy.line.includes(input.eventSpine.endingGrammar.line)
    && input.endingStrategy.strategy === input.eventSpine.endingImageStrategy
    && input.endingStrategy.strategy === input.creativeSpine.endingImageStrategy
    && Boolean(input.eventSpine.endingResolution.trim())
    && Boolean(releaseShot?.event.whatChanges.trim())
    && releaseShot?.event.whatHappens === input.eventSpine.shots[releaseShot?.shotIndex ?? -1]?.whatHappens
    && releaseShot?.event.whatChanges === input.eventSpine.shots[releaseShot?.shotIndex ?? -1]?.whatChanges;
  const executionSpecificity = input.actionPlan.every((item) => (
    !/\bor\b/i.test(item.physicalActionLine)
    && !/\b(?:completes a task|makes an adjustment|settles naturally|performs a small move|continues through space|pauses naturally)\b/i.test(item.physicalActionLine)
    && /\b(?:she|he|they|her|his|their|the person)\b/i.test(item.physicalActionLine)
  ));
  const soundWorldContext = Boolean(input.soundPlan.context.trim())
    && input.soundPlan.shots.every((shot) => shot.cues.length >= 1 && shot.cues.length <= 3);
  const worldRealism = input.worldRealism.line.trim().length > 0
    && input.worldRealism.backgroundSignals.length > 0
    && input.worldRealism.signagePolicy.trim().length > 0
    && !/\bEMPTY\b/.test(input.worldRealism.density);

  const qc: CommercialQc = {
    product_message_preserved: gate(
      "product_message_preserved",
      productMessagePreserved && referenceSourceBound,
      productMessagePreserved
        ? categoryOnlyProductContextAllowed
          ? "The Product Message uses only THERUIZ AURA's category-level default context for this intent; no SKU or unsupported product detail is inferred."
          : "The Product Message is derived only from confirmed current-task reference coverage and contains an explicit no-fabrication rule."
        : "The Product Message could not be bound to confirmed product evidence or an allowed AURA category-level context."
    ),
    brand_mood_preserved: gate(
      "brand_mood_preserved",
      input.brandMood.id === "THERUIZ_AURA_QUIET_WARM_LUXURY"
        && input.brandMood.attributes.join("|") === "quiet|warm|restrained|premium|natural|material-aware",
      "The closed THERUIZ AURA Commercial Film brand mood remains quiet, warm, restrained, premium, natural, and material-aware."
    ),
    product_readability: gate(
      "product_readability",
      Boolean(readableShot)
        && input.creativeSpine.productPresenceByShot[readableShot!.shotIndex] === "CLEAR",
      readableShot
        ? categoryOnlyProductContextAllowed
          ? `A visible ${readableShot.productVisibility} beat at index ${readableShot.shotIndex} is supported at category level only; no SKU-specific appearance or physical detail is asserted.`
          : `A visible ${readableShot.productVisibility} beat at index ${readableShot.shotIndex} carries CLEAR presence and a confirmed reference-backed product dimension.`
        : "No actual visible product-expression beat is bound to CLEAR presence and confirmed product evidence."
    ),
    hero_moment_exists: gate(
      "hero_moment_exists",
      heroReadabilityReachable,
      readableProductShots.length > 0
        ? heroHoldMotivated
          ? "A Product Role authorized beat reaches a supported worn-product read inside its declared action continuity."
          : "A readability beat forces a breath-hold inside an action declared as continuous."
        : "No Product Role authorized readable shot exists."
    ),
    detail_supported_by_reference: gate(
      "detail_supported_by_reference",
      detailSupported,
      detailSupported
        ? categoryOnlyProductContextAllowed
          ? "The allowed intent uses only a non-specific environmental relationship; SKU, material, construction, and other product details remain deferred to confirmed references."
          : "Every declared PRODUCT_DETAIL beat names a product relationship and maps it to a confirmed supported dimension."
        : "A PRODUCT_DETAIL beat lacks an event relationship or confirmed reference-backed dimension."
    ),
    continuity_state_consistent: gate(
      "continuity_state_consistent",
      continuityStateConsistent,
      continuityStateConsistent
        ? "Every beat's preconditions are satisfied by the previous beat's effects, and no single-use action, spatial anchor, or object state is reset."
        : `The World State chain contains hard continuity conflicts: ${input.continuity.failureReasons.join(" | ")}`
    ),
    take_grouping_motivated: gate(
      "take_grouping_motivated",
      takeGroupingMotivated,
      takeGroupingMotivated
        ? `${input.shotArchitecture.shots.length} narrative beats compile into ${takePlan.takes.length} motivated take(s), and every take boundary comes from a declared spatial, photographic, temporal, or action boundary.`
        : `The take plan is not admissible: ${takePlan.failureReasons.join(" | ") || "no motivated take could be planned"}.`
    ),
    micro_decision_visible_consequence: gate(
      "micro_decision_visible_consequence",
      microDecisionValid,
      microDecisionLine
    ),
    no_product_deformation: gate(
      "no_product_deformation",
      actionPhysical && input.productMessage.prohibitedClaims.some((line) => /invented toe shape/i.test(line)),
      "The action plan keeps product scale and structure stable and carries explicit no-invention protection."
    ),
    no_product_identity_drift: gate(
      "no_product_identity_drift",
      continuity,
      "Every shot carries the same person, wardrobe, product, season, and visual continuity requirement."
    ),
    no_random_scene_jump: gate(
      "no_random_scene_jump",
      sameSceneWorld,
      "All five shots use one coherent shared Scene Library world with ordered spatial anchors."
    ),
    no_random_character_reset: gate(
      "no_random_character_reset",
      input.character.resolved.status === "CHARACTER_PROFILE_APPROVED" && continuity,
      "One approved Character Profile is carried through every shot without reset."
    ),
    physical_reality: gate(
      "physical_reality",
      actionPhysical && hasContiguousTiming(input) && hasDynamicTiming(input),
      "The five semantic shots fit a contiguous, dynamically timed 15-second real-time human action chain."
    ),
    camera_continuity: gate(
      "camera_continuity",
      cameraContinuity,
      "One lens family and one established camera side are preserved across all five shots."
    ),
    no_runway_pose: gate(
      "no_runway_pose",
      noRunway,
      "The action plan contains no runway pose or fashion-walk behavior."
    ),
    no_shoe_modeling_pose: gate(
      "no_shoe_modeling_pose",
      noShoeModeling,
      "No executed action is a toe-pointing, presentation-stance, or repeated shoe-display gesture."
    ),
    no_commercial_cliche_overload: gate(
      "no_commercial_cliche_overload",
      noClicheOverload,
      "The plan retains THERUIZ AURA restraint and excludes logo, runway, orbit, and loud advertising endings."
    ),
    natural_ending: gate(
      "natural_ending",
      naturalEnding,
      "The RELEASE resolves with the product retained at its Product Role-authorized level; ending strategy, grammar, and final event agree with Event Spine."
    ),
    full_15_second_timing: gate(
      "full_15_second_timing",
      hasContiguousTiming(input) && hasDynamicTiming(input),
      "The five shots cover 0.0-15.0 seconds contiguously without a gap and without five equal durations."
    ),
    execution_specificity: gate(
      "execution_specificity",
      executionSpecificity,
      executionSpecificity
        ? "Every final action resolves to one physical action with one cause and no unresolved alternatives."
        : "At least one action contains an unresolved alternative or vague execution."
    ),
    sound_world_context: gate(
      "sound_world_context",
      soundWorldContext,
      soundWorldContext
        ? `Sound World is bound to ${input.soundPlan.context} with one to three motivated cues per shot.`
        : "Sound World is not bound to the current physical context."
    ),
    world_realism: gate(
      "world_realism",
      worldRealism,
      worldRealism
        ? `World realism uses ${input.worldRealism.density} with controlled background life and a signage policy.`
        : "World realism metadata is incomplete."
    ),
  };

  const failureReasons = Object.values(qc)
    .filter((entry) => entry.status === "FAIL")
    .map((entry) => `${entry.id}: ${entry.reason}`);

  return {
    qc,
    passed: failureReasons.length === 0,
    failureReasons,
  };
}
