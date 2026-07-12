import type { ProductCategory, ProductFidelityLevel } from "./productProfile";

export type VisualImageType =
  | "footwearOnFoot"
  | "mirrorOutfit"
  | "lifestyle"
  | "nonProductAtmosphere"
  | "materialBehindTheScenes"
  | "productStillLife"
  | "apparelOnBody"
  | "apparelDetail"
  | "other";

export type CommercialIntensity = "low" | "balanced" | "medium" | "high";

export type ProductDisplayPriority =
  | "productDominant"
  | "productWithContext"
  | "balanced"
  | "atmosphereDominant";

export type SystemRecommendationTarget =
  | "model"
  | "scene"
  | "styling"
  | "action"
  | "gaze"
  | "lighting"
  | "composition"
  | "camera"
  | "imageMix";

export type BrandVisualConfig = {
  brandId: string;
  brandName: string;
  traits: string[];
  commercialIntensity: CommercialIntensity;
  targetAgeRanges: string[];
  targetCustomerProfiles: string[];
  preferredSceneFamilies?: string[];
  preferredModelStyles?: string[];
  preferredColorDirections?: string[];
  prohibitedTags?: string[];
};

export type ProductVisualConfig = {
  productProfileId: string;
  category: ProductCategory;
  type: string;
  fidelityLevel: ProductFidelityLevel;
  focusPoints: string[];
  immutableAttributes?: string[];
};

export type ProjectVisualBrief = {
  projectId?: string;
  platform: string;
  businessGoal: string;
  imageType: VisualImageType;
  imageCount?: number;
  season?: string;
  scenePreferences: string[];
  modelStyle?: string;
  modelAgeRange?: string;
  garmentTypePreference?: string;
  productDisplayPriority: ProductDisplayPriority;
  lightingPreference?: string;
  compositionPreference?: string;
  gazePreference?: string;
  actionPreference?: string;
  negativePreferences: string[];
  systemRecommend: SystemRecommendationTarget[];
  customerExtraRequirement?: string;
};

/**
 * Stable intermediate representation between a customer questionnaire and the
 * current prompt engine. Customer answers should be normalized here before any
 * prompt module or legacy template is selected.
 */
export type VisualConfig = {
  schemaVersion: 1;
  brand: BrandVisualConfig;
  product: ProductVisualConfig;
  project: ProjectVisualBrief;
  humanReviewRequired: boolean;
  reviewReasons: string[];
};

export function createVisualConfig(input: Omit<VisualConfig, "schemaVersion">): VisualConfig {
  return {
    schemaVersion: 1,
    ...input
  };
}
