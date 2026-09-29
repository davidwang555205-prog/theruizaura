import type {
  CommercialFilmPlan,
  CommercialProductVisibility,
  CommercialShotRole,
} from "../types";

export type CommercialProductVisibilityState =
  | "ABSENT"
  | "IMPLIED"
  | "PARTIAL"
  | "SECONDARY"
  | "READABLE"
  | "DETAIL"
  | "HERO"
  | "RELEASE";

export type CommercialProductVisibilityTimelineBeat = {
  beatIndex: number;
  takeIndex: number;
  normalizedState: CommercialProductVisibilityState;
  sourcePresence: CommercialFilmPlan["productVisibilityPlan"]["presenceByShot"][number];
  sourceLegacyLevel: CommercialProductVisibility;
  sourceRole: CommercialShotRole;
  sourceStructureGoal: string;
  sourceRevealCause: string | null;
  roleCompatible: boolean;
  legacyCompatible: boolean;
};

export type CommercialProductRevealContract = {
  revealBeatIndex: number;
  takeIndex: number;
  fromVisibility: CommercialProductVisibilityState;
  toVisibility: CommercialProductVisibilityState;
  cause: string;
  requiredVisibleEvidence: string[];
  physicalResourceDependency: string[];
  productReferenceRequirement:
    | "EXTERNAL_REFERENCE_REQUIRED"
    | "CONFIRMED_REFERENCE_REQUIRED";
  cameraRequirement: string;
  firstDirectView: boolean;
  compatible: boolean;
};

export type CommercialProductVisibilityDiagnostic = {
  code: "VISIBILITY_CONFLICT" | "REVEAL_CONFLICT";
  beatIndex?: number;
  message: string;
};

export type CommercialProductVisibilityAuthority = {
  timeline: CommercialProductVisibilityTimelineBeat[];
  revealContract: CommercialProductRevealContract;
  diagnostics: CommercialProductVisibilityDiagnostic[];
};
