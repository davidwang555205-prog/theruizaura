import type { PersonActionFootwork } from "../../data/personActionLibrary";
import type {
  PhysicalActionAuditInput,
  PhysicalActionHandTask,
  PhysicalActionMovementState,
  PhysicalActionRequiredObject,
  PhysicalActionRequirement,
  PhysicalActionWeightCapability,
} from "./types";

type MovementRule = {
  id: string;
  pattern: RegExp;
  intent: string;
  states: PhysicalActionMovementState[];
  stridePhases: PhysicalActionMovementState[];
  startState: PhysicalActionMovementState;
  endState: PhysicalActionMovementState;
  footwork: PersonActionFootwork[] | null;
  weight: PhysicalActionWeightCapability[];
};

type HandRule = {
  id: string;
  pattern: RegExp;
  intent: string;
  task: PhysicalActionHandTask;
  object: PhysicalActionRequiredObject;
};

// Movement rules are ordered: the first match wins. Stop and Threshold rules sit
// above the plain walking rule because those Moments contain both a walk verb and
// an arrival verb, while the physical requirement is the arrival or the stop.
const MOVEMENT_RULES: MovementRule[] = [
  {
    id: "seated",
    pattern: /\bsits?\b|\bseated\b|\btakes a seat\b/,
    intent: "settle into a seated state",
    states: ["seated"],
    stridePhases: [],
    startState: "stationary",
    endState: "seated",
    footwork: ["seatedGrounded"],
    weight: ["seated_support"],
  },
  {
    id: "threshold",
    pattern: /\bsteps (?:into|through|in)\b|\benters?\b|\bpasses through\b|\bopens the door and steps\b/,
    intent: "cross a doorway or threshold inside a real step",
    states: ["walking_starting", "walking_ongoing", "walking_finish"],
    stridePhases: ["walking_ongoing", "walking_starting", "walking_finish"],
    startState: "walking_ongoing",
    endState: "walking_ongoing",
    footwork: ["stepStart", "midStep", "stepFinish"],
    weight: ["transferring", "settling"],
  },
  {
    id: "stop",
    pattern: /\bstops?\b|\bpauses?\b|\bwaits?\b|\bremains\b|\bdoes not immediately find it\b|\bsettles (?:her|back|into)\b/,
    intent: "carry a walk into a grounded stop",
    states: ["stopping_settle", "transition_pause"],
    stridePhases: ["stopping_settle", "walking_finish"],
    startState: "walking_finish",
    endState: "stationary",
    footwork: ["split", "stepFinish", "parallel"],
    weight: ["settling", "unilateral_support", "bilateral_support"],
  },
  {
    id: "slow",
    pattern: /\bslows?\b|\bshortens one step\b/,
    intent: "reduce cadence inside an unfinished step",
    states: ["walking_finish", "stopping_settle"],
    stridePhases: ["walking_finish", "stopping_settle"],
    startState: "walking_ongoing",
    endState: "walking_finish",
    footwork: ["stepFinish", "midStep", "split"],
    weight: ["settling", "transferring"],
  },
  {
    id: "turn",
    pattern: /\bturns\b|\bturning\b/,
    intent: "change travel direction with a compact pivot",
    states: ["turning", "transition_pause"],
    stridePhases: ["turning", "transition_pause"],
    startState: "walking_finish",
    endState: "walking_ongoing",
    footwork: ["split", "stepFinish", "parallel"],
    weight: ["transferring", "settling"],
  },
  {
    id: "start_walking",
    pattern: /\bbegins walking\b|\bbegins moving\b|\bresumes walking\b|\bstarts walking\b|\bsteps out\b|\bdecides to continue walking\b/,
    intent: "start a compact everyday step",
    states: ["walking_starting", "transition_pause"],
    stridePhases: ["walking_starting", "transition_pause"],
    startState: "stationary",
    endState: "walking_ongoing",
    footwork: ["stepStart", "midStep", "stepFinish"],
    weight: ["transitional_support", "transferring"],
  },
  {
    id: "walking",
    pattern: /\bwalks?\b|\bwalking\b|\bkeeps moving\b|\bcontinues\b|\bmoves through\b|\bapproaches\b|\breaches\b|\bcrosses\b/,
    intent: "hold a grounded walking phase",
    states: ["walking_starting", "walking_ongoing", "walking_finish"],
    stridePhases: ["walking_ongoing", "walking_finish", "walking_starting"],
    startState: "walking_ongoing",
    endState: "walking_ongoing",
    footwork: ["stepStart", "midStep", "stepFinish"],
    weight: ["transferring", "settling"],
  },
  {
    id: "standing",
    pattern: /./,
    intent: "hold a grounded stationary state",
    states: ["stationary", "scene_task", "garment_task", "stopping_settle"],
    stridePhases: [],
    startState: "stationary",
    endState: "stationary",
    footwork: null,
    weight: ["unilateral_support", "bilateral_support", "settling"],
  },
];

// Hand rules are ordered by object specificity. A Moment that names a real object
// must never be satisfied by a decorative free hand.
const HAND_RULES: HandRule[] = [
  {
    id: "search_bag",
    pattern: /\bsearch(?:ing)? inside the bag\b|\blooks inside the bag\b|\bbegins searching\b|\bsearch for the key\b/,
    intent: "search inside a carried container",
    task: "object_search",
    object: "bag",
  },
  {
    id: "retrieve_card",
    pattern: /\busual pocket\b|\bchecks the pocket\b|\bthe card\b|\bfinds the card\b|\bcloses the pocket\b/,
    intent: "retrieve a small item from a pocket",
    task: "object_retrieval",
    object: "card",
  },
  {
    id: "handover_bag",
    pattern: /\bmoves the bag from one hand to the other\b|\bbag handle shifts\b|\bhandle slips\b|\bsettles the bag\b|\badjusts the bag\b|\bbag strap\b|\bsettles the new grip\b/,
    intent: "re-grip or hand over a carried object",
    task: "carried_object_adjust",
    object: "bag",
  },
  {
    id: "check_carried_item",
    pattern: /\bchecks the bag once\b|\bchecks the small item\b|\bsmall item is secure\b|\bsettles it securely\b/,
    intent: "verify a carried object is secure",
    task: "carried_object_check",
    object: "small_item",
  },
  {
    id: "carry_object",
    pattern: /\bwith one bag in hand\b|\bbag held steadily\b|\bone small item already in hand\b/,
    intent: "carry a real object while moving",
    task: "carried_object_hold",
    object: "bag",
  },
  {
    id: "place_object",
    pattern: /\breaches for the object, places it down\b|\bmoves a small item between pockets\b/,
    intent: "place a small object on a real surface",
    task: "object_placement",
    object: "small_item",
  },
  {
    id: "key_door",
    pattern: /\bfinds the key\b|\breaching for the key\b|\bbegins reaching for the key\b/,
    intent: "retrieve a key and align it with the door",
    task: "object_retrieval",
    object: "key",
  },
  {
    id: "door",
    // Real hand-to-door contact only: arriving at, standing beside, or looking
    // toward a door is movement context, not a hand interaction.
    pattern: /\bopens? the door\b|\bunlocks? the door\b|\breaches? for the door\b|\bcloses? the door\b|\blocks? the door\b|\bdoor handle\b/,
    intent: "make real hand contact with a door",
    task: "door_contact",
    object: "door",
  },
  {
    id: "garment",
    pattern: /\badjusts her sleeve\b|\badjusts her outer layer\b|\bsettles the bag\b|\bchecks the garment\b|\bsleeve once\b/,
    intent: "adjust the existing garment",
    task: "garment_adjustment",
    object: "garment",
  },
  {
    id: "none",
    pattern: /./,
    intent: "no object contact",
    task: "none",
    object: "none",
  },
];

const NARRATIVE_OBJECT_PATTERNS: { object: PhysicalActionRequiredObject; pattern: RegExp }[] = [
  { object: "bag", pattern: /\bbag\b/i },
  { object: "key", pattern: /\bkey\b/i },
  { object: "door", pattern: /\bdoor\b/i },
  { object: "card", pattern: /\bcard\b/i },
  { object: "small_item", pattern: /\bsmall item\b|\bthe object\b/i },
  { object: "garment", pattern: /\bsleeve\b|\bouter layer\b|\bclothing\b|\bgarment\b/i },
  { object: "phone", pattern: /\bphone\b/i },
  { object: "seat", pattern: /\bseat\b|\bchair\b/i },
];

function narrativeObjectsOf(text: string) {
  return NARRATIVE_OBJECT_PATTERNS.filter((entry) => entry.pattern.test(text)).map((entry) => entry.object);
}

const CONTACT_HAND_TASKS: PhysicalActionHandTask[] = [
  "object_search",
  "object_retrieval",
  "object_placement",
  "carried_object_hold",
  "carried_object_adjust",
  "carried_object_check",
  "door_contact",
];

export function isObjectContactTask(task: PhysicalActionHandTask) {
  return CONTACT_HAND_TASKS.includes(task);
}

// Carried-object rules read the real object from the Moment text instead of
// assuming a bag, so a Moment that carries or checks a small item keeps that
// object identity.
function resolveCarriedObject(
  text: string,
  fallback: PhysicalActionRequiredObject
): PhysicalActionRequiredObject {
  if (/\bbag\b/i.test(text)) return "bag";
  if (/\bsmall item\b|\bthe object\b/i.test(text)) return "small_item";
  return fallback;
}

export function extractMomentRequirement(
  input: PhysicalActionAuditInput["moments"][number]
): PhysicalActionRequirement {
  const text = input.whatHappens;
  const movement = MOVEMENT_RULES.find((rule) => rule.pattern.test(text)) ?? MOVEMENT_RULES[MOVEMENT_RULES.length - 1];
  // Every hand requirement the Narrative states is kept, because a Moment may
  // combine several tasks (for example a garment adjustment plus a carried
  // object). The first match stays the primary requirement.
  const matchedHandRules = HAND_RULES.filter((rule) => rule.id !== "none" && rule.pattern.test(text));
  const hand = matchedHandRules[0] ?? HAND_RULES[HAND_RULES.length - 1];
  const requiredHandCapabilities = (matchedHandRules.length ? matchedHandRules : [HAND_RULES[HAND_RULES.length - 1]])
    .map((rule) => ({
      capability: rule.task,
      object: rule.task === "carried_object_hold" || rule.task === "carried_object_check"
        ? resolveCarriedObject(text, rule.object)
        : rule.object,
      evidence: text.match(rule.pattern)?.[0] ?? rule.intent,
    }));
  const narrativeObjects = narrativeObjectsOf(text);
  const requiredObject = hand.object;

  return {
    topicId: input.topicId,
    topicLabel: input.topicLabel,
    momentIndex: input.momentIndex,
    purpose: input.purpose,
    whatHappens: text,
    sceneId: input.sceneId,
    sceneName: input.sceneName,
    productPresence: input.productPresence,
    cameraRole: input.cameraRole,
    intentId: `${movement.id}+${hand.id}`,
    actionIntent: `${movement.intent}; ${hand.intent}`,
    requiredBodyMode: [],
    requiredMovementState: [...movement.states],
    requiredHandTask: hand.task,
    requiredObject,
    requiredHandCapabilities,
    requiredFootwork: {
      acceptsFootwork: movement.footwork ? [...movement.footwork] : [],
      requiresGroundContact: true,
      requiresPivot: movement.id === "turn",
      allowsStationaryOffset: movement.id === "standing" || movement.id === "stop",
    },
    requiredWeight: [...movement.weight],
    requiredStridePhase: [...movement.stridePhases],
    startState: movement.startState,
    desiredEndState: movement.endState,
    forbiddenCapabilities: [
      "product display pose",
      "camera driven behavior",
      "unsupported object interaction",
      "narrative contradiction",
    ],
    narrativeObjects,
  };
}

export function buildMomentRequirementMatrix(input: PhysicalActionAuditInput): PhysicalActionRequirement[] {
  return input.moments.map(extractMomentRequirement);
}
