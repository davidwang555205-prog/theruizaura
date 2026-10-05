import {
  AURA_CAMERA_EXECUTION_LOOK_LINE,
  AURA_CAMERA_EXECUTION_NEGATIVE_LINE,
  AURA_CAMERA_EXECUTION_RESTRICTIONS,
  resolveAuraTopicLensProfile,
} from "../immersive-narrative/camera-execution";
import type {
  CommercialCameraPlan,
  CommercialCameraRhythm,
  CommercialCameraShot,
  CommercialIntentId,
  CommercialProductVisibility,
  CommercialShotRole,
} from "./types";
import type {
  CommercialCameraBehavior,
  CommercialCreativeDirectionPlan,
} from "./creative-direction";
import type { CommercialEventSpinePlan } from "./event-spine";

const CAMERA_BEHAVIOR_OVERRIDES: Partial<Record<CommercialCameraBehavior, Partial<CommercialCameraShot>>> = {
  OBSERVE: {
    cameraHeight: "natural_eye_level",
    movement: "locked_observation",
    movementLine: "Let the person enter, cross, or act independently inside a quiet observational frame.",
  },
  FOLLOW: {
    cameraHeight: "natural_chest_height",
    movement: "restrained_follow",
    movementLine: "Follow at a human working distance from the side or rear three-quarter without centering a fashion walk.",
  },
  WAIT: {
    framing: "wide environmental full figure",
    cameraHeight: "natural_eye_level",
    movement: "locked_observation",
    movementLine: "Place the frame before the action begins, then let the person enter, complete the action, and leave naturally.",
  },
  DISCOVER: {
    cameraHeight: "natural_chest_height",
    movement: "short_lateral_track",
    movementLine: "Use one restrained reframe motivated by the body, light, doorway, or spatial change.",
  },
  PASS_BY: {
    framing: "full figure with foreground depth",
    cameraHeight: "natural_chest_height",
    movement: "locked_observation",
    movementLine: "Let the person pass through the visual space with natural depth rather than centering the frame.",
  },
  GROUND_OBSERVATION: {
    framing: "natural lower-body observation",
    cameraHeight: "natural_shoulder_height",
    movement: "controlled_detail_framing",
    movementLine: "Observe real stride, weight, stopping, or ground contact without creating a shoe beauty shot.",
  },
  DETAIL_INTERRUPTION: {
    framing: "short motivated lower-body detail",
    cameraHeight: "natural_chest_height",
    movement: "controlled_detail_framing",
    movementLine: "Interrupt the wider action briefly for one confirmed detail, then return to the human continuity.",
  },
  WITHHOLD: {
    cameraHeight: "natural_eye_level",
    movement: "locked_observation",
    movementLine: "Keep the complete product view temporarily outside the frame without breaking physical plausibility.",
  },
  REVEAL: {
    framing: "medium-full three-quarter worn reveal",
    cameraHeight: "natural_eye_level",
    movement: "brief_hero_hold",
    movementLine: "Use a motivated body, light, doorway, or reframing change to make the worn product clearly readable.",
  },
};

const COMMERCIAL_RHYTHM_RULES: Record<CommercialCameraRhythm, Record<CommercialShotRole, Pick<
  CommercialCameraShot,
  "framing" | "cameraHeight" | "viewAngle" | "movement" | "movementLine" | "transitionLine"
>>> = {
  CALM: {
    WORLD: {
      framing: "wide environmental full figure",
      cameraHeight: "natural_eye_level",
      viewAngle: "three_quarter_front",
      movement: "locked_observation",
      movementLine: "Hold a quiet environmental frame while the person enters and crosses only a small part of it.",
      transitionLine: "Continue the same motion into the next framing instead of cutting to a new world.",
    },
    WEAR: {
      framing: "full figure with a readable lower third",
      cameraHeight: "natural_chest_height",
      viewAngle: "three_quarter_front",
      movement: "restrained_follow",
      movementLine: "Follow at a fixed working distance without closing in or overtaking the person.",
      transitionLine: "Keep the same camera side and spatial axis.",
    },
    DETAIL: {
      framing: "medium three-quarter observation with the person and lower silhouette in context",
      cameraHeight: "natural_chest_height",
      viewAngle: "three_quarter_front",
      movement: "restrained_follow",
      movementLine: "Keep the existing human action primary; do not isolate or magnify a product detail because of this legacy beat label.",
      transitionLine: "Continue the established human and spatial continuity without a role-driven insert.",
    },
    HERO: {
      framing: "medium-full three-quarter worn composition",
      cameraHeight: "natural_eye_level",
      viewAngle: "three_quarter_front",
      movement: "restrained_follow",
      movementLine: "Observe the established physical action at a natural human distance without requesting a stop.",
      transitionLine: "Continue from the exact established body and spatial state.",
    },
    RELEASE: {
      framing: "wide environmental continuation",
      cameraHeight: "natural_eye_level",
      viewAngle: "three_quarter_back",
      movement: "locked_observation",
      movementLine: "Let the person continue through or out of the frame while the camera stays quiet.",
      transitionLine: "End on the continuing life movement, not on the product.",
    },
  },
  BALANCED: {
    WORLD: {
      framing: "wide environmental full figure",
      cameraHeight: "natural_eye_level",
      viewAngle: "three_quarter_front",
      movement: "locked_observation",
      movementLine: "Establish the person and the shared street world before the product becomes the visual priority.",
      transitionLine: "Carry the same walking direction into the next shot.",
    },
    WEAR: {
      framing: "full figure with a product-readable lower third",
      cameraHeight: "natural_chest_height",
      viewAngle: "three_quarter_front",
      movement: "restrained_follow",
      movementLine: "Track at ordinary walking pace with a stable distance and no speed ramp.",
      transitionLine: "Keep the subject moving inside one spatial axis.",
    },
    DETAIL: {
      framing: "motivated three-quarter lower framing",
      cameraHeight: "natural_chest_height",
      viewAngle: "three_quarter_front",
      movement: "short_lateral_track",
      movementLine: "Use one short lateral move motivated by the person's path to make the natural step and product relationship readable.",
      transitionLine: "Stop the lateral movement before it becomes a product chase.",
    },
    HERO: {
      framing: "medium-full three-quarter worn hero",
      cameraHeight: "natural_eye_level",
      viewAngle: "three_quarter_front",
      movement: "brief_hero_hold",
      movementLine: "Hold the natural stop long enough to read the worn product, then let the scene continue.",
      transitionLine: "Resume the camera side and movement from the preceding shot.",
    },
    RELEASE: {
      framing: "wide environmental continuation",
      cameraHeight: "natural_eye_level",
      viewAngle: "three_quarter_back",
      movement: "restrained_follow",
      movementLine: "Follow for one short continuation before allowing the person to leave the frame.",
      transitionLine: "End without another reframe or product beat.",
    },
  },
  PRODUCT_FORWARD: {
    WORLD: {
      framing: "medium-full environmental full figure",
      cameraHeight: "natural_eye_level",
      viewAngle: "three_quarter_front",
      movement: "locked_observation",
      movementLine: "Establish a real dressing or preparation moment with the person already wearing the product.",
      transitionLine: "Keep the same room, light direction, and body continuity.",
    },
    WEAR: {
      framing: "full figure with a clear worn-product relationship",
      cameraHeight: "natural_chest_height",
      viewAngle: "three_quarter_front",
      movement: "restrained_follow",
      movementLine: "Use a restrained follow through one small, real movement without turning the shot into a pose.",
      transitionLine: "Move closer only through a motivated framing change inside the same room.",
    },
    DETAIL: {
      framing: "controlled lower-body and material observation",
      cameraHeight: "natural_shoulder_height",
      viewAngle: "profile_parallel",
      movement: "controlled_detail_framing",
      movementLine: "Frame one confirmed material or structural relationship inside the real wearing action, with the ankle and ground preserved.",
      transitionLine: "Return immediately to a full human frame after the detail.",
    },
    HERO: {
      framing: "medium-full three-quarter worn hero",
      cameraHeight: "natural_eye_level",
      viewAngle: "three_quarter_front",
      movement: "brief_hero_hold",
      movementLine: "Hold the worn product after a natural weight settle; the person remains present and physically connected.",
      transitionLine: "Release with the beginning of a real movement rather than a pose change.",
    },
    RELEASE: {
      framing: "medium-full continuation into the room",
      cameraHeight: "natural_eye_level",
      viewAngle: "three_quarter_back",
      movement: "motivated_pan",
      movementLine: "Use one restrained pan motivated by the person continuing through the room.",
      transitionLine: "Settle the final frame on ordinary life, not on a product packshot.",
    },
  },
};

/**
 * A HERO beat that the narrative declares as continuous is observed inside the
 * movement that is already happening. The worn product is read through
 * framing and distance, not by stopping the person for the camera.
 */
const HERO_CONTINUOUS_ACTION_RULE: Record<CommercialCameraRhythm, Pick<
  CommercialCameraShot,
  "movement" | "movementLine"
>> = {
  CALM: {
    movement: "restrained_follow",
    movementLine: "Follow the worn product inside the movement that is already happening; the person never stops for the frame.",
  },
  BALANCED: {
    movement: "restrained_follow",
    movementLine: "Track the ongoing action at an ordinary distance so the worn product stays readable without interrupting the movement.",
  },
  PRODUCT_FORWARD: {
    movement: "short_lateral_track",
    movementLine: "Use one short lateral reframe motivated by the person's own weight change so the worn product reads without a stop.",
  },
};

const FACE_BEAT_PRIORITY: Record<CommercialIntentId, number[]> = {
  QUIET_LUXURY: [1, 0, 3],
  URBAN_MOTION: [1, 0, 3],
  DAILY_STYLING: [0, 1, 3],
  NEW_ARRIVAL: [1, 0, 3],
  PRODUCT_CRAFT: [3, 1, 0],
};

const FACE_FRAMING_MARKER = "head, face, and upper-body context naturally readable";
const FACE_INCOMPATIBLE_FRAMING = /lower[- ]body|medium[- ]lower|detail[- ]only|head[- ]out[- ]of[- ]frame|rear[- ]facing|rear[- ]profile|severe(?:ly)? occlud|foreground occlusion|partially obscur|cropped above the face|face[- ]unreadable/i;

function canCarryFacePresence(
  shot: CommercialCameraShot,
  behavior?: CommercialCameraBehavior
) {
  return shot.shotRole !== "DETAIL"
    && shot.shotRole !== "RELEASE"
    && behavior !== "DETAIL_INTERRUPTION"
    && behavior !== "GROUND_OBSERVATION"
    && shot.viewAngle !== "three_quarter_back"
    && shot.movement !== "controlled_detail_framing"
    && shot.movement !== "product_readable_lower_framing"
    && !FACE_INCOMPATIBLE_FRAMING.test(shot.framing);
}

/** Add one face-readable moment to an existing beat, after all camera overrides. */
export function applyCommercialCharacterFacePresence(
  cameraPlan: CommercialCameraPlan,
  intent: CommercialIntentId,
  direction: CommercialCreativeDirectionPlan
) {
  const beatIndex = FACE_BEAT_PRIORITY[intent].find((index) => {
    const shot = cameraPlan.shots[index];
    return shot && canCarryFacePresence(shot, direction.shotDirections[index]?.cameraBehavior);
  });
  if (beatIndex === undefined) return;

  const shot = cameraPlan.shots[beatIndex];
  const orientation = shot.viewAngle === "profile_parallel"
    ? "in a naturally readable profile"
    : "in a natural three-quarter-front orientation";
  shot.framing = `${shot.framing}; ${FACE_FRAMING_MARKER} ${orientation} within this same action and product composition`;
  const existingMovement = shot.movementLine.replace(
    "from the side or rear three-quarter",
    "from the established scene side at a natural three-quarter-front or readable profile angle"
  );
  shot.movementLine = `${existingMovement} Preserve her existing task-directed gaze toward the route, object, or off-screen space; keep the face clear without direct eye contact, portrait posing, or camera-aware performance.`;
}

export function validateCommercialCharacterFacePresence(cameraPlan: CommercialCameraPlan) {
  const beatIndex = cameraPlan.shots.length === 5 ? cameraPlan.shots.findIndex((shot) => (
    canCarryFacePresence(shot)
    && shot.framing.includes(FACE_FRAMING_MARKER)
    && (shot.viewAngle === "three_quarter_front"
      ? shot.framing.includes("natural three-quarter-front orientation")
      : shot.viewAngle === "profile_parallel" && shot.framing.includes("naturally readable profile"))
  )) : -1;
  return beatIndex >= 0
    ? { status: "PASS" as const, beatIndex, code: null }
    : { status: "FAIL" as const, beatIndex: null, code: "CHARACTER_FACE_PRESENCE_MISSING" as const };
}

export function buildCommercialCameraPlan(
  rhythm: CommercialCameraRhythm,
  shotRoles: CommercialShotRole[],
  actionLines: string[],
  direction?: CommercialCreativeDirectionPlan,
  eventSpine?: CommercialEventSpinePlan,
  productRole: "INHABITED" | "DISCOVERED" | "REVEALED" | "HERO" = "INHABITED",
  productVisibilityByShot: CommercialProductVisibility[] = []
): CommercialCameraPlan {
  const lens = resolveAuraTopicLensProfile(actionLines);
  let currentCharacterSpace = eventSpine?.worldModel.entities.find((entity) => entity.id === "character")?.initialAttributes.space ?? "";
  const declaredSpatialChangeBeat = eventSpine?.shots.findIndex((shot) => shot.stateContract.effects.some((effect) => (
    effect.entityId === "character" && effect.attribute === "space" && effect.fromValue !== effect.toValue
  ))) ?? -1;
  const characterSpaceByBeat = eventSpine?.shots.map((shot) => {
    const change = shot.stateContract.effects.find((effect) => (
      effect.entityId === "character" && effect.attribute === "space" && effect.fromValue !== effect.toValue
    ));
    if (change) currentCharacterSpace = change.toValue;
    return currentCharacterSpace;
  }) ?? [];
  const shots: CommercialCameraShot[] = shotRoles.map((shotRole, shotIndex) => {
    const rule = COMMERCIAL_RHYTHM_RULES[rhythm][shotRole];
    const behavior = direction?.shotDirections[shotIndex]?.cameraBehavior;
    const behaviorOverride = behavior ? CAMERA_BEHAVIOR_OVERRIDES[behavior] : undefined;
    const selectedHeroRead = productRole === "HERO" && productVisibilityByShot[shotIndex] === "PRODUCT_HERO";
    const eventShot = eventSpine?.shots[shotIndex];
    const eventIsContinuous = eventShot?.actionContinuity === "CONTINUOUS";
    const heroActionIsContinuous = selectedHeroRead && eventIsContinuous;
    const heroContinuousRule = HERO_CONTINUOUS_ACTION_RULE[rhythm];
    const dailyPostCrossing = eventSpine?.intent === "DAILY_STYLING"
      && eventSpine.advertisingStructure === "WITHHOLD_REVEAL"
      && shotIndex > declaredSpatialChangeBeat
      && /outside|street/i.test(characterSpaceByBeat[shotIndex] ?? "");
    return {
      shotIndex,
      shotRole,
      ...rule,
      ...behaviorOverride,
      framing: eventSpine?.shots[shotIndex]?.framingHint ?? behaviorOverride?.framing ?? rule.framing,
      // A reveal behavior is subordinate to the Event Spine: a readability
      // beat cannot stop a continuous action for a camera-led product hold.
      movement: eventIsContinuous
        ? selectedHeroRead
          ? heroContinuousRule.movement
          : behaviorOverride?.movement === "brief_hero_hold" || rule.movement === "brief_hero_hold"
            ? (rule.movement === "brief_hero_hold" ? "restrained_follow" : rule.movement)
            : (behaviorOverride?.movement ?? rule.movement)
        : selectedHeroRead
          ? "brief_hero_hold"
          : (behaviorOverride?.movement ?? rule.movement),
      movementLine: heroActionIsContinuous
        ? heroContinuousRule.movementLine
        : eventIsContinuous && behaviorOverride?.movement === "brief_hero_hold"
          ? "Keep the camera with the ongoing event; let the product remain readable through natural framing without pausing the action."
          : dailyPostCrossing
          ? shotIndex === 3
            ? "Keep the camera on the exterior side as she clears the doorway edge while remaining outside."
            : shotIndex === 4
              ? "Hold the settled street state; the person stays outside and the next movement has not begun."
              : "Observe the first ordinary street movement from the exterior side after the completed crossing."
          : (behaviorOverride?.movementLine ?? rule.movementLine),
      productReadabilityGuard:
        productVisibilityByShot[shotIndex] === "PRODUCT_DETAIL"
          ? "Observe only reference-supported detail; keep the ankle, product, and ground relationship intact."
          : productVisibilityByShot[shotIndex] === "PRODUCT_HERO"
            ? heroActionIsContinuous
              ? "Keep the product worn, moving, and readable at natural human scale without stopping the person or isolating the product."
              : "Keep the product worn at natural human scale and clearly readable without isolating it."
            : "Keep the product naturally inside the human action; never force a product-only close-up.",
    };
  });

  return {
    rhythm,
    continuity: {
      cameraSide: "established_scene_side",
      oneLensFamily: true,
      focalRange: lens.focalRange,
      spatialAxisRule:
        "Keep one established camera side and one spatial axis through all five shots. Reframing is allowed, crossing the axis without motivation is not.",
    },
    cameraLookLine: AURA_CAMERA_EXECUTION_LOOK_LINE,
    negativeLine: AURA_CAMERA_EXECUTION_NEGATIVE_LINE,
    shots,
    restrictions: [
      ...AURA_CAMERA_EXECUTION_RESTRICTIONS.filter((restriction) => (
        !restriction.includes("Product Presence")
      )),
      "no product-only close-up inserted to satisfy the commercial edit",
    ],
  };
}
