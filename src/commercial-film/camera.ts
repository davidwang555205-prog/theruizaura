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
      framing: "motivated medium lower-body observation",
      cameraHeight: "natural_chest_height",
      viewAngle: "profile_parallel",
      movement: "controlled_detail_framing",
      movementLine: "Use a restrained detail framing that keeps the ankle, product, and ground relationship inside the same scene.",
      transitionLine: "Return to the wider human frame without an aggressive push or zoom.",
    },
    HERO: {
      framing: "medium-full three-quarter worn hero",
      cameraHeight: "natural_eye_level",
      viewAngle: "three_quarter_front",
      movement: "brief_hero_hold",
      movementLine: "Let the person settle into a short natural stop and hold the worn product at human scale.",
      transitionLine: "Release from the hold as the person begins to move again.",
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

export function buildCommercialCameraPlan(
  rhythm: CommercialCameraRhythm,
  shotRoles: CommercialShotRole[],
  actionLines: string[],
  direction?: CommercialCreativeDirectionPlan,
  eventSpine?: CommercialEventSpinePlan
): CommercialCameraPlan {
  const lens = resolveAuraTopicLensProfile(actionLines);
  const shots: CommercialCameraShot[] = shotRoles.map((shotRole, shotIndex) => {
    const rule = COMMERCIAL_RHYTHM_RULES[rhythm][shotRole];
    const behavior = direction?.shotDirections[shotIndex]?.cameraBehavior;
    const behaviorOverride = behavior ? CAMERA_BEHAVIOR_OVERRIDES[behavior] : undefined;
    return {
      shotIndex,
      shotRole,
      ...rule,
      ...behaviorOverride,
      framing: eventSpine?.shots[shotIndex]?.framingHint ?? behaviorOverride?.framing ?? rule.framing,
      movement: shotRole === "HERO" ? "brief_hero_hold" : (behaviorOverride?.movement ?? rule.movement),
      productReadabilityGuard:
        shotRole === "DETAIL"
          ? "Observe only reference-supported detail; keep the ankle, product, and ground relationship intact."
          : shotRole === "HERO"
            ? "Keep the product worn at natural human scale and clearly readable without isolating it."
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
