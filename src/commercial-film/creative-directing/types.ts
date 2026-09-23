import type {
  CommercialFilmPlan,
  CommercialIntentId,
  CommercialShotRole,
} from "../types";
import type { CommercialFilmPipelineGenerated } from "../pipeline";
import type { CommercialDirectorConceptId } from "../director-concept/types";
import type { CommercialBrandSignOff } from "../brand-signoff/types";

export const COMMERCIAL_CREATIVE_DIRECTING_SCHEMA_VERSION =
  "commercial-film/creative-directing-v1.4" as const;
export const COMMERCIAL_CREATIVE_DIRECTING_VERSION = "1.4.0" as const;

export type CommercialV14StructureType =
  | "CLASSIC_FIVE_ROLE"
  | "OBSCURE_REVEAL_INTERRUPT_RESOLVE_DISAPPEAR"
  | "MOVE_MOVE_HOLD_SINGLE_ACTION_RELEASE"
  | "OBSERVE_APPROACH_CONTACT_RESOLVE_AFTERIMAGE"
  | "REPEAT_REPEAT_CHANGE_BREAK_HERO_RELEASE"
  | "ARRIVE_DISCOVER_INTERACT_SETTLE_REMAIN";

export type CommercialV14DeviceIntensity = "LOW" | "MEDIUM" | "HIGH" | "CLEAR";
export type CommercialV14VisualPriority = {
  primary: string;
  secondary: string;
  suppressed: string;
};

export type CommercialCreativeProposition = {
  internalMeaning: string;
  presentationText: string;
  tension: {
    from: string;
    to: string;
    line: string;
  };
};

export type CommercialSignatureEvent = {
  id: string;
  family: string;
  whoOrWhat: string;
  action: string;
  where: string;
  event: string;
  cause: string;
  beforeState: string;
  afterState: string;
  visualResult: string;
  nextBeatTrigger: string;
  nextBeatConsequence: string;
  sourceShotIndex: number;
  productConnection: string;
  eventRevealLink: {
    eventResult: string;
    revealChange: string;
    causalConnection: string;
  };
};

export type CommercialSignatureMoment = {
  id: string;
  mechanism: string;
  momentDescription: string;
  beforeMoment: string;
  visualInterruption: string;
  afterMoment: string;
  productRole: string;
  worldRole: string;
  deviceRole: string;
  memoryReason: string;
  signatureBeatIndex: number;
  location: string;
  carrier: string;
};

export type CommercialV14EventBeat = {
  beatIndex: number;
  structureRole: string;
  sourceShotRole: CommercialShotRole;
  sourceEvent: string;
  cause: string;
  event: string;
  beforeState: string;
  afterState: string;
  visualResult: string;
  nextBeatTrigger: string;
  nextBeatConsequence: string;
  productVisibilityGoal: string;
  productRevealCause: string | null;
  visualPriority: CommercialV14VisualPriority;
};

export type CommercialDeviceArcBeat = {
  beatIndex: number;
  deviceState: string;
  deviceCarrier: string;
  deviceIntensity: CommercialV14DeviceIntensity;
  deviceFunction: string;
};

export type CommercialStructureBeat = {
  beatIndex: number;
  structureRole: string;
  sourceShotRole: CommercialShotRole;
  function: string;
  productVisibilityGoal: string;
};

export type CommercialProductRevealLogic = {
  cause: string;
  consequence: string;
  productVisibilityGoal: string;
  revealBeatIndex: number;
  eventRevealLink: CommercialSignatureEvent["eventRevealLink"];
};

export type CommercialCreativeTreatmentQcCode =
  | "GENERIC_EVENT_CHAIN"
  | "EVENT_CAUSALITY_TOO_WEAK"
  | "SIGNATURE_EVENT_MISSING"
  | "DEVICE_MECHANICAL_REPETITION"
  | "DEVICE_CARRIER_COLLAPSE"
  | "DEVICE_ARC_FLAT"
  | "STRUCTURE_FORCED_OVER_CONCEPT"
  | "SHOT_ROLE_TEMPLATE_COLLAPSE"
  | "UNNECESSARY_DETAIL_BEAT"
  | "UNNECESSARY_HERO_BEAT"
  | "FILM_STATE_DOES_NOT_CHANGE"
  | "PRODUCT_REVEAL_UNMOTIVATED"
  | "PRODUCT_REVEAL_TOO_EARLY"
  | "PRODUCT_REVEAL_TEMPLATE_DRIVEN"
  | "ENDING_IMAGE_ABSTRACT"
  | "ENDING_DUPLICATES_HERO"
  | "ENDING_NEW_UNRELATED_BEAT"
  | "GENERIC_COMMERCIAL_ACTION_CHAIN"
  | "CREATIVE_TREATMENT_SEMANTIC_CLONE"
  | "CREATIVE_PROPOSITION_SEMANTIC_CLONE"
  | "SIGNATURE_EVENT_REUSE"
  | "DEVICE_ARC_REUSE"
  | "SIGNATURE_EVENT_PLACEHOLDER"
  | "SIGNATURE_EVENT_NOT_FILMABLE"
  | "SIGNATURE_EVENT_OBJECT_UNRESOLVED"
  | "SIGNATURE_EVENT_NO_STATE_CHANGE"
  | "PRODUCT_REVEAL_CAUSAL_DISCONNECT"
  | "ENDING_IMAGE_NOT_LITERAL"
  | "ENDING_IMAGE_STATE_ONLY"
  | "ENDING_IMAGE_NOT_FILMABLE"
  | "PROPOSITION_TEMPLATE_SCAFFOLD"
  | "PROPOSITION_ONLY_PARAPHRASES_CONCEPT"
  | "DEVICE_CARRIER_EVENT_MISMATCH"
  | "DEVICE_CARRIER_FUNCTION_MISMATCH"
  | "SIGNATURE_MOMENT_GENERIC"
  | "SIGNATURE_MOMENT_STATE_ONLY"
  | "SIGNATURE_MOMENT_NOT_FILMABLE"
  | "SIGNATURE_MOMENT_NO_VISUAL_CHANGE"
  | "SIGNATURE_MOMENT_PRODUCT_SHOT_ONLY"
  | "SIGNATURE_MOMENT_TOO_ABSTRACT"
  | "SIGNATURE_MOMENT_STRUCTURE_DISCONNECT"
  | "DEVICE_ARC_IGNORES_SIGNATURE_MOMENT"
  | "PRODUCT_ROLE_FORCED_INTO_SIGNATURE_MOMENT"
  | "ENDING_DOES_NOT_RESOLVE_SIGNATURE_MOMENT"
  | "SIGNATURE_MOMENT_MECHANISM_COLLAPSE";

export type CommercialCreativeTreatmentQcGate = {
  code: CommercialCreativeTreatmentQcCode;
  status: "PASS" | "FAIL";
  reason: string;
};

export type CommercialTreatmentSemanticFingerprint = {
  propositionCore: string;
  signatureEventMechanism: string;
  signatureEventObject: string;
  eventCausality: string;
  deviceArcProgression: string;
  productRevealCause: string;
  endingImageMechanism: string;
};

export type CommercialCreativeTreatment = {
  schemaVersion: typeof COMMERCIAL_CREATIVE_DIRECTING_SCHEMA_VERSION;
  plannerVersion: typeof COMMERCIAL_CREATIVE_DIRECTING_VERSION;
  commercialIntent: CommercialIntentId;
  directorConceptId: CommercialDirectorConceptId;
  title: string;
  creativeProposition: CommercialCreativeProposition;
  propositionCore: string;
  signatureMoment: CommercialSignatureMoment;
  directorConcept: string;
  cinematicDevice: string;
  filmTension: CommercialCreativeProposition["tension"];
  signatureEvent: CommercialSignatureEvent;
  preMomentEvents: CommercialV14EventBeat[];
  postMomentEvents: CommercialV14EventBeat[];
  eventSequence: CommercialV14EventBeat[];
  deviceArc: CommercialDeviceArcBeat[];
  structureType: CommercialV14StructureType;
  structure: CommercialStructureBeat[];
  productRevealLogic: CommercialProductRevealLogic;
  endingImage: string;
  endingMeaning: string;
  worldBehavior: string;
  shotVisualPriorities: CommercialV14VisualPriority[];
  semanticFingerprint: CommercialTreatmentSemanticFingerprint;
  qc: CommercialCreativeTreatmentQcGate[];
  failureReasons?: string[];
};

export type CommercialV14Presentation = {
  canonicalCompiledText: string;
  v14CompiledText: string;
  presentationScript: string;
  sourceEvents: string[];
  treatment: CommercialCreativeTreatment;
  brandSignOff: CommercialBrandSignOff;
};

export type CommercialV14Plan = {
  schemaVersion: typeof COMMERCIAL_CREATIVE_DIRECTING_SCHEMA_VERSION;
  plannerVersion: typeof COMMERCIAL_CREATIVE_DIRECTING_VERSION;
  basePlan: CommercialFilmPlan;
  creativeTreatment: CommercialCreativeTreatment;
  canonicalCompiledText: string;
  v14CompiledText: string;
  presentation: CommercialV14Presentation;
};

export type CommercialV14PipelineGenerated = {
  status: "GENERATED";
  baseOutcome: CommercialFilmPipelineGenerated;
  plan: CommercialV14Plan;
  translationExtension: string;
  stages: {
    v13Baseline: "GENERATED";
    creativeDirecting: "GENERATED";
    seedanceExtension: "GENERATED";
    presentation: "GENERATED";
  };
};

export type CommercialV14PipelineBlocked = {
  status: "BLOCKED";
  code: "V13_BASELINE_BLOCKED" | "CREATIVE_DIRECTING_FAILED";
  reason: string;
  diagnostics: string[];
};

export type CommercialV14PipelineOutcome =
  | CommercialV14PipelineGenerated
  | CommercialV14PipelineBlocked;

export type CommercialV14AcceptanceCase = {
  caseId: string;
  group: "A" | "B";
  intent: CommercialIntentId;
  directorConceptId: CommercialDirectorConceptId;
  generationNonce: number;
  title: string;
  creativeProposition: string;
  signatureEvent: string;
  deviceArc: CommercialDeviceArcBeat[];
  structureType: CommercialV14StructureType;
  endingImage: string;
  productRevealCause: string;
  shotVisualPriorities: CommercialV14VisualPriority[];
  canonicalCompiledText: string;
  canonicalCompiledTextFingerprint: string;
  v14CompiledText: string;
  presentationScript: string;
  creativeTreatment: CommercialCreativeTreatment;
};

export type CommercialV14AcceptanceMatrix = {
  schemaVersion: typeof COMMERCIAL_CREATIVE_DIRECTING_SCHEMA_VERSION;
  cases: CommercialV14AcceptanceCase[];
  classicStructureCases: number;
  nonClassicStructureCases: number;
  finalVisualStatus: "NOT_VERIFIED";
};
