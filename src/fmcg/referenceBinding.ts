import type {
  FmcgCategory,
  FmcgCoverage,
  FmcgProductTruth,
  FmcgReferenceAsset,
  FmcgReferencePlan,
  FmcgReferenceRole,
} from "./types";

export const fmcgReferenceRoleLabels: Record<FmcgReferenceRole, string> = {
  primary_product_reference: "主要产品参考",
  front_packaging_reference: "包装正面参考",
  side_packaging_reference: "包装侧面参考",
  back_packaging_reference: "包装背面参考",
  closure_reference: "盖体 / 封口参考",
  dispenser_reference: "泵头 / 喷头参考",
  label_reference: "标签版面参考",
  logo_reference: "Logo 位置参考",
  content_reference: "可见内容物参考",
  secondary_packaging_reference: "外盒 / 次级包装参考",
  scale_reference: "产品尺度参考",
  usage_reference: "真实使用方式参考",
  unclassified: "未分类",
};

const allCoverage: FmcgCoverage[] = [
  "overall_package_silhouette", "front_panel_layout", "side_panel_layout", "back_panel_layout",
  "closure_structure", "dispenser_structure", "label_relationship", "logo_relationship",
  "color_blocking", "visible_content_state", "secondary_packaging_relationship", "product_scale",
];

const coverageByRole: Record<FmcgReferenceRole, FmcgCoverage[]> = {
  primary_product_reference: ["overall_package_silhouette", "front_panel_layout", "closure_structure", "label_relationship", "logo_relationship", "color_blocking", "product_scale"],
  front_packaging_reference: ["overall_package_silhouette", "front_panel_layout", "label_relationship", "logo_relationship", "color_blocking"],
  side_packaging_reference: ["side_panel_layout", "overall_package_silhouette", "color_blocking"],
  back_packaging_reference: ["back_panel_layout", "overall_package_silhouette", "color_blocking"],
  closure_reference: ["closure_structure"],
  dispenser_reference: ["dispenser_structure"],
  label_reference: ["label_relationship"],
  logo_reference: ["logo_relationship"],
  content_reference: ["visible_content_state"],
  secondary_packaging_reference: ["secondary_packaging_relationship"],
  scale_reference: ["product_scale"],
  usage_reference: ["product_scale"],
  unclassified: [],
};

const priorityByRole: Record<FmcgReferenceRole, number> = {
  primary_product_reference: 1, front_packaging_reference: 2, side_packaging_reference: 3,
  back_packaging_reference: 4, closure_reference: 5, dispenser_reference: 5,
  label_reference: 6, logo_reference: 6, content_reference: 7,
  secondary_packaging_reference: 8, scale_reference: 9, usage_reference: 10, unclassified: 99,
};

function requiredCoverage(category: FmcgCategory): FmcgCoverage[] {
  const base: FmcgCoverage[] = ["overall_package_silhouette", "front_panel_layout", "label_relationship", "color_blocking", "product_scale"];
  if (category === "fragrance") return [...base, "closure_structure"];
  if (category === "beauty_skincare" || category === "personal_care" || category === "household_cleaning") return [...base, "closure_structure"];
  return base;
}

export function bindFmcgProductTruth(category: FmcgCategory, assets: FmcgReferenceAsset[]): {
  productTruth: FmcgProductTruth;
  referencePlan: FmcgReferencePlan;
} {
  const confirmed = assets.filter((asset) => asset.confirmedByUser && asset.role !== "unclassified");
  const evidence = new Map<FmcgCoverage, string[]>();
  for (const asset of confirmed) {
    for (const coverage of coverageByRole[asset.role]) {
      evidence.set(coverage, [...(evidence.get(coverage) ?? []), asset.id]);
    }
  }
  const required = requiredCoverage(category);
  const coverage = allCoverage.filter((item) => evidence.has(item));
  const missingCoverage = required.filter((item) => !evidence.has(item));
  const diagnostics = [
    ...(assets.length === 0 ? ["MISSING_REFERENCE_IMAGES"] : []),
    ...(assets.some((asset) => !asset.confirmedByUser) ? ["REFERENCE_ROLE_CONFIRMATION_REQUIRED"] : []),
    ...missingCoverage.map((item) => `MISSING_${item.toUpperCase()}`),
  ];
  const referenceEvidenceBound = diagnostics.length === 0;
  const orderedAssets = confirmed
    .map((asset) => ({ assetId: asset.id, role: asset.role, coverage: coverageByRole[asset.role], priority: priorityByRole[asset.role] }))
    .sort((a, b) => a.priority - b.priority || assets.findIndex((item) => item.id === a.assetId) - assets.findIndex((item) => item.id === b.assetId));
  const productTruth: FmcgProductTruth = {
    productCategory: "fmcg",
    fmcgCategory: category,
    productTruthMode: "reference_bound",
    referenceEvidenceBound,
    structuredFactsExtracted: false,
    manualExecutionReady: referenceEvidenceBound,
    providerExecutionReady: false,
    productionReady: false,
    facts: Object.fromEntries(allCoverage.map((item) => [item, {
      value: "unknown", evidenceAssetIds: evidence.get(item) ?? [], extractionSource: "not_extracted",
    }])) as Record<FmcgCoverage, FmcgProductTruth["facts"][FmcgCoverage]>,
    coverage,
    missingCoverage,
  };
  return {
    productTruth,
    referencePlan: {
      provider: "image2",
      productCategory: "fmcg",
      orderedAssets,
      order: orderedAssets.map((item) => item.assetId),
      referencePlanReady: referenceEvidenceBound,
      manualExecutionReady: referenceEvidenceBound,
      providerExecutionReady: false,
      diagnostics,
    },
  };
}

export function fmcgReferenceFingerprint(category: FmcgCategory, assets: FmcgReferenceAsset[]): string {
  return JSON.stringify({ productCategory: "fmcg", category, assets: assets.map(({ id, originalUploadIndex, role, confirmedByUser }) => ({ id, originalUploadIndex, role, confirmedByUser })) });
}
