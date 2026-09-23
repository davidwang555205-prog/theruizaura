import type { NarrativeMomentPurpose, NarrativePlanStatus } from "../types";
import type { NarrativeTopicId } from "../topic-catalog";
import type { CameraNarrativeRole, CameraNarrativeStatus } from "../camera-role";
import type { ProductPresenceLevel, ProductPresenceStatus } from "../product-presence";
import type { SceneResolverStatus } from "../scene-resolver";
import type { SoundWorldStatus } from "../sound-world";
import type { CharacterProfileStatus, CharacterSelection } from "../character-profile";
import type {
  PersonActionDefinition,
  PersonActionFootwork,
  PersonActionHandTask,
  PersonActionHeelState,
  PersonActionKneeState,
  PersonActionMacroGroup,
  PersonActionMovementPhase,
  PersonActionOrientation,
  PersonActionHandPlacementZone,
  PersonActionSupportLeg,
  PersonActionTravelDirection,
  PersonActionVisualLegPoseFamily,
} from "../../data/personActionLibrary";

export type PhysicalActionBodyMode =
  | "standing"
  | "walking"
  | "transition"
  | "turning"
  | "seated"
  | "garment_interaction"
  | "scene_gesture"
  | "on_foot_placement"
  | "mirror";

export type PhysicalActionMovementState =
  | "stationary"
  | "walking_starting"
  | "walking_ongoing"
  | "walking_finish"
  | "stopping_settle"
  | "turning"
  | "transition_pause"
  | "seated"
  | "scene_task"
  | "garment_task"
  | "mirror_still";

export type PhysicalActionWeightCapability =
  | "bilateral_support"
  | "unilateral_support"
  | "transferring"
  | "settling"
  | "seated_support"
  | "transitional_support";

export type PhysicalActionHandCapability =
  | "none"
  | "garment_adjustment"
  | "pocket_contact"
  | "scene_gesture"
  | "object_hold"
  | "furniture_contact";

export type PhysicalActionObjectCategory =
  | "phone"
  | "seat"
  | "garment";

export type PhysicalActionRequiredObject =
  | "bag"
  | "key"
  | "door"
  | "card"
  | "small_item"
  | "garment"
  | "phone"
  | "seat"
  | "none";

export type PhysicalActionHandTask =
  | "none"
  | "garment_adjustment"
  | "pocket_contact"
  | "scene_gesture"
  | "object_hold"
  | "furniture_contact"
  | "object_search"
  | "object_retrieval"
  | "object_placement"
  | "carried_object_hold"
  | "carried_object_adjust"
  | "carried_object_check"
  | "door_contact";

export type PhysicalActionHandRequirement = {
  capability: PhysicalActionHandTask;
  object: PhysicalActionRequiredObject;
  evidence: string;
};

export type PhysicalActionNarrativeSuitability =
  | "neutral_daily_action"
  | "specialized_action"
  | "display_like";

export type PhysicalActionCapability = {
  actionId: string;
  actionFamily: string;
  macroActionGroup: PersonActionMacroGroup;
  category: PersonActionDefinition["category"];
  bodyMode: PhysicalActionBodyMode;
  movementState: PhysicalActionMovementState;
  footwork: {
    pattern: PersonActionFootwork;
    stridePhase: PersonActionMovementPhase;
    leadRearRelationship: string;
    supportLeg: PersonActionSupportLeg;
    kneeState: PersonActionKneeState;
    heelState: PersonActionHeelState;
    groundContact: "grounded" | "settling" | "seated_grounded";
    pivotCapability: boolean;
    stationaryOffsetCapability: boolean;
  };
  weightCapability: PhysicalActionWeightCapability;
  hand: {
    capability: PhysicalActionHandCapability;
    sourceHandTask: PersonActionHandTask;
    requiredObject: PhysicalActionObjectCategory | null;
  };
  garment: {
    declared: boolean;
    sourceField: "handTask";
    rawValue: PersonActionHandTask | null;
    placementZone: PersonActionHandPlacementZone;
  };
  objectCapability: {
    supportsObjectSearch: boolean;
    supportsObjectRetrieval: boolean;
    supportsObjectPlacement: boolean;
    supportsCarriedObjectHold: boolean;
    supportsDoorContact: boolean;
    holdsAnyObject: boolean;
  };
  transitionCapability: {
    canStartFrom: PhysicalActionMovementState[];
    canEndAs: PhysicalActionMovementState[];
  };
  orientationCapability: PersonActionOrientation;
  visualLegPoseFamily: PersonActionVisualLegPoseFamily;
  travelDirection: PersonActionTravelDirection;
  narrativeSuitability: PhysicalActionNarrativeSuitability;
  imageTypeScope: PersonActionDefinition["compatibleImageTypes"];
  handheldPolicy: PersonActionDefinition["handheldPolicy"];
  telephotoSafe: boolean;
  source: "SHARED_ACTION_LIBRARY" | "NARRATIVE_ONLY" | "NARRATIVE_PRIMITIVE";
  narrativePrimitive?: {
    primitiveId: string;
    capabilityFamily: string;
    capabilities: string[];
    movementCompatibility: PhysicalActionMovementState[];
    endState: PhysicalActionMovementState;
    bodyBehavior: string;
    handBehavior: string;
    requiresSurfaceContext: boolean;
    requiresDoorContext: boolean;
    gapIds: string[];
    affectedMoments: { topicId: string; momentIndex: number }[];
    legacySelectorEligible: false;
  };
};

export type PhysicalActionRequirement = {
  topicId: NarrativeTopicId;
  topicLabel: string;
  momentIndex: number;
  purpose: NarrativeMomentPurpose;
  whatHappens: string;
  sceneId: string;
  sceneName: string;
  productPresence: ProductPresenceLevel;
  cameraRole: CameraNarrativeRole;
  actionIntent: string;
  intentId: string;
  requiredBodyMode: PhysicalActionBodyMode[];
  requiredMovementState: PhysicalActionMovementState[];
  requiredHandTask: PhysicalActionHandTask;
  requiredObject: PhysicalActionRequiredObject;
  // Every hand requirement the Narrative states for this Moment, in rule order.
  // handTask is a single canonical value per source Action, so one Action can
  // only ever satisfy a subset of a combined requirement.
  requiredHandCapabilities: PhysicalActionHandRequirement[];
  requiredFootwork: {
    acceptsFootwork: PersonActionFootwork[];
    requiresGroundContact: boolean;
    requiresPivot: boolean;
    allowsStationaryOffset: boolean;
  };
  requiredWeight: PhysicalActionWeightCapability[];
  // Ordered gait-phase requirement. The first entry is the exact phase, the
  // remaining entries are compatible phases. An empty list means the Moment
  // does not state a gait phase, so stride phase stays UNDECLARED.
  requiredStridePhase: PhysicalActionMovementState[];
  startState: PhysicalActionMovementState;
  desiredEndState: PhysicalActionMovementState;
  forbiddenCapabilities: string[];
  narrativeObjects: PhysicalActionRequiredObject[];
};

export type PhysicalActionCompatibilityGrade = "exact" | "partial" | "incompatible";

export type PhysicalActionCompatibilityValue =
  | "EXACT"
  | "COMPATIBLE"
  | "UNDECLARED"
  | "INCOMPATIBLE";

// Capability vocabulary used only inside the Physical Action subsystem.
export type NarrativePrimitiveCapability =
  | "CARRIED_OBJECT_HOLD"
  | "CARRIED_OBJECT_ADJUST"
  | "CARRIED_OBJECT_CHECK"
  | "CONTAINER_OBJECT_SEARCH"
  | "SMALL_OBJECT_RETRIEVAL"
  | "SMALL_OBJECT_PLACEMENT"
  | "DOOR_CONTACT"
  | "GARMENT_ADJUSTMENT";

export type NarrativePrimitiveCapabilityVerdict = {
  capability: NarrativePrimitiveCapability;
  verdict: "DIRECT_EVIDENCE" | "SAME_OBJECT_MODE_EXCEPTION" | "REJECTED_UNSUPPORTED_EXTRA";
  evidence: string;
  objectClass: string | null;
};

// Canonical eligibility result produced by the Unified Eligibility Evaluator and
// carried by the match record. Debug layers read this instead of re-judging.
export type NarrativePrimitiveEligibility = {
  primitiveId: string;
  eligible: boolean;
  capabilityVerdicts: NarrativePrimitiveCapabilityVerdict[];
  directEvidenceCount: number;
  sameObjectExceptions: {
    primitiveId: string;
    capability: NarrativePrimitiveCapability;
    objectClass: string;
    reason: string;
  }[];
  unsupportedExtraCapabilities: NarrativePrimitiveCapability[];
  requiredCapabilityMissing: NarrativePrimitiveCapability[];
  physicalCompatibility: {
    movement: boolean;
    footwork: boolean;
    weight: boolean;
    context: boolean;
    transition: boolean;
  };
  rejectionReasons: string[];
};

export type PhysicalActionGapClass =
  | "REAL_CAPABILITY_GAP"
  | "REQUIREMENT_MODELING_BUG"
  | "MATCHING_IMPLEMENTATION_BUG"
  | "CONTINUITY_GAP"
  | "GARMENT_COMBINATION_GAP"
  | "UNSUPPORTED_MULTI_CAPABILITY_COMBINATION";

export type PhysicalActionSelectionReason =
  | "EXACT_CAPABILITY_FIT"
  | "EXACT_STRIDE_PHASE_ALIGNMENT"
  | "GARMENT_EXACT"
  | "NARRATIVE_PRIMITIVE_EXACT"
  | "GENERIC_COMPATIBLE"
  | "CONTINUITY_PREFERRED";

export type PhysicalActionCandidateFunnel = {
  totalActions: number;
  afterEligibility: number;
  afterMovement: number;
  afterHandTask: number;
  afterFootwork: number;
  afterWeight: number;
  afterContinuity: number;
  finalCompatible: number;
  narrativePrimitivesEvaluated: number;
  narrativePrimitivesCompatible: number;
};

export type PhysicalActionRejectedCandidate = {
  actionId: string;
  rejectedBecause: string;
};

export type PhysicalActionMatchCandidate = {
  actionId: string;
  actionFamily: string;
  grade: PhysicalActionCompatibilityGrade;
  matchedCapabilities: string[];
  unmatchedCapabilities: string[];
  compatibilityVector: {
    movementMatch: PhysicalActionCompatibilityValue;
    transitionMatch: PhysicalActionCompatibilityValue;
    handTaskMatch: PhysicalActionCompatibilityValue;
    footworkMatch: PhysicalActionCompatibilityValue;
    stridePhaseMatch: PhysicalActionCompatibilityValue;
    garmentMatch: PhysicalActionCompatibilityValue;
    continuityMatch: PhysicalActionCompatibilityValue;
  };
};

export type PhysicalActionMomentMatch = {
  topicId: NarrativeTopicId;
  topicLabel: string;
  momentIndex: number;
  purpose: NarrativeMomentPurpose;
  whatHappens: string;
  sceneId: string;
  sceneName: string;
  actionIntent: string;
  intentId: string;
  status: "MATCHED" | "UNRESOLVED";
  selectedActionId: string | null;
  selectedActionFamily: string | null;
  selectedHandTask: PersonActionHandTask | null;
  selectedFootwork: PersonActionFootwork | null;
  selectedMovementState: PhysicalActionMovementState | null;
  startState: PhysicalActionMovementState;
  endState: PhysicalActionMovementState;
  whyCompatible: string;
  missingCapability: string | null;
  compatibleCandidates: PhysicalActionMatchCandidate[];
  candidateFunnel: PhysicalActionCandidateFunnel;
  selectionReason: PhysicalActionSelectionReason;
  tieBreak: boolean;
  tieBreakReason: string | null;
  tieBreakCandidateCount: number;
  rejectedCandidates: PhysicalActionRejectedCandidate[];
  stridePhase: {
    required: PhysicalActionMovementState[];
    selected: PhysicalActionMovementState | null;
    match: PhysicalActionCompatibilityValue;
    selectionChangedByStridePhase: boolean;
    tiesBefore: number;
    tiesAfter: number;
  };
  garment: {
    required: PhysicalActionHandRequirement[];
    selectedCapability: PersonActionHandTask | null;
    match: PhysicalActionCompatibilityValue;
  };
  finalStatus: "MATCHED" | "UNRESOLVED";
  unresolvedReason: string | null;
  gapId: string | null;
  gapClass: PhysicalActionGapClass | null;
  source: "EXISTING_ACTION" | "NARRATIVE_PRIMITIVE";
  primitiveId: string | null;
  primitiveGapOrigin: string[];
  primitiveDebug: {
    evaluated: number;
    eligible: number;
    unsupportedExtraCapabilities: string[];
    sameObjectExceptionCount: number;
    physicalCompatibility: boolean;
  };
  primitiveEligibility: NarrativePrimitiveEligibility | null;
  rejectedPrimitiveTraces: {
    primitiveId: string;
    eligibility: NarrativePrimitiveEligibility;
  }[];
  provisional: true;
  continuation: {
    previousEndState: PhysicalActionMovementState | null;
    compatibleWithPrevious: boolean | null;
    note: string;
  };
};

export type PhysicalActionContinuityIssue = {
  topicId: NarrativeTopicId;
  topicLabel: string;
  fromMomentIndex: number;
  toMomentIndex: number;
  previousEndState: PhysicalActionMovementState | null;
  nextStartState: PhysicalActionMovementState | null;
  reason: string;
  repairApplied: "NONE" | "RESELECTED_CANDIDATE" | "TRANSITION_CAPABLE_ACTION" | "UNRESOLVED_CAPABILITY_GAP";
};

export type PhysicalActionCapabilityGap = {
  gapId: string;
  missingCapability: string;
  affectedTopics: string[];
  affectedMoments: { topicId: NarrativeTopicId; topicLabel: string; momentIndex: number; whatHappens: string }[];
  requiredStartState: PhysicalActionMovementState | null;
  requiredEndState: PhysicalActionMovementState | null;
  requiredFamily: string[];
  requiredMovementPhase: PhysicalActionMovementState[];
  requiredHandTask: PhysicalActionHandTask[];
  requiredFootwork: PersonActionFootwork[];
  requiredWeightLogic: PhysicalActionWeightCapability[];
  requiredGarmentCapability: PhysicalActionHandTask[];
  requiredCombination: PhysicalActionHandTask[];
  requiredContinuityTransition: PhysicalActionMovementState[];
  closestExistingActionIds: string[];
  whyExistingActionsFail: string;
  couldBeSolvedByExistingSingleAction: boolean;
  couldBeSolvedByCombination: boolean;
  newPrimitiveLikelyRequired: boolean;
  singleExistingActionCanSatisfy: boolean;
  canBeSolvedByMatchingRuleChange: boolean;
  requiresNewPrimitive: boolean;
  gapClass: PhysicalActionGapClass;
};

export type PhysicalActionTopicCoverage = {
  topicId: NarrativeTopicId;
  topicLabel: string;
  matchedMoments: number;
  unresolvedMoments: number;
  totalMoments: number;
  continuityStatus: "CONTINUOUS" | "CONTINUITY_REPAIRED" | "BLOCKED_BY_UNRESOLVED_MOMENT";
  unresolvedMomentIndexes: number[];
};

export type PhysicalActionCoverageSummary = {
  totalExistingActions: number;
  totalMoments: number;
  matchedMoments: number;
  unresolvedMoments: number;
  coveragePercent: number;
  uniqueExistingActionsReused: number;
  narrativePrimitivesUsed: number;
  addedPrimitiveCount: 0;
};

export type PhysicalActionCapabilitySummary = {
  totalActions: number;
  byCategory: Record<string, number>;
  families: Record<string, number>;
  handTasks: Record<string, number>;
  footwork: Record<string, number>;
  movementStates: Record<string, number>;
  transitionCapabilities: Record<string, number>;
  objectCapabilityCounts: Record<string, number>;
  narrativeSuitability: Record<string, number>;
};

export type PhysicalActionAuditReport = {
  capabilitySummary: PhysicalActionCapabilitySummary;
  coverage: PhysicalActionCoverageSummary;
  topicCoverage: PhysicalActionTopicCoverage[];
  moments: PhysicalActionMomentMatch[];
  continuityIssues: PhysicalActionContinuityIssue[];
  gaps: PhysicalActionCapabilityGap[];
  resultStage: "PROVISIONAL_MATCHING_RESULT" | "FINAL_TRUSTED_REMATCH" | "PHYSICAL_ACTION_APPROVED";
  finalTrustedPrerequisites: Record<string, boolean>;
  continuityAudit: {
    issuesBefore: number;
    issuesAfter: number;
    repairedByAlternateAction: number;
    capabilityCompatibleWithIssue: number;
    continuityCausedUnresolved: number;
    missingTransitionCapability: number;
  };
  gapReview: {
    totalGapClusters: number;
    byClass: Record<PhysicalActionGapClass, number>;
    minimumNewPrimitives: number;
  };
  primitivePatch: {
    registryCount: number;
    primitiveIds: string[];
    selectedMomentCount: number;
    selectedPrimitiveIds: string[];
    legacySelectorEligible: false;
  };
  selectionReasonDistribution: Record<PhysicalActionSelectionReason, number>;
  tieBreakSelectionCount: number;
  garmentStats: {
    sourceField: string;
    schemaShape: "single";
    garmentValues: PersonActionHandTask[];
    actionsWithGarmentCapability: number;
    garmentRequiringMoments: number;
    combinationRequiringMoments: number;
    automaticComposition: false;
    inventedCapability: 0;
  };
  stridePhaseStats: {
    sourceField: string;
    normalizedField: string;
    momentsRequiringExplicitStridePhase: number;
    actionsWithDeclaredStridePhase: number;
    selectionDecisionsChangedByStridePhase: number;
    finalTiesBefore: number;
    finalTiesAfter: number;
    tiesResolvedByStridePhase: number;
  };
  topReusedActions: {
    actionId: string;
    actionFamily: string;
    selectionCount: number;
    selectionReasonDistribution: Record<PhysicalActionSelectionReason, number>;
    affectedTopics: string[];
  }[];
  recommendation: "A" | "B";
  recommendationDetail: string;
};

export type PhysicalActionAuditInput = {
  moments: {
    topicId: NarrativeTopicId;
    topicLabel: string;
    momentIndex: number;
    purpose: NarrativeMomentPurpose;
    whatHappens: string;
    sceneId: string;
    sceneName: string;
    productPresence: ProductPresenceLevel;
    cameraRole: CameraNarrativeRole;
  }[];
};

export type PhysicalActionAuditOptions = {
  actions?: PersonActionDefinition[];
};

export type PhysicalActionPipelineStatus = {
  characterStatus: CharacterProfileStatus;
  narrativeStatus: NarrativePlanStatus;
  sceneResolutionStatus: SceneResolverStatus;
  productPresenceStatus: ProductPresenceStatus;
  soundWorldStatus: SoundWorldStatus;
  cameraNarrativeStatus: CameraNarrativeStatus;
  characterSelection: CharacterSelection;
};
