import {
  personActionLibrary,
  type PersonActionDefinition,
  type PersonActionHandTask,
} from "../../data/personActionLibrary";
import type {
  PhysicalActionBodyMode,
  PhysicalActionCapability,
  PhysicalActionCapabilitySummary,
  PhysicalActionHandCapability,
  PhysicalActionMovementState,
  PhysicalActionNarrativeSuitability,
  PhysicalActionObjectCategory,
  PhysicalActionWeightCapability,
} from "./types";

const FAMILY_BODY_MODE: Record<string, PhysicalActionBodyMode> = {
  standing: "standing",
  walking: "walking",
  transition: "transition",
  turning: "turning",
  "garment-task": "garment_interaction",
  "scene-interaction": "scene_gesture",
  "environment-response": "scene_gesture",
  "on-foot": "on_foot_placement",
  seated: "seated",
};

const HAND_CAPABILITY: Record<PersonActionHandTask, {
  capability: PhysicalActionHandCapability;
  requiredObject: PhysicalActionObjectCategory | null;
}> = {
  emptyRelaxed: { capability: "none", requiredObject: null },
  sleeve: { capability: "garment_adjustment", requiredObject: "garment" },
  lapel: { capability: "garment_adjustment", requiredObject: "garment" },
  hem: { capability: "garment_adjustment", requiredObject: "garment" },
  pocketEdge: { capability: "pocket_contact", requiredObject: "garment" },
  environmentCue: { capability: "scene_gesture", requiredObject: null },
  phone: { capability: "object_hold", requiredObject: "phone" },
  seatSupport: { capability: "furniture_contact", requiredObject: "seat" },
};

// Real garment-related canonical values of PersonActionDefinition.handTask.
export const GARMENT_HAND_TASKS: PersonActionHandTask[] = ["sleeve", "lapel", "hem", "pocketEdge"];
export const GARMENT_HAND_CAPABILITIES: PhysicalActionHandCapability[] = ["garment_adjustment", "pocket_contact"];

const STATE_TRANSITIONS: Record<PhysicalActionMovementState, {
  canStartFrom: PhysicalActionMovementState[];
  canEndAs: PhysicalActionMovementState[];
}> = {
  stationary: {
    canStartFrom: ["stationary", "stopping_settle", "walking_finish", "turning", "scene_task", "garment_task"],
    canEndAs: ["stationary", "walking_starting", "turning", "scene_task", "garment_task"],
  },
  walking_starting: {
    canStartFrom: ["stationary", "walking_starting", "transition_pause", "scene_task"],
    canEndAs: ["walking_ongoing", "walking_starting"],
  },
  walking_ongoing: {
    canStartFrom: ["walking_starting", "walking_ongoing", "turning"],
    canEndAs: ["walking_ongoing", "walking_finish", "turning"],
  },
  walking_finish: {
    canStartFrom: ["walking_ongoing", "walking_finish"],
    canEndAs: ["stopping_settle", "stationary", "turning", "transition_pause"],
  },
  stopping_settle: {
    canStartFrom: ["walking_finish", "stopping_settle", "stationary"],
    canEndAs: ["stationary", "scene_task", "garment_task"],
  },
  transition_pause: {
    canStartFrom: ["walking_ongoing", "walking_finish", "stopping_settle", "stationary", "transition_pause"],
    canEndAs: ["walking_starting", "walking_ongoing", "stationary", "transition_pause"],
  },
  turning: {
    canStartFrom: ["stationary", "walking_ongoing", "walking_finish", "turning", "stopping_settle"],
    canEndAs: ["stationary", "walking_ongoing", "walking_finish", "turning"],
  },
  seated: {
    canStartFrom: ["seated", "stopping_settle", "stationary"],
    canEndAs: ["seated", "transition_pause"],
  },
  scene_task: {
    canStartFrom: ["stationary", "stopping_settle", "walking_finish", "scene_task"],
    canEndAs: ["stationary", "scene_task", "walking_starting"],
  },
  garment_task: {
    canStartFrom: ["stationary", "stopping_settle", "walking_finish", "garment_task", "transition_pause"],
    canEndAs: ["stationary", "garment_task", "walking_starting"],
  },
  mirror_still: {
    canStartFrom: ["mirror_still"],
    canEndAs: ["mirror_still"],
  },
};

function movementStateOf(action: PersonActionDefinition): PhysicalActionMovementState {
  if (action.category === "mirror") return "mirror_still";
  if (action.category === "seated") return "seated";
  if (action.category === "studio") {
    if (action.footwork === "midStep") return "walking_ongoing";
    if (action.footwork === "stepStart") return "walking_starting";
    if (action.footwork === "stepFinish") return "walking_finish";
    return "stationary";
  }

  switch (action.diversityFamily) {
    case "walking":
      if (action.movementPhase === "preparing") return "walking_starting";
      if (action.movementPhase === "moving") return "walking_ongoing";
      return "walking_finish";
    case "transition":
      return action.movementPhase === "preparing" ? "transition_pause" : "stopping_settle";
    case "turning":
      return "turning";
    case "garment-task":
      return "garment_task";
    case "scene-interaction":
      return action.movementPhase === "preparing" ? "transition_pause" : "scene_task";
    case "environment-response":
      return action.movementPhase === "settling" ? "stopping_settle" : "stationary";
    case "on-foot":
      if (action.movementPhase === "preparing") return "walking_starting";
      if (action.movementPhase === "settling") return "stopping_settle";
      return "stationary";
    case "standing":
    default:
      return action.movementPhase === "settling" ? "stopping_settle" : "stationary";
  }
}

function weightCapabilityOf(action: PersonActionDefinition): PhysicalActionWeightCapability {
  if (action.category === "seated" || action.footwork === "seatedGrounded") return "seated_support";
  if (action.footwork === "stepStart" || action.footwork === "midStep") return "transferring";
  if (action.footwork === "stepFinish") return "settling";
  if (action.movementPhase === "preparing") return "transitional_support";
  if (action.movementPhase === "settling") return "settling";
  if (action.footwork === "split") return "unilateral_support";
  return "bilateral_support";
}

function narrativeSuitabilityOf(action: PersonActionDefinition): PhysicalActionNarrativeSuitability {
  if (action.category === "studio") return "display_like";
  if (action.diversityFamily === "on-foot") return "display_like";
  if (action.category === "mirror") return "specialized_action";
  return "neutral_daily_action";
}

function groundContactOf(action: PersonActionDefinition) {
  if (action.footwork === "seatedGrounded") return "seated_grounded" as const;
  if (action.heelState === "leadContact" || action.heelState === "rearLifted") return "settling" as const;
  return "grounded" as const;
}

export function toActionCapability(action: PersonActionDefinition): PhysicalActionCapability {
  const movementState = movementStateOf(action);
  const hand = HAND_CAPABILITY[action.handTask];

  return {
    actionId: action.id,
    actionFamily: action.diversityFamily,
    macroActionGroup: action.macroActionGroup,
    category: action.category,
    bodyMode: FAMILY_BODY_MODE[action.diversityFamily]
      ?? (action.category === "mirror"
        ? "mirror"
        : action.framing === "onFootDetail" || action.framing === "waistToFloor"
          ? "on_foot_placement"
          : "standing"),
    movementState,
    footwork: {
      pattern: action.footwork,
      stridePhase: action.movementPhase,
      leadRearRelationship: action.supportLeg === "balanced"
        ? "bilateral_even_support"
        : `${action.supportLeg}_carrying_main_weight`,
      supportLeg: action.supportLeg,
      kneeState: action.kneeState,
      heelState: action.heelState,
      groundContact: groundContactOf(action),
      pivotCapability: action.travelDirection === "turning",
      stationaryOffsetCapability: action.footwork === "split",
    },
    weightCapability: weightCapabilityOf(action),
    hand: {
      capability: hand.capability,
      sourceHandTask: action.handTask,
      requiredObject: hand.requiredObject,
    },
    garment: {
      declared: GARMENT_HAND_TASKS.includes(action.handTask),
      sourceField: "handTask",
      rawValue: action.handTask,
      placementZone: action.handPlacementZone,
    },
    objectCapability: {
      // Only the existing handTask enum expresses real contact. No existing
      // field expresses search, retrieval, placement, carried-object, or door contact.
      supportsObjectSearch: false,
      supportsObjectRetrieval: false,
      supportsObjectPlacement: false,
      supportsCarriedObjectHold: false,
      supportsDoorContact: false,
      holdsAnyObject: action.handTask === "phone",
    },
    transitionCapability: {
      canStartFrom: [...STATE_TRANSITIONS[movementState].canStartFrom],
      canEndAs: [...STATE_TRANSITIONS[movementState].canEndAs],
    },
    orientationCapability: action.bodyOrientation,
    visualLegPoseFamily: action.visualLegPoseFamily,
    travelDirection: action.travelDirection,
    narrativeSuitability: narrativeSuitabilityOf(action),
    imageTypeScope: [...action.compatibleImageTypes],
    handheldPolicy: action.handheldPolicy,
    telephotoSafe: action.shoeVisibilityRisk === "low",
    source: "SHARED_ACTION_LIBRARY",
  };
}

export function buildActionCapabilityMatrix(
  actions: PersonActionDefinition[] = personActionLibrary
): PhysicalActionCapability[] {
  return actions.map(toActionCapability);
}

function tally(values: string[]) {
  const counts: Record<string, number> = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort((first, second) => first[0].localeCompare(second[0])));
}

export function summarizeCapabilityMatrix(matrix: PhysicalActionCapability[]): PhysicalActionCapabilitySummary {
  return {
    totalActions: matrix.length,
    byCategory: tally(matrix.map((entry) => entry.category)),
    families: tally(matrix.map((entry) => entry.actionFamily)),
    handTasks: tally(matrix.map((entry) => entry.hand.capability)),
    footwork: tally(matrix.map((entry) => entry.footwork.pattern)),
    movementStates: tally(matrix.map((entry) => entry.movementState)),
    transitionCapabilities: tally(matrix.map((entry) => `${entry.movementState}->${entry.transitionCapability.canEndAs.join("|")}`)),
    objectCapabilityCounts: {
      holdsAnyObject: matrix.filter((entry) => entry.objectCapability.holdsAnyObject).length,
      supportsObjectSearch: matrix.filter((entry) => entry.objectCapability.supportsObjectSearch).length,
      supportsObjectRetrieval: matrix.filter((entry) => entry.objectCapability.supportsObjectRetrieval).length,
      supportsObjectPlacement: matrix.filter((entry) => entry.objectCapability.supportsObjectPlacement).length,
      supportsCarriedObjectHold: matrix.filter((entry) => entry.objectCapability.supportsCarriedObjectHold).length,
      supportsDoorContact: matrix.filter((entry) => entry.objectCapability.supportsDoorContact).length,
    },
    narrativeSuitability: tally(matrix.map((entry) => entry.narrativeSuitability)),
  };
}

export function isNarrativeEligible(capability: PhysicalActionCapability) {
  return capability.narrativeSuitability === "neutral_daily_action"
    && (capability.category === "general" || capability.category === "seated");
}
