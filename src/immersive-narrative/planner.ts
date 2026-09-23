import {
  NARRATIVE_ARCHETYPES,
  type NarrativeMomentDraft,
  type NarrativePronoun,
  type NarrativeSceneRef,
  type NarrativeSceneRole,
  type NarrativeTemplateContext,
} from "./catalog";
import { runNarrativeQc } from "./qc";
import {
  detectCompletionBoundary,
  detectMotionState,
  evaluateNarrativeClosure,
  goalProgressFor,
  interactionStateOf,
  type ClosureMomentView,
} from "./closure";
import { detectSpatialAnchor, validateSpatialSequence } from "./spatial/validator";
import {
  NARRATIVE_TOPIC_CATALOG,
  TOPIC_LOCAL_GOALS,
  buildSpatialEnvelope,
  resolveNarrativeTopic,
} from "./topic-catalog";
import { resolveCharacterSelection } from "./character-profile";
import {
  NARRATIVE_PLANNER_SCHEMA_VERSION,
  NARRATIVE_PLANNER_VERSION,
  NarrativePlannerError,
  type NarrativeDuration,
  type NarrativeCompletionBoundary,
  type NarrativeMoment,
  type NarrativeMomentPurpose,
  type NarrativePlan,
  type NarrativePlannerInput,
  type NarrativeQc,
  type NarrativeSceneLibraryItem,
} from "./types";

const MOMENT_PURPOSE_LABELS: Record<NarrativeMomentPurpose, string> = {
  establish_state: "Establish State",
  approach_trigger: "Approach Trigger",
  micro_event: "Micro Event",
  response: "Response",
  after_state: "After-state",
};

const SCENE_ROLE_PATTERNS: Record<NarrativeSceneRole, RegExp[]> = {
  approach: [
    /(电梯|楼梯|公寓外|外观|elevator|stair|lobby|approach|exterior front|storefront exterior)/i,
    /(楼道|门前区域)/i,
  ],
  transition: [
    /(走廊|通道|门廊|过道|corridor|hallway|passage|transition)/i,
    /(楼道)/i,
  ],
  threshold: [
    /(门口|门前|入口|闸机|门厅|gate|door|doorway|threshold|entrance|entry)/i,
    /(玄关)/i,
  ],
  interior: [
    /(室内|屋内|店内|客厅|厨房|公寓内|玄关|interior|inside|home interior|apartment interior|entryway interior)/i,
  ],
  exterior: [
    /(室外|户外|街边|街道|人行道|楼外|广场|路边|outside|street|sidewalk|plaza|outdoor|exterior)/i,
  ],
  waiting: [
    /(等待|等人|等车|候车|站台|长椅|waiting|wait|bench|platform|stop)/i,
  ],
  counter: [
    /(柜台|吧台|收银台|counter|bar|checkout)/i,
  ],
};

const SCENE_ROLE_FALLBACK_INDEX: Record<NarrativeSceneRole, number> = {
  approach: 0,
  transition: 1,
  threshold: 1,
  interior: -1,
  exterior: 0,
  waiting: 0,
  counter: 1,
};

function normalizeSceneLibrary(items: NarrativeSceneLibraryItem[]) {
  const seen = new Set<string>();
  const normalized = items
    .map((item, index) => ({
      id: item.id.trim() || `scene-${index + 1}`,
      label: item.label.trim(),
      kind: item.kind,
    }))
    .filter((item) => item.label.length > 0)
    .filter((item) => {
      const key = item.label.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  if (normalized.length === 0) {
    throw new NarrativePlannerError(
      "EMPTY_SCENE_LIBRARY",
      "Narrative Planner requires at least one available scene.",
      ["Provide one to four physically continuous scenes from the current scene library."]
    );
  }

  return normalized;
}

function selectScene(
  scenes: NarrativeSceneLibraryItem[],
  role: NarrativeSceneRole
): NarrativeSceneRef {
  const patterns = SCENE_ROLE_PATTERNS[role];
  const kindMatch = scenes.find((item) => item.kind === role);
  const matched = kindMatch ?? patterns
    .map((pattern) => scenes.find((item) => pattern.test(item.label)))
    .find(Boolean);
  const fallbackIndex = SCENE_ROLE_FALLBACK_INDEX[role] < 0
    ? scenes.length - 1
    : Math.min(SCENE_ROLE_FALLBACK_INDEX[role], scenes.length - 1);
  const fallback = scenes[Math.max(0, fallbackIndex)] ?? scenes[0];
  const selected = matched ?? fallback;
  return { id: selected.id, label: selected.label };
}

function resolvePronoun(characterProfile: string): NarrativePronoun {
  const normalized = characterProfile.toLowerCase();
  const female = /(?:女性|女人|女生|妈妈|母亲|她|woman|female|\bshe\b|\bher\b)/i.test(normalized);
  const male = /(?:男性|男人|男生|爸爸|父亲|他|man|male|\bhe\b|\bhis\b)/i.test(normalized);

  if (female && !male) {
    return { subject: "She", subjectLower: "she", possessive: "Her", possessiveLower: "her", isPlural: false };
  }
  if (male && !female) {
    return { subject: "He", subjectLower: "he", possessive: "His", possessiveLower: "his", isPlural: false };
  }
  return { subject: "They", subjectLower: "they", possessive: "Their", possessiveLower: "their", isPlural: true };
}

function buildToneClause(lifestyleFeeling: string, pronoun: NarrativePronoun) {
  const normalized = lifestyleFeeling.toLowerCase();
  if (/(安静|克制|平静|quiet|calm|restrained|contained|understated)/i.test(normalized)) {
    return `${pronoun.possessive} movement stays quiet and contained, with no unnecessary gestures.`;
  }
  if (/(轻快|轻松|明亮|bright|light|easy|relaxed)/i.test(normalized)) {
    return `${pronoun.possessive} movement is alert but unhurried, without exaggerated lightness.`;
  }
  if (/(疲惫|累|tired|weary|depleted)/i.test(normalized)) {
    return `${pronoun.possessive} pace is slightly slower than usual, while the movement remains steady and self-directed.`;
  }
  return "The outward movement remains ordinary, controlled, and self-directed.";
}

function buildSeasonClause(season: NarrativeInputSeason) {
  const clauses: Record<NarrativeInputSeason, string> = {
    春: "Spring appears only through a mild change in air or surface light.",
    夏: "Summer is present only through warmth and the weight of light clothing.",
    秋: "Autumn appears only as a slight coolness in the air or one restrained layer.",
    冬: "Winter appears only through a cold edge in the air or an already-worn outer layer.",
  };
  return clauses[season];
}

type NarrativeInputSeason = NarrativePlannerInput["season"];

function buildTemplateContext(
  input: NarrativePlannerInput,
  scenes: NarrativeSceneLibraryItem[],
  resolvedCharacterContext: string
): NarrativeTemplateContext {
  const pronoun = resolvePronoun(input.characterProfile ?? "女性");
  return {
    topic: input.topic.trim(),
    characterProfile: resolvedCharacterContext,
    season: input.season,
    lifestyleFeeling: input.lifestyleFeeling.trim(),
    duration: input.duration,
    pronoun,
    scenes: {
      approach: selectScene(scenes, "approach"),
      transition: selectScene(scenes, "transition"),
      threshold: selectScene(scenes, "threshold"),
      interior: selectScene(scenes, "interior"),
      exterior: selectScene(scenes, "exterior"),
      waiting: selectScene(scenes, "waiting"),
      counter: selectScene(scenes, "counter"),
    },
    toneClause: buildToneClause(input.lifestyleFeeling, pronoun),
    seasonClause: buildSeasonClause(input.season),
  };
}

function toMoment(
  draft: NarrativeMomentDraft,
  index: number,
  scenes: NarrativeTemplateContext["scenes"],
  previous: { boundary: NarrativeCompletionBoundary; anchor: NarrativeMoment["spatialAnchor"] }
): NarrativeMoment {
  const scene = scenes[draft.sceneRole];
  const whatHappens = draft.whatHappens.trim();
  const boundary = detectCompletionBoundary(whatHappens);
  const spatialAnchor = detectSpatialAnchor(whatHappens, previous.anchor);
  return {
    id: `moment-${String(index + 1).padStart(2, "0")}`,
    index,
    purpose: draft.purpose,
    purposeLabel: MOMENT_PURPOSE_LABELS[draft.purpose],
    sceneId: scene.id,
    sceneLabel: scene.label,
    whatHappens,
    causalLink: draft.causalLink,
    startState: index === 0 ? "INITIAL_STATE" : previous.boundary,
    endState: boundary,
    goalProgress: goalProgressFor(draft.purpose),
    completionBoundary: boundary,
    spatialAnchor,
  };
}

function renderQcLine(qc: NarrativeQc, id: keyof NarrativeQc) {
  return `${qc[id].label}: ${qc[id].status}`;
}

export function renderNarrativePlanText(plan: Omit<NarrativePlan, "compiledText">) {
  return [
    "[NARRATIVE CORE]",
    "",
    "Story Intent:",
    plan.storyIntent,
    "",
    "Local Goal:",
    plan.localGoal,
    `Goal State: ${plan.goalState}`,
    "",
    "Initial Character State:",
    plan.initialCharacterState,
    "",
    "Micro Event:",
    plan.microEvent,
    "",
    "Emotional Arc:",
    ...plan.emotionalArc,
    "",
    "[MOMENT CHAIN]",
    "",
    ...plan.moments.flatMap((moment) => [
      `Moment ${String(moment.index + 1).padStart(2, "0")}`,
      `Purpose: ${moment.purposeLabel}`,
      `Anchor: ${moment.spatialAnchor} · Goal progress: ${moment.goalProgress}`,
      `Boundary: ${moment.completionBoundary}`,
      `What Happens: ${moment.whatHappens}`,
      "",
    ]),
    "[NARRATIVE QC]",
    "",
    renderQcLine(plan.qc, "one_story"),
    renderQcLine(plan.qc, "one_event"),
    renderQcLine(plan.qc, "causality"),
    renderQcLine(plan.qc, "physical_reality"),
    renderQcLine(plan.qc, "no_performance"),
    renderQcLine(plan.qc, "state_visibility"),
    renderQcLine(plan.qc, "location_logic"),
    renderQcLine(plan.qc, "natural_ending"),
    renderQcLine(plan.qc, "spatial_continuity"),
    renderQcLine(plan.qc, "state_progression"),
    renderQcLine(plan.qc, "micro_event_consequence"),
    renderQcLine(plan.qc, "no_semantic_loop"),
    renderQcLine(plan.qc, "goal_completion"),
    renderQcLine(plan.qc, "resolved_ending"),
    "",
    "Spatial Envelope:",
    `Macro location: ${plan.spatialEnvelope.macroLocation} · Mode: ${plan.spatialEnvelope.continuityMode}`,
    `Allowed anchors: ${plan.spatialEnvelope.allowedAnchors.join(" → ")}`,
    "",
    "Narrative Status:",
    plan.status === "APPROVED_FOR_SCENE_RESOLUTION"
      ? "APPROVED FOR SCENE RESOLUTION"
      : "BLOCKED",
  ].join("\n");
}

export function planImmersiveNarrative(input: NarrativePlannerInput): NarrativePlan {
  if (input.duration !== 15) {
    throw new NarrativePlannerError(
      "INVALID_DURATION",
      "Narrative Planner V1 supports a 15-second continuous narrative only.",
      [`Received duration: ${input.duration}`]
    );
  }
  if (!input.topic.trim()) {
    throw new NarrativePlannerError("MISSING_TOPIC", "A Topic is required.");
  }
  if (!input.characterSelection && !input.characterProfile?.trim()) {
    throw new NarrativePlannerError("MISSING_CHARACTER_PROFILE", "A Character Profile selection is required.");
  }
  const characterProfile = resolveCharacterSelection({
    characterSelection: input.characterSelection,
    characterProfile: input.characterProfile,
  });
  if (characterProfile.status !== "CHARACTER_PROFILE_APPROVED") {
    const unsupported = characterProfile.failureReasons?.some((reason) => reason.startsWith("UNSUPPORTED_CHARACTER_PROFILE"));
    throw new NarrativePlannerError(
      unsupported ? "UNSUPPORTED_CHARACTER_PROFILE" : "CHARACTER_PROFILE_FAILED",
      unsupported
        ? "Only the official Character Profile Catalog or the legacy 32岁左右成熟女性 profile is supported."
        : "The Character Profile selection failed catalog guardrails.",
      characterProfile.failureReasons ?? []
    );
  }
  if (!input.lifestyleFeeling.trim()) {
    throw new NarrativePlannerError("MISSING_LIFESTYLE_FEELING", "A Lifestyle Feeling is required.");
  }

  const scenes = normalizeSceneLibrary(input.availableSceneLibrary);
  const resolvedTopic = resolveNarrativeTopic(input.topic);
  const archetype = resolvedTopic
    ? NARRATIVE_ARCHETYPES.find((candidate) => candidate.topicId === resolvedTopic.id)
    : undefined;
  if (!archetype) {
    throw new NarrativePlannerError(
      "UNSUPPORTED_TOPIC",
      `No Narrative Planner V1 archetype matches "${input.topic.trim()}".`,
      [`Use one of the 13 official topics: ${NARRATIVE_TOPIC_CATALOG.map((topic) => topic.label).join(", ")}.`]
    );
  }

  const context = buildTemplateContext(
    { ...input, availableSceneLibrary: scenes },
    scenes,
    characterProfile.resolvedCharacterContext
  );
  const drafts = archetype.moments(context);
  if (drafts.length !== 5) {
    throw new NarrativePlannerError(
      "INVALID_ARCHETYPE_OUTPUT",
      `Archetype "${archetype.id}" must produce exactly five moments for the V1 15-second plan.`,
      [`Received ${drafts.length} moments.`]
    );
  }

  let previousBoundary: NarrativeCompletionBoundary = "STATE_HELD";
  let previousAnchor: NarrativeMoment["spatialAnchor"] = "UNKNOWN";
  const moments = drafts.map((draft, index) => {
    const moment = toMoment(draft, index, context.scenes, { boundary: previousBoundary, anchor: previousAnchor });
    previousBoundary = moment.completionBoundary;
    previousAnchor = moment.spatialAnchor;
    return moment;
  });
  const localGoal = TOPIC_LOCAL_GOALS[resolvedTopic!.id];
  const spatialEnvelope = buildSpatialEnvelope(resolvedTopic!.id);
  const closureView: ClosureMomentView[] = moments.map((moment) => ({
    index: moment.index,
    purpose: moment.purpose,
    whatHappens: moment.whatHappens,
    completionBoundary: moment.completionBoundary,
    motionState: detectMotionState(moment.whatHappens),
    interactionState: interactionStateOf(moment.completionBoundary),
    spatialAnchor: moment.spatialAnchor,
    goalProgress: moment.goalProgress,
  }));
  const closureEvaluation = evaluateNarrativeClosure(closureView, localGoal);
  const spatialValidation = validateSpatialSequence(
    moments.map((moment) => moment.index),
    moments.map((moment) => moment.spatialAnchor),
    spatialEnvelope
  );
  const qcResult = runNarrativeQc({
    durationSeconds: 15,
    storyIntent: archetype.storyIntent,
    initialCharacterState: archetype.initialCharacterState(context),
    microEvent: archetype.microEvent(context),
    emotionalArc: archetype.emotionalArc,
    moments,
    availableSceneLibrary: scenes,
    localGoal,
    closure: closureEvaluation,
    spatial: spatialValidation,
  });
  const planWithoutText: Omit<NarrativePlan, "compiledText"> = {
    schemaVersion: NARRATIVE_PLANNER_SCHEMA_VERSION,
    plannerVersion: NARRATIVE_PLANNER_VERSION,
    topicId: resolvedTopic!.id,
    archetypeId: archetype.id,
    characterSelection: characterProfile.selection,
    resolvedCharacterContext: characterProfile.resolvedCharacterContext,
    status: qcResult.passed ? "APPROVED_FOR_SCENE_RESOLUTION" : "BLOCKED",
    durationSeconds: 15,
    momentCount: moments.length,
    storyIntent: archetype.storyIntent,
    localGoal,
    goalState: closureEvaluation.goalState,
    spatialEnvelope,
    initialCharacterState: archetype.initialCharacterState(context),
    microEvent: archetype.microEvent(context),
    emotionalArc: [...archetype.emotionalArc],
    moments,
    qc: qcResult.qc,
  };

  return {
    ...planWithoutText,
    compiledText: renderNarrativePlanText(planWithoutText),
  };
}

export function parseSceneLibraryText(value: string, startIndex = 0): NarrativeSceneLibraryItem[] {
  return value
    .split(/\r?\n|,/)
    .map((label) => label.trim())
    .filter(Boolean)
    .filter((label, index, all) => all.findIndex((candidate) => candidate.toLowerCase() === label.toLowerCase()) === index)
    .map((label, index) => ({
      id: `scene-${startIndex + index + 1}`,
      label,
    }));
}

export function getSupportedNarrativeTopics() {
  return NARRATIVE_TOPIC_CATALOG.map((topic) => topic.label);
}

export function isNarrativeDuration(value: number): value is NarrativeDuration {
  return value === 15;
}
