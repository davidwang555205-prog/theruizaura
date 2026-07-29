import type { ProductTruth, ProductTruthConfidence } from "./types";

export type ReferenceAssetRole =
  | "primary_product_reference"
  | "full_product_reference"
  | "outer_side_reference"
  | "inner_side_reference"
  | "top_view_reference"
  | "toe_reference"
  | "heel_reference"
  | "outsole_reference"
  | "material_reference"
  | "color_reference"
  | "construction_detail_reference"
  | "logo_detail_reference"
  | "on_foot_reference"
  | "unclassified";

export type ProductCoverage = "silhouette" | "toe_structure" | "side_panel_structure" | "heel_structure" | "outsole_profile" | "color_blocking" | "material_evidence";
export type ReferenceAssignmentSource = "automatic" | "heuristic" | "user_confirmed" | "manually_assigned" | "unclassified";
export type TaskReferenceAsset = {
  id: string;
  name: string;
  mime: string;
  width?: number;
  height?: number;
  originalUploadIndex: number;
  roles: ReferenceAssetRole[];
  coverage: ProductCoverage[];
  confidence: "high" | "medium" | "low" | "unknown";
  assignmentSource: ReferenceAssignmentSource;
  needsConfirmation: boolean;
  confirmedByUser: boolean;
};

export type TaskReferenceSet = {
  referenceSetId: string;
  taskId: string;
  sourceType: "uploaded_reference_set";
  productCategory: "footwear";
  assetIds: string[];
  originalUploadOrder: string[];
  createdAt: string;
  analysisStatus: "manual_confirmation_required" | "confirmed";
  confirmationStatus: "incomplete" | "confirmed";
  assets: TaskReferenceAsset[];
};

export type Image2ReferencePlan = {
  provider: "image2";
  referenceSetId: string;
  orderedAssets: Array<{ assetId: string; roles: ReferenceAssetRole[]; priority: number; required: boolean; coverage: ProductCoverage[]; reason: string; cardApplicability: "all" }>;
  assetIds: string[];
  order: string[];
  referencePlanReady: boolean;
  manualExecutionReady: boolean;
  providerExecutionReady: false;
  diagnostics: string[];
};

export type TaskProductFact = {
  value: "unknown";
  evidenceAssetIds: string[];
  extractionSource: "not_extracted";
};

export type TaskProductTruth = ProductTruth & {
  taskProductTruthId: string;
  referenceSetId: string;
  sourceType: "uploaded_reference_set";
  productCategory: "footwear";
  version: "v1";
  status: "draft" | "blocked";
  productTruthMode: "reference_bound";
  referenceEvidenceBound: boolean;
  structuredFactsExtracted: false;
  manualExecutionReady: boolean;
  providerExecutionReady: false;
  productionReady: false;
  facts: Record<ProductCoverage, TaskProductFact>;
  factEvidence: Partial<Record<ProductCoverage, string[]>>;
  coverage: ProductCoverage[];
  missingCoverage: ProductCoverage[];
  createdAt: string;
};

export const referenceRoleLabels: Record<ReferenceAssetRole, string> = {
  primary_product_reference: "主参考 / 完整覆盖",
  full_product_reference: "完整侧面 / 结构",
  outer_side_reference: "外侧面 / 结构",
  inner_side_reference: "内侧面 / 结构",
  top_view_reference: "俯视 / 鞋头",
  toe_reference: "鞋头 / 结构",
  heel_reference: "后跟 / 鞋底收口",
  outsole_reference: "鞋底 / 轮廓",
  material_reference: "材质 / 工艺细节",
  color_reference: "配色细节",
  construction_detail_reference: "结构 / 工艺细节",
  logo_detail_reference: "Logo 细节",
  on_foot_reference: "上脚辅助参考",
  unclassified: "尚未分类",
};

export type ReferencePlanDisplayItem = {
  index: number;
  assetId: string;
  fileName: string;
  role: ReferenceAssetRole;
  roleLabel: string;
};

export function buildReferencePlanDisplayItems(referenceSet: TaskReferenceSet, referencePlan: Image2ReferencePlan): ReferencePlanDisplayItem[] {
  const assetById = new Map(referenceSet.assets.map((asset) => [asset.id, asset]));
  return referencePlan.order.flatMap((assetId, index) => {
    const asset = assetById.get(assetId);
    if (!asset?.confirmedByUser || asset.roles.includes("unclassified")) return [];
    const role = asset.roles[0];
    return [{ index: index + 1, assetId, fileName: asset.name, role, roleLabel: referenceRoleLabels[role] }];
  });
}

export function buildReferenceBindingFingerprint(referenceSet: TaskReferenceSet, productTruth: TaskProductTruth, referencePlan: Image2ReferencePlan): string {
  return JSON.stringify({
    assetIds: referenceSet.assetIds,
    originalUploadOrder: referenceSet.originalUploadOrder,
    assets: referenceSet.assets.map((asset) => ({
      id: asset.id,
      roles: asset.roles,
      confirmedByUser: asset.confirmedByUser,
      confirmationStatus: asset.needsConfirmation ? "required" : "confirmed",
      coverage: asset.coverage,
    })),
    referencePlanOrder: referencePlan.order,
    productTruthMode: productTruth.productTruthMode,
    referenceEvidenceBound: productTruth.referenceEvidenceBound,
    referencePlanReady: referencePlan.referencePlanReady,
  });
}

export function isGeneratedPromptStale(currentFingerprint: string, generatedFingerprint: string): boolean {
  return currentFingerprint !== generatedFingerprint;
}

export function resolvePromptForCopy(input: {
  currentFingerprint: string;
  generatedFingerprint: string;
  generatedPrompt: string;
  compileLatest: () => string;
}): { prompt: string; bindingFingerprint: string; recompiled: boolean } {
  if (!isGeneratedPromptStale(input.currentFingerprint, input.generatedFingerprint)) {
    return { prompt: input.generatedPrompt, bindingFingerprint: input.generatedFingerprint, recompiled: false };
  }
  return { prompt: input.compileLatest(), bindingFingerprint: input.currentFingerprint, recompiled: true };
}

const requiredCoverage: ProductCoverage[] = ["silhouette", "toe_structure", "side_panel_structure", "heel_structure", "outsole_profile", "color_blocking", "material_evidence"];
const coverageByRole: Record<ReferenceAssetRole, ProductCoverage[]> = {
  primary_product_reference: ["silhouette", "toe_structure", "side_panel_structure", "heel_structure", "outsole_profile", "color_blocking", "material_evidence"],
  full_product_reference: ["silhouette", "side_panel_structure", "outsole_profile", "color_blocking"],
  outer_side_reference: ["silhouette", "side_panel_structure", "outsole_profile", "color_blocking"],
  inner_side_reference: ["side_panel_structure", "outsole_profile", "color_blocking"],
  top_view_reference: ["toe_structure", "color_blocking"],
  toe_reference: ["toe_structure", "color_blocking", "material_evidence"],
  heel_reference: ["heel_structure", "outsole_profile", "color_blocking"],
  outsole_reference: ["outsole_profile"],
  material_reference: ["material_evidence", "color_blocking"],
  color_reference: ["color_blocking"],
  construction_detail_reference: ["side_panel_structure", "material_evidence"],
  logo_detail_reference: [],
  on_foot_reference: [],
  unclassified: [],
};
const rolePriority: Record<ReferenceAssetRole, number> = {
  primary_product_reference: 1, full_product_reference: 2, outer_side_reference: 2, inner_side_reference: 3,
  top_view_reference: 3, toe_reference: 3, heel_reference: 4, outsole_reference: 4,
  material_reference: 5, color_reference: 5, construction_detail_reference: 5, logo_detail_reference: 6,
  on_foot_reference: 7, unclassified: 99,
};

export function createTaskReferenceSet(input: Omit<TaskReferenceSet, "sourceType" | "productCategory" | "assetIds" | "originalUploadOrder" | "analysisStatus" | "confirmationStatus">): TaskReferenceSet {
  const assets = input.assets.map((asset) => ({ ...asset, coverage: [...new Set(asset.roles.flatMap((role) => coverageByRole[role]))] }));
  const confirmedAssets = assets.filter((asset) => asset.confirmedByUser && !asset.roles.includes("unclassified"));
  return {
    ...input,
    sourceType: "uploaded_reference_set",
    productCategory: "footwear",
    assetIds: assets.map((asset) => asset.id),
    originalUploadOrder: [...assets].sort((a, b) => a.originalUploadIndex - b.originalUploadIndex).map((asset) => asset.id),
    analysisStatus: "manual_confirmation_required",
    confirmationStatus: confirmedAssets.length > 0 && confirmedAssets.length === assets.length ? "confirmed" : "incomplete",
    assets,
  };
}

export function assignReferenceRole(asset: TaskReferenceAsset, role: ReferenceAssetRole): TaskReferenceAsset {
  const roles = role === "unclassified" ? [role] : [role];
  return { ...asset, roles, coverage: coverageByRole[role], confidence: role === "unclassified" ? "unknown" : "high", assignmentSource: role === "unclassified" ? "unclassified" : "user_confirmed", needsConfirmation: role === "unclassified", confirmedByUser: role !== "unclassified" };
}

export function bindTaskProductTruth(referenceSet: TaskReferenceSet): { productTruth: TaskProductTruth; referencePlan: Image2ReferencePlan } {
  const evidence = new Map<ProductCoverage, string[]>();
  for (const asset of referenceSet.assets.filter((item) => item.confirmedByUser)) for (const coverage of asset.coverage) evidence.set(coverage, [...(evidence.get(coverage) ?? []), asset.id]);
  const coverage = requiredCoverage.filter((item) => evidence.has(item));
  const missingCoverage = requiredCoverage.filter((item) => !evidence.has(item));
  const diagnostics = [
    ...(referenceSet.assets.length === 0 ? ["MISSING_REFERENCE_IMAGES"] : []),
    ...(referenceSet.assets.some((asset) => !asset.confirmedByUser) ? ["REFERENCE_ROLE_CONFIRMATION_REQUIRED"] : []),
    ...missingCoverage.map((item) => `MISSING_${item.toUpperCase()}`),
  ];
  const referenceEvidenceBound = diagnostics.length === 0;
  const referencePlanReady = referenceEvidenceBound;
  const manualExecutionReady = referencePlanReady;
  const confidence: ProductTruthConfidence = referenceSet.assets.length === 0 ? "Blocked" : referenceEvidenceBound ? "Medium" : "Low";
  const orderedAssets = referenceSet.assets
    .filter((asset) => asset.confirmedByUser)
    .sort((a, b) => Math.min(...a.roles.map((role) => rolePriority[role])) - Math.min(...b.roles.map((role) => rolePriority[role])) || a.originalUploadIndex - b.originalUploadIndex)
    .map((asset) => ({ assetId: asset.id, roles: asset.roles, priority: Math.min(...asset.roles.map((role) => rolePriority[role])), required: asset.coverage.some((item) => requiredCoverage.includes(item)), coverage: asset.coverage, reason: `confirmed ${asset.roles.join(", ")} evidence`, cardApplicability: "all" as const }));
  const productTruth: TaskProductTruth = {
    confidence,
    evidence: referenceSet.assets.filter((asset) => asset.confirmedByUser).map((asset) => ({ id: asset.id, name: asset.name, role: "overall_structure" })),
    missingEvidence: [],
    source: "current_task_uploaded_images",
    taskProductTruthId: `truth-${referenceSet.referenceSetId}`,
    referenceSetId: referenceSet.referenceSetId,
    sourceType: "uploaded_reference_set",
    productCategory: "footwear",
    version: "v1",
    status: referenceSet.assets.length === 0 ? "blocked" : "draft",
    productTruthMode: "reference_bound",
    referenceEvidenceBound,
    structuredFactsExtracted: false,
    manualExecutionReady,
    providerExecutionReady: false,
    productionReady: false,
    facts: Object.fromEntries(requiredCoverage.map((item) => [item, {
      value: "unknown",
      evidenceAssetIds: evidence.get(item) ?? [],
      extractionSource: "not_extracted",
    }])) as Record<ProductCoverage, TaskProductFact>,
    factEvidence: Object.fromEntries([...evidence]),
    coverage,
    missingCoverage,
    createdAt: referenceSet.createdAt,
  };
  return { productTruth, referencePlan: { provider: "image2", referenceSetId: referenceSet.referenceSetId, orderedAssets, assetIds: orderedAssets.map((item) => item.assetId), order: orderedAssets.map((item) => item.assetId), referencePlanReady, manualExecutionReady, providerExecutionReady: false, diagnostics } };
}

export function productTruthPromptLines(truth?: ProductTruth): string[] {
  const taskTruth = truth as TaskProductTruth | undefined;
  if (!taskTruth?.coverage?.length) return ["Use the uploaded footwear references as the only product source. Preserve only product features visibly confirmed by the current reference set; do not infer missing shape, material, color, construction, or branding details."];
  const labels: Record<ProductCoverage, string> = {
    silhouette: "overall silhouette shown in the confirmed silhouette references", toe_structure: "toe structure shown in the confirmed toe references", side_panel_structure: "side-panel relationships shown in the confirmed side references",
    heel_structure: "heel area shown in the confirmed heel references", outsole_profile: "outsole profile shown in the confirmed outsole references", color_blocking: "color relationships shown in the confirmed color references", material_evidence: "material zones shown in the confirmed material references",
  };
  const lines = [`Use the current confirmed uploaded reference set as the only product source. Preserve the ${taskTruth.coverage.map((item) => labels[item]).join(", ")}. Do not infer or name any specific product fact that has not been extracted or explicitly confirmed.`];
  if (taskTruth.coverage.includes("material_evidence")) lines.push("Preserve the exact material zones, surface finish, texture transitions, stitching relationships, and construction details shown in the confirmed material references.");
  return lines;
}
