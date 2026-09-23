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
  const referenceCoverage = new Set(input.referenceState.coverage);
  const actionText = executedActionText(input);
  const referenceSourceBound =
    input.referenceState.status === "REFERENCE_READY"
    && (
      input.referenceState.confirmedReferenceCount > 0
      || input.productMessage.externalReferenceRequired
    );
  const productMessagePreserved =
    input.productMessage.evidenceLines.length > 0
    && input.productMessage.supportedDimensions.every((dimension) => referenceCoverage.has(dimension.coverage))
    && input.productMessage.prohibitedClaims.length > 0;
  const readableShot = input.shotArchitecture.shots.find((shot) => (
    shot.productVisibility === "PRODUCT_READABLE"
  ));
  const detailShot = input.shotArchitecture.shots.find((shot) => shot.role === "DETAIL");
  const heroShot = input.shotArchitecture.shots.find((shot) => shot.role === "HERO");
  const releaseShot = input.shotArchitecture.shots.find((shot) => shot.role === "RELEASE");
  const detailSupported = input.productMessage.externalReferenceRequired
    ? detailShot?.storySpine.productPresenceDesign !== "ABSENT"
    : Boolean(detailShot?.productMessageDimension)
      && referenceCoverage.has(detailShot!.productMessageDimension!);
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
  const naturalEnding = releaseShot?.productVisibility === "BRAND_RELEASE"
    && releaseShot.storySpine.dramaticFunction === "RESOLVE"
    && input.eventSpine.endingGrammar.line.trim().length > 0
    && input.endingStrategy.line === input.eventSpine.endingGrammar.line;
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
        ? "The Product Message is derived only from confirmed current-task reference coverage and contains an explicit no-fabrication rule."
        : "The Product Message could not be bound to the confirmed reference coverage."
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
        && (Boolean(readableShot?.productMessageDimension) || input.productMessage.externalReferenceRequired)
        && input.shotArchitecture.shots.some((shot) => shot.productVisibility === "PRODUCT_HERO"),
      readableShot
        ? "At least one WEAR shot requires a readable worn product and the HERO shot preserves its product requirement."
        : "No PRODUCT_READABLE shot exists."
    ),
    hero_moment_exists: gate(
      "hero_moment_exists",
      Boolean(heroShot)
        && (Boolean(heroShot?.productMessageDimension) || input.productMessage.externalReferenceRequired)
        && heroShot?.camera.movement === "brief_hero_hold",
      heroShot
        ? "The HERO shot is a brief worn-product hold inside the continuation of the person's real action."
        : "No PRODUCT_HERO shot exists."
    ),
    detail_supported_by_reference: gate(
      "detail_supported_by_reference",
      detailSupported,
      detailSupported
        ? `The DETAIL shot observes only ${detailShot?.productMessageDimension}, a coverage item established by the current confirmed references.`
        : "The DETAIL shot is not supported by any confirmed product coverage."
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
      "The RELEASE shot lets the person continue into life and prohibits packshots, logo animation, and end-card branding."
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
