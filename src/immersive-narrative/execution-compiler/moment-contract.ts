import type {
  ActionExecutionEvidence,
  BoundaryConflict,
  ExecutionCompilerInput,
  ExecutionMomentContract,
  NarrativeCompletionClass,
  ExecutionEndState,
} from "./types";
import type { NarrativeCompletionBoundary } from "../types";
import type { SpatialAnchorId } from "../spatial/types";

// ---------------------------------------------------------------------------
// Narrative truth extraction. Every pattern below reads the Narrative Moment
// text (or, for object identity, the whole Topic narrative). Nothing here reads
// a primitive capability, so a primitive can never advance the story.
// ---------------------------------------------------------------------------
type EndStateRule = {
  state: ExecutionEndState;
  pattern: RegExp;
  allowedProgress: string;
  forbidden: NarrativeCompletionClass[];
  objectAfter: (match: string) => string;
};

const UNRESOLVED_LATER: NarrativeCompletionClass[] = [
  "ITEM_RETRIEVED",
  "DOOR_INTERACTION",
  "ENTRY",
  "TASK_COMPLETE",
];

const END_STATE_RULES: EndStateRule[] = [
  {
    state: "SEARCH_CONTINUES",
    pattern: /\bdoes not (?:immediately )?find\b|\bstill not found\b|\banother second\b|\bchecks? the pocket (?:once more|again)\b|\bfirst touch\b|\bonce more\b/i,
    allowedProgress: "the same search continues; nothing is taken out",
    forbidden: UNRESOLVED_LATER,
    objectAfter: () => "still inside; not found",
  },
  {
    state: "SEARCH_BEGINS",
    pattern: /\bbegins? searching\b|\bsearch(?:ing)? inside\b|\breaching for the usual pocket\b|\bbegins? reaching for the (?:usual pocket|card)\b/i,
    allowedProgress: "the search or reach has only started",
    forbidden: UNRESOLVED_LATER,
    objectAfter: () => "not yet found, not yet out",
  },
  {
    state: "OBJECT_HANDLING_IN_PROGRESS",
    pattern: /\bbag handle shifts?\b|\bmoves? the bag\b|\badjusts? the bag\b|\bnew grip\b|\badjusts? her (?:sleeve|outer layer)\b/i,
    allowedProgress: "the carried object or garment is being handled",
    forbidden: ["CARRIED_OBJECT_SECURED", "GARMENT_SETTLED", "ENTRY", "TASK_COMPLETE"],
    objectAfter: () => "held; still being handled",
  },
  {
    state: "ITEM_RETRIEVED",
    pattern: /\bfinds? the (?:key|card|item)\b|\bcard is found\b|\bkey is found\b|\bcloses? the pocket\b/i,
    allowedProgress: "the small item is taken out",
    forbidden: ["ENTRY"],
    objectAfter: () => "in hand",
  },
  {
    state: "DOOR_INTERACTION",
    pattern: /\b(?:opens?|unlocks?|closes?)\b[^.]*\bdoor\b|\breaches? for the door\b|\bdoor handle\b/i,
    allowedProgress: "the door is being handled",
    forbidden: ["ENTRY"],
    objectAfter: () => "door handled",
  },
  {
    state: "OBJECT_PLACEMENT",
    pattern: /\bplaces? (?:it|the object) down\b|\bplaces? the object\b/i,
    allowedProgress: "the small object is set down",
    forbidden: ["ITEM_RETRIEVED", "ENTRY"],
    objectAfter: () => "set down on the surface",
  },
  {
    state: "ENTRY_COMPLETE",
    pattern: /\bsteps? into\b|\benters?\b|\bsteps? through\b/i,
    allowedProgress: "the person moves inside",
    forbidden: ["TASK_COMPLETE"],
    objectAfter: () => "inside",
  },
  {
    state: "SETTLED_STATE",
    pattern: /\bremains? quietly\b|\bis complete\b|\breturns? to stillness\b|\blets? her attention\b|\bsettles? back\b|\bsettles? into a normal\b/i,
    allowedProgress: "the state settles and holds",
    forbidden: ["ITEM_RETRIEVED", "DOOR_INTERACTION", "ENTRY"],
    objectAfter: () => "unchanged",
  },
  {
    state: "REACH_BEGINS",
    pattern: /\bslows?\b|\bbegins? reaching\b|\breaches? for the (?:key|card)\b/i,
    allowedProgress: "the movement slows and the reach starts",
    forbidden: UNRESOLVED_LATER,
    objectAfter: () => "not yet reached",
  },
  {
    state: "WALK_CONTINUES",
    pattern: /\bwalks?\b|\bwalking\b|\bapproaches?\b|\bcontinues?\b|\bcrosses?\b|\bmoves through\b|\bheads? toward\b/i,
    allowedProgress: "the walk continues at an ordinary pace",
    forbidden: ["ITEM_RETRIEVED", "OBJECT_PLACEMENT", "GARMENT_SETTLED", "ENTRY", "TASK_COMPLETE"],
    objectAfter: () => "unchanged",
  },
];

const CONTAINER_PATTERN = /\bbag\b|\bpocket\b|\bhandbag\b/i;
const ITEM_PATTERN = /\bkey\b|\bcard\b|\bsmall item\b|\bthe object\b/i;
const RETURNS_OBJECT_TO_CONTAINER = /\b(?:slips?|puts?|returns?)\s+(?:it|the (?:card|key|item))\s+(?:straight\s+)?back\s+(?:into|in)\s+(?:the\s+)?(?:same|usual)\s+(?:pocket|bag)\b/i;

export function returnsObjectToContainer(text: string) {
  return RETURNS_OBJECT_TO_CONTAINER.test(text);
}

function containerOf(text: string) {
  const match = text.match(CONTAINER_PATTERN);
  if (!match) return null;
  return match[0].toLowerCase();
}

function itemOf(text: string) {
  const match = text.match(ITEM_PATTERN);
  if (!match) return null;
  return match[0].toLowerCase();
}

export function detectEndState(text: string): EndStateRule {
  return END_STATE_RULES.find((rule) => rule.pattern.test(text))
    ?? {
      state: "STATE_HOLD" as ExecutionEndState,
      pattern: /(?:)/,
      allowedProgress: "the current state holds",
      forbidden: [] as NarrativeCompletionClass[],
      objectAfter: () => "unchanged",
    };
}

// The canonical boundary is the only source of truth. It is mapped onto the
// execution vocabulary; the execution layer never re-reads the Moment text.
const CANONICAL_TO_EXECUTION: Record<NarrativeCompletionBoundary, ExecutionEndState> = {
  WALK_CONTINUES: "WALK_CONTINUES",
  SEARCH_STARTED: "SEARCH_BEGINS",
  SEARCH_CONTINUES: "SEARCH_CONTINUES",
  REACH_STARTED: "REACH_BEGINS",
  OBJECT_HANDLING: "OBJECT_HANDLING_IN_PROGRESS",
  ITEM_RETRIEVED: "ITEM_RETRIEVED",
  DOOR_HANDLED: "DOOR_INTERACTION",
  ENTERED: "ENTRY_COMPLETE",
  SETTLED: "SETTLED_STATE",
  STATE_HELD: "STATE_HOLD",
};

export function boundaryRuleFor(boundary: NarrativeCompletionBoundary): EndStateRule {
  const executionState = CANONICAL_TO_EXECUTION[boundary];
  return END_STATE_RULES.find((rule) => rule.state === executionState)
    ?? {
      state: "STATE_HOLD" as ExecutionEndState,
      pattern: /(?:)/,
      allowedProgress: "the current state holds",
      forbidden: [] as NarrativeCompletionClass[],
      objectAfter: () => "unchanged",
    };
}

// Spatial anchor: a within-scene execution position derived from the Narrative
// text. It is not a second scene library and never invents a location.
const SPATIAL_ANCHORS: { pattern: RegExp; anchor: string }[] = [
  { pattern: /电梯|elevator/i, anchor: "elevator exit" },
  { pattern: /走廊|hallway/i, anchor: "hallway" },
  { pattern: /公寓门口|归家玄关|回家进门|玄关|threshold/i, anchor: "home entrance threshold" },
  { pattern: /咖啡馆|café|cafe/i, anchor: "cafe interior" },
  { pattern: /柜台|counter/i, anchor: "counter" },
  { pattern: /书店|杂志店|bookstore/i, anchor: "bookstore front" },
  { pattern: /窗前|window-side|window/i, anchor: "window side" },
  { pattern: /写字楼门口|entrance/i, anchor: "office entrance" },
  { pattern: /精品超市|超市|grocery/i, anchor: "grocery aisle" },
  { pattern: /街区|street|pavement|sidewalk/i, anchor: "street" },
  { pattern: /衣帽间|更衣角|cloakroom/i, anchor: "cloakroom" },
  { pattern: /table/i, anchor: "nearby table" },
];

export function detectSpatialAnchor(text: string, fallback: string) {
  return SPATIAL_ANCHORS.find((entry) => entry.pattern.test(text))?.anchor ?? fallback;
}

export function buildExecutionMomentContracts(
  input: ExecutionCompilerInput
): ExecutionMomentContract[] {
  const topicNarrative = input.plan.moments.map((moment) => moment.whatHappens).join(" ");
  const topicContainer = containerOf(topicNarrative);
  const topicItem = itemOf(topicNarrative);
  let previousState: ExecutionEndState = "STATE_HOLD";
  let previousObjectState = topicContainer && topicItem ? `${topicItem} in ${topicContainer}` : "unchanged";
  let worldState: WorldSnapshot | null = TOPIC_STATE_DATA[input.plan.topicId]
    ? { facts: { ...TOPIC_STATE_DATA[input.plan.topicId].initial, "character.anchor": TOPIC_STATE_DATA[input.plan.topicId].anchors[0] }, entities: { ...TOPIC_STATE_DATA[input.plan.topicId].entities }, completedEvents: [] }
    : null;

  const contracts = input.plan.moments.map((moment) => {
    const worldStateBefore = worldState
      ? { facts: { ...worldState.facts }, entities: { ...worldState.entities }, completedEvents: [...worldState.completedEvents] }
      : null;
    const reduced = worldState ? reduceMomentState(input.plan.topicId, moment.index, worldState) : null;
    if (reduced) worldState = reduced.after;
    const rule = boundaryRuleFor(moment.completionBoundary);
    const ruleObjectStateAfter = rule.objectAfter(moment.whatHappens);
    const objectStateAfter = returnsObjectToContainer(moment.whatHappens)
      ? "returned to the same pocket or bag; not held"
      : ruleObjectStateAfter === "unchanged" || (rule.state === "ENTRY_COMPLETE" && topicItem)
        ? previousObjectState
        : ruleObjectStateAfter;
    const cameraMoment = input.cameraExecution.moments.find((entry) => entry.momentIndex === moment.index);
    const anchor = moment.spatialAnchor;
    const notes: string[] = [];
    const container = containerOf(moment.whatHappens) ?? topicContainer;
    const item = itemOf(moment.whatHappens) ?? topicItem;
    if (container && !containerOf(moment.whatHappens)) {
      notes.push(`container "${container}" is established by the Topic narrative`);
    }
    if (item && !itemOf(moment.whatHappens)) {
      notes.push(`object "${item}" is established by the Topic narrative`);
    }
    const contract: ExecutionMomentContract = {
      momentIndex: moment.index,
      purpose: moment.purpose,
      timeRange: cameraMoment?.timing
        ? { startSecond: cameraMoment.timing.startSecond, endSecond: cameraMoment.timing.endSecond }
        : null,
      narrativeEvent: moment.whatHappens,
      startState: previousState,
      allowedProgress: rule.allowedProgress,
      endState: rule.state,
      objectStateBefore: previousObjectState,
      objectStateAfter,
      forbiddenCompletions: [...rule.forbidden],
      requiredProgressEvidence: requiredProgressFor(rule.state),
      narrativeEvidence: moment.whatHappens,
      spatialAnchor: anchor,
      executionStatus: "EXECUTABLE",
      notes,
      stateAuthority: reduced?.data && (
        Object.keys(reduced.data.preconditions ?? {}).length > 0
        || Object.keys(reduced.data.effects ?? {}).length > 0
        || (reduced.data.visible?.length ?? 0) > 0
      ) ? "STRUCTURED_AUTHORITY" : "LEGACY_FALLBACK",
      worldStateBefore,
      worldStateAfter: reduced ? { facts: { ...reduced.after.facts }, entities: { ...reduced.after.entities }, completedEvents: [...reduced.after.completedEvents] } : null,
      requiredVisibleEvidence: reduced?.data?.visible ?? [],
      singleUseAction: reduced?.data?.singleUseAction ?? null,
      takeBoundary: reduced?.data?.takeBoundary ?? null,
      stateConflicts: reduced?.errors ?? [],
      requiresStationaryBody: reduced?.data?.requiresStationaryBody ?? false,
    };
    previousState = rule.state;
    previousObjectState = objectStateAfter;
    return contract;
  });

  // An internally unsupported Moment carries no camera window, but the model
  // facing timeline still has to be continuous. The window is taken from the
  // canonical scheduler's own boundaries: it runs from the previous Moment's end
  // to the next Moment's start.
  contracts.forEach((contract, index) => {
    if (contract.timeRange) return;
    const previousEnd = contracts
      .slice(0, index)
      .map((entry) => entry.timeRange?.endSecond)
      .filter((value): value is number => typeof value === "number")
      .pop() ?? 0;
    const nextStart = contracts
      .slice(index + 1)
      .map((entry) => entry.timeRange?.startSecond)
      .find((value): value is number => typeof value === "number") ?? input.plan.durationSeconds;
    contract.timeRange = { startSecond: previousEnd, endSecond: nextStart };
    contract.notes.push(`time window inherited from the canonical scheduler (${previousEnd}-${nextStart})`);
  });

  return contracts;
}

function requiredProgressFor(state: ExecutionEndState): NarrativeCompletionClass[] | null {
  if (state === "SEARCH_BEGINS" || state === "SEARCH_CONTINUES") return ["ITEM_RETRIEVED"];
  if (state === "REACH_BEGINS") return ["ITEM_RETRIEVED", "DOOR_INTERACTION"];
  if (state === "OBJECT_HANDLING_IN_PROGRESS") return ["CARRIED_OBJECT_SECURED", "GARMENT_SETTLED"];
  return null;
}

// Completion classes a selected Action *claims*. Only structured capability ids
// and the canonical hand task are read; the primitive's prose is never used.
const CAPABILITY_COMPLETION: Record<string, NarrativeCompletionClass> = {
  SMALL_OBJECT_RETRIEVAL: "ITEM_RETRIEVED",
  DOOR_CONTACT: "DOOR_INTERACTION",
  SMALL_OBJECT_PLACEMENT: "OBJECT_PLACEMENT",
  GARMENT_ADJUSTMENT: "GARMENT_SETTLED",
  CARRIED_OBJECT_CHECK: "CARRIED_OBJECT_SECURED",
};

const HAND_TASK_COMPLETION: Record<string, NarrativeCompletionClass> = {
  object_retrieval: "ITEM_RETRIEVED",
  door_contact: "DOOR_INTERACTION",
  object_placement: "OBJECT_PLACEMENT",
  garment_adjustment: "GARMENT_SETTLED",
  carried_object_check: "CARRIED_OBJECT_SECURED",
};

export function completionClassesOf(evidence: ActionExecutionEvidence): NarrativeCompletionClass[] {
  const classes = new Set<NarrativeCompletionClass>();
  for (const capability of evidence.capabilityIds) {
    const mapped = CAPABILITY_COMPLETION[capability];
    if (mapped) classes.add(mapped);
  }
  if (evidence.handTask && HAND_TASK_COMPLETION[evidence.handTask]) {
    classes.add(HAND_TASK_COMPLETION[evidence.handTask]);
  }
  if (/\bfound and brought out\b|\bworks? until\b/i.test(evidence.internalText)) {
    classes.add("ITEM_RETRIEVED");
  }
  return [...classes];
}

function maintainsInProgress(evidence: ActionExecutionEvidence, contract: ExecutionMomentContract) {
  const inProgressCapabilities = evidence.capabilityIds.some((capability) => (
    capability === "CONTAINER_OBJECT_SEARCH"
    || capability === "CARRIED_OBJECT_HOLD"
    || capability === "CARRIED_OBJECT_ADJUST"
  ));
  if (inProgressCapabilities) return true;
  if (evidence.handTask === "object_search" || evidence.handTask === "carried_object_hold" || evidence.handTask === "carried_object_adjust") {
    return true;
  }
  return contract.endState === "SEARCH_CONTINUES"
    && /looks? inside|checks? the pocket|another second|once more/i.test(contract.narrativeEvidence);
}

export function checkMomentBoundary(
  contract: ExecutionMomentContract,
  evidence: ActionExecutionEvidence,
  options: { safeContinuationAvailable: boolean; source: BoundaryConflict["source"] }
): BoundaryConflict[] {
  const conflicts: BoundaryConflict[] = [];
  const claimed = completionClassesOf(evidence);
  const returnsObject = returnsObjectToContainer(contract.narrativeEvent);
  const early = claimed.filter((entry) => contract.forbiddenCompletions.includes(entry)
    && !(returnsObject && entry === "ITEM_RETRIEVED"));
  if (early.length > 0) {
    conflicts.push({
      momentIndex: contract.momentIndex,
      type: "EARLY_COMPLETION",
      detail: `Action evidence claims ${early.join(", ")} while the Narrative Moment ends at ${contract.endState}.`,
      source: options.source,
    });
  }
  const needsProgress = Boolean(contract.requiredProgressEvidence) && evidence.status === "UNRESOLVED";
  if (needsProgress && !options.safeContinuationAvailable) {
    conflicts.push({
      momentIndex: contract.momentIndex,
      type: "MISSING_END_STATE",
      detail: `Narrative Moment ends at ${contract.endState} but no executable action or safe continuation preserves that end state.`,
      source: options.source,
    });
  }
  return conflicts;
}

export function temporalCoverage(moments: { startSecond: number; endSecond: number }[], duration: number) {
  const sorted = [...moments].sort((a, b) => a.startSecond - b.startSecond);
  let contiguous = sorted.length > 0 && sorted[0].startSecond === 0;
  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index].startSecond !== sorted[index - 1].endSecond) contiguous = false;
  }
  if (sorted.length > 0 && sorted[sorted.length - 1].endSecond !== duration) contiguous = false;
  return {
    startSecond: sorted[0]?.startSecond ?? 0,
    endSecond: sorted[sorted.length - 1]?.endSecond ?? 0,
    contiguous,
  };
}
// Declarative facts for the existing Moment contract. These records are story
// data, never inferred from model-facing prose or from a selected Action.
export type WorldFacts = Record<string, string>;
export type WorldEntity = { kind: "CHARACTER" | "THRESHOLD" | "OBJECT" | "PLACE" | "SURFACE" };
export type WorldSnapshot = { facts: WorldFacts; entities?: Record<string, WorldEntity>; completedEvents: string[] };
export type VisibleEvent = { id: string; statement: string };
export type TakeBoundary = {
  kind: "REAL_SPATIAL_BOUNDARY" | "TIME_DISCONTINUITY" | "ACTION_CONTINUITY_IMPOSSIBLE" | "TRUE_CAMERA_STATE_DISCONTINUITY";
  evidence: string;
  whyContinuousCoverageFails: string;
};
export type MomentStateData = {
  preconditions?: WorldFacts;
  effects?: WorldFacts;
  visible?: VisibleEvent[];
  singleUseAction?: string;
  takeBoundary?: TakeBoundary;
  requiresStationaryBody?: boolean;
};
export type TopicStateData = { initial: WorldFacts; entities?: Record<string, WorldEntity>; anchors: SpatialAnchorId[]; moments: MomentStateData[] };

const event = (id: string, statement: string): VisibleEvent => ({ id, statement });
const spatialCut = (evidence: string, whyContinuousCoverageFails: string): TakeBoundary => ({
  kind: "REAL_SPATIAL_BOUNDARY", evidence, whyContinuousCoverageFails,
});
const cameraCut = (evidence: string, whyContinuousCoverageFails: string): TakeBoundary => ({
  kind: "TRUE_CAMERA_STATE_DISCONTINUITY", evidence, whyContinuousCoverageFails,
});

// One data row per existing Moment, including the alternate variants (which
// retain the same state transitions). Empty rows explicitly mean legacy prose
// for that Moment; they do not assert a world fact.
export const TOPIC_STATE_DATA: Record<string, TopicStateData> = {
  after_work_home: {
    entities: { character: { kind: "CHARACTER" }, door: { kind: "THRESHOLD" }, key: { kind: "OBJECT" } },
    anchors: ["APARTMENT_HALLWAY", "APARTMENT_THRESHOLD", "APARTMENT_THRESHOLD", "ENTRYWAY", "HOME_INTERIOR"],
    initial: { "character.place": "HALLWAY", "character.motion": "WALKING", "door.lock": "LOCKED", "door.state": "CLOSED", "key.location": "BAG", "key.containment": "BAG", "key.visibility": "HIDDEN" },
    moments: [
      { effects: { "character.place": "HALLWAY" } },
      { effects: { "character.place": "THRESHOLD", "character.motion": "STOPPED" }, requiresStationaryBody: true },
      { preconditions: { "door.lock": "LOCKED", "key.location": "BAG", "key.containment": "BAG" }, effects: { "key.location": "HAND", "key.containment": "NONE", "key.visibility": "VISIBLE", "door.lock": "UNLOCKED" }, visible: [event("FIND_KEY", "The same key visibly comes out of the bag."), event("UNLOCK_DOOR", "The key visibly unlocks the same door.")], singleUseAction: "UNLOCK_DOOR" },
      { preconditions: { "door.lock": "UNLOCKED", "door.state": "CLOSED", "character.place": "THRESHOLD" }, effects: { "door.state": "OPEN", "character.place": "INSIDE", "character.motion": "WALKING" }, visible: [event("OPEN_DOOR", "The unlocked door visibly opens."), event("CROSS_THRESHOLD", "The character visibly crosses that open threshold into the home.")], singleUseAction: "CROSS_THRESHOLD" },
      { preconditions: { "character.place": "INSIDE", "door.state": "OPEN" }, effects: { "character.motion": "SETTLED" }, requiresStationaryBody: true, takeBoundary: spatialCut("The route passes from the exterior door view to the private home interior.", "One established camera cannot cover both sides of the doorway while keeping the same observation side.") },
    ],
  },
  afternoon_cafe: {
    entities: { character: { kind: "CHARACTER" }, seat: { kind: "OBJECT" }, route: { kind: "PLACE" } },
    anchors: ["CAFE_INTERIOR", "CAFE_COUNTER", "CAFE_COUNTER", "CAFE_INTERIOR", "CAFE_INTERIOR"],
    initial: { "character.place": "CAFE_ENTRY", "character.motion": "WALKING", "seat.state": "OPEN", "seat.visibility": "HIDDEN", "route.state": "STRAIGHT" },
    moments: [
      { effects: { "character.place": "CAFE_INTERIOR" }, visible: [event("ENTER_CAFE", "The character visibly enters the cafe and continues walking.")], singleUseAction: "ENTER_CAFE" },
      { effects: { "seat.visibility": "VISIBLE", "character.place": "COUNTER" }, visible: [event("SEE_OPEN_SEAT", "The open seat becomes visible along the continuing walk.")], takeBoundary: cameraCut("The entry observation gives way to the counter-side sightline where the open chair becomes visible.", "The opening entry camera cannot hold the counter-side seat sightline at the established working distance.") },
      { preconditions: { "seat.visibility": "VISIBLE", "route.state": "STRAIGHT" }, effects: { "route.state": "AISLE" }, visible: [event("ROUTE_CHANGE", "The character visibly redirects the same continuing stride into the clear aisle.")], singleUseAction: "ROUTE_CHANGE" },
      { preconditions: { "route.state": "AISLE" }, effects: { "character.place": "CHAIR_APPROACH", "character.motion": "SLOWING" }, visible: [event("APPROACH_CHAIR", "The character visibly reaches the open chair before sitting.") ] },
      { preconditions: { "character.place": "CHAIR_APPROACH", "seat.state": "OPEN" }, effects: { "character.place": "SEAT", "character.motion": "SEATED", "seat.state": "OCCUPIED" }, visible: [event("TAKE_SEAT", "The character visibly takes the same open chair and remains seated.")], singleUseAction: "TAKE_SEAT" },
    ],
  },
  weekend_walk: {
    entities: { character: { kind: "CHARACTER" }, surface: { kind: "SURFACE" } },
    anchors: ["COMMUNITY_PATH", "COMMUNITY_PATH", "COMMUNITY_PATH", "COMMUNITY_PATH", "COMMUNITY_PATH"],
    initial: { "character.place": "PATH", "character.motion": "WALKING", "surface.state": "AHEAD" },
    moments: [
      { effects: { "character.motion": "WALKING" } }, { effects: { "character.motion": "WALKING" } },
      { preconditions: { "surface.state": "AHEAD" }, effects: { "surface.state": "CLEARED" }, visible: [event("CLEAR_SURFACE", "One real step visibly clears the uneven surface without stopping the walk.")], singleUseAction: "CLEAR_SURFACE" },
      { preconditions: { "surface.state": "CLEARED" }, effects: { "character.motion": "WALKING" } },
      { preconditions: { "character.motion": "WALKING" }, effects: { "character.motion": "WALKING" } },
    ],
  },
  bookstore_browse: {
    entities: { character: { kind: "CHARACTER" }, store: { kind: "PLACE" } },
    anchors: ["SHOP_FRONT", "SHOP_WINDOW", "SHOP_WINDOW", "SHOP_FRONT", "SHOP_INTERIOR"],
    initial: { "character.place": "OUTSIDE", "character.motion": "WALKING", "store.entry": "NOT_ENTERED" },
    moments: [
      {}, { effects: { "character.motion": "SLOWING" } },
      { effects: { "character.motion": "STOPPED", "character.place": "WINDOW" }, visible: [event("WINDOW_STOP", "The character visibly stops outside at the window.")], singleUseAction: "WINDOW_STOP" },
      { preconditions: { "character.place": "WINDOW" }, effects: { "character.motion": "SETTLED" } },
      { preconditions: { "store.entry": "NOT_ENTERED", "character.place": "WINDOW" }, effects: { "store.entry": "ENTERED", "character.place": "INSIDE", "character.motion": "WALKING" }, visible: [event("ENTER_STORE", "The character visibly crosses from the window outside into the bookstore.")], singleUseAction: "ENTER_STORE", takeBoundary: spatialCut("The window observation is outside and the final position is inside the shop.", "The exterior window camera cannot cover the interior route from the same established side.") },
    ],
  },
  returning_with_purchases: {
    entities: { character: { kind: "CHARACTER" }, bag: { kind: "OBJECT" }, door: { kind: "THRESHOLD" } },
    anchors: ["APARTMENT_HALLWAY", "APARTMENT_HALLWAY", "APARTMENT_THRESHOLD", "APARTMENT_THRESHOLD", "ENTRYWAY"],
    initial: { "character.place": "HALLWAY", "character.motion": "WALKING", "bag.location": "FIRST_HAND", "door.lock": "LOCKED", "door.state": "CLOSED" },
    moments: [
      {}, {},
      { preconditions: { "bag.location": "FIRST_HAND" }, effects: { "bag.location": "OTHER_HAND", "character.motion": "STOPPED" }, visible: [event("CHANGE_GRIP", "The same shopping bag visibly moves to the other hand.")], singleUseAction: "CHANGE_GRIP" },
      { preconditions: { "bag.location": "OTHER_HAND", "door.lock": "LOCKED" }, effects: { "door.lock": "UNLOCKED", "door.state": "OPEN" }, visible: [event("UNLOCK_DOOR", "The same door visibly unlocks and opens before entry.")], singleUseAction: "UNLOCK_DOOR" },
      { preconditions: { "door.state": "OPEN", "bag.location": "OTHER_HAND" }, effects: { "character.place": "INSIDE", "character.motion": "WALKING" }, visible: [event("CROSS_THRESHOLD", "The character visibly enters the home with the bag in the other hand.")], singleUseAction: "CROSS_THRESHOLD", takeBoundary: spatialCut("The carried-bag route crosses the apartment doorway into the private interior.", "The hallway observation cannot continuously cover the interior without changing camera side.") },
    ],
  },
  evening_return_home: {
    entities: { character: { kind: "CHARACTER" }, door: { kind: "THRESHOLD" }, key: { kind: "OBJECT" } },
    anchors: ["RESIDENTIAL_EXIT", "APARTMENT_THRESHOLD", "APARTMENT_THRESHOLD", "APARTMENT_THRESHOLD", "ENTRYWAY"],
    initial: { "character.place": "OUTSIDE", "character.motion": "WALKING", "door.lock": "LOCKED", "door.state": "CLOSED", "key.location": "POCKET", "key.containment": "POCKET", "key.visibility": "HIDDEN" },
    moments: [
      {}, { effects: { "character.place": "THRESHOLD", "character.motion": "SLOWING" } },
      { preconditions: { "door.lock": "LOCKED", "key.location": "POCKET", "key.containment": "POCKET" }, effects: { "key.location": "HAND", "key.containment": "NONE", "key.visibility": "VISIBLE", "door.lock": "UNLOCKED" }, visible: [event("FIND_KEY", "The key visibly comes from the pocket."), event("UNLOCK_DOOR", "The key visibly unlocks the same door.")], singleUseAction: "UNLOCK_DOOR" },
      { preconditions: { "door.lock": "UNLOCKED", "door.state": "CLOSED" }, effects: { "door.state": "OPEN", "character.motion": "STOPPED" }, visible: [event("OPEN_DOOR", "The same unlocked door visibly opens.")], singleUseAction: "OPEN_DOOR" },
      { preconditions: { "door.state": "OPEN", "character.place": "THRESHOLD" }, effects: { "character.place": "INSIDE", "character.motion": "SETTLED" }, visible: [event("CROSS_THRESHOLD", "The character visibly crosses into the home and remains inside.")], singleUseAction: "CROSS_THRESHOLD", takeBoundary: spatialCut("The final position is inside the home beyond the exterior threshold.", "The exterior camera cannot see the private interior from its established side.") },
    ],
  },
  errand_outing: {
    entities: { character: { kind: "CHARACTER" }, door: { kind: "THRESHOLD" }, bag: { kind: "OBJECT" }, sleeve: { kind: "OBJECT" } },
    anchors: ["ENTRYWAY", "APARTMENT_THRESHOLD", "RESIDENTIAL_EXIT", "RESIDENTIAL_EXIT", "RESIDENTIAL_EXIT"],
    initial: { "character.place": "INSIDE", "character.motion": "WALKING", "door.state": "CLOSED", "bag.location": "HAND" },
    moments: [
      { effects: { "character.place": "THRESHOLD" } },
      { preconditions: { "door.state": "CLOSED", "character.place": "THRESHOLD" }, effects: { "door.state": "OPEN", "character.place": "OUTSIDE" }, visible: [event("OPEN_AND_EXIT", "The door visibly opens and the character crosses outside once.")], singleUseAction: "OPEN_AND_EXIT" },
      { preconditions: { "character.place": "OUTSIDE" }, effects: { "character.motion": "SLOWING" }, takeBoundary: spatialCut("The character is now outside in the changed temperature.", "The indoor entry observation cannot cover the exterior route from the same position.") },
      { effects: { "sleeve.state": "ADJUSTED", "bag.location": "HAND", "character.motion": "WALKING" }, visible: [event("ADJUST_SLEEVE", "The sleeve adjustment visibly finishes during the walk.")], singleUseAction: "ADJUST_SLEEVE" },
      { preconditions: { "character.place": "OUTSIDE", "sleeve.state": "ADJUSTED" }, effects: { "character.motion": "WALKING" } },
    ],
  },
  waiting_for_friend: {
    entities: { character: { kind: "CHARACTER" }, entry: { kind: "THRESHOLD" }, bag: { kind: "OBJECT" } },
    anchors: ["OFFICE_ENTRANCE", "OFFICE_ENTRANCE", "OFFICE_ENTRANCE", "OFFICE_ENTRANCE", "OFFICE_ENTRANCE"],
    initial: { "character.place": "OUTSIDE", "character.motion": "WALKING", "entry.state": "NOT_ENTERED" },
    moments: [
      {}, { effects: { "character.place": "ENTRANCE", "character.motion": "STOPPED" } },
      { preconditions: { "entry.state": "NOT_ENTERED" }, effects: { "character.motion": "WAITING" }, visible: [event("WAIT_OUTSIDE", "The character visibly remains outside and begins the short wait.")], singleUseAction: "WAIT_OUTSIDE" },
      { preconditions: { "character.motion": "WAITING" }, effects: { "bag.strap": "ADJUSTED" } },
      { preconditions: { "entry.state": "NOT_ENTERED" }, effects: { "character.motion": "WAITING" } },
    ],
  },
  weekend_alone: {
    entities: { character: { kind: "CHARACTER" }, object: { kind: "OBJECT" } },
    anchors: ["WINDOW_SIDE", "TABLE", "TABLE", "WINDOW_SIDE", "WINDOW_SIDE"],
    initial: { "character.place": "HOME_INTERIOR", "character.motion": "WALKING", "object.location": "TABLE", "object.visibility": "VISIBLE" },
    moments: [
      {}, {},
      { preconditions: { "object.location": "TABLE" }, effects: { "object.location": "TABLE_PLACED", "character.motion": "STOPPED" }, visible: [event("PUT_OBJECT_DOWN", "The same small object is visibly put down once on the nearby surface.")], singleUseAction: "PUT_OBJECT_DOWN" },
      { preconditions: { "object.location": "TABLE_PLACED" }, effects: { "character.motion": "SETTLED" } },
      { preconditions: { "object.location": "TABLE_PLACED" }, effects: { "character.motion": "SETTLED" } },
    ],
  },
  after_school_pickup: {
    entities: { character: { kind: "CHARACTER" }, passage: { kind: "PLACE" }, bag: { kind: "OBJECT" } },
    anchors: ["COMMUNITY_PATH", "COMMUNITY_PATH", "COMMUNITY_PATH", "COMMUNITY_PATH", "COMMUNITY_PATH"],
    initial: { "character.place": "COMMUNITY_PATH", "character.motion": "WALKING", "passage.state": "BLOCKED", "bag.location": "HAND" },
    moments: [
      {}, { effects: { "character.motion": "SLOWING" } },
      { preconditions: { "passage.state": "BLOCKED" }, effects: { "passage.state": "CLEAR", "character.motion": "WALKING" }, visible: [event("WAIT_FOR_PASSAGE", "The character visibly waits for the passage to clear before walking again.")], singleUseAction: "WAIT_FOR_PASSAGE", requiresStationaryBody: true },
      { preconditions: { "passage.state": "CLEAR" }, effects: { "character.motion": "WALKING" } },
      { preconditions: { "passage.state": "CLEAR" }, effects: { "character.motion": "WALKING" } },
    ],
  },
  after_lunch: {
    entities: { character: { kind: "CHARACTER" }, route: { kind: "PLACE" }, outer_layer: { kind: "OBJECT" } },
    anchors: ["STREET", "STREET", "STREET", "STREET", "STREET"],
    initial: { "character.place": "STREET", "character.motion": "STOPPED", "route.state": "UNDECIDED" },
    moments: [
      {}, { effects: { "character.motion": "WALKING" } },
      { preconditions: { "route.state": "UNDECIDED" }, effects: { "route.state": "CHOSEN", "character.motion": "SLOWING" }, visible: [event("CHOOSE_ROUTE", "The character visibly turns toward the clearer route.")], singleUseAction: "CHOOSE_ROUTE" },
      { preconditions: { "route.state": "CHOSEN" }, effects: { "outer_layer.state": "ADJUSTED", "character.motion": "WALKING" }, visible: [event("ADJUST_LAYER", "The outer-layer adjustment visibly finishes during the resumed walk.")], singleUseAction: "ADJUST_LAYER" },
      { preconditions: { "route.state": "CHOSEN" }, effects: { "character.motion": "WALKING" } },
    ],
  },
  city_wandering: {
    entities: { character: { kind: "CHARACTER" }, notice: { kind: "SURFACE" } },
    anchors: ["STREET", "SHOP_FRONT", "SHOP_FRONT", "SHOP_FRONT", "SHOP_FRONT"],
    initial: { "character.place": "STREET", "character.motion": "WALKING", "notice.state": "UNSEEN" },
    moments: [
      { effects: { "character.motion": "WALKING" } }, { effects: { "character.motion": "WALKING" } },
      { preconditions: { "notice.state": "UNSEEN" }, effects: { "notice.state": "SEEN", "character.motion": "WALKING" }, visible: [event("NOTICE_REFLECTION", "The reflection is visibly noticed during the same uninterrupted walk.")], singleUseAction: "NOTICE_REFLECTION" },
      { preconditions: { "notice.state": "SEEN" }, effects: { "character.motion": "WALKING" } },
      { preconditions: { "notice.state": "SEEN" }, effects: { "character.motion": "WALKING" } },
    ],
  },
  short_local_trip: {
    entities: { character: { kind: "CHARACTER" }, item: { kind: "OBJECT" }, arrival: { kind: "PLACE" } },
    anchors: ["COMMUNITY_PATH", "COMMUNITY_PATH", "COMMUNITY_PATH", "DESTINATION_APPROACH", "DESTINATION_ANCHOR"],
    initial: { "character.place": "ROUTE", "character.motion": "WALKING", "item.location": "HAND", "item.state": "LOOSE", "arrival.state": "NOT_ARRIVED" },
    moments: [
      {}, {},
      { preconditions: { "item.location": "HAND", "item.state": "LOOSE" }, effects: { "item.state": "SECURE", "character.motion": "STOPPED" }, visible: [event("SECURE_ITEM", "The same item is visibly secured during the real stop.")], singleUseAction: "SECURE_ITEM" },
      { preconditions: { "item.state": "SECURE" }, effects: { "character.motion": "WALKING" } },
      { preconditions: { "arrival.state": "NOT_ARRIVED" }, effects: { "arrival.state": "ARRIVED", "character.place": "DESTINATION", "character.motion": "STOPPED" }, visible: [event("ARRIVE", "The character visibly arrives at the nearby destination and stops there.")], singleUseAction: "ARRIVE" },
    ],
  },
};

export function reduceMomentState(topicId: string, momentIndex: number, before: WorldSnapshot): {
  after: WorldSnapshot; data: MomentStateData | null; errors: string[];
} {
  const data = TOPIC_STATE_DATA[topicId]?.moments[momentIndex] ?? null;
  if (!data) return { after: before, data: null, errors: [] };
  const errors: string[] = [];
  for (const [key, expected] of Object.entries(data.preconditions ?? {})) {
    if (before.facts[key] !== expected) errors.push(`Moment ${momentIndex + 1}: ${key} requires ${expected}, found ${before.facts[key] ?? "UNKNOWN"}`);
  }
  const eventIds = [...new Set([data.singleUseAction, ...(data.visible ?? []).map((item) => item.id)].filter((id): id is string => Boolean(id)))];
  for (const id of eventIds) {
    if (before.completedEvents.includes(id)) errors.push(`Moment ${momentIndex + 1}: single-use event ${id} already completed`);
  }
  const after: WorldSnapshot = {
    facts: { ...before.facts, ...data.effects, "character.anchor": TOPIC_STATE_DATA[topicId].anchors[momentIndex] },
    entities: { ...before.entities },
    completedEvents: [...before.completedEvents, ...eventIds],
  };
  return { after, data, errors };
}
