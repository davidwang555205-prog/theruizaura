import type {
  CommercialDirectorConceptId,
  CommercialDirectorConceptPlan,
} from "../director-concept/types";
import type { CommercialFilmPlan, CommercialFilmPlannerInput } from "../types";
import type { CommercialCreativeTreatment } from "../creative-directing/types";
import type { CommercialProductVisibilityAuthority } from "../product-visibility/types";
import type { CommercialFinalPhysicalResource } from "../final-execution/types";
import type { CommercialDirectorConceptEligibility } from "./capabilities";

export type CommercialAuthorityMode = "AUTO" | "FORCED";

export type CommercialAuthorityConsolidationBlockedCode =
  | "NO_EXECUTABLE_DIRECTOR_CONCEPT"
  | "DIRECTOR_CONCEPT_RESOURCE_INCOMPATIBLE"
  | "DIRECTOR_CONCEPT_CAMERA_INCOMPATIBLE"
  | "DIRECTOR_CONCEPT_EVENT_INCOMPATIBLE";

export type CommercialAuthorityConsolidationGenerated = {
  status: "GENERATED";
  mode: CommercialAuthorityMode;
  effectiveDirectorConceptId: CommercialDirectorConceptId;
  effectiveDirectorConcept: CommercialDirectorConceptPlan;
  effectivePlan: CommercialFilmPlan;
  resourcePlan: {
    primaryResource: CommercialFinalPhysicalResource | null;
    resourceIds: string[];
  };
  productVisibility: CommercialProductVisibilityAuthority;
  treatment: CommercialCreativeTreatment;
  eligibility: CommercialDirectorConceptEligibility[];
};

export type CommercialAuthorityConsolidationBlocked = {
  status: "BLOCKED";
  code: CommercialAuthorityConsolidationBlockedCode;
  reason: string;
  diagnostics: string[];
  eligibility: CommercialDirectorConceptEligibility[];
};

export type CommercialAuthorityConsolidationInput = {
  basePlan: CommercialFilmPlan;
  input: CommercialFilmPlannerInput;
  generationNonce: number;
};

export type CommercialAuthorityConsolidationOutcome =
  | CommercialAuthorityConsolidationGenerated
  | CommercialAuthorityConsolidationBlocked;
