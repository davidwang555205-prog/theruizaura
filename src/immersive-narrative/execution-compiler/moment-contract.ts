import type {
  ActionExecutionEvidence,
  BoundaryConflict,
  ExecutionCompilerInput,
  ExecutionMomentContract,
  NarrativeCompletionClass,
  ExecutionEndState,
} from "./types";
import type { NarrativeCompletionBoundary } from "../types";

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
  let previousAnchor = "scene position";
  let previousState: ExecutionEndState = "STATE_HOLD";
  let previousObjectState = topicContainer && topicItem ? `${topicItem} in ${topicContainer}` : "unchanged";

  const contracts = input.plan.moments.map((moment) => {
    const rule = boundaryRuleFor(moment.completionBoundary);
    const ruleObjectStateAfter = rule.objectAfter(moment.whatHappens);
    const objectStateAfter = returnsObjectToContainer(moment.whatHappens)
      ? "returned to the same pocket or bag; not held"
      : ruleObjectStateAfter === "unchanged" || (rule.state === "ENTRY_COMPLETE" && topicItem)
        ? previousObjectState
        : ruleObjectStateAfter;
    const cameraMoment = input.cameraExecution.moments.find((entry) => entry.momentIndex === moment.index);
    const anchor = detectSpatialAnchor(moment.whatHappens, previousAnchor);
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
    };
    previousAnchor = anchor;
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
