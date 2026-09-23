import type { SpatialAnchorId } from "./spatial/types";
import type {
  NarrativeCompletionBoundary,
  NarrativeGoalState,
  NarrativeMomentPurpose,
} from "./types";

export const CLOSURE_SCHEMA_VERSION = "immersive-narrative/closure-v1.1" as const;

export type NarrativeMotionState = "walking" | "paused" | "standing" | "still";

const BOUNDARY_RULES: { boundary: NarrativeCompletionBoundary; pattern: RegExp }[] = [
  {
    boundary: "SEARCH_CONTINUES",
    pattern: /\bdoes not (?:immediately )?find\b|\bstill not found\b|\banother second\b|\bchecks? the pocket (?:once more|again)\b|\bfirst touch\b|\bonce more\b/i,
  },
  {
    boundary: "SEARCH_STARTED",
    pattern: /\bbegins? searching\b|\bsearch(?:ing)? inside\b|\bbegins? reaching for the (?:usual pocket|card)\b/i,
  },
  {
    boundary: "ITEM_RETRIEVED",
    pattern: /\bfinds? the (?:key|card|item)\b|\bcloses? the pocket\b/i,
  },
  {
    boundary: "DOOR_HANDLED",
    pattern: /\b(?:opens?|unlocks?|closes?)\b[^.]*\bdoor\b|\breaches? for the door\b|\bturns? the key\b/i,
  },
  {
    boundary: "ENTERED",
    pattern: /\bsteps? into\b|\bsteps? inside\b|\benters?\b/i,
  },
  {
    boundary: "OBJECT_HANDLING",
    pattern: /\bbag handle shifts?\b|\bmoves? the bag\b|\badjusts? the bag\b|\bnew grip\b|\bchecks? the bag\b|\bsettles? it securely\b|\badjusts? her (?:sleeve|outer layer)\b|\bchecks? the small item\b/i,
  },
  {
    boundary: "REACH_STARTED",
    pattern: /\bslows?\b|\bbegins? reaching for the key\b|\breaches? for the key\b/i,
  },
  {
    boundary: "SETTLED",
    pattern: /\bremains? quietly\b|\bis complete\b|\breturns? to stillness\b|\bbehind (?:her|him|them|their|his)\b|\bsettles? back\b|\bsettles? into a normal\b|\bthe .{0,24}is over\b/i,
  },
  {
    boundary: "WALK_CONTINUES",
    pattern: /\bwalks?\b|\bwalking\b|\bapproaches?\b|\bcontinues?\b|\bcrosses?\b|\bmoves? through\b|\bsteps? out\b|\bheads? toward\b|\bresumes?\b|\bfinal few steps\b/i,
  },
];

const UNRESOLVED_ENDING = /\bnearly\b|\babout to\b|\bprepares? to\b|\bcontinues? toward\b|\bkeeps? approaching\b|\bstill heading\b|\byet to\b|\bhas not\b|\bnot yet\b/i;

const RESOLVED_BOUNDARIES: NarrativeCompletionBoundary[] = [
  "ITEM_RETRIEVED",
  "DOOR_HANDLED",
  "ENTERED",
  "SETTLED",
];

const GOAL_PROGRESS_BY_PURPOSE: Record<NarrativeMomentPurpose, number> = {
  establish_state: 0.15,
  approach_trigger: 0.35,
  micro_event: 0.55,
  response: 0.8,
  after_state: 1,
};

export function detectCompletionBoundary(text: string): NarrativeCompletionBoundary {
  return BOUNDARY_RULES.find((rule) => rule.pattern.test(text))?.boundary ?? "STATE_HELD";
}

export function detectMotionState(text: string): NarrativeMotionState {
  if (/\bstops?\b|\bpauses?\b|\bwaits?\b|\bremains?\b|\bfor one second\b|\bcomes? to a\b/i.test(text)) return "paused";
  if (/\bwalks?\b|\bwalking\b|\bcontinues?\b|\bapproaches?\b|\bsteps? out\b|\bmoves? through\b|\bcrosses?\b|\btoward\b/i.test(text)) return "walking";
  if (/\bstands?\b|\bsettles? her stance\b|\breaches? for the door\b|\bsearch(?:ing)? inside\b/i.test(text)) return "standing";
  return "still";
}

export function interactionStateOf(boundary: NarrativeCompletionBoundary) {
  switch (boundary) {
    case "SEARCH_STARTED":
      return "search_started";
    case "SEARCH_CONTINUES":
      return "search_continues";
    case "REACH_STARTED":
      return "reach_started";
    case "OBJECT_HANDLING":
      return "object_handling";
    case "ITEM_RETRIEVED":
      return "item_in_hand";
    case "DOOR_HANDLED":
      return "door_handled";
    case "ENTERED":
      return "entered";
    case "SETTLED":
      return "settled";
    default:
      return "none";
  }
}

export function goalProgressFor(purpose: NarrativeMomentPurpose) {
  return GOAL_PROGRESS_BY_PURPOSE[purpose] ?? 0.5;
}

export function isResolvedBoundary(boundary: NarrativeCompletionBoundary) {
  return RESOLVED_BOUNDARIES.includes(boundary);
}

export function hasUnresolvedEnding(text: string) {
  return UNRESOLVED_ENDING.test(text);
}

export type ClosureMomentView = {
  index: number;
  purpose: NarrativeMomentPurpose;
  whatHappens: string;
  completionBoundary: NarrativeCompletionBoundary;
  motionState: NarrativeMotionState;
  interactionState: string;
  spatialAnchor: SpatialAnchorId;
  goalProgress: number;
};

export type ClosureGateResult = { pass: boolean; reason: string };

export type ClosureEvaluation = {
  goalState: NarrativeGoalState;
  stateProgression: ClosureGateResult;
  microEventConsequence: ClosureGateResult;
  noSemanticLoop: ClosureGateResult;
  goalCompletion: ClosureGateResult;
  resolvedEnding: ClosureGateResult;
  signatures: string[];
};

export function stateSignature(moment: ClosureMomentView) {
  return [moment.motionState, moment.interactionState, moment.spatialAnchor].join("|");
}

export function evaluateNarrativeClosure(moments: ClosureMomentView[], localGoal: string): ClosureEvaluation {
  const signatures = moments.map(stateSignature);
  const last = moments[moments.length - 1];

  // 1. Every step must change motion, interaction, spatial position, or goal progress.
  const stalled: string[] = [];
  for (let index = 1; index < moments.length; index += 1) {
    const previous = moments[index - 1];
    const current = moments[index];
    const changed = current.motionState !== previous.motionState
      || current.interactionState !== previous.interactionState
      || current.spatialAnchor !== previous.spatialAnchor
      || current.goalProgress > previous.goalProgress;
    if (!changed) stalled.push(`M${previous.index + 1}→M${current.index + 1}`);
  }
  const stateProgression: ClosureGateResult = stalled.length === 0
    ? { pass: true, reason: "Every Moment changes motion, interaction, spatial position, or goal progress." }
    : { pass: false, reason: `No meaningful progression between ${stalled.join(", ")}.` };

  // 2. The micro event must leave a consequence in a later Moment.
  const micro = moments.find((moment) => moment.purpose === "micro_event");
  const microIndex = micro ? moments.findIndex((moment) => moment.index === micro.index) : -1;
  const laterMoments = microIndex >= 0 ? moments.slice(microIndex + 1) : [];
  const consequence = micro ? laterMoments.some((moment) => (
    moment.interactionState !== micro.interactionState
    || moment.spatialAnchor !== micro.spatialAnchor
    || moment.goalProgress > micro.goalProgress
  )) : false;
  const microEventConsequence: ClosureGateResult = consequence
    ? { pass: true, reason: "The micro event changes the following interaction, position, or goal progress." }
    : { pass: false, reason: "The micro event leaves no consequence in the following Moments." };

  // 3. No later Moment may repeat an earlier state without extra progress.
  const loops: string[] = [];
  for (let first = 0; first < moments.length; first += 1) {
    for (let second = first + 1; second < moments.length; second += 1) {
      if (signatures[first] === signatures[second] && moments[second].goalProgress <= moments[first].goalProgress) {
        loops.push(`M${moments[first].index + 1}=M${moments[second].index + 1}`);
      }
    }
  }
  const initialEqualsFinal = signatures.length > 1 && signatures[0] === signatures[signatures.length - 1];
  const noSemanticLoop: ClosureGateResult = loops.length === 0 && !initialEqualsFinal
    ? { pass: true, reason: "No later Moment returns to an earlier state without new goal progress." }
    : { pass: false, reason: `Semantic loop detected: ${[...loops, initialEqualsFinal ? "initial=final" : ""].filter(Boolean).join(", ")}.` };

  // 4. The final Moment must complete the local goal.
  const goalCompleted = Boolean(last)
    && last.goalProgress >= 1
    && isResolvedBoundary(last.completionBoundary)
    && !hasUnresolvedEnding(last.whatHappens);
  const goalCompletion: ClosureGateResult = goalCompleted
    ? { pass: true, reason: `Local goal completed: ${localGoal}` }
    : {
      pass: false,
      reason: `The final Moment does not complete the local goal "${localGoal}" (boundary ${last?.completionBoundary ?? "none"}, progress ${last?.goalProgress ?? 0}).`,
    };

  // 5. The ending must be resolved: no "nearly / about to / continues toward".
  const resolvedEnding: ClosureGateResult = last && !hasUnresolvedEnding(last.whatHappens) && isResolvedBoundary(last.completionBoundary)
    ? { pass: true, reason: "The final Moment states a resolved after-state." }
    : { pass: false, reason: `The final Moment still reads as an unfinished ending: "${last?.whatHappens ?? ""}"` };

  const goalState: NarrativeGoalState = goalCompleted && resolvedEnding.pass
    ? "COMPLETED"
    : last && last.goalProgress >= 0.8
      ? "IN_PROGRESS"
      : "BLOCKED";

  return {
    goalState,
    stateProgression,
    microEventConsequence,
    noSemanticLoop,
    goalCompletion,
    resolvedEnding,
    signatures,
  };
}
