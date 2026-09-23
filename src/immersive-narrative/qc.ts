import type {
  NarrativeDuration,
  NarrativeMoment,
  NarrativeQc,
  NarrativeQcGate,
  NarrativeQcGateId,
  NarrativeSceneLibraryItem,
} from "./types";
import type { ClosureEvaluation } from "./closure";
import type { SpatialSequenceValidation } from "./spatial/types";

type NarrativeQcInput = {
  durationSeconds: NarrativeDuration;
  storyIntent: string;
  initialCharacterState: string;
  microEvent: string;
  emotionalArc: string[];
  moments: NarrativeMoment[];
  availableSceneLibrary: NarrativeSceneLibraryItem[];
  localGoal: string;
  closure: ClosureEvaluation;
  spatial: SpatialSequenceValidation;
};

const GATE_LABELS: Record<NarrativeQcGateId, string> = {
  one_story: "One Story",
  one_event: "One Event",
  causality: "Causality",
  physical_reality: "Physical Reality",
  no_performance: "No Performance",
  state_visibility: "State Visibility",
  location_logic: "Location Logic",
  natural_ending: "Natural Ending",
  spatial_continuity: "Spatial Continuity",
  state_progression: "State Progression",
  micro_event_consequence: "Micro Event Consequence",
  no_semantic_loop: "No Semantic Loop",
  goal_completion: "Goal Completion",
  resolved_ending: "Resolved Ending",
};

const FORBIDDEN_MICRO_EVENTS = /\b(?:old love|important call|sudden cry|major failure|proposal|argument|missed flight|storms?|thunderstorm|blizzard|found child|dramatic twist|suddenly runs?|strong surprise)\b/i;
const FORBIDDEN_PERFORMANCE = /\b(?:look(?:s|ing)? at (?:the )?camera|smile(?:s|d)? (?:at|toward) (?:the )?camera|fashion pose|model pose|runway walk|shows? (?:the |her |his |their )?(?:shoe|sneakers?|footwear)|leg extension|pose for (?:the )?camera|turn(?:s|ing)? for the camera)\b/i;
const FORBIDDEN_INTERNAL_PSYCHOLOGY = /\b(?:feels? deeply|thinking about (?:the|her|his|their) future|feels? empowered|feels? confident|feels? lonely|feels? anxious|dreams? about)\b/i;
const OBSERVABLE_STATE = /\b(?:pace|attention|posture|hand|shoulder|gaze|walking|searching|stopping|adjusting|movement|stance|weight)\b/i;
const IMPOSSIBLE_ACTION = /\b(?:teleport|fly|flying|instant(?:ly)?|freeze time|all day|for hours|overnight)\b/i;
const NEW_ENDING_EVENT = /\b(?:suddenly|new arrival|second event|then another|again|unexpected visitor)\b/i;
const FAR_LOCATION = /(?:home|apartment|bookstore|shop|cafe|restaurant|grassland|airport|hotel|museum|market)/i;

function gate(id: NarrativeQcGateId, passed: boolean, reason: string): NarrativeQcGate {
  return {
    id,
    label: GATE_LABELS[id],
    status: passed ? "PASS" : "FAIL",
    reason,
  };
}

function sentenceCount(value: string) {
  return value
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean).length;
}

function locationWorld(label: string) {
  const normalized = label.toLowerCase();
  if (/(bookstore|bookshop|magazine|书店|杂志)/i.test(normalized)) {
    return "bookstore";
  }
  if (/(cafe|coffee|咖啡)/i.test(normalized)) {
    return "cafe";
  }
  if (/(market|grocery|supermarket|超市|便利店|采购|买菜)/i.test(normalized)) {
    return "market";
  }
  if (/(street|sidewalk|outdoor|station|platform|waiting|bench|stop|entrance|entry|街区|街角|站台|人行道|等人|长椅|入口)/i.test(normalized)) {
    return "street";
  }
  if (/(home|apartment|elevator|corridor|hallway|door|entryway|threshold|interior|kitchen|电梯|公寓|走廊|楼道|门口|玄关|室内|厨房|客厅)/i.test(normalized)) {
    return "home_transition";
  }
  return `scene:${normalized}`;
}

function hasFarLocationJump(moments: NarrativeMoment[]) {
  const words = [...new Set(moments.flatMap((moment) => {
    const matches = moment.sceneLabel.match(new RegExp(FAR_LOCATION.source, "gi"));
    return matches?.map((match) => match.toLowerCase()) ?? [];
  }))];
  return words.length > 2;
}

function orderedLocationWorlds(moments: NarrativeMoment[]) {
  const worlds = moments.map((moment) => locationWorld(moment.sceneLabel));
  return worlds.filter((world, index) => world !== worlds[index - 1]);
}

export function runNarrativeQc(input: NarrativeQcInput): { qc: NarrativeQc; passed: boolean } {
  const allText = [
    input.storyIntent,
    input.initialCharacterState,
    input.microEvent,
    ...input.moments.map((moment) => moment.whatHappens),
  ].join(" ");
  const allowedSceneIds = new Set(input.availableSceneLibrary.map((item) => item.id));
  const worlds = orderedLocationWorlds(input.moments);
  const uniqueWorlds = new Set(worlds);
  const finalMoment = input.moments[input.moments.length - 1];
  const locationReason = `Observed location worlds: ${worlds.join(" -> ") || "none"}; allowed scene ids: ${input.moments.every((moment) => allowedSceneIds.has(moment.sceneId)) ? "valid" : "invalid"}.`;

  const qc: NarrativeQc = {
    one_story: gate(
      "one_story",
      Boolean(input.storyIntent.trim()) && sentenceCount(input.storyIntent) === 1,
      Boolean(input.storyIntent.trim())
        ? "The plan contains one clear story sentence."
        : "Story Intent is empty."
    ),
    one_event: gate(
      "one_event",
      Boolean(input.microEvent.trim()) && !FORBIDDEN_MICRO_EVENTS.test(input.microEvent) && !FORBIDDEN_MICRO_EVENTS.test(allText),
      FORBIDDEN_MICRO_EVENTS.test(allText)
        ? "A forbidden dramatic event marker is present."
        : "Exactly one ordinary Micro Event is represented."
    ),
    causality: gate(
      "causality",
      input.moments.length >= 4
        && input.moments.length <= 5
        && input.moments.slice(1).every((moment) => Boolean(moment.causalLink?.trim())),
      "Every moment after the first carries an explicit dependency on the preceding moment."
    ),
    physical_reality: gate(
      "physical_reality",
      input.durationSeconds === 15 && input.moments.length === 5 && !IMPOSSIBLE_ACTION.test(allText),
      "The plan fits one continuous 15-second human action chain without impossible timing or movement."
    ),
    no_performance: gate(
      "no_performance",
      !FORBIDDEN_PERFORMANCE.test(allText),
      "No camera performance, pose, runway behavior, or product-display gesture is present."
    ),
    state_visibility: gate(
      "state_visibility",
      OBSERVABLE_STATE.test(input.initialCharacterState) && !FORBIDDEN_INTERNAL_PSYCHOLOGY.test(allText),
      "Character state is expressed through observable pace, attention, posture, hand, stance, or weight behavior."
    ),
    location_logic: gate(
      "location_logic",
      input.moments.every((moment) => allowedSceneIds.has(moment.sceneId))
        && input.availableSceneLibrary.length > 0
        && uniqueWorlds.size <= 2
        && worlds.length <= 2
        && !hasFarLocationJump(input.moments),
      locationReason
    ),
    natural_ending: gate(
      "natural_ending",
      finalMoment?.purpose === "after_state"
        && /(?:continues|steps into|steps inside|returns to stillness|remains quietly|settles|reaches|stops|arrives|enters)/i.test(finalMoment.whatHappens)
        && !NEW_ENDING_EVENT.test(finalMoment.whatHappens)
        && input.closure.goalCompletion.pass,
      input.closure.goalCompletion.pass
        ? "The final moment resolves the established behavior and completes the local goal."
        : "The final moment does not complete the local goal, so it cannot resolve the story."
    ),
    spatial_continuity: gate(
      "spatial_continuity",
      input.spatial.pass,
      input.spatial.pass
        ? `All Moment anchors stay inside ${input.spatial.anchors.length > 0 ? "one continuous route" : "the envelope"}: ${input.spatial.transitions.map((transition) => transition.transitionClass).join(" → ") || "single anchor"}.`
        : input.spatial.failures.join(" ")
    ),
    state_progression: gate(
      "state_progression",
      input.closure.stateProgression.pass,
      input.closure.stateProgression.reason
    ),
    micro_event_consequence: gate(
      "micro_event_consequence",
      input.closure.microEventConsequence.pass,
      input.closure.microEventConsequence.reason
    ),
    no_semantic_loop: gate(
      "no_semantic_loop",
      input.closure.noSemanticLoop.pass,
      input.closure.noSemanticLoop.reason
    ),
    goal_completion: gate(
      "goal_completion",
      input.closure.goalCompletion.pass,
      input.closure.goalCompletion.reason
    ),
    resolved_ending: gate(
      "resolved_ending",
      input.closure.resolvedEnding.pass,
      input.closure.resolvedEnding.reason
    ),
  };

  return {
    qc,
    passed: Object.values(qc).every((entry) => entry.status === "PASS"),
  };
}
