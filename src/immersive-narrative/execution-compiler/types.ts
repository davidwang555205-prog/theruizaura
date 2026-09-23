import type { NarrativeDuration, NarrativeMomentPurpose, NarrativeSeason } from "../types";
import type { NarrativeTopicId } from "../topic-catalog";
import type { CameraExecutionMoment, CameraExecutionPlan } from "../camera-execution";
import type { PhysicalActionMomentMatch } from "../physical-action";
import type { ProductPresenceLevel } from "../product-presence";
import type { SoundMoment } from "../sound-world";
import type { ResolvedCharacterProfile } from "../character-profile";
import type { ImmersiveReferenceMapping } from "../seedance-compiler";

export const EXECUTION_COMPILER_SCHEMA_VERSION = "immersive-narrative/execution-compiler-v1.1" as const;
export const EXECUTION_COMPILER_VERSION = "1.1.0" as const;

export const MODEL_FACING_HEADER = "SEEDANCE — IMMERSIVE NARRATIVE EXECUTION SCRIPT" as const;

// Narrative decides WHAT HAPPENS. These end states are the closed set the
// Execution Compiler is allowed to translate into model-facing language.
export type NarrativeEndState =
  | "WALK_CONTINUES"
  | "SEARCH_BEGINS"
  | "SEARCH_CONTINUES"
  | "REACH_BEGINS"
  | "OBJECT_HANDLING_IN_PROGRESS"
  | "ITEM_RETRIEVED"
  | "DOOR_INTERACTION"
  | "OBJECT_PLACEMENT"
  | "GARMENT_SETTLE"
  | "ENTRY_COMPLETE"
  | "SETTLED_STATE"
  | "STATE_HOLD";

export type NarrativeCompletionClass =
  | "ITEM_RETRIEVED"
  | "DOOR_INTERACTION"
  | "OBJECT_PLACEMENT"
  | "GARMENT_SETTLED"
  | "CARRIED_OBJECT_SECURED"
  | "ENTRY"
  | "TASK_COMPLETE";

export type ExecutionMomentContract = {
  momentIndex: number;
  purpose: NarrativeMomentPurpose;
  timeRange: { startSecond: number; endSecond: number } | null;
  narrativeEvent: string;
  startState: NarrativeEndState;
  allowedProgress: string;
  endState: NarrativeEndState;
  objectStateBefore: string;
  objectStateAfter: string;
  forbiddenCompletions: NarrativeCompletionClass[];
  requiredProgressEvidence: NarrativeCompletionClass[] | null;
  narrativeEvidence: string;
  spatialAnchor: string;
  executionStatus: "EXECUTABLE" | "SAFE_CONTINUATION" | "NOT_EXECUTABLE";
  notes: string[];
};

export type BoundaryConflictType = "EARLY_COMPLETION" | "MISSING_END_STATE";

export type BoundaryConflict = {
  momentIndex: number;
  type: BoundaryConflictType;
  detail: string;
  source: "INTERNAL_ACTION" | "INTERNAL_SCRIPT" | "MODEL_FACING";
};

export type ActionExecutionEvidence = {
  momentIndex: number;
  status: "MATCHED" | "UNRESOLVED";
  actionId: string | null;
  source: "EXISTING_ACTION" | "NARRATIVE_PRIMITIVE" | null;
  handTask: string | null;
  movementState: string | null;
  capabilityIds: string[];
  internalText: string;
};

export type SafeContinuationKind =
  | "SEARCH_CONTINUES"
  | "REACH_BEGINS"
  | "CARRIED_OBJECT_HANDLING_CONTINUES"
  | "NARRATIVE_STATED_STATE_CHANGE";

export type SafeContinuation = {
  kind: SafeContinuationKind;
  continuesActionId: string | null;
  humanLine: string;
  preservedObject: string;
  preservedHandTask: string;
  preservedCausalState: string;
  cameraReuse: string;
  soundReuse: string[];
  evidence: string;
};

export type SafeContinuationResult =
  | { available: true; continuation: SafeContinuation }
  | { available: false; reason: string };

export type ModelFacingProductVisibility =
  | "ABSENT"
  | "VISIBLE_IF_NATURALLY_FRAMED"
  | "READABLE_REQUIRED";

export type ProductVisibilityDecision = {
  momentIndex: number;
  internalPresence: ProductPresenceLevel;
  modelFacing: ModelFacingProductVisibility;
  downgraded: boolean;
  reason: string;
};

export type SoundCueVerdict = {
  momentIndex: number;
  cue: string;
  kept: boolean;
  rejectionReason: string | null;
  evidence: string;
};

export type ModelFacingCameraState = {
  cameraPosition: string;
  cameraSide: string;
  height: string;
  lensFamily: string;
  workingDistance: string;
  framingState: string;
  movementState: "locked_off" | "restrained_follow" | "hold_position";
  naturalPartialVisibility: boolean;
};

export type CameraStateTransition = {
  momentIndex: number;
  changed: boolean;
  suppressed: boolean;
  motivation: string | null;
  state: ModelFacingCameraState;
  note: string;
};

export type ModelFacingMoment = {
  momentIndex: number;
  title: string;
  timeRange: { startSecond: number; endSecond: number };
  whatHappens: string;
  bodyBehavior: string;
  cameraObservation: string;
  naturalSound: string[];
  productVisibility: ModelFacingProductVisibility;
  productLine: string | null;
  endStateLine: string;
  contract: ExecutionMomentContract;
};

export type ModelFacingExecutionScript = {
  schemaVersion: typeof EXECUTION_COMPILER_SCHEMA_VERSION;
  compilerVersion: typeof EXECUTION_COMPILER_VERSION;
  topicId: NarrativeTopicId;
  topicLabel: string;
  season: NarrativeSeason;
  durationSeconds: NarrativeDuration;
  status: "EXECUTABLE" | "NOT_EXECUTABLE";
  notExecutableReasons: string[];
  compiledText: string;
  moments: ModelFacingMoment[];
  contracts: ExecutionMomentContract[];
  diagnostics: {
    internalScriptLength: number;
    modelFacingLength: number;
    boundaryConflictsBefore: BoundaryConflict[];
    boundaryConflictsAfter: BoundaryConflict[];
    safeContinuations: { momentIndex: number; kind: SafeContinuationKind; evidence: string }[];
    soundVerdicts: SoundCueVerdict[];
    rejectedSoundCount: number;
    productDecisions: ProductVisibilityDecision[];
    productDowngrades: number;
    cameraTransitions: CameraStateTransition[];
    cameraStateChanges: number;
    unmotivatedCameraChanges: number;
    suppressedCameraChanges: number;
    forcedInsertShots: number;
    referenceCount: number;
    engineeringMarkers: string[];
    timelineCoverage: { startSecond: number; endSecond: number; contiguous: boolean };
  };
};

export type ExecutionCompilerCheck = {
  id: string;
  label: string;
  status: "PASS" | "FAIL";
  reason: string;
};

export type ExecutionCompilerValidation = {
  checks: ExecutionCompilerCheck[];
  status: "EXECUTION_SCRIPT_VALIDATED" | "EXECUTION_SCRIPT_FAILED";
  failureReasons: string[];
};

export type ExecutionCompilerInput = {
  topicLabel: string;
  season: NarrativeSeason;
  character: ResolvedCharacterProfile;
  plan: {
    topicId: string;
    durationSeconds: NarrativeDuration;
    storyIntent: string;
    moments: { index: number; purpose: NarrativeMomentPurpose; whatHappens: string; causalLink: string | null }[];
  };
  sceneResolution: {
    locationWorld: { id: string; label: string } | null;
    resolvedMoments: { momentIndex: number; sceneId: string; sceneName: string; locationWorldId: string }[];
  };
  productPresence: { curve: { momentIndex: number; presence: ProductPresenceLevel; reason: string }[] };
  soundWorld: { moments: SoundMoment[] };
  cameraExecution: CameraExecutionPlan;
  physicalAction: { moments: PhysicalActionMomentMatch[] };
  referenceMapping: ImmersiveReferenceMapping;
  internalScriptText: string;
};

export type CameraExecutionMomentLike = CameraExecutionMoment;
