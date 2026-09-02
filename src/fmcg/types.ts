export type ProductCategory = "footwear" | "fmcg";

export type FmcgCategory =
  | "beauty_skincare"
  | "beverage"
  | "food_snack"
  | "personal_care"
  | "household_cleaning"
  | "fragrance";

export type FmcgTopicId =
  | "lifestyle_soft_seeding"
  | "product_development_behind_scenes"
  | "autumn_winter_color_lab"
  | "styling_solution"
  | "material_craft_education"
  | "brand_aesthetic_viewpoint"
  | "launch_conversion"
  | "studio_launch_shoot";

export type FmcgImageCount = 1 | 3 | 5 | 8;
export type FmcgSeason = "春" | "夏" | "秋" | "冬";

export type FmcgReferenceRole =
  | "primary_product_reference"
  | "front_packaging_reference"
  | "side_packaging_reference"
  | "back_packaging_reference"
  | "closure_reference"
  | "dispenser_reference"
  | "label_reference"
  | "logo_reference"
  | "content_reference"
  | "secondary_packaging_reference"
  | "scale_reference"
  | "usage_reference"
  | "unclassified";

export type FmcgCoverage =
  | "overall_package_silhouette"
  | "front_panel_layout"
  | "side_panel_layout"
  | "back_panel_layout"
  | "closure_structure"
  | "dispenser_structure"
  | "label_relationship"
  | "logo_relationship"
  | "color_blocking"
  | "visible_content_state"
  | "secondary_packaging_relationship"
  | "product_scale";

export type FmcgReferenceAsset = {
  id: string;
  name: string;
  originalUploadIndex: number;
  role: FmcgReferenceRole;
  confirmedByUser: boolean;
};

export type FmcgProductFact = {
  value: "unknown";
  evidenceAssetIds: string[];
  extractionSource: "not_extracted";
};

export type FmcgProductTruth = {
  productCategory: "fmcg";
  fmcgCategory: FmcgCategory;
  productTruthMode: "reference_bound";
  referenceEvidenceBound: boolean;
  structuredFactsExtracted: false;
  manualExecutionReady: boolean;
  providerExecutionReady: false;
  productionReady: false;
  facts: Record<FmcgCoverage, FmcgProductFact>;
  coverage: FmcgCoverage[];
  missingCoverage: FmcgCoverage[];
};

export type FmcgReferencePlan = {
  provider: "image2";
  productCategory: "fmcg";
  orderedAssets: Array<{
    assetId: string;
    role: FmcgReferenceRole;
    coverage: FmcgCoverage[];
    priority: number;
  }>;
  order: string[];
  referencePlanReady: boolean;
  manualExecutionReady: boolean;
  providerExecutionReady: false;
  diagnostics: string[];
};

export type FmcgThemeCard = {
  id: string;
  title: string;
  purpose: string;
  scene: string;
  composition: string;
  action: string;
  evidenceRole: string;
};

export type FmcgPromptInput = {
  fmcgCategory: FmcgCategory;
  topicId: FmcgTopicId;
  imageCount: FmcgImageCount;
  season: FmcgSeason;
  productName: string;
  confirmedProductDescription: string;
  confirmedClaims: string;
  brandVisual: string;
  extraRequirement: string;
  generationNonce: number;
  productTruth: FmcgProductTruth;
  referencePlan: FmcgReferencePlan;
};

export type FmcgCompiledCard = FmcgThemeCard & {
  index: number;
  prompt: string;
};

export type FmcgCompiledSet = {
  productCategory: "fmcg";
  topicId: FmcgTopicId;
  cards: FmcgCompiledCard[];
};
