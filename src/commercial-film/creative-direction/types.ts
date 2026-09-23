import type {
  CommercialCameraRhythm,
  CommercialIntentId,
  CommercialShotRole,
} from "../types";
import type {
  CommercialCreativeSpinePlan,
  CommercialDramaticFunction,
  CommercialProductPresenceDesign,
  CommercialRevealStrategy,
} from "../creative-spine/types";
import type { CommercialActionPlanItem } from "../types";
import type { CommercialEventSpinePlan } from "../event-spine/types";

export const COMMERCIAL_CREATIVE_DIRECTION_SCHEMA_VERSION =
  "commercial-film/creative-direction-v1.2" as const;
export const COMMERCIAL_CREATIVE_DIRECTION_VERSION = "1.2.0" as const;

export type CommercialCreativeMode =
  | "PRIVATE_MOMENT"
  | "CITY_JOURNEY"
  | "EVERYDAY_MOVEMENT"
  | "STATE_TRANSITION"
  | "SENSORY_LIFE"
  | "SINGLE_IDEA";

export type CommercialCameraBehavior =
  | "OBSERVE"
  | "FOLLOW"
  | "WAIT"
  | "DISCOVER"
  | "PASS_BY"
  | "GROUND_OBSERVATION"
  | "DETAIL_INTERRUPTION"
  | "WITHHOLD"
  | "REVEAL";

export type CommercialEditLogic =
  | "ACTION_CUT"
  | "MATCH_MOVEMENT"
  | "SENSORY_INSERT"
  | "DELAYED_REVEAL";

export type CommercialVisualMotif =
  | "THRESHOLD"
  | "LIGHT"
  | "REFLECTION"
  | "SHADOW"
  | "LINE"
  | "REPETITION";

export type CommercialCutMotivation =
  | "ACTION_COMPLETION"
  | "ACTION_CONTINUATION"
  | "VISUAL_MATCH"
  | "ATTENTION_SHIFT"
  | "SPATIAL_TRANSITION"
  | "PRODUCT_DISCOVERY"
  | "EMOTIONAL_RELEASE";

export type CommercialCreativeDirectionQcGateId =
  | "commercial_camera_monotony"
  | "perceptual_camera_monotony"
  | "camera_function_mismatch"
  | "unmotivated_edit"
  | "visual_grammar_break"
  | "decorative_insert"
  | "product_presentation_gesture"
  | "reveal_strategy_conflict"
  | "release_direction_break"
  | "generic_fashion_walk_sequence"
  | "unmotivated_product_closeup"
  | "camera_aware_performance"
  | "scene_as_decoration_only"
  | "location_continuity_weak"
  | "product_overexposure"
  | "no_visual_idea"
  | "hero_as_pose"
  | "release_as_extra_beauty_shot"
  | "visibility_framing_compatibility";

export type CommercialCreativeDirectionQcGate = {
  id: CommercialCreativeDirectionQcGateId;
  code:
    | "COMMERCIAL_CAMERA_MONOTONY"
    | "PERCEPTUAL_CAMERA_MONOTONY"
    | "CAMERA_FUNCTION_MISMATCH"
    | "UNMOTIVATED_EDIT"
    | "VISUAL_GRAMMAR_BREAK"
    | "DECORATIVE_INSERT"
    | "PRODUCT_PRESENTATION_GESTURE"
    | "REVEAL_STRATEGY_CONFLICT"
    | "RELEASE_DIRECTION_BREAK"
    | "GENERIC_FASHION_WALK_SEQUENCE"
    | "UNMOTIVATED_PRODUCT_CLOSEUP"
    | "CAMERA_AWARE_PERFORMANCE"
    | "SCENE_AS_DECORATION_ONLY"
    | "LOCATION_CONTINUITY_WEAK"
    | "PRODUCT_OVEREXPOSURE"
    | "NO_VISUAL_IDEA"
    | "HERO_AS_POSE"
    | "RELEASE_AS_EXTRA_BEAUTY_SHOT"
    | "VISIBILITY_FRAMING_MISMATCH";
  label: string;
  status: "PASS" | "FAIL";
  reason: string;
};

export type CommercialCreativeDirectionQc = Record<
  CommercialCreativeDirectionQcGateId,
  CommercialCreativeDirectionQcGate
>;

export type CommercialShotDirection = {
  shotIndex: number;
  shotRole: CommercialShotRole;
  creativeMode: CommercialCreativeMode;
  editLogic: CommercialEditLogic;
  cameraBehavior: CommercialCameraBehavior;
  editEntry: string;
  editExit: string;
  cutMotivation: CommercialCutMotivation;
  visualMotifContribution: string | null;
  cameraNarrativeReason: string;
  movementContinuity: string;
  viewerAttentionTarget: string;
  perceptualSignature: string;
  perceptualSignatureParts: string[];
};

export type CommercialCreativeDirectionPlan = {
  schemaVersion: typeof COMMERCIAL_CREATIVE_DIRECTION_SCHEMA_VERSION;
  plannerVersion: typeof COMMERCIAL_CREATIVE_DIRECTION_VERSION;
  creativeMode: CommercialCreativeMode;
  cameraBehaviorByShot: CommercialCameraBehavior[];
  primaryEditLogic: CommercialEditLogic;
  secondaryEditLogic: CommercialEditLogic | null;
  visualMotif: CommercialVisualMotif | null;
  eventSpine: CommercialEventSpinePlan;
  shotDirections: CommercialShotDirection[];
  qc: CommercialCreativeDirectionQc;
  failureReasons?: string[];
};

export type CommercialCreativeDirectionPlannerInput = {
  commercialIntent: CommercialIntentId;
  creativeSpine: CommercialCreativeSpinePlan;
  cameraRhythm: CommercialCameraRhythm;
  generationNonce: number;
  shotRoles: CommercialShotRole[];
  productPresenceByShot: CommercialProductPresenceDesign[];
  actionPlan: CommercialActionPlanItem[];
  eventSpine: CommercialEventSpinePlan;
  creativeModeOverride?: CommercialCreativeMode;
  primaryEditLogicOverride?: CommercialEditLogic;
  secondaryEditLogicOverride?: CommercialEditLogic | null;
  visualMotifOverride?: CommercialVisualMotif | null;
};

export type CommercialCreativeDirectionQcInput = Omit<
  CommercialCreativeDirectionPlan,
  "qc" | "failureReasons"
> & {
  creativeSpine: CommercialCreativeSpinePlan;
};
