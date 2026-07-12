import type { ProductPromptAdapter } from "../productAdapter";
import type { ProductAdapterInput, ProductPresenceInput } from "../types";
import { germanTrainerAdapter } from "./germanTrainerAdapter";
import { pumpAdapter } from "./pumpAdapter";
import { bootAdapter } from "./bootAdapter";
import { loaferAdapter } from "./loaferAdapter";
import { balletFlatAdapter } from "./balletFlatAdapter";
import { sandalAdapter } from "./sandalAdapter";
import { muleAdapter } from "./muleAdapter";
import {
  SHOE_CATEGORY_LABELS,
  type ShoeAccuracyGuardSet,
  type ShoeCategory,
  type ShoeContentProfile,
  type ShoeFieldDefinition,
  type ShoeProductContext,
  type ShoeReferenceRequirements,
  type ShoeShotPlanProfile
} from "./shoeProductTypes";

export type { ShoeAccuracyGuardSet, ShoeContentProfile, ShoeFieldDefinition, ShoeReferenceRequirements, ShoeShotPlanProfile } from "./shoeProductTypes";

export type ShoeCategoryAdapter = {
  category: ShoeCategory;
  status: "active" | "planned" | "disabled";
  createPromptAdapter(context: ShoeProductContext): ProductPromptAdapter;
  getFieldSchema(): ShoeFieldDefinition[];
  getReferenceRequirements(): ShoeReferenceRequirements;
  getShotPlanProfile(): ShoeShotPlanProfile;
  getAccuracyGuards(input: ProductAdapterInput): ShoeAccuracyGuardSet;
  getNegativeRules(input: ProductAdapterInput): string[];
  getContentProfile?(): ShoeContentProfile;
};

const disabledReferenceRequirements: ShoeReferenceRequirements = {
  minCount: 0,
  maxCount: 0,
  requiredRoles: [],
  recommendedRoles: []
};

const disabledShotPlanProfile: ShoeShotPlanProfile = {
  supportedImageCounts: [],
  supportsLifestyleSeries: false,
  supportsStudioSeries: false
};

function createDisabledPromptAdapter(category: ShoeCategory, context: ShoeProductContext): ProductPromptAdapter {
  const label = SHOE_CATEGORY_LABELS[category];
  const unsupportedLine = `Black Mirror does not yet support ${label} for formal generation. Do not substitute another footwear category or create a formal product prompt.`;

  return {
    mode: "shoe",
    getDisplayName: () => context.customShoe.trim() || label,
    isProductPresent: () => true,
    buildProductLine: () => unsupportedLine,
    buildAccuracyLines: () => [unsupportedLine],
    buildVisibilityLines: () => [],
    buildClippingLines: () => [],
    buildSceneControlLines: () => ["Stop before generating a formal product prompt for this unsupported shoe category."],
    buildCompositionLines: () => [],
    buildImageTypeLines: () => ["This category is planned and cannot use a formal production prompt path."],
    buildActionSafetyLines: () => [],
    buildNegativePhrases: () => ["category substitution", "silent category fallback"],
    buildStylingBoundaryLines: () => [],
    getProductSpecificQualityLines: () => []
  };
}

function createPlannedAdapter(category: Exclude<ShoeCategory, "germanTrainer">): ShoeCategoryAdapter {
  const label = SHOE_CATEGORY_LABELS[category];
  return {
    category,
    status: "planned",
    createPromptAdapter: (context) => createDisabledPromptAdapter(category, context),
    getFieldSchema: () => [],
    getReferenceRequirements: () => disabledReferenceRequirements,
    getShotPlanProfile: () => disabledShotPlanProfile,
    getAccuracyGuards: () => ({ structurePriorities: [], requiresGroundedContact: false, requiresReferenceAccuracy: false }),
    getNegativeRules: () => ["category substitution", "silent category fallback"],
    getContentProfile: () => ({ productNouns: [label], structurePriorities: [], lifestyleBenefits: [], forbiddenPrimaryTerms: [] })
  };
}

export const shoeCategoryRegistry: Record<ShoeCategory, ShoeCategoryAdapter> = {
  germanTrainer: germanTrainerAdapter,
  pump: pumpAdapter,
  boot: bootAdapter,
  loafer: loaferAdapter,
  balletFlat: balletFlatAdapter,
  sandal: sandalAdapter,
  mule: muleAdapter,
  other: createPlannedAdapter("other")
};

export function getShoeCategoryAdapter(category: ShoeCategory): ShoeCategoryAdapter {
  const adapter = shoeCategoryRegistry[category];
  if (!adapter) throw new Error(`Unsupported shoe category: ${category}`);
  return adapter;
}

export function isShoeCategoryActive(category: ShoeCategory) {
  return getShoeCategoryAdapter(category).status === "active";
}
