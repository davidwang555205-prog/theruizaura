import type { NarrativePlanStatus } from "../types";
import type { ResolvedMoment, SceneResolverStatus } from "../scene-resolver";

export type ProductPresenceLevel =
  | "ABSENT"
  | "INCIDENTAL"
  | "READABLE"
  | "HERO";

export type ProductPresenceRequirement = {
  visibilityRequired: boolean;
  fullShoeRequired: boolean;
  heroEvidenceRequired: boolean;
};

export type ProductPresenceMoment = {
  momentIndex: number;
  sceneId: string;
  originalWhatHappens: string;
  presence: ProductPresenceLevel;
  reason: string;
  productRequirement: ProductPresenceRequirement;
};

export type ProductPresenceQcGateId =
  | "narrative_preserved"
  | "product_not_forced"
  | "sufficient_product_evidence"
  | "no_overexposure";

export type ProductPresenceQcGate = {
  id: ProductPresenceQcGateId;
  label: string;
  status: "PASS" | "FAIL";
  reason: string;
};

export type ProductPresenceQc = Record<ProductPresenceQcGateId, ProductPresenceQcGate>;

export type ProductPresenceStatus =
  | "PRODUCT_PRESENCE_APPROVED"
  | "PRODUCT_PRESENCE_FAILED";

export type ProductPresenceInput = {
  narrativeStatus: NarrativePlanStatus;
  sceneResolutionStatus: SceneResolverStatus;
  topic: string;
  duration: number;
  moments: ResolvedMoment[];
};

export type ProductPresenceRule = {
  topic: string;
  label: string;
  baseline: ProductPresenceLevel[];
  description: string;
};

export type ProductPresenceOptions = {
  rules?: ProductPresenceRule[];
};

export type ProductPresenceOutput = {
  narrativeStatus: NarrativePlanStatus;
  sceneResolutionStatus: SceneResolverStatus;
  topic: string;
  duration: number;
  curve: ProductPresenceMoment[];
  qc: ProductPresenceQc;
  status: ProductPresenceStatus;
  failureReasons?: string[];
};
