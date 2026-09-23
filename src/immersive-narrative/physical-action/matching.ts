import type {
  PhysicalActionCapability,
  PhysicalActionCapabilityGap,
  PhysicalActionCompatibilityGrade,
  PhysicalActionContinuityIssue,
  PhysicalActionMatchCandidate,
  PhysicalActionMomentMatch,
  PhysicalActionMovementState,
  PhysicalActionRequirement,
  PhysicalActionTopicCoverage,
  PhysicalActionHandTask,
  NarrativePrimitiveCapability,
  NarrativePrimitiveCapabilityVerdict,
  NarrativePrimitiveEligibility,
} from "./types";
import { isObjectContactTask } from "./moment-requirements";
import type { PersonActionFootwork } from "../../data/personActionLibrary";
import { NARRATIVE_PRIMITIVE_REGISTRY } from "./narrative-primitives";

const PRIMITIVE_CAPABILITY_BY_HAND_TASK: Partial<Record<PhysicalActionHandTask, NarrativePrimitiveCapability>> = {
  object_search: "CONTAINER_OBJECT_SEARCH",
  object_retrieval: "SMALL_OBJECT_RETRIEVAL",
  object_placement: "SMALL_OBJECT_PLACEMENT",
  carried_object_hold: "CARRIED_OBJECT_HOLD",
  carried_object_adjust: "CARRIED_OBJECT_ADJUST",
  carried_object_check: "CARRIED_OBJECT_CHECK",
  door_contact: "DOOR_CONTACT",
  garment_adjustment: "GARMENT_ADJUSTMENT",
};

function requiredPrimitiveCapabilities(requirement: PhysicalActionRequirement) {
  return requirement.requiredHandCapabilities
    .map((entry) => PRIMITIVE_CAPABILITY_BY_HAND_TASK[entry.capability])
    .filter((capability): capability is NarrativePrimitiveCapability => Boolean(capability));
}

function contextWarranted(requirement: PhysicalActionRequirement) {
  const text = requirement.whatHappens.toLowerCase();
  return {
    surface: /places? it down|places? the object|\btable\b|\bcounter\b|\bsurface\b|\bshelf\b/.test(text),
    door: /\bdoor\b|\bdoorway\b/.test(text),
  };
}

// NarrativePrimitiveCapabilityVerdict / NarrativePrimitiveEligibility are
// declared in ./types so the match record can carry them without a duplicate
// debug DTO.

// Semantic capability evidence patterns. These describe Narrative objects and
// interactions, never physical execution fields.
const SEMANTIC_EVIDENCE_PATTERNS: Record<NarrativePrimitiveCapability, RegExp> = {
  CARRIED_OBJECT_HOLD: /\bbag\b|\bsmall item\b|\bitem already in hand\b|\bheld steadily\b/,
  CARRIED_OBJECT_ADJUST: /\bbag\b|\bsmall item\b|\bbag strap\b|\bhandle\b|\bgrip\b|\bsettles\b/,
  CARRIED_OBJECT_CHECK: /\bchecks the bag\b|\bchecks the small item\b|\bsecure\b|\bchecks\b/,
  CONTAINER_OBJECT_SEARCH: /\bsearch(?:ing)? inside the bag\b|\blooks inside the bag\b|\bpocket\b|\bcontainer\b/,
  SMALL_OBJECT_RETRIEVAL: /\bkey\b|\bcard\b|\busual pocket\b|\bfinds the\b|\breaching for the\b/,
  SMALL_OBJECT_PLACEMENT: /\bplaces? it down\b|\bplaces? the object\b|\bplaces? it\b/,
  DOOR_CONTACT: /\bopens? the door\b|\bunlocks? the door\b|\breaches? for the door\b|\bdoor handle\b/,
  GARMENT_ADJUSTMENT: /\badjusts her sleeve\b|\badjusts her outer layer\b|\bsleeve once\b|\bgarment\b|\bouter layer\b|\bcuff\b|\blapel\b|\bhem\b/,
};

const CARRIED_OBJECT_MODES: NarrativePrimitiveCapability[] = [
  "CARRIED_OBJECT_HOLD",
  "CARRIED_OBJECT_ADJUST",
  "CARRIED_OBJECT_CHECK",
];

const CARRIED_OBJECT_CLASS_PATTERN = /\bbag\b|\bsmall item\b|\bthe object\b|\bitem\b/;

function directEvidenceFor(
  requirement: PhysicalActionRequirement,
  capability: NarrativePrimitiveCapability
) {
  if (requiredPrimitiveCapabilities(requirement).includes(capability)) {
    return "structured Moment requirement";
  }
  const matched = requirement.whatHappens.toLowerCase().match(SEMANTIC_EVIDENCE_PATTERNS[capability]);
  return matched ? `Moment text "${matched[0]}"` : null;
}

// Unified evaluator: every declared semantic capability gets its own verdict,
// and the narrow same-object mode exception stays traceable.
export function evaluatePrimitiveEvidenceEligibility(
  requirement: PhysicalActionRequirement,
  capability: PhysicalActionCapability
): NarrativePrimitiveEligibility {
  const primitive = capability.narrativePrimitive;
  const rejectionReasons: string[] = [];
  const capabilityVerdicts: NarrativePrimitiveCapabilityVerdict[] = [];
  const sameObjectExceptions: NarrativePrimitiveEligibility["sameObjectExceptions"] = [];
  const unsupportedExtraCapabilities: NarrativePrimitiveCapability[] = [];
  const physicalCompatibility = { movement: false, footwork: false, weight: false, context: false, transition: false };

  if (!primitive || capability.source !== "NARRATIVE_PRIMITIVE") {
    return {
      primitiveId: capability.actionId,
      eligible: false,
      capabilityVerdicts,
      directEvidenceCount: 0,
      sameObjectExceptions,
      unsupportedExtraCapabilities,
      requiredCapabilityMissing: [],
      physicalCompatibility,
      rejectionReasons: ["not a Narrative primitive record"],
    };
  }

  const required = requiredPrimitiveCapabilities(requirement);
  const declared = primitive.capabilities as NarrativePrimitiveCapability[];
  if (required.length === 0) {
    rejectionReasons.push("Moment states no object capability for a Narrative primitive");
  }
  const missingRequired = required.filter((entry) => !declared.includes(entry));
  if (missingRequired.length > 0) {
    rejectionReasons.push(`missing required capability: ${missingRequired.join(", ")}`);
  }

  const carriedObjectEvidenced = CARRIED_OBJECT_CLASS_PATTERN.test(requirement.whatHappens.toLowerCase());
  for (const declaredCapability of declared) {
    const direct = directEvidenceFor(requirement, declaredCapability);
    if (direct) {
      capabilityVerdicts.push({
        capability: declaredCapability,
        verdict: "DIRECT_EVIDENCE",
        evidence: direct,
        objectClass: null,
      });
      continue;
    }
    const sameObjectCandidate = CARRIED_OBJECT_MODES.includes(declaredCapability)
      && required.some((entry) => CARRIED_OBJECT_MODES.includes(entry))
      && carriedObjectEvidenced;
    if (sameObjectCandidate) {
      capabilityVerdicts.push({
        capability: declaredCapability,
        verdict: "SAME_OBJECT_MODE_EXCEPTION",
        evidence: "same carried object already confirmed by the Moment",
        objectClass: declaredCapability === "CARRIED_OBJECT_HOLD" ? "carried_object" : "carried_object_mode",
      });
      sameObjectExceptions.push({
        primitiveId: capability.actionId,
        capability: declaredCapability,
        objectClass: "carried_object",
        reason: "same-object handling mode of a capability the Moment already requires",
      });
      continue;
    }
    unsupportedExtraCapabilities.push(declaredCapability);
    capabilityVerdicts.push({
      capability: declaredCapability,
      verdict: "REJECTED_UNSUPPORTED_EXTRA",
      evidence: "no structured requirement and no Moment text evidence",
      objectClass: null,
    });
  }
  if (unsupportedExtraCapabilities.length > 0) {
    rejectionReasons.push(`unsupported extra capability: ${unsupportedExtraCapabilities.join(", ")}`);
  }

  // Physical execution compatibility: movement, footwork, weight, and the
  // narrative context the primitive needs (surface / door presence).
  physicalCompatibility.movement = primitive.movementCompatibility
    .some((state) => requirement.requiredMovementState.includes(state));
  const startOk = primitive.movementCompatibility.includes(requirement.startState)
    || capability.transitionCapability.canStartFrom.includes(requirement.startState);
  const endOk = capability.movementState === requirement.desiredEndState
    || capability.transitionCapability.canEndAs.includes(requirement.desiredEndState);
  const accepted = requirement.requiredFootwork.acceptsFootwork;
  physicalCompatibility.footwork = accepted.length === 0 || accepted.includes(capability.footwork.pattern);
  physicalCompatibility.weight = requirement.requiredWeight.includes(capability.weightCapability);
  const context = contextWarranted(requirement);
  physicalCompatibility.context = (!primitive.requiresSurfaceContext || context.surface)
    && (!primitive.requiresDoorContext || context.door);
  physicalCompatibility.transition = startOk && endOk;
  if (!physicalCompatibility.movement) rejectionReasons.push("movement state not compatible");
  if (!startOk || !endOk) rejectionReasons.push("transition state not compatible");
  if (!physicalCompatibility.footwork) rejectionReasons.push("footwork not compatible");
  if (!physicalCompatibility.weight) rejectionReasons.push("weight logic not compatible");
  if (!physicalCompatibility.context) rejectionReasons.push("required narrative context missing");

  return {
    primitiveId: capability.actionId,
    eligible: rejectionReasons.length === 0,
    capabilityVerdicts,
    directEvidenceCount: capabilityVerdicts.filter((verdict) => verdict.verdict === "DIRECT_EVIDENCE").length,
    sameObjectExceptions,
    unsupportedExtraCapabilities,
    requiredCapabilityMissing: missingRequired,
    physicalCompatibility,
    rejectionReasons,
  };
}

function narrativePrimitiveCompatible(
  requirement: PhysicalActionRequirement,
  capability: PhysicalActionCapability
) {
  return evaluatePrimitiveEvidenceEligibility(requirement, capability).eligible;
}

const MAX_REPORTED_CANDIDATES = 3;
const MAX_CLOSEST_ACTIONS_PER_GAP = 5;

export function isNarrativeActionEligible(capability: PhysicalActionCapability) {
  return capability.narrativeSuitability === "neutral_daily_action"
    && (capability.category === "general" || capability.category === "seated");
}

function handCompatible(requirement: PhysicalActionRequirement, capability: PhysicalActionCapability) {
  const contactRequirements = requirement.requiredHandCapabilities.filter((entry) => entry.capability !== "none");
  if (contactRequirements.length > 1) {
    // handTask is a single canonical value per source Action, so one Action can
    // never satisfy a combined hand requirement. No composition is allowed.
    return false;
  }
  const task = requirement.requiredHandTask;
  if (task === "none") {
    // A Moment without an object must stay with empty hands or a prop-free
    // scene gesture; garment, pocket, phone, and seat contact would add an
    // object the Narrative never introduced.
    return capability.hand.capability === "none" || capability.hand.capability === "scene_gesture";
  }
  if (task === "garment_adjustment") return capability.hand.capability === "garment_adjustment";
  if (task === "pocket_contact") return capability.hand.capability === "pocket_contact";
  if (task === "scene_gesture") return capability.hand.capability === "scene_gesture";
  if (task === "object_hold") return capability.hand.capability === "object_hold";
  if (task === "furniture_contact") return capability.hand.capability === "furniture_contact";
  return false;
}

function garmentMatchValue(
  requirement: PhysicalActionRequirement,
  capability: PhysicalActionCapability
): "EXACT" | "COMPATIBLE" | "UNDECLARED" | "INCOMPATIBLE" {
  const garmentRequirements = requirement.requiredHandCapabilities.filter(
    (entry) => entry.capability === "garment_adjustment" || entry.capability === "pocket_contact"
  );
  if (garmentRequirements.length === 0) return "UNDECLARED";
  if (capability.garment.declared) {
    // A garment task can only be exact when the Moment asks for garment contact alone.
    return requirement.requiredHandCapabilities.length === 1 ? "EXACT" : "INCOMPATIBLE";
  }
  return capability.hand.capability === "none" || capability.hand.capability === "scene_gesture"
    ? "UNDECLARED"
    : "INCOMPATIBLE";
}

function garmentRank(requirement: PhysicalActionRequirement, capability: PhysicalActionCapability) {
  const value = garmentMatchValue(requirement, capability);
  if (value === "EXACT") return 0;
  if (value === "COMPATIBLE") return 1;
  if (value === "UNDECLARED") return 2;
  return 3;
}

function movementCompatible(requirement: PhysicalActionRequirement, capability: PhysicalActionCapability) {
  const stateMatches = requirement.requiredMovementState.includes(capability.movementState);
  const startOk = capability.movementState === requirement.startState
    || capability.transitionCapability.canStartFrom.includes(requirement.startState);
  const endOk = capability.movementState === requirement.desiredEndState
    || capability.transitionCapability.canEndAs.includes(requirement.desiredEndState);
  return { stateMatches, startOk, endOk, compatible: stateMatches && startOk && endOk };
}

function footworkCompatible(requirement: PhysicalActionRequirement, capability: PhysicalActionCapability) {
  const accepted = requirement.requiredFootwork.acceptsFootwork;
  if (accepted.length > 0 && !accepted.includes(capability.footwork.pattern)) return false;
  if (requirement.requiredFootwork.requiresPivot && !capability.footwork.pivotCapability) return false;
  if (requirement.requiredFootwork.requiresGroundContact && capability.footwork.groundContact === "seated_grounded"
    && requirement.requiredMovementState[0] !== "seated") {
    return false;
  }
  return true;
}

function weightCompatible(requirement: PhysicalActionRequirement, capability: PhysicalActionCapability) {
  return requirement.requiredWeight.includes(capability.weightCapability);
}

type DimensionResult = {
  capability: PhysicalActionCapability;
  movement: ReturnType<typeof movementCompatible>;
  handOk: boolean;
  footworkOk: boolean;
  weightOk: boolean;
  grade: PhysicalActionCompatibilityGrade;
};

function evaluateCandidate(
  requirement: PhysicalActionRequirement,
  capability: PhysicalActionCapability
): DimensionResult {
  const movement = movementCompatible(requirement, capability);
  const handOk = handCompatible(requirement, capability);
  const footworkOk = footworkCompatible(requirement, capability);
  const weightOk = weightCompatible(requirement, capability);
  const exact = movement.compatible && handOk && footworkOk && weightOk;
  const partial = !exact && movement.compatible && (handOk || footworkOk || weightOk);

  return {
    capability,
    movement,
    handOk,
    footworkOk,
    weightOk,
    grade: exact ? "exact" : partial ? "partial" : "incompatible",
  };
}

function candidateReport(
  requirement: PhysicalActionRequirement,
  result: DimensionResult
): PhysicalActionMatchCandidate {
  const matched: string[] = [];
  const unmatched: string[] = [];
  if (result.movement.compatible) matched.push(`movement:${result.capability.movementState}`);
  else unmatched.push(`movement:${result.capability.movementState}`);
  if (result.handOk) matched.push(`hand:${result.capability.hand.capability}`);
  else unmatched.push(`hand:${result.capability.hand.capability}`);
  if (result.footworkOk) matched.push(`footwork:${result.capability.footwork.pattern}`);
  else unmatched.push(`footwork:${result.capability.footwork.pattern}`);
  if (result.weightOk) matched.push(`weight:${result.capability.weightCapability}`);
  else unmatched.push(`weight:${result.capability.weightCapability}`);

  return {
    actionId: result.capability.actionId,
    actionFamily: result.capability.actionFamily,
    grade: result.grade,
    matchedCapabilities: matched,
    unmatchedCapabilities: unmatched,
    compatibilityVector: {
      movementMatch: result.movement.compatible
        ? (result.capability.movementState === requirement.requiredMovementState[0] ? "EXACT" : "COMPATIBLE")
        : "INCOMPATIBLE",
      transitionMatch: result.movement.startOk && result.movement.endOk ? "EXACT" : "INCOMPATIBLE",
      handTaskMatch: result.handOk
        ? (requirement.requiredHandTask === "none" ? "UNDECLARED" : "EXACT")
        : "INCOMPATIBLE",
      footworkMatch: result.footworkOk
        ? (requirement.requiredFootwork.acceptsFootwork.length === 0 ? "UNDECLARED" : "COMPATIBLE")
        : "INCOMPATIBLE",
      stridePhaseMatch: stridePhaseMatchValue(requirement, result.capability),
      garmentMatch: result.capability.source === "NARRATIVE_PRIMITIVE"
        ? (result.capability.narrativePrimitive?.capabilities.includes("GARMENT_ADJUSTMENT") ? "EXACT" : "UNDECLARED")
        : garmentMatchValue(requirement, result.capability),
      continuityMatch: "UNDECLARED",
    },
  };
}

function missingCapabilityOf(requirement: PhysicalActionRequirement, result: DimensionResult | null) {
  if (isObjectContactTask(requirement.requiredHandTask)) {
    return `${requirement.requiredHandTask} with ${requirement.requiredObject}`;
  }
  if (!result) return "no eligible existing action primitive";
  if (!result.movement.compatible) return `movement state ${requirement.requiredMovementState.join("|")}`;
  if (!result.handOk) return `hand task ${requirement.requiredHandTask}`;
  if (!result.footworkOk) return `footwork ${requirement.requiredFootwork.acceptsFootwork.join("|")}`;
  if (!result.weightOk) return `weight logic ${requirement.requiredWeight.join("|")}`;
  return "unspecified capability";
}

// Selection-stage preference table. It reads the movement intent that the
// requirement layer already produced and orders the declared movement states by
// how specifically they express that intent. It changes no requirement field.
const INTENT_STATE_PREFERENCE: Record<string, PhysicalActionMovementState[]> = {
  seated: ["seated"],
  threshold: ["walking_ongoing", "walking_starting", "walking_finish"],
  stop: ["stopping_settle", "transition_pause"],
  slow: ["walking_finish", "stopping_settle"],
  turn: ["turning", "transition_pause"],
  start_walking: ["walking_starting", "transition_pause"],
  walking: ["walking_ongoing", "walking_finish", "walking_starting"],
  standing: ["stationary", "scene_task", "garment_task", "stopping_settle"],
};

function movementIntentOf(requirement: PhysicalActionRequirement) {
  return requirement.intentId.split("+")[0] || "standing";
}

function preferredStates(requirement: PhysicalActionRequirement) {
  return INTENT_STATE_PREFERENCE[movementIntentOf(requirement)] ?? [];
}

function statePreferenceRank(requirement: PhysicalActionRequirement, capability: PhysicalActionCapability) {
  const preference = preferredStates(requirement);
  const rank = preference.indexOf(capability.movementState);
  return rank === -1 ? preference.length : rank;
}

function handDeclarationDepth(capability: PhysicalActionCapability) {
  // Declared non-empty hand capability reads the Moment more specifically than
  // fully empty hands. It never introduces an object the Narrative omitted.
  return capability.hand.capability === "none" ? 0 : 1;
}

function selectionRank(requirement: PhysicalActionRequirement, result: DimensionResult) {
  return [
    stridePhaseRank(requirement, result.capability),
    statePreferenceRank(requirement, result.capability),
    garmentRank(requirement, result.capability),
    footworkAlignmentRank(result.capability),
    -handDeclarationDepth(result.capability),
  ];
}

// Pre-stride comparator, kept only to report tie statistics before and after
// stride-phase alignment. Selection never uses it.
function legacySelectionRank(requirement: PhysicalActionRequirement, result: DimensionResult) {
  return [
    statePreferenceRank(requirement, result.capability),
    -handDeclarationDepth(result.capability),
  ];
}

function stridePhaseMatchValue(
  requirement: PhysicalActionRequirement,
  capability: PhysicalActionCapability
): "EXACT" | "COMPATIBLE" | "UNDECLARED" | "INCOMPATIBLE" {
  const phases = requirement.requiredStridePhase;
  if (phases.length === 0) return "UNDECLARED";
  if (capability.movementState === phases[0]) return "EXACT";
  if (phases.includes(capability.movementState)) return "COMPATIBLE";
  return "INCOMPATIBLE";
}

function stridePhaseRank(requirement: PhysicalActionRequirement, capability: PhysicalActionCapability) {
  const phases = requirement.requiredStridePhase;
  if (phases.length === 0) return 0;
  const index = phases.indexOf(capability.movementState);
  return index === -1 ? phases.length : index;
}

// Footwork preference per declared stride phase. Both sides come from the real
// source schema: the phase from `movementPhase`, the pattern from `footwork`.
const STATE_FOOTWORK_PREFERENCE: Partial<Record<PhysicalActionMovementState, PersonActionFootwork[]>> = {
  walking_starting: ["stepStart", "midStep", "stepFinish"],
  walking_ongoing: ["midStep", "stepStart", "stepFinish"],
  walking_finish: ["stepFinish", "midStep", "split"],
  stopping_settle: ["split", "stepFinish", "parallel"],
  transition_pause: ["split", "stepFinish", "stepStart"],
  turning: ["split", "stepFinish", "parallel"],
  stationary: ["parallel", "split"],
  scene_task: ["parallel", "split"],
  garment_task: ["parallel", "split"],
  seated: ["seatedGrounded"],
};

function footworkAlignmentRank(capability: PhysicalActionCapability) {
  const preference = STATE_FOOTWORK_PREFERENCE[capability.movementState] ?? [];
  const rank = preference.indexOf(capability.footwork.pattern);
  return rank === -1 ? preference.length : rank;
}

function selectionReasonOf(
  requirement: PhysicalActionRequirement,
  result: DimensionResult,
  ranked: DimensionResult[]
) {
  if (statePreferenceRank(requirement, result.capability) !== 0) return "GENERIC_COMPATIBLE" as const;
  const phaseValue = stridePhaseMatchValue(requirement, result.capability);
  const lowerPhaseAlternative = ranked.some((other) => (
    other !== result
    && stridePhaseRank(requirement, other.capability) > stridePhaseRank(requirement, result.capability)
  ));
  if (
    garmentMatchValue(requirement, result.capability) === "EXACT"
    && ranked.some((other) => (
      other !== result && garmentRank(requirement, other.capability) > garmentRank(requirement, result.capability)
    ))
  ) {
    return "GARMENT_EXACT" as const;
  }
  if (phaseValue === "EXACT" && lowerPhaseAlternative) return "EXACT_STRIDE_PHASE_ALIGNMENT" as const;
  return "EXACT_CAPABILITY_FIT" as const;
}

function rankExactCandidates(
  requirement: PhysicalActionRequirement,
  results: DimensionResult[],
  withStridePhase = true
) {
  return [...results].sort((first, second) => {
    const firstRank = withStridePhase
      ? selectionRank(requirement, first)
      : legacySelectionRank(requirement, first);
    const secondRank = withStridePhase
      ? selectionRank(requirement, second)
      : legacySelectionRank(requirement, second);
    for (let index = 0; index < firstRank.length; index += 1) {
      if (firstRank[index] !== secondRank[index]) return firstRank[index] - secondRank[index];
    }
    // Fully equivalent capability: stable source order is the only remaining
    // rule, and every such choice is reported as a tie break.
    return 0;
  });
}

export function matchMoment(
  requirement: PhysicalActionRequirement,
  matrix: PhysicalActionCapability[],
  narrativePrimitives: PhysicalActionCapability[] = NARRATIVE_PRIMITIVE_REGISTRY
): PhysicalActionMomentMatch {
  // PHASE A — compatibility filter. Every eligible source record is evaluated
  // independently; no candidate is merged, deduplicated, or replaced by a
  // representative, and the funnel keeps each surviving layer countable.
  const eligible = matrix.filter(isNarrativeActionEligible);
  const evaluated = eligible.map((capability) => evaluateCandidate(requirement, capability));
  const movementCompatible = evaluated.filter((result) => result.movement.compatible);
  const handCompatibleResults = movementCompatible.filter((result) => result.handOk);
  const footworkCompatibleResults = handCompatibleResults.filter((result) => result.footworkOk);
  const compatibleResults = footworkCompatibleResults.filter((result) => result.weightOk);
  const partial = evaluated.filter((result) => result.grade === "partial");

  // PHASE B — deterministic exact-fit selection over the surviving candidates.
  // Existing Actions always take priority; the Narrative-only registry is only
  // consulted when no existing Action covers the Moment.
  const ranked = rankExactCandidates(requirement, compatibleResults);
  const preStrideRanked = rankExactCandidates(requirement, compatibleResults, false);
  const narrativeEvaluated = narrativePrimitives.filter((capability) => capability.source === "NARRATIVE_PRIMITIVE");
  const narrativeEvaluations = narrativeEvaluated.map((capability) => evaluatePrimitiveEvidenceEligibility(requirement, capability));
  const narrativeCompatible = narrativeEvaluated.filter((_, index) => narrativeEvaluations[index].eligible);
  const narrativeSelectedResult: DimensionResult | null = ranked.length === 0 && narrativeCompatible[0]
    ? {
        capability: narrativeCompatible[0],
        movement: { stateMatches: true, startOk: true, endOk: true, compatible: true },
        handOk: true,
        footworkOk: true,
        weightOk: true,
        grade: "exact",
      }
    : null;
  const selectedIsNarrativePrimitive = Boolean(narrativeSelectedResult);
  const selected = ranked[0] ?? narrativeSelectedResult;
  const preStrideSelected = preStrideRanked[0] ?? null;
  const status = selected ? "MATCHED" as const : "UNRESOLVED" as const;
  const closest = partial.slice(0, MAX_REPORTED_CANDIDATES);
  const rankKeyOf = (result: DimensionResult) => JSON.stringify(selectionRank(requirement, result));
  const legacyRankKeyOf = (result: DimensionResult) => JSON.stringify(legacySelectionRank(requirement, result));
  const tiedWithSelected = selectedIsNarrativePrimitive
    ? []
    : selected
      ? ranked.filter((result) => rankKeyOf(result) === rankKeyOf(selected))
      : [];
  const tiedBeforeStride = preStrideSelected
    ? preStrideRanked.filter((result) => legacyRankKeyOf(result) === legacyRankKeyOf(preStrideSelected))
    : [];
  const selectionChangedByStridePhase = Boolean(
    selected && preStrideSelected && selected.capability.actionId !== preStrideSelected.capability.actionId
  );
  const selectedPrimitiveEligibility = selectedIsNarrativePrimitive
    ? narrativeEvaluations.find((evaluation) => evaluation.primitiveId === selected!.capability.actionId) ?? null
    : null;
  const rejectedPrimitiveTraces = narrativeEvaluated
    .map((capability, index) => ({ capability, eligibility: narrativeEvaluations[index] }))
    .filter(({ capability, eligibility }) => !eligibility.eligible
      && requiredPrimitiveCapabilities(requirement)
        .every((entry) => (capability.narrativePrimitive?.capabilities ?? []).includes(entry)))
    .slice(0, MAX_REPORTED_CANDIDATES)
    .map(({ capability, eligibility }) => ({ primitiveId: capability.actionId, eligibility }));

  return {
    topicId: requirement.topicId,
    topicLabel: requirement.topicLabel,
    momentIndex: requirement.momentIndex,
    purpose: requirement.purpose,
    whatHappens: requirement.whatHappens,
    sceneId: requirement.sceneId,
    sceneName: requirement.sceneName,
    actionIntent: requirement.actionIntent,
    intentId: requirement.intentId,
    status,
    selectedActionId: selected?.capability.actionId ?? null,
    selectedActionFamily: selected?.capability.actionFamily ?? null,
    selectedHandTask: selected?.capability.hand.sourceHandTask ?? null,
    selectedFootwork: selected?.capability.footwork.pattern ?? null,
    selectedMovementState: selected?.capability.movementState ?? null,
    startState: requirement.startState,
    endState: selected ? requirement.desiredEndState : requirement.desiredEndState,
    whyCompatible: selected
      ? (selectedIsNarrativePrimitive
        ? `${selected.capability.actionId} is a Narrative-only primitive that covers the required ${requiredPrimitiveCapabilities(requirement).join(" + ")} capability set as one continuous body behavior${selected.capability.narrativePrimitive?.bodyBehavior ? `: ${selected.capability.narrativePrimitive.bodyBehavior}` : ""}`
        : `${selected.capability.actionId} satisfies the ${requirement.requiredMovementState.join("|")} movement requirement${requirement.requiredStridePhase.length ? ` at the ${stridePhaseMatchValue(requirement, selected.capability)} stride phase ${selected.capability.movementState}` : ""} with ${selected.capability.hand.capability} hand capability and ${selected.capability.footwork.pattern} footwork.`)
      : `No existing shared-library action expresses ${missingCapabilityOf(requirement, closest[0] ?? null)}.`,
    missingCapability: selected ? null : missingCapabilityOf(requirement, closest[0] ?? null),
    compatibleCandidates: [
      ...(narrativeSelectedResult ? [candidateReport(requirement, narrativeSelectedResult)] : []),
      ...ranked.slice(0, MAX_REPORTED_CANDIDATES).map((result) => candidateReport(requirement, result)),
      ...closest.map((result) => candidateReport(requirement, result)),
    ],
    candidateFunnel: {
      totalActions: matrix.length,
      afterEligibility: eligible.length,
      afterMovement: movementCompatible.length,
      afterHandTask: handCompatibleResults.length,
      afterFootwork: footworkCompatibleResults.length,
      afterWeight: compatibleResults.length,
      afterContinuity: compatibleResults.length,
      finalCompatible: compatibleResults.length,
      narrativePrimitivesEvaluated: narrativeEvaluated.length,
      narrativePrimitivesCompatible: narrativeCompatible.length,
    },
    selectionReason: selectedIsNarrativePrimitive
      ? "NARRATIVE_PRIMITIVE_EXACT"
      : selected ? selectionReasonOf(requirement, selected, ranked) : "GENERIC_COMPATIBLE",
    tieBreak: selectedIsNarrativePrimitive
      ? narrativeCompatible.length > 1
      : selected ? tiedWithSelected.length > 1 : false,
    tieBreakReason: selectedIsNarrativePrimitive
      ? (narrativeCompatible.length > 1
        ? `${narrativeCompatible.length} narrative primitives cover the requirement; selected by stable registry order.`
        : null)
      : selected && tiedWithSelected.length > 1
        ? `${tiedWithSelected.length} equivalent exact candidates share the same capability rank; selected by stable source order.`
        : null,
    tieBreakCandidateCount: selectedIsNarrativePrimitive
      ? narrativeCompatible.length
      : selected ? tiedWithSelected.length : 0,
    rejectedCandidates: selected
      ? [
          ...(selectedIsNarrativePrimitive
            ? narrativeCompatible.slice(1, 1 + MAX_REPORTED_CANDIDATES).map((capability) => ({
                actionId: capability.actionId,
                rejectedBecause: "narrative primitive with equal capability coverage that ranks behind the selected registry entry",
              }))
            : ranked.filter((result) => result !== selected).slice(0, MAX_REPORTED_CANDIDATES).map((result) => ({
                actionId: result.capability.actionId,
                rejectedBecause: `equivalent exact fit with capability rank ${selectionRank(requirement, result).join("/")} against selected rank ${selectionRank(requirement, selected).join("/")}`,
              }))),
          ...closest.slice(0, MAX_REPORTED_CANDIDATES).map((result) => ({
            actionId: result.capability.actionId,
            rejectedBecause: `partial compatibility: ${candidateReport(requirement, result).unmatchedCapabilities.join(", ") || "unmatched capability"}`,
          })),
        ].slice(0, MAX_REPORTED_CANDIDATES)
      : closest.slice(0, MAX_REPORTED_CANDIDATES).map((result) => ({
          actionId: result.capability.actionId,
          rejectedBecause: `no exact fit: ${candidateReport(requirement, result).unmatchedCapabilities.join(", ") || "unmatched capability"}`,
        })),
    stridePhase: {
      required: [...requirement.requiredStridePhase],
      selected: selected?.capability.movementState ?? null,
      match: selected
        ? stridePhaseMatchValue(requirement, selected.capability)
        : "UNDECLARED",
      selectionChangedByStridePhase,
      tiesBefore: tiedBeforeStride.length,
      tiesAfter: tiedWithSelected.length,
    },
    garment: {
      required: requirement.requiredHandCapabilities.map((entry) => ({ ...entry })),
      selectedCapability: selected?.capability.hand.sourceHandTask ?? null,
      match: selectedIsNarrativePrimitive
        ? (selectedPrimitiveEligibility?.capabilityVerdicts.some(
            (verdict) => verdict.capability === "GARMENT_ADJUSTMENT"
          ) ? "EXACT" : "UNDECLARED")
        : selected ? garmentMatchValue(requirement, selected.capability) : "UNDECLARED",
    },
    finalStatus: status,
    unresolvedReason: selected ? null : missingCapabilityOf(requirement, closest[0] ?? null),
    gapId: null,
    gapClass: null,
    source: selectedIsNarrativePrimitive ? "NARRATIVE_PRIMITIVE" : "EXISTING_ACTION",
    primitiveId: selectedIsNarrativePrimitive ? selected!.capability.actionId : null,
    primitiveGapOrigin: selectedIsNarrativePrimitive ? [...(selected!.capability.narrativePrimitive?.gapIds ?? [])] : [],
    primitiveDebug: {
      evaluated: narrativeEvaluations.length,
      eligible: narrativeCompatible.length,
      unsupportedExtraCapabilities: [...new Set(narrativeEvaluations.flatMap(
        (evaluation) => evaluation.unsupportedExtraCapabilities as string[]
      ))],
      sameObjectExceptionCount: narrativeEvaluations.reduce(
        (total, evaluation) => total + evaluation.sameObjectExceptions.length,
        0
      ),
      physicalCompatibility: selectedIsNarrativePrimitive
        || narrativeEvaluations.some((evaluation) => evaluation.physicalCompatibility.movement),
    },
    primitiveEligibility: selectedPrimitiveEligibility,
    rejectedPrimitiveTraces,
    provisional: true,
    continuation: {
      previousEndState: null,
      compatibleWithPrevious: null,
      note: "Continuity is evaluated in the chain pass.",
    },
  };
}

export function matchRequirementMatrix(
  requirements: PhysicalActionRequirement[],
  matrix: PhysicalActionCapability[],
  narrativePrimitives: PhysicalActionCapability[] = NARRATIVE_PRIMITIVE_REGISTRY
): PhysicalActionMomentMatch[] {
  return requirements.map((requirement) => matchMoment(requirement, matrix, narrativePrimitives));
}

function stateCompatible(
  previousEndState: PhysicalActionMovementState | null,
  capability: PhysicalActionCapability
) {
  if (!previousEndState) return true;
  if (capability.movementState === previousEndState) return true;
  return capability.transitionCapability.canStartFrom.includes(previousEndState);
}

function candidatesFor(
  requirement: PhysicalActionRequirement,
  matrix: PhysicalActionCapability[],
  narrativePrimitives: PhysicalActionCapability[]
) {
  const compatible = matrix
    .filter(isNarrativeActionEligible)
    .map((capability) => evaluateCandidate(requirement, capability))
    .filter((result) => result.grade === "exact");
  // The continuity path must observe the same ranked candidate set as the
  // primary path; it never falls back to raw library order.
  const existing = rankExactCandidates(requirement, compatible).map((result) => result.capability);
  if (existing.length > 0) return existing;
  // Existing Actions keep priority; the Narrative-only registry is only used
  // when no existing Action covers the Moment.
  return narrativePrimitives
    .filter((capability) => capability.source === "NARRATIVE_PRIMITIVE")
    .filter((capability) => narrativePrimitiveCompatible(requirement, capability));
}

export type ContinuityPassResult = {
  matches: PhysicalActionMomentMatch[];
  issues: PhysicalActionContinuityIssue[];
  topicCoverage: PhysicalActionTopicCoverage[];
};

export function runContinuityPass(
  requirements: PhysicalActionRequirement[],
  matrix: PhysicalActionCapability[],
  matches: PhysicalActionMomentMatch[],
  narrativePrimitives: PhysicalActionCapability[] = NARRATIVE_PRIMITIVE_REGISTRY
): ContinuityPassResult {
  const byId = new Map([...matrix, ...narrativePrimitives].map((capability) => [capability.actionId, capability]));
  const reselected: PhysicalActionMomentMatch[] = matches.map((match) => ({
    ...match,
    compatibleCandidates: match.compatibleCandidates.map((candidate) => ({ ...candidate })),
    continuation: { ...match.continuation },
  }));
  const issues: PhysicalActionContinuityIssue[] = [];
  const topicOrder: string[] = [];
  const byTopic = new Map<string, { requirement: PhysicalActionRequirement; index: number }[]>();

  requirements.forEach((requirement, index) => {
    if (!byTopic.has(requirement.topicId)) {
      byTopic.set(requirement.topicId, []);
      topicOrder.push(requirement.topicId);
    }
    byTopic.get(requirement.topicId)!.push({ requirement, index });
  });

  for (const topicId of topicOrder) {
    const entries = byTopic.get(topicId)!;
    let previousEnd: PhysicalActionMovementState | null = null;
    let previousActionId: string | null = null;
    let previousCanonicalIndex: number | null = null;

    for (const { requirement, index } of entries) {
      const match = reselected[index];
      if (match.status === "UNRESOLVED") {
        match.continuation = {
          previousEndState: previousEnd,
          compatibleWithPrevious: null,
          note: `Moment ${requirement.momentIndex} is unresolved, so continuity cannot be claimed.`,
        };
        if (previousEnd !== null) {
          issues.push({
            topicId: requirement.topicId,
            topicLabel: requirement.topicLabel,
            fromMomentIndex: previousCanonicalIndex ?? requirement.momentIndex,
            toMomentIndex: requirement.momentIndex,
            previousEndState: previousEnd,
            nextStartState: requirement.startState,
            reason: `Moment ${requirement.momentIndex} has no existing primitive; the chain cannot reach its required start state.`,
            repairApplied: "UNRESOLVED_CAPABILITY_GAP",
          });
        }
        previousEnd = null;
        previousActionId = null;
        previousCanonicalIndex = requirement.momentIndex;
        continue;
      }

      let capability = byId.get(match.selectedActionId!)!;
      const rankedCandidates = candidatesFor(requirement, matrix, narrativePrimitives);
      // The funnel tracks the existing-Action pool only; Narrative primitives
      // are counted separately so existing-pool invariants stay meaningful.
      const continuityCompatible = rankedCandidates
        .filter((candidate) => candidate.source !== "NARRATIVE_PRIMITIVE")
        .filter((candidate) => stateCompatible(previousEnd, candidate));
      const continuityCompatibleNarrative = rankedCandidates
        .filter((candidate) => candidate.source === "NARRATIVE_PRIMITIVE")
        .filter((candidate) => stateCompatible(previousEnd, candidate));
      const compatible = stateCompatible(previousEnd, capability);
      if (!compatible) {
        // Repair priority A: re-select another exact candidate for this Moment,
        // using the same ranked candidate set as the primary selection path.
        const alternatives = continuityCompatible.filter((candidate) => candidate.actionId !== capability.actionId);
        if (alternatives.length > 0) {
          const replacement = alternatives[0];
          const replacementReport = candidateReport(requirement, evaluateCandidate(requirement, replacement));
          const replacementIsNarrativePrimitive = replacement.source === "NARRATIVE_PRIMITIVE";
          reselected[index] = {
            ...match,
            selectedActionId: replacement.actionId,
            selectedActionFamily: replacement.actionFamily,
            selectedHandTask: replacement.hand.sourceHandTask,
            selectedFootwork: replacement.footwork.pattern,
            selectedMovementState: replacement.movementState,
            selectionReason: "CONTINUITY_PREFERRED",
            source: replacementIsNarrativePrimitive ? "NARRATIVE_PRIMITIVE" : "EXISTING_ACTION",
            primitiveId: replacementIsNarrativePrimitive ? replacement.actionId : null,
            primitiveGapOrigin: replacementIsNarrativePrimitive
              ? [...(replacement.narrativePrimitive?.gapIds ?? [])]
              : [],
            primitiveEligibility: replacementIsNarrativePrimitive
              ? evaluatePrimitiveEvidenceEligibility(requirement, replacement)
              : null,
            tieBreak: alternatives.length > 1,
            tieBreakReason: alternatives.length > 1
              ? `${alternatives.length} continuity-compatible candidates share the same ranked candidate set; selected by stable ranked order.`
              : null,
            tieBreakCandidateCount: alternatives.length,
            rejectedCandidates: alternatives.slice(1, 1 + MAX_REPORTED_CANDIDATES).map((candidate) => ({
              actionId: candidate.actionId,
              rejectedBecause: "continuity-compatible alternative that ranked behind the selected candidate",
            })),
            compatibleCandidates: [
              replacementReport,
              ...match.compatibleCandidates.filter((candidate) => candidate.actionId !== replacement.actionId),
            ].slice(0, 1 + MAX_REPORTED_CANDIDATES),
            whyCompatible: `${replacement.actionId} satisfies the Moment requirement and continues from the previous end state (${previousEnd}).`,
          };
          issues.push({
            topicId: requirement.topicId,
            topicLabel: requirement.topicLabel,
            fromMomentIndex: previousCanonicalIndex ?? requirement.momentIndex,
            toMomentIndex: requirement.momentIndex,
            previousEndState: previousEnd,
            nextStartState: requirement.startState,
            reason: `Moment ${requirement.momentIndex} was reselected to ${replacement.actionId} to keep the behavior chain continuous.`,
            repairApplied: "RESELECTED_CANDIDATE",
          });
          capability = replacement;
        } else {
          issues.push({
            topicId: requirement.topicId,
            topicLabel: requirement.topicLabel,
            fromMomentIndex: previousCanonicalIndex ?? requirement.momentIndex,
            toMomentIndex: requirement.momentIndex,
            previousEndState: previousEnd,
            nextStartState: requirement.startState,
            reason: `No exact candidate for Moment ${requirement.momentIndex} can start from ${previousEnd}.`,
            repairApplied: "TRANSITION_CAPABLE_ACTION",
          });
        }
      }

      const finalMatch = reselected[index];
      finalMatch.candidateFunnel = {
        ...finalMatch.candidateFunnel,
        afterContinuity: continuityCompatible.length,
        narrativePrimitivesCompatible: Math.max(
          finalMatch.candidateFunnel.narrativePrimitivesCompatible,
          continuityCompatibleNarrative.length
        ),
      };
      const selectedCandidate = finalMatch.compatibleCandidates.find(
        (candidate) => candidate.actionId === finalMatch.selectedActionId
      );
      if (selectedCandidate) {
        selectedCandidate.compatibilityVector.continuityMatch = finalMatch.selectedActionId === match.selectedActionId
          ? (compatible ? "EXACT" : "INCOMPATIBLE")
          : "EXACT";
      }
      finalMatch.continuation = {
        previousEndState: previousEnd,
        compatibleWithPrevious: compatible || finalMatch.selectedActionId !== match.selectedActionId,
        note: previousEnd
          ? `Previous end state ${previousEnd} is carried into ${finalMatch.selectedActionId}.`
          : "First Moment of the chain starts the body state.",
      };
      previousEnd = requirement.desiredEndState;
      previousActionId = finalMatch.selectedActionId;
      previousCanonicalIndex = requirement.momentIndex;
    }
  }

  const topicCoverage: PhysicalActionTopicCoverage[] = topicOrder.map((topicId) => {
    const entries = byTopic.get(topicId)!;
    const topicMatches = entries.map((entry) => reselected[entry.index]);
    const unresolvedMomentIndexes = topicMatches
      .filter((match) => match.status === "UNRESOLVED")
      .map((match) => match.momentIndex);
    const topicIssues = issues.filter((issue) => issue.topicId === topicId);
    const repaired = topicIssues.some((issue) => issue.repairApplied === "RESELECTED_CANDIDATE");

    return {
      topicId: topicId as PhysicalActionTopicCoverage["topicId"],
      topicLabel: entries[0].requirement.topicLabel,
      matchedMoments: topicMatches.filter((match) => match.status === "MATCHED").length,
      unresolvedMoments: unresolvedMomentIndexes.length,
      totalMoments: topicMatches.length,
      continuityStatus: unresolvedMomentIndexes.length > 0
        ? "BLOCKED_BY_UNRESOLVED_MOMENT"
        : repaired
          ? "CONTINUITY_REPAIRED"
          : "CONTINUOUS",
      unresolvedMomentIndexes,
    };
  });

  return { matches: reselected, issues, topicCoverage };
}

function gapIdFor(match: PhysicalActionMomentMatch) {
  const raw = match.missingCapability ?? "unknown";
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function movementFamilyOfState(state: PhysicalActionMovementState) {
  if (state.startsWith("walking") || state === "stopping_settle") return "walking";
  if (state === "turning") return "turning";
  if (state === "seated") return "seated";
  if (state === "garment_task") return "garment-task";
  if (state === "scene_task") return "scene-interaction";
  return "standing";
}

export function clusterCapabilityGaps(
  matches: PhysicalActionMomentMatch[],
  requirements: PhysicalActionRequirement[]
): PhysicalActionCapabilityGap[] {
  const requirementByKey = new Map(requirements.map((requirement) => [
    `${requirement.topicId}:${requirement.momentIndex}`,
    requirement,
  ]));
  const groups = new Map<string, PhysicalActionMomentMatch[]>();

  for (const match of matches.filter((entry) => entry.status === "UNRESOLVED")) {
    const key = gapIdFor(match);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(match);
  }

  return [...groups.entries()].map(([gapId, group]) => {
    const groupRequirements = group
      .map((match) => requirementByKey.get(`${match.topicId}:${match.momentIndex}`)!)
      .filter(Boolean);
    const closest = [...new Set(group.flatMap((match) => match.compatibleCandidates.map((candidate) => candidate.actionId)))]
      .slice(0, MAX_CLOSEST_ACTIONS_PER_GAP);
    const first = groupRequirements[0];
    const missing = group[0].missingCapability ?? "unknown capability";
    const contactGap = groupRequirements.some((requirement) => isObjectContactTask(requirement.requiredHandTask));
    const combinedHandRequirement = groupRequirements.some(
      (requirement) => requirement.requiredHandCapabilities.filter((entry) => entry.capability !== "none").length > 1
    );
    const requiredFamilies = [...new Set(groupRequirements.flatMap((requirement) => {
      const families = requirement.requiredMovementState.map((state) => movementFamilyOfState(state));
      return contactGap ? [...families, "hand_object_interaction"] : families;
    }))];
    const garmentRequirementPresent = groupRequirements.some(
      (requirement) => requirement.requiredHandCapabilities.some(
        (entry) => entry.capability === "garment_adjustment" || entry.capability === "pocket_contact"
      )
    );
    const requiredContactTasks = [...new Set(groupRequirements.flatMap(
      (requirement) => requirement.requiredHandCapabilities
        .map((entry) => entry.capability)
        .filter((capability) => capability !== "none")
    ))];
    const gapClass: PhysicalActionCapabilityGap["gapClass"] = combinedHandRequirement
      ? (garmentRequirementPresent ? "GARMENT_COMBINATION_GAP" : "UNSUPPORTED_MULTI_CAPABILITY_COMBINATION")
      : "REAL_CAPABILITY_GAP";

    return {
      gapId,
      missingCapability: missing,
      affectedTopics: [...new Set(group.map((match) => match.topicLabel))],
      affectedMoments: group.map((match) => ({
        topicId: match.topicId,
        topicLabel: match.topicLabel,
        momentIndex: match.momentIndex,
        whatHappens: match.whatHappens,
      })),
      requiredStartState: first?.startState ?? null,
      requiredEndState: first?.desiredEndState ?? null,
      requiredFamily: requiredFamilies,
      requiredMovementPhase: [...new Set(groupRequirements.flatMap((requirement) => requirement.requiredMovementState))],
      requiredHandTask: [...new Set(groupRequirements.map((requirement) => requirement.requiredHandTask))],
      requiredFootwork: [...new Set(groupRequirements.flatMap((requirement) => requirement.requiredFootwork.acceptsFootwork))],
      requiredWeightLogic: [...new Set(groupRequirements.flatMap((requirement) => requirement.requiredWeight))],
      requiredGarmentCapability: [...new Set(groupRequirements.flatMap(
        (requirement) => requirement.requiredHandCapabilities
          .filter((entry) => entry.capability === "garment_adjustment" || entry.capability === "pocket_contact")
          .map((entry) => entry.capability)
      ))],
      requiredCombination: combinedHandRequirement ? requiredContactTasks : [],
      requiredContinuityTransition: [first?.startState, first?.desiredEndState].filter(Boolean) as PhysicalActionMovementState[],
      closestExistingActionIds: closest,
      whyExistingActionsFail: combinedHandRequirement
        ? "The canonical handTask is a single value per Action, so no existing Action can express this combined hand requirement. Automatic action composition is prohibited."
        : contactGap
          ? `The shared action library has no handTask that produces real contact with ${group[0].missingCapability?.split(" with ")[1] ?? "the required object"}. Every existing candidate is limited to empty hands, a garment adjustment, a pocket edge, a prop-free scene gesture, a phone, or a seat.`
          : "The shared action library has no primitive whose movement state and transition capability cover this Moment.",
      couldBeSolvedByExistingSingleAction: false,
      couldBeSolvedByCombination: !contactGap,
      newPrimitiveLikelyRequired: contactGap,
      singleExistingActionCanSatisfy: false,
      canBeSolvedByMatchingRuleChange: false,
      requiresNewPrimitive: ([
        "REAL_CAPABILITY_GAP",
        "CONTINUITY_GAP",
        "GARMENT_COMBINATION_GAP",
        "UNSUPPORTED_MULTI_CAPABILITY_COMBINATION",
      ] as PhysicalActionCapabilityGap["gapClass"][]).includes(gapClass),
      gapClass,
    };
  }).sort((first, second) => second.affectedMoments.length - first.affectedMoments.length || first.gapId.localeCompare(second.gapId));
}
