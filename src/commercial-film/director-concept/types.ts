import type { CommercialIntentId, CommercialShotRole } from "../types";
import type { CommercialCreativeSpinePlan } from "../creative-spine/types";
import type { CommercialCreativeDirectionPlan } from "../creative-direction/types";
import type { CommercialEventSpinePlan } from "../event-spine/types";

export const COMMERCIAL_DIRECTOR_CONCEPT_SCHEMA_VERSION =
  "commercial-film/director-concept-v1.3" as const;
export const COMMERCIAL_DIRECTOR_CONCEPT_VERSION = "1.3.0" as const;

export type CommercialDirectorConceptId =
  | "STATIC_CAMERA_FILM"
  | "PARTIAL_OBSCURATION"
  | "EDGE_OF_FRAME"
  | "THRESHOLD_CHAIN"
  | "REFLECTION_WORLD"
  | "LIGHT_REVEAL"
  | "WORLD_MOVES_SUBJECT_SETTLES"
  | "REPEATED_GESTURE";

export type CommercialDirectorContribution =
  | "PRIMARY"
  | "SUPPORTING"
  | "REST"
  | "RESOLUTION";

export type CommercialGraphicComposition = {
  negativeSpace: string;
  asymmetricWeight: string;
  frameWithinFrame: string;
  foregroundLayer: string;
  deepPlane: string;
  edgePlacement: string;
  geometricDivision: string;
};

export type CommercialDirectorConceptShot = {
  shotIndex: number;
  shotRole: CommercialShotRole;
  contribution: CommercialDirectorContribution;
  conceptRule: string;
  graphicComposition: CommercialGraphicComposition;
  productDiscovery: string;
  heroConvergence: string | null;
  releaseConvergence: string | null;
};

export type CommercialDirectorConceptQcGateId =
  | "director_concept_missing"
  | "director_concept_weak"
  | "director_concept_only_one_shot"
  | "director_concept_mechanical_repetition"
  | "director_concept_break"
  | "director_concept_product_disconnect"
  | "pseudo_luxury_device";

export type CommercialDirectorConceptQcGate = {
  id: CommercialDirectorConceptQcGateId;
  code:
    | "DIRECTOR_CONCEPT_MISSING"
    | "DIRECTOR_CONCEPT_WEAK"
    | "DIRECTOR_CONCEPT_ONLY_ONE_SHOT"
    | "DIRECTOR_CONCEPT_MECHANICAL_REPETITION"
    | "DIRECTOR_CONCEPT_BREAK"
    | "DIRECTOR_CONCEPT_PRODUCT_DISCONNECT"
    | "PSEUDO_LUXURY_DEVICE";
  label: string;
  status: "PASS" | "FAIL";
  reason: string;
};

export type CommercialDirectorConceptQc = Record<
  CommercialDirectorConceptQcGateId,
  CommercialDirectorConceptQcGate
>;

export type CommercialDirectorConceptPlan = {
  schemaVersion: typeof COMMERCIAL_DIRECTOR_CONCEPT_SCHEMA_VERSION;
  plannerVersion: typeof COMMERCIAL_DIRECTOR_CONCEPT_VERSION;
  concept: CommercialDirectorConceptId;
  label: string;
  globalRule: string;
  soundRule: string;
  heroRule: string;
  releaseRule: string;
  shots: CommercialDirectorConceptShot[];
  qc: CommercialDirectorConceptQc;
  failureReasons?: string[];
};

export type CommercialDirectorConceptPlannerInput = {
  commercialIntent: CommercialIntentId;
  creativeSpine: CommercialCreativeSpinePlan;
  creativeDirection: CommercialCreativeDirectionPlan;
  eventSpine: CommercialEventSpinePlan;
  generationNonce: number;
  override?: CommercialDirectorConceptId;
};
