import type {
  CommercialCameraPlan,
  CommercialFilmPlan,
  CommercialShotRole,
} from "../types";
import type { CommercialBrandSignOff } from "../brand-signoff/types";
import type {
  CommercialContinuityLock,
} from "../event-spine/continuity-lock";
import type {
  CommercialEventStateContract,
  CommercialWorldModel,
  CommercialWorldStateSnapshot,
  CommercialWorldStateTimeline,
} from "../event-spine/world-state";
import type {
  CommercialTake,
  CommercialTakePlan,
} from "../event-spine/takes";
import type { CommercialMicroDecisionPlan } from "../event-spine/micro-decision";
import type {
  CommercialCreativeTreatment,
} from "../creative-directing/types";
import type {
  CommercialProductRevealContract,
  CommercialProductVisibilityState,
  CommercialProductVisibilityTimelineBeat,
} from "../product-visibility/types";

export const COMMERCIAL_FINAL_EXECUTION_PLAN_SCHEMA_VERSION =
  "commercial-film/final-execution-plan-v1" as const;
export const COMMERCIAL_FINAL_EXECUTION_PLAN_VERSION = "1.0.0" as const;

export type CommercialFinalExecutionPlanStatus = "VALID" | "BLOCKED";

export type CommercialFinalProductVisibilityState = CommercialProductVisibilityState;

export type CommercialFinalExecutionDiagnosticCode =
  | "VISIBILITY_CONFLICT"
  | "REVEAL_CONFLICT"
  | "UNDECLARED_PHYSICAL_RESOURCE"
  | "DEVICE_RESOURCE_MISSING"
  | "SIGNATURE_VISIBLE_EVIDENCE_MISSING"
  | "DEVICE_CAMERA_INCOMPATIBLE"
  | "CAMERA_VISIBILITY_INCOMPATIBLE"
  | "DEVICE_TAKE_INCOMPATIBLE"
  | "ENDING_STATE_CONFLICT"
  | "ENDING_NEW_ENTITY"
  | "ENDING_NEW_ACTION"
  | "ENDING_SUBJECT_EXIT"
  | "COMPLETED_ACTION_REPLAY"
  | "FIVE_SHOT_CHRONOLOGY_REINTRODUCTION"
  | "FILM_LINE_AUTHORITY_LEAK"
  | "INVALID_TAKE_COVERAGE"
  | "FINAL_PLAN_VALIDATION_FAILED";

export type CommercialFinalExecutionDiagnostic = {
  code: CommercialFinalExecutionDiagnosticCode;
  layer:
    | "identity"
    | "physical-state"
    | "take-structure"
    | "product-visibility"
    | "reveal"
    | "physical-resources"
    | "device"
    | "signature"
    | "camera"
    | "ending"
    | "film-line";
  message: string;
  beatIndex?: number;
  takeIndex?: number;
  source?: "PLAN" | "TREATMENT" | "PRESENTATION" | "BRAND_SIGNOFF";
  resource?: string;
};

export type CommercialFinalExecutionCheckId =
  | "visibility_normalized"
  | "reveal_contract_consistent"
  | "physical_resources_declared"
  | "device_resource_exists"
  | "signature_visible_evidence"
  | "device_camera_compatible"
  | "device_take_compatible"
  | "ending_matches_final_state"
  | "completed_action_not_replayed"
  | "ending_has_no_new_entity"
  | "no_five_shot_chronology_reintroduction"
  | "film_line_post_production_only";

export type CommercialFinalExecutionCheck = {
  id: CommercialFinalExecutionCheckId;
  label: string;
  status: "PASS" | "FAIL";
  reason: string;
};

export type CommercialFinalProductVisibilityBeat = CommercialProductVisibilityTimelineBeat;

export type CommercialFinalRevealContract = CommercialProductRevealContract;

export type CommercialFinalPhysicalResource = {
  id: string;
  label: string;
  kind: "ENTITY" | "ENVIRONMENT_CONDITION";
  source: "WORLD_MODEL" | "SCENE_WORLD" | "WORLD_LIFE_SIGNAL";
  entityId: string | null;
  attributes: Record<string, string>;
};

export type CommercialFinalPhysicalResourceBinding = {
  beatIndex: number;
  takeIndex: number;
  carrier: string;
  resourceId: string | null;
  resolved: boolean;
  reason: string;
};

export type CommercialFinalDeviceContract = {
  concept: CommercialCreativeTreatment["directorConceptId"];
  device: string;
  beatIndex: number;
  takeIndex: number;
  resourceId: string | null;
  signatureBeatIndex: number;
  initialVisualState: string;
  requiredVisibleChange: string;
  resolvedVisualState: string;
  resourceBindings: CommercialFinalPhysicalResourceBinding[];
  requiredVisibleEvidence: string[];
  stateDependency: string;
  cameraDependency: string;
  productDependency: string;
};

export type CommercialFinalSignatureContract = {
  eventId: string;
  beatIndex: number;
  takeIndex: number;
  resourceId: string | null;
  requiredVisibleEvidence: string[];
  stateDependency: string;
  cameraDependency: string;
  productDependency: string;
};

export type CommercialFinalIdentity = {
  commercialIntent: CommercialFilmPlan["commercialIntent"];
  commercialIntentLabel: string;
  duration: CommercialFilmPlan["duration"];
  cameraRhythm: CommercialFilmPlan["cameraRhythm"];
  character: CommercialFilmPlan["character"];
  season: CommercialFilmPlan["season"];
  sceneWorld: CommercialFilmPlan["sceneWorld"];
  referenceState: CommercialFilmPlan["referenceState"];
  productMessage: CommercialFilmPlan["productMessage"];
  brandMood: CommercialFilmPlan["brandMood"];
};

export type CommercialFinalExecutionBeat = {
  beatIndex: number;
  takeIndex: number;
  role: CommercialShotRole;
  timeRange: CommercialFilmPlan["shotArchitecture"]["shots"][number]["timeRange"];
  action: string;
  eventWhatHappens: string;
  eventWhatChanges: string;
  spatialAnchor: string;
  camera: CommercialCameraPlan["shots"][number];
  productVisibility: CommercialFinalProductVisibilityState;
};

export type CommercialFinalRenderPolicy = {
  visualLookLines: string[];
  soundLines: string[];
  productProtectionLines: string[];
  negativeLines: string[];
};

export type CommercialFinalPhysicalState = {
  worldModel: CommercialWorldModel;
  timeline: CommercialWorldStateTimeline;
  finalState: CommercialWorldStateSnapshot;
  completedActions: string[];
  continuityLock: CommercialContinuityLock;
  microDecision: CommercialMicroDecisionPlan;
  eventContracts: Array<{
    beatIndex: number;
    takeIndex: number;
    eventKind: string;
    contract: CommercialEventStateContract;
  }>;
};

export type CommercialFinalTakeStructure = {
  takePlan: CommercialTakePlan;
  takes: CommercialTake[];
  beatWindows: Array<{
    beatIndex: number;
    takeIndex: number;
    startSecond: number;
    endSecond: number;
    durationSeconds: number;
  }>;
};

export type CommercialFinalProductVisibility = {
  timeline: CommercialFinalProductVisibilityBeat[];
  revealContract: CommercialFinalRevealContract;
};

export type CommercialFinalCameraAuthority = {
  plan: CommercialCameraPlan;
  compatibilityStatus: "COMPATIBLE" | "INCOMPATIBLE";
  visibilityCompatibility: Array<{
    beatIndex: number;
    visibility: CommercialFinalProductVisibilityState;
    compatible: boolean;
    reason: string;
  }>;
  conflicts: Array<{
    code: "DEVICE_CAMERA_INCOMPATIBLE";
    message: string;
    shotIndex: number | null;
    movement: string | null;
  }>;
};

export type CommercialFinalEnding = {
  candidateImage: string;
  candidateAccepted: boolean;
  finalImage: string;
  rejectionReasons: string[];
  finalCharacterState: Record<string, string>;
  finalWorldState: CommercialWorldStateSnapshot;
  endingGrammar: CommercialFilmPlan["endingStrategy"]["grammar"];
  releaseConstraint: string;
  filmLine: {
    value: string | null;
    postProductionOnly: boolean;
    endingImagePreserved: boolean;
  };
};

export type CommercialFinalExecutionPlan = {
  schemaVersion: typeof COMMERCIAL_FINAL_EXECUTION_PLAN_SCHEMA_VERSION;
  plannerVersion: typeof COMMERCIAL_FINAL_EXECUTION_PLAN_VERSION;
  status: CommercialFinalExecutionPlanStatus;
  identity: CommercialFinalIdentity;
  beats: CommercialFinalExecutionBeat[];
  physicalState: CommercialFinalPhysicalState;
  takeStructure: CommercialFinalTakeStructure;
  productVisibility: CommercialFinalProductVisibility;
  physicalResources: CommercialFinalPhysicalResource[];
  device: CommercialFinalDeviceContract;
  signature: CommercialFinalSignatureContract;
  camera: CommercialFinalCameraAuthority;
  ending: CommercialFinalEnding;
  renderPolicy: CommercialFinalRenderPolicy;
  source: {
    basePlan: CommercialFilmPlan;
    treatment: CommercialCreativeTreatment;
    brandSignOff: CommercialBrandSignOff;
    canonicalCompiledText: string;
    productionCompiledText: string;
  };
  validation: {
    status: CommercialFinalExecutionPlanStatus;
    checks: CommercialFinalExecutionCheck[];
    diagnostics: CommercialFinalExecutionDiagnostic[];
  };
};
