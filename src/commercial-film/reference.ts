import type {
  Image2ReferencePlan,
  ProductCoverage,
  TaskProductTruth,
  TaskReferenceSet,
} from "../visual-system/taskReferenceBinding";
import type {
  CommercialReferenceInput,
  CommercialReferenceState,
} from "./types";

const ALL_PRODUCT_COVERAGE: ProductCoverage[] = [
  "silhouette",
  "toe_structure",
  "side_panel_structure",
  "heel_structure",
  "outsole_profile",
  "color_blocking",
  "material_evidence",
];

export function buildCommercialReferenceInput(
  referenceSet: TaskReferenceSet,
  productTruth: TaskProductTruth,
  referencePlan: Image2ReferencePlan
): CommercialReferenceInput {
  const confirmedAssets = referenceSet.assets.filter((asset) => (
    asset.confirmedByUser && !asset.roles.includes("unclassified")
  ));
  const coverage = ALL_PRODUCT_COVERAGE.filter((item) => (
    confirmedAssets.some((asset) => asset.coverage.includes(item))
  ));
  const confirmed = confirmedAssets.length > 0
    && confirmedAssets.length === referenceSet.assets.length
    && referenceSet.confirmationStatus === "confirmed";

  return {
    referenceSetId: referenceSet.referenceSetId,
    taskId: referenceSet.taskId,
    sourceType: "current_task_reference_set",
    confirmationStatus: confirmed ? "confirmed" : "incomplete",
    confirmedReferenceCount: confirmedAssets.length,
    confirmedAssetIds: confirmedAssets.map((asset) => asset.id),
    coverage,
    missingCoverage: ALL_PRODUCT_COVERAGE.filter((item) => !coverage.includes(item)),
    referencePlanReady: referencePlan.referencePlanReady && confirmed,
    productTruthMode: "reference_bound",
    productTruth,
  };
}

export function resolveCommercialReferenceState(
  reference: CommercialReferenceInput
): CommercialReferenceState {
  return {
    ...reference,
    status: "REFERENCE_READY",
    instruction: reference.confirmedReferenceCount === 0
      ? "No AURA-internal product reference is required for script generation. Product identity is supplied later by the external Seedance workflow."
      : reference.confirmationStatus === "confirmed" && reference.referencePlanReady
        ? "The current task reference set is confirmed and bound. Product Message may use only the coverage established by these references."
        : "AURA-internal references are optional. The script will use only confirmed internal coverage, if any, and defer final product identity to external Seedance references.",
  };
}

export function coverageSupports(
  reference: CommercialReferenceInput,
  coverage: ProductCoverage[]
) {
  return coverage.every((item) => reference.coverage.includes(item));
}
