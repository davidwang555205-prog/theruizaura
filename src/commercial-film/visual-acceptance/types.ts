import type {
  CommercialDirectorConceptId,
} from "../director-concept/types";
import type { CommercialIntentId } from "../types";

export const COMMERCIAL_VISUAL_ACCEPTANCE_SCHEMA_VERSION =
  "commercial-film/visual-acceptance-v1.3-final" as const;
export const COMMERCIAL_VISUAL_ACCEPTANCE_BASELINE_SCHEMA_VERSION =
  "commercial-film/visual-acceptance-baseline-v1.3-final" as const;
export const COMMERCIAL_VISUAL_ACCEPTANCE_ASPECT_RATIO = "9:16" as const;

export type CommercialVisualAcceptanceAspectRatio =
  typeof COMMERCIAL_VISUAL_ACCEPTANCE_ASPECT_RATIO;

export type CommercialVisualReviewStatus =
  | "NOT_REVIEWED"
  | "PASS"
  | "FAIL"
  | "INCONCLUSIVE";

export type CommercialVisualFinalStatus =
  | "NOT_VERIFIED"
  | "INCONCLUSIVE"
  | "FAIL"
  | "PRODUCTION_VERIFIED";

export type CommercialVisualFailureCode =
  | "CONCEPT_NOT_VISIBLE"
  | "CONCEPT_TOO_WEAK"
  | "CONCEPT_ONE_SHOT_ONLY"
  | "CONCEPT_EXECUTION_COLLAPSE"
  | "CINEMATIC_DEVICE_NOT_VISIBLE"
  | "CINEMATIC_DEVICE_ONE_SHOT_ONLY"
  | "CINEMATIC_DEVICE_MECHANICAL"
  | "CAMERA_INSTRUCTION_IGNORED"
  | "CAMERA_OVER_EXECUTED"
  | "TRANSITION_INSTRUCTION_IGNORED"
  | "INTENT_OVERRIDDEN_BY_CONCEPT"
  | "CROSS_CONCEPT_VISUAL_COLLAPSE"
  | "PRODUCT_VISUAL_DISCONNECT"
  | "PRODUCT_TOO_DOMINANT"
  | "PRODUCT_TOO_WEAK"
  | "WORLD_REALISM_COLLAPSE"
  | "BACKGROUND_ACTIVITY_COLLAPSE"
  | "ENDING_NOT_EXECUTED"
  | "SEEDANCE_OVER_INTERPRETATION"
  | "SEEDANCE_UNDER_INTERPRETATION"
  | "CHARACTER_CONTINUITY_FAILURE"
  | "PRODUCT_CONTINUITY_FAILURE";

export const COMMERCIAL_VISUAL_FAILURE_CODES: CommercialVisualFailureCode[] = [
  "CONCEPT_NOT_VISIBLE",
  "CONCEPT_TOO_WEAK",
  "CONCEPT_ONE_SHOT_ONLY",
  "CONCEPT_EXECUTION_COLLAPSE",
  "CINEMATIC_DEVICE_NOT_VISIBLE",
  "CINEMATIC_DEVICE_ONE_SHOT_ONLY",
  "CINEMATIC_DEVICE_MECHANICAL",
  "CAMERA_INSTRUCTION_IGNORED",
  "CAMERA_OVER_EXECUTED",
  "TRANSITION_INSTRUCTION_IGNORED",
  "INTENT_OVERRIDDEN_BY_CONCEPT",
  "CROSS_CONCEPT_VISUAL_COLLAPSE",
  "PRODUCT_VISUAL_DISCONNECT",
  "PRODUCT_TOO_DOMINANT",
  "PRODUCT_TOO_WEAK",
  "WORLD_REALISM_COLLAPSE",
  "BACKGROUND_ACTIVITY_COLLAPSE",
  "ENDING_NOT_EXECUTED",
  "SEEDANCE_OVER_INTERPRETATION",
  "SEEDANCE_UNDER_INTERPRETATION",
  "CHARACTER_CONTINUITY_FAILURE",
  "PRODUCT_CONTINUITY_FAILURE",
];

export type CommercialVisualReviewDimensions = {
  conceptVisibility: CommercialVisualReviewStatus | null;
  conceptContinuity: CommercialVisualReviewStatus | null;
  cinematicDeviceVisibility: CommercialVisualReviewStatus | null;
  cinematicDeviceContinuity: CommercialVisualReviewStatus | null;
  intentIntegrity: CommercialVisualReviewStatus | null;
  productIntegration: CommercialVisualReviewStatus | null;
  cameraExecution: CommercialVisualReviewStatus | null;
  transitionExecution: CommercialVisualReviewStatus | null;
  worldRealism: CommercialVisualReviewStatus | null;
  endingExecution: CommercialVisualReviewStatus | null;
};

export type CommercialVisualAcceptanceResult = CommercialVisualReviewDimensions & {
  caseId: string;
  seedanceModel: string | null;
  seedanceVersion: string | null;
  attempt: number | null;
  sameReferenceSet: boolean | null;
  sameDuration: boolean | null;
  sameAspectRatio: boolean | null;
  sameGenerationSettings: boolean | null;
  videoReference: string | null;
  reviewStatus: CommercialVisualReviewStatus;
  notes: string;
  failureCodes: CommercialVisualFailureCode[];
};

export type CommercialVisualAcceptanceCase = {
  caseId: string;
  group: "A" | "B";
  intent: CommercialIntentId;
  directorConceptId: CommercialDirectorConceptId;
  cinematicDevice: string;
  generationNonce: number;
  duration: 15;
  aspectRatio: CommercialVisualAcceptanceAspectRatio;
  directorPlanSummary: {
    concept: CommercialDirectorConceptId;
    label: string;
    globalRule: string;
    heroRule: string;
    releaseRule: string;
    shotContributions: string[];
  };
  eventSpineSummary: {
    centralEvent: string;
    eventChain: string[];
    durationPlan: number[];
    endingGrammar: string;
  };
  shotCount: number;
  productRevealStrategy: string;
  transitionStrategy: string[];
  endingStrategy: string;
  canonicalCompiledText: string;
  scriptValidationStatus: "COMMERCIAL_EXECUTION_VALIDATED";
  visualReviewStatus: CommercialVisualReviewStatus;
};

export type CommercialVisualAcceptanceControlContract = {
  sameProduct: true;
  sameReferenceSet: true;
  sameSeedanceModelVersion: true;
  sameDuration: true;
  sameAspectRatio: true;
  sameGenerationSettingsWherePossible: true;
  canonicalTextOnly: true;
  noPerCasePromptEditing: true;
  noBestOfSelection: true;
  attemptsMustBeRecorded: true;
  visualReviewerMustNotSeeDebugMetadata: true;
  providerExecutionByHarness: false;
};

export type CommercialVisualAcceptanceMatrix = {
  schemaVersion: typeof COMMERCIAL_VISUAL_ACCEPTANCE_SCHEMA_VERSION;
  controlContract: CommercialVisualAcceptanceControlContract;
  cases: CommercialVisualAcceptanceCase[];
  reviewResults: CommercialVisualAcceptanceResult[];
  finalVisualStatus: CommercialVisualFinalStatus;
};

export type CommercialCanonicalCaseBaseline = {
  caseId: string;
  intent: CommercialIntentId;
  directorConceptId: CommercialDirectorConceptId;
  generationNonce: number;
  duration: 15;
  aspectRatio: CommercialVisualAcceptanceAspectRatio;
  canonicalInputSha256: string;
  directorPlanSha256: string;
  compiledTextSha256: string;
};

export type CommercialProtectedSourceBaseline = {
  path: string;
  sha256: string;
};

export type CommercialCanonicalBaseline = {
  schemaVersion: typeof COMMERCIAL_VISUAL_ACCEPTANCE_BASELINE_SCHEMA_VERSION;
  stage: "COMMERCIAL_FILM_V1.3_CANONICAL_BASELINE";
  hashAlgorithm: "sha256";
  cases: CommercialCanonicalCaseBaseline[];
  protectedSources: CommercialProtectedSourceBaseline[];
};
