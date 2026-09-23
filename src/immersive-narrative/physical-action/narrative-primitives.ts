import type { PersonActionFootwork, PersonActionMovementPhase } from "../../data/personActionLibrary";
import type {
  PhysicalActionCapability,
  PhysicalActionMovementState,
  PhysicalActionWeightCapability,
  NarrativePrimitiveCapability,
} from "./types";

// The canonical capability vocabulary lives in ./types so the match record can
// carry evaluator results without duplicating the type.
export type { NarrativePrimitiveCapability } from "./types";

export type NarrativePrimitiveSpec = {
  primitiveId: string;
  capabilityFamily: string;
  capabilities: NarrativePrimitiveCapability[];
  movementState: PhysicalActionMovementState;
  movementCompatibility: PhysicalActionMovementState[];
  footwork: PersonActionFootwork;
  weight: PhysicalActionWeightCapability;
  canStartFrom: PhysicalActionMovementState[];
  canEndAs: PhysicalActionMovementState[];
  endState: PhysicalActionMovementState;
  bodyBehavior: string;
  handBehavior: string;
  requiresSurfaceContext: boolean;
  requiresDoorContext: boolean;
  garmentContact: boolean;
  gapIds: string[];
  affectedMoments: { topicId: string; momentIndex: number }[];
};

const PHASE_BY_STATE: Record<PhysicalActionMovementState, PersonActionMovementPhase> = {
  stationary: "still",
  walking_starting: "preparing",
  walking_ongoing: "moving",
  walking_finish: "settling",
  stopping_settle: "settling",
  turning: "moving",
  transition_pause: "preparing",
  seated: "still",
  scene_task: "task",
  garment_task: "task",
  mirror_still: "still",
};

// Nine capability-level primitives, one per confirmed gap cluster. Each entry is
// a single real body behavior, never a runtime composition of two Actions.
export const NARRATIVE_PRIMITIVE_SPECS: NarrativePrimitiveSpec[] = [
  {
    primitiveId: "narrative-carried-object-walk",
    capabilityFamily: "carried-object-handling",
    capabilities: ["CARRIED_OBJECT_HOLD"],
    movementState: "walking_ongoing",
    movementCompatibility: ["walking_starting", "walking_ongoing", "walking_finish"],
    footwork: "midStep",
    weight: "transferring",
    canStartFrom: ["walking_starting", "walking_ongoing", "stationary", "transition_pause"],
    canEndAs: ["walking_ongoing", "walking_finish"],
    endState: "walking_ongoing",
    bodyBehavior: "Walk at an ordinary grounded pace while one hand keeps a steady grip on a carried object.",
    handBehavior: "The carrying hand keeps a closed, weight-bearing grip; the free arm swings naturally with the stride.",
    requiresSurfaceContext: false,
    requiresDoorContext: false,
    garmentContact: false,
    gapIds: ["carried-object-hold-with-bag"],
    affectedMoments: [
      { topicId: "returning_with_purchases", momentIndex: 0 },
      { topicId: "returning_with_purchases", momentIndex: 4 },
      { topicId: "short_local_trip", momentIndex: 0 },
    ],
  },
  {
    primitiveId: "narrative-carried-object-secure",
    capabilityFamily: "carried-object-handling",
    capabilities: ["CARRIED_OBJECT_ADJUST", "CARRIED_OBJECT_CHECK"],
    movementState: "stopping_settle",
    movementCompatibility: ["walking_finish", "stopping_settle", "stationary"],
    footwork: "stepFinish",
    weight: "settling",
    canStartFrom: ["walking_ongoing", "walking_finish", "stopping_settle", "stationary", "transition_pause"],
    canEndAs: ["stationary", "transition_pause"],
    endState: "stationary",
    bodyBehavior: "Carry a walk into a settled stance, let the weight finish moving, and re-settle the carried object against the grip.",
    handBehavior: "One hand re-seats the object against the body, then releases into a relaxed but still weight-bearing grip.",
    requiresSurfaceContext: false,
    requiresDoorContext: false,
    garmentContact: false,
    gapIds: ["carried-object-adjust-with-bag", "carried-object-check-with-small-item"],
    affectedMoments: [
      { topicId: "waiting_for_friend", momentIndex: 3 },
      { topicId: "returning_with_purchases", momentIndex: 1 },
      { topicId: "returning_with_purchases", momentIndex: 2 },
      { topicId: "after_school_pickup", momentIndex: 2 },
      { topicId: "short_local_trip", momentIndex: 2 },
    ],
  },
  {
    primitiveId: "narrative-container-object-retrieval",
    capabilityFamily: "small-object-handling",
    capabilities: ["SMALL_OBJECT_RETRIEVAL", "CONTAINER_OBJECT_SEARCH"],
    movementState: "walking_finish",
    movementCompatibility: ["walking_starting", "walking_ongoing", "walking_finish", "stopping_settle", "stationary"],
    footwork: "stepFinish",
    weight: "settling",
    canStartFrom: ["walking_ongoing", "walking_finish", "stopping_settle", "stationary"],
    canEndAs: ["stationary", "transition_pause", "walking_ongoing"],
    endState: "stationary",
    bodyBehavior: "Keep the grounded stride or settle the stance while one hand reaches into the container and works until the object is found and brought out.",
    handBehavior: "One hand holds the container open and steady while the working hand initiates the reach and searches, then closes on the object and draws it out.",
    requiresSurfaceContext: false,
    requiresDoorContext: false,
    garmentContact: false,
    gapIds: ["object-search-with-bag", "object-retrieval-with-card"],
    affectedMoments: [
      { topicId: "after_work_home", momentIndex: 1 },
      { topicId: "after_work_home", momentIndex: 2 },
      { topicId: "afternoon_cafe", momentIndex: 1 },
      { topicId: "afternoon_cafe", momentIndex: 2 },
      { topicId: "afternoon_cafe", momentIndex: 3 },
      { topicId: "evening_return_home", momentIndex: 1 },
    ],
  },
  {
    primitiveId: "narrative-key-door-unlock",
    capabilityFamily: "threshold-handling",
    capabilities: ["SMALL_OBJECT_RETRIEVAL", "DOOR_CONTACT"],
    movementState: "stopping_settle",
    movementCompatibility: ["walking_finish", "stopping_settle", "stationary"],
    footwork: "split",
    weight: "unilateral_support",
    canStartFrom: ["walking_ongoing", "walking_finish", "stopping_settle", "stationary"],
    canEndAs: ["stationary", "transition_pause"],
    endState: "stationary",
    bodyBehavior: "Settle in front of the door, bring the key out of the pocket or bag, and turn the torso toward the lock as the hand reaches it.",
    handBehavior: "One hand retrieves the key and moves it to the lock; the other hand keeps the doorway position stable.",
    requiresSurfaceContext: false,
    requiresDoorContext: true,
    garmentContact: false,
    gapIds: ["object-retrieval-with-key"],
    affectedMoments: [
      { topicId: "after_work_home", momentIndex: 3 },
      { topicId: "evening_return_home", momentIndex: 2 },
    ],
  },
  {
    primitiveId: "narrative-door-open-transition",
    capabilityFamily: "threshold-handling",
    capabilities: ["DOOR_CONTACT"],
    movementState: "walking_ongoing",
    movementCompatibility: ["walking_ongoing", "stopping_settle", "stationary", "transition_pause"],
    footwork: "stepFinish",
    weight: "settling",
    canStartFrom: ["stationary", "walking_ongoing", "walking_finish", "stopping_settle"],
    canEndAs: ["walking_ongoing", "walking_finish"],
    endState: "walking_ongoing",
    bodyBehavior: "Open the door with one hand and carry the same step through the threshold without adding a pause.",
    handBehavior: "One hand contacts the door and pushes or pulls it clear; the other arm stays with the body line.",
    requiresSurfaceContext: false,
    requiresDoorContext: true,
    garmentContact: false,
    gapIds: ["door-contact-with-door"],
    affectedMoments: [
      { topicId: "errand_outing", momentIndex: 1 },
      { topicId: "evening_return_home", momentIndex: 3 },
    ],
  },
  {
    primitiveId: "narrative-small-object-placement",
    capabilityFamily: "small-object-handling",
    capabilities: ["SMALL_OBJECT_PLACEMENT"],
    movementState: "stopping_settle",
    movementCompatibility: ["stopping_settle", "stationary"],
    footwork: "split",
    weight: "settling",
    canStartFrom: ["walking_ongoing", "walking_finish", "stopping_settle", "stationary"],
    canEndAs: ["stationary", "transition_pause"],
    endState: "stationary",
    bodyBehavior: "Settle beside a real surface, lower the small object onto it, and only then release the hand and the stance.",
    handBehavior: "The holding hand carries the object's weight down onto the surface before the fingers open.",
    requiresSurfaceContext: true,
    requiresDoorContext: false,
    garmentContact: false,
    gapIds: ["object-placement-with-small-item"],
    affectedMoments: [{ topicId: "weekend_alone", momentIndex: 2 }],
  },
  {
    primitiveId: "narrative-garment-adjust-transition",
    capabilityFamily: "garment-handling",
    capabilities: ["GARMENT_ADJUSTMENT"],
    movementState: "walking_starting",
    movementCompatibility: ["walking_starting", "transition_pause"],
    footwork: "stepStart",
    weight: "transitional_support",
    canStartFrom: ["stationary", "transition_pause", "stopping_settle"],
    canEndAs: ["walking_ongoing", "walking_starting"],
    endState: "walking_ongoing",
    bodyBehavior: "Correct one layer of the worn garment while the first step of a departure is already underway.",
    handBehavior: "One hand makes one purposeful correction to the worn layer and returns to the body line before the stride lengthens.",
    requiresSurfaceContext: false,
    requiresDoorContext: false,
    garmentContact: true,
    gapIds: ["hand-task-garment-adjustment"],
    affectedMoments: [{ topicId: "after_lunch", momentIndex: 3 }],
  },
  {
    primitiveId: "narrative-carried-object-garment-settle",
    capabilityFamily: "carried-object-handling",
    capabilities: ["CARRIED_OBJECT_ADJUST", "CARRIED_OBJECT_CHECK", "GARMENT_ADJUSTMENT"],
    movementState: "walking_ongoing",
    movementCompatibility: ["walking_starting", "walking_ongoing", "walking_finish"],
    footwork: "midStep",
    weight: "transferring",
    canStartFrom: ["walking_ongoing", "walking_finish", "stopping_settle", "stationary"],
    canEndAs: ["walking_ongoing", "walking_finish"],
    endState: "walking_ongoing",
    bodyBehavior: "Keep walking at the same measured pace while one hand re-seats the carried object and the other corrects a worn layer.",
    handBehavior: "The carrying hand re-seats and verifies the object; the free hand corrects one layer of the worn garment.",
    requiresSurfaceContext: false,
    requiresDoorContext: false,
    garmentContact: true,
    gapIds: ["carried-object-adjust-with-bag"],
    affectedMoments: [{ topicId: "errand_outing", momentIndex: 3 }],
  },
  {
    primitiveId: "narrative-carried-object-door-approach",
    capabilityFamily: "threshold-handling",
    capabilities: ["CARRIED_OBJECT_ADJUST", "CARRIED_OBJECT_CHECK", "DOOR_CONTACT"],
    movementState: "stopping_settle",
    movementCompatibility: ["walking_ongoing", "walking_finish", "stopping_settle", "stationary"],
    footwork: "stepFinish",
    weight: "settling",
    canStartFrom: ["walking_ongoing", "walking_finish", "stopping_settle", "stationary"],
    canEndAs: ["stationary", "transition_pause", "walking_ongoing"],
    endState: "stationary",
    bodyBehavior: "Carry the walk to a settled stance at the door, secure the carried object, and let the working hand continue into door contact.",
    handBehavior: "One hand settles and verifies the carried object against the body before it moves on to the door.",
    requiresSurfaceContext: false,
    requiresDoorContext: true,
    garmentContact: false,
    gapIds: ["carried-object-adjust-with-bag"],
    affectedMoments: [{ topicId: "returning_with_purchases", momentIndex: 3 }],
  },
];

export function narrativePrimitiveToCapability(spec: NarrativePrimitiveSpec): PhysicalActionCapability {
  const garmentContact = spec.capabilities.includes("GARMENT_ADJUSTMENT");
  return {
    actionId: spec.primitiveId,
    actionFamily: spec.capabilityFamily,
    macroActionGroup: "standStill",
    category: "general",
    bodyMode: "standing",
    movementState: spec.movementState,
    footwork: {
      pattern: spec.footwork,
      stridePhase: PHASE_BY_STATE[spec.movementState],
      leadRearRelationship: "unilateral_support",
      supportLeg: spec.weight === "bilateral_support" ? "balanced" : "left",
      kneeState: "softEven",
      heelState: "bothGrounded",
      groundContact: "grounded",
      pivotCapability: false,
      stationaryOffsetCapability: spec.footwork === "split",
    },
    weightCapability: spec.weight,
    hand: {
      capability: garmentContact ? "garment_adjustment" : "scene_gesture",
      sourceHandTask: garmentContact ? "sleeve" : "environmentCue",
      requiredObject: garmentContact ? "garment" : null,
    },
    garment: {
      declared: garmentContact,
      sourceField: "handTask",
      rawValue: garmentContact ? "sleeve" : null,
      placementZone: garmentContact ? "cuff" : "environment",
    },
    objectCapability: {
      supportsObjectSearch: spec.capabilities.includes("CONTAINER_OBJECT_SEARCH"),
      supportsObjectRetrieval: spec.capabilities.includes("SMALL_OBJECT_RETRIEVAL"),
      supportsObjectPlacement: spec.capabilities.includes("SMALL_OBJECT_PLACEMENT"),
      supportsCarriedObjectHold: spec.capabilities.includes("CARRIED_OBJECT_HOLD"),
      supportsDoorContact: spec.capabilities.includes("DOOR_CONTACT"),
      holdsAnyObject: spec.capabilities.some((capability) => capability.startsWith("CARRIED_OBJECT")),
    },
    transitionCapability: {
      canStartFrom: [...spec.canStartFrom],
      canEndAs: [...spec.canEndAs],
    },
    orientationCapability: "threeQuarter",
    visualLegPoseFamily: "offset-standing",
    travelDirection: spec.capabilities.includes("CARRIED_OBJECT_HOLD") ? "forward" : "stationary",
    narrativeSuitability: "neutral_daily_action",
    imageTypeScope: [],
    handheldPolicy: "none",
    telephotoSafe: true,
    source: "NARRATIVE_PRIMITIVE",
    narrativePrimitive: {
      primitiveId: spec.primitiveId,
      capabilityFamily: spec.capabilityFamily,
      capabilities: [...spec.capabilities],
      movementCompatibility: [...spec.movementCompatibility],
      endState: spec.endState,
      bodyBehavior: spec.bodyBehavior,
      handBehavior: spec.handBehavior,
      requiresSurfaceContext: spec.requiresSurfaceContext,
      requiresDoorContext: spec.requiresDoorContext,
      gapIds: [...spec.gapIds],
      affectedMoments: spec.affectedMoments.map((moment) => ({ ...moment })),
      legacySelectorEligible: false,
    },
  };
}

export const NARRATIVE_PRIMITIVE_REGISTRY: PhysicalActionCapability[] =
  NARRATIVE_PRIMITIVE_SPECS.map(narrativePrimitiveToCapability);
