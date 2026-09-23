import type {
  CommercialCreativeDirectionPlan,
  CommercialCreativeDirectionQcInput,
  CommercialCreativeDirectionQc,
  CommercialCreativeDirectionQcGate,
  CommercialCreativeDirectionQcGateId,
} from "./types";
import { COMMERCIAL_CAMERA_BEHAVIOR_CATALOG } from "./camera-behavior";

const GATE_LABELS: Record<CommercialCreativeDirectionQcGateId, string> = {
  commercial_camera_monotony: "Camera Behavior Variety",
  perceptual_camera_monotony: "Perceptual Camera Diversity",
  camera_function_mismatch: "Camera / Dramatic Function Match",
  unmotivated_edit: "Motivated Edit Chain",
  visual_grammar_break: "Consistent Visual Grammar",
  decorative_insert: "Meaningful Insert",
  product_presentation_gesture: "No Product Presentation Gesture",
  reveal_strategy_conflict: "Reveal Strategy Compatibility",
  release_direction_break: "Resolved Release Direction",
  generic_fashion_walk_sequence: "No Generic Fashion-Walk Sequence",
  unmotivated_product_closeup: "No Unmotivated Product Close-up",
  camera_aware_performance: "No Camera-Aware Performance",
  scene_as_decoration_only: "Scene Is Part Of The Story",
  location_continuity_weak: "Location Continuity",
  product_overexposure: "Product Not Overexposed",
  no_visual_idea: "One Visual Idea",
  hero_as_pose: "Hero Is Not A Pose",
  release_as_extra_beauty_shot: "Release Is Not An Extra Beauty Shot",
  visibility_framing_compatibility: "Visibility / Framing Compatibility",
};

const GATE_CODES: Record<CommercialCreativeDirectionQcGateId, CommercialCreativeDirectionQcGate["code"]> = {
  commercial_camera_monotony: "COMMERCIAL_CAMERA_MONOTONY",
  perceptual_camera_monotony: "PERCEPTUAL_CAMERA_MONOTONY",
  camera_function_mismatch: "CAMERA_FUNCTION_MISMATCH",
  unmotivated_edit: "UNMOTIVATED_EDIT",
  visual_grammar_break: "VISUAL_GRAMMAR_BREAK",
  decorative_insert: "DECORATIVE_INSERT",
  product_presentation_gesture: "PRODUCT_PRESENTATION_GESTURE",
  reveal_strategy_conflict: "REVEAL_STRATEGY_CONFLICT",
  release_direction_break: "RELEASE_DIRECTION_BREAK",
  generic_fashion_walk_sequence: "GENERIC_FASHION_WALK_SEQUENCE",
  unmotivated_product_closeup: "UNMOTIVATED_PRODUCT_CLOSEUP",
  camera_aware_performance: "CAMERA_AWARE_PERFORMANCE",
  scene_as_decoration_only: "SCENE_AS_DECORATION_ONLY",
  location_continuity_weak: "LOCATION_CONTINUITY_WEAK",
  product_overexposure: "PRODUCT_OVEREXPOSURE",
  no_visual_idea: "NO_VISUAL_IDEA",
  hero_as_pose: "HERO_AS_POSE",
  release_as_extra_beauty_shot: "RELEASE_AS_EXTRA_BEAUTY_SHOT",
  visibility_framing_compatibility: "VISIBILITY_FRAMING_MISMATCH",
};

function gate(
  id: CommercialCreativeDirectionQcGateId,
  passed: boolean,
  reason: string
): CommercialCreativeDirectionQcGate {
  return {
    id,
    code: GATE_CODES[id],
    label: GATE_LABELS[id],
    status: passed ? "PASS" : "FAIL",
    reason,
  };
}

function containsPresentationLanguage(text: string) {
  return /\b(?:pose for camera|present(?:s|ing)? (?:the|her|his|their)? ?shoe|look(?:s|ing)? at (?:the )?shoe|shoe presentation|display gesture|camera aware|acknowledge(?:s|d)? (?:the )?camera)\b/i.test(text);
}

function containsPositivePattern(text: string, pattern: RegExp) {
  return text
    .split(/[.\n]+/)
    .filter((sentence) => !/\b(?:no|not|never|without|avoid|rather than)\b/i.test(sentence))
    .some((sentence) => pattern.test(sentence));
}

export function runCommercialDirectionQc(
  input: CommercialCreativeDirectionQcInput
): {
  qc: CommercialCreativeDirectionQc;
  passed: boolean;
  failureReasons: string[];
} {
  const behaviors = input.cameraBehaviorByShot;
  const counts = new Map<string, number>();
  behaviors.forEach((behavior) => counts.set(behavior, (counts.get(behavior) ?? 0) + 1));
  const distinctBehaviors = new Set(behaviors).size;
  const maxBehaviorCount = Math.max(...counts.values());
  const shotDirections = input.shotDirections;
  const allDirectionText = shotDirections.map((shot) => [
    shot.cameraNarrativeReason,
    shot.editEntry,
    shot.editExit,
    shot.visualMotifContribution,
    shot.movementContinuity,
    shot.viewerAttentionTarget,
  ].join(" ")).join(" ");
  const presentationGesture = containsPositivePattern(
    allDirectionText,
    /\b(?:pose for camera|present(?:s|ing)? (?:the|her|his|their)? ?shoe|look(?:s|ing)? at (?:the )?shoe|shoe presentation|display gesture|camera aware|acknowledge(?:s|d)? (?:the )?camera)\b/i
  );
  const cameraAware = containsPositivePattern(
    allDirectionText,
    /\b(?:look(?:s|ing)? at (?:the )?camera|acknowledge(?:s|d)? (?:the )?camera|perform(?:s|ing)? for (?:the )?camera)\b/i
  );
  const heroDirection = shotDirections.find((shot) => shot.shotRole === "HERO");
  const releaseDirection = shotDirections.find((shot) => shot.shotRole === "RELEASE");
  const detailDirection = shotDirections.find((shot) => shot.shotRole === "DETAIL");
  const detailStory = input.creativeSpine.shotFunctions.find((shot) => shot.shotRole === "DETAIL");
  const heroStory = input.creativeSpine.shotFunctions.find((shot) => shot.shotRole === "HERO");
  const releaseStory = input.creativeSpine.shotFunctions.find((shot) => shot.shotRole === "RELEASE");
  const firstClearIndex = input.creativeSpine.productPresenceByShot.indexOf("CLEAR");
  const revealConflict =
    (input.creativeSpine.revealStrategy === "IMMEDIATE" && behaviors.includes("WITHHOLD"))
    || heroDirection?.cameraBehavior === "WITHHOLD"
    || input.creativeSpine.productPresenceByShot[3] !== "CLEAR"
    || firstClearIndex < 0
    || firstClearIndex > 3;
  const releaseBreak = releaseDirection?.cameraBehavior === "REVEAL"
    || releaseDirection?.cameraBehavior === "DETAIL_INTERRUPTION"
    || releaseDirection?.cameraBehavior === "WITHHOLD"
    || releaseDirection?.cutMotivation !== "EMOTIONAL_RELEASE"
    || !releaseStory?.continuityFromPrevious.includes("shot 4")
    || firstClearIndex > 3;
  const locationContinuity = input.creativeSpine.continuity.locationRelationship.trim().length > 0
    && shotDirections.every((shot) => shot.movementContinuity.trim().length > 0);
  const motifConsistent = input.visualMotif === null
    ? shotDirections.every((shot) => shot.visualMotifContribution === null)
    : shotDirections.every((shot) => Boolean(shot.visualMotifContribution?.trim()));
  const productOverexposure = input.creativeSpine.productPresenceByShot.filter((presence) => presence === "CLEAR").length > 3;
  const visualIdea = Boolean(input.creativeMode)
    && input.creativeSpine.premise.text.trim().length > 0
    && (input.visualMotif !== null || input.creativeSpine.shotFunctions.length === 5);
  const functionMismatch = shotDirections.some((shot) => {
    const behavior = COMMERCIAL_CAMERA_BEHAVIOR_CATALOG[shot.cameraBehavior];
    return !behavior.functionAffinity.includes(
      input.creativeSpine.shotFunctions[shot.shotIndex]?.dramaticFunction ?? "ESTABLISH"
    );
  });
  const unmotivatedEdit = shotDirections.length !== 5
    || shotDirections.some((shot, index) => (
      !shot.cutMotivation
      || (index > 0 && !shot.editEntry.trim())
      || (index < 4 && !shot.editExit.trim())
    ));
  const visibilityFramingCompatible = shotDirections.every((shot, index) => {
    if (input.creativeSpine.productPresenceByShot[index] !== "ABSENT") return true;
    const framingHint = input.eventSpine.shots[index]?.framingHint ?? "";
    return /\b(?:crop|foreground|upper-body|seated|occlu|partial|entry|enters|environment)\b/i.test(framingHint);
  });
  const distinctPerceptualSignatures = new Set(
    shotDirections.map((shot) => shot.perceptualSignature)
  ).size;

  const qc: CommercialCreativeDirectionQc = {
    commercial_camera_monotony: gate(
      "commercial_camera_monotony",
      distinctBehaviors >= 3 && maxBehaviorCount <= 2,
      `Distinct behaviors: ${distinctBehaviors}; maximum repetition: ${maxBehaviorCount}.`
    ),
    perceptual_camera_monotony: gate(
      "perceptual_camera_monotony",
      distinctPerceptualSignatures >= 3,
      `Distinct perceptual camera signatures: ${distinctPerceptualSignatures}/5.`
    ),
    camera_function_mismatch: gate(
      "camera_function_mismatch",
      !functionMismatch,
      functionMismatch
        ? "At least one camera behavior does not support its Story Spine dramatic function."
        : "Every camera behavior supports its assigned dramatic function."
    ),
    unmotivated_edit: gate(
      "unmotivated_edit",
      !unmotivatedEdit,
      unmotivatedEdit
        ? "At least one shot has no motivated edit entry, exit, or cut motivation."
        : "Every cut has an internal motivation and a stated relationship to the surrounding shots."
    ),
    visual_grammar_break: gate(
      "visual_grammar_break",
      shotDirections.every((shot) => shot.creativeMode === input.creativeMode),
      "All five shots retain one creative grammar."
    ),
    decorative_insert: gate(
      "decorative_insert",
      input.primaryEditLogic !== "SENSORY_INSERT" || (
        detailStory?.dramaticFunction === "DISCOVER"
        || detailStory?.dramaticFunction === "CONFIRM"
      ) && (
        input.primaryEditLogic !== "SENSORY_INSERT"
        || (
          !releaseDirection?.editEntry.toLowerCase().includes("sensory observation")
          && !releaseDirection?.editExit.toLowerCase().includes("sensory observation")
        )
      ),
      "Sensory inserts must retain a defined story function."
    ),
    product_presentation_gesture: gate(
      "product_presentation_gesture",
      !presentationGesture,
      presentationGesture
        ? "Direction language includes a product presentation gesture."
        : "No shot asks the person to present, point at, or look down at the product."
    ),
    reveal_strategy_conflict: gate(
      "reveal_strategy_conflict",
      !revealConflict,
      revealConflict
        ? "The camera behavior conflicts with the existing Reveal Strategy or HERO readability."
        : "Camera withholding and reveal behavior implement the existing Reveal Strategy without weakening product comprehension."
    ),
    release_direction_break: gate(
      "release_direction_break",
      !releaseBreak,
      releaseBreak
        ? "The release introduces a new camera grammar instead of resolving the established one."
        : "The release resolves the existing grammar and movement."
    ),
    generic_fashion_walk_sequence: gate(
      "generic_fashion_walk_sequence",
      !containsPositivePattern(allDirectionText, /\b(?:fashion walk|runway walk|walk(?:s|ing)? toward camera)\b/i),
      "The direction contains no generic fashion-walk sequence."
    ),
    unmotivated_product_closeup: gate(
      "unmotivated_product_closeup",
      input.creativeSpine.productPresenceByShot.includes("CLEAR")
        && input.creativeSpine.productPresenceByShot[2] !== "ABSENT"
        && Boolean(detailStory?.narrativePurpose.trim()),
      "Any product detail remains tied to the same human situation and confirmed coverage."
    ),
    camera_aware_performance: gate(
      "camera_aware_performance",
      !cameraAware,
      cameraAware
        ? "Direction language creates camera-aware performance."
        : "The person remains unaware of the camera throughout the direction."
    ),
    scene_as_decoration_only: gate(
      "scene_as_decoration_only",
      Boolean(input.creativeSpine.humanSituation.resourceHints.sceneWorldId)
        && input.creativeSpine.continuity.locationRelationship.trim().length > 0
        && shotDirections.every((shot) => shot.movementContinuity.trim().length > 0),
      "The scene participates in continuity and movement rather than serving as decoration."
    ),
    location_continuity_weak: gate(
      "location_continuity_weak",
      locationContinuity,
      locationContinuity
        ? "Every shot carries a location and movement continuity statement."
        : "At least one shot weakens the location or movement chain."
    ),
    product_overexposure: gate(
      "product_overexposure",
      !productOverexposure,
      `Product-presence distribution: ${input.creativeSpine.productPresenceByShot.join(" → ")}.`
    ),
    no_visual_idea: gate(
      "no_visual_idea",
      visualIdea,
      visualIdea
        ? "The film has one creative mode, one premise, and a visible structural idea."
        : "The film has no visible structural idea."
    ),
    hero_as_pose: gate(
      "hero_as_pose",
      heroDirection?.cameraBehavior !== "WITHHOLD"
        && heroDirection?.cutMotivation !== "ACTION_COMPLETION"
        && input.creativeSpine.productPresenceByShot[3] === "CLEAR"
        && heroStory?.continuityFromPrevious.includes("shot 3") === true
        && !containsPositivePattern(
          heroDirection?.cameraNarrativeReason ?? "",
          /\b(?:pose for camera|present(?:s|ing)? (?:the|her|his|their)? ?shoe|look(?:s|ing)? at (?:the )?shoe|display gesture|camera aware)\b/i
        ),
      "The hero is a worn-product culmination rather than a pose or display gesture."
    ),
    release_as_extra_beauty_shot: gate(
      "release_as_extra_beauty_shot",
      releaseDirection?.cutMotivation === "EMOTIONAL_RELEASE"
        && releaseDirection?.cameraBehavior !== "REVEAL"
        && releaseDirection?.cameraBehavior !== "DETAIL_INTERRUPTION"
        && releaseDirection?.cameraBehavior !== "WITHHOLD"
        && firstClearIndex <= 3,
      "The release closes the film instead of adding another beauty shot."
    ),
    visibility_framing_compatibility: gate(
      "visibility_framing_compatibility",
      visibilityFramingCompatible,
      visibilityFramingCompatible
        ? "Every product-absent beat uses framing or occlusion that physically prevents footwear visibility."
        : "A product-absent beat uses framing that would leave the footwear visibly exposed."
    ),
  };

  const failureReasons = Object.values(qc)
    .filter((entry) => entry.status === "FAIL")
    .map((entry) => `${entry.code}: ${entry.reason}`);

  return {
    qc,
    passed: failureReasons.length === 0,
    failureReasons,
  };
}
