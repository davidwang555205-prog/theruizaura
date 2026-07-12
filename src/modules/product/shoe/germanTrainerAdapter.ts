import type { ProductPromptAdapter } from "../productAdapter";
import type { ProductAdapterInput, ProductPresenceInput } from "../types";
import type {
  ShoeAccuracyGuardSet,
  ShoeCategoryAdapter,
  ShoeContentProfile,
  ShoeFieldDefinition,
  ShoeReferenceRequirements,
  ShoeShotPlanProfile
} from "./shoeCategoryRegistry";
import type { ShoeProductContext } from "./shoeProductTypes";
import {
  chooseShoeProtectionLines,
  getShoeActionSafetyLines,
  getShoeDisplayName,
  getShoeImageTypeLine,
  getShoeNegativePhrases,
  getShoeStudioCompositionLine,
  getShoeStylingBoundaryLine,
  shoeRequirementMentionsProduct
} from "./shoeProtectionRules";

function isPeopleOrProductImage(imageType: ProductPresenceInput["imageType"]) {
  return (
    imageType === "产品上脚图" ||
    imageType === "对镜穿搭图" ||
    imageType === "生活场景图" ||
    imageType === "产品静物图"
  );
}

export const germanTrainerFieldSchema: ShoeFieldDefinition[] = [
  { key: "productName", label: "鞋款", type: "select", required: true, helpText: "沿用当前 THERUIZ AURA 鞋款选择。" },
  { key: "color", label: "主颜色", type: "text" },
  { key: "upperMaterial", label: "鞋面材质", type: "text" },
  { key: "toeShape", label: "鞋头", type: "text" },
  { key: "closureType", label: "闭合方式", type: "text" },
  { key: "keyDetails", label: "结构细节", type: "textarea" }
];

export const germanTrainerReferenceRequirements: ShoeReferenceRequirements = {
  minCount: 0,
  maxCount: 9,
  requiredRoles: [],
  recommendedRoles: ["primary", "side", "top", "rear", "material", "detail"]
};

export const germanTrainerShotPlanProfile: ShoeShotPlanProfile = {
  supportedImageCounts: [1, 3, 5, 8],
  supportsLifestyleSeries: true,
  supportsStudioSeries: true
};

export const germanTrainerAccuracyGuards: ShoeAccuracyGuardSet = {
  structurePriorities: ["low-cut silhouette", "rounded toe box", "slim outsole", "panels", "tongue", "laces", "eyelets", "heel patch"],
  requiresGroundedContact: true,
  requiresReferenceAccuracy: true
};

export const germanTrainerContentProfile: ShoeContentProfile = {
  productNouns: ["German trainer", "sneaker", "toe box", "outsole", "panel", "tongue", "laces"],
  structurePriorities: germanTrainerAccuracyGuards.structurePriorities,
  lifestyleBenefits: ["daily wearability", "clear on-foot proportion", "quiet-luxury styling", "natural movement"],
  forbiddenPrimaryTerms: ["pump", "boot", "chunky running-shoe sole", "skateboard shoe"]
};

export function createGermanTrainerPromptAdapter(context: ShoeProductContext): ProductPromptAdapter {
  const getProtection = (input: ProductAdapterInput) =>
    chooseShoeProtectionLines({
      imageType: input.imageType,
      shoe: context.shoe,
      shoeDisplayName: getShoeDisplayName(context),
      customShoe: context.customShoe,
      hasShoe: input.productPresent
    });

  return {
    mode: "shoe",
    getDisplayName: () => getShoeDisplayName(context),
    isProductPresent(input) {
      if (input.imageType === "非产品氛围图") return false;
      if (isPeopleOrProductImage(input.imageType)) return true;
      return shoeRequirementMentionsProduct(input.extraRequirement);
    },
    buildProductLine: (input) => getProtection(input).productLine,
    buildAccuracyLines: (input) => [getProtection(input).shoeSpecificAccuracyLine].filter(Boolean),
    buildVisibilityLines: (input) => [getProtection(input).visibilityLine].filter(Boolean),
    buildClippingLines: (input) => [getProtection(input).clippingLine].filter(Boolean),
    buildSceneControlLines: (input) => [getProtection(input).sceneControlLine].filter(Boolean),
    buildCompositionLines: (input) => [getShoeStudioCompositionLine(input)].filter(Boolean),
    buildImageTypeLines: (input) => [getShoeImageTypeLine(input)].filter(Boolean),
    buildActionSafetyLines: (input) => getShoeActionSafetyLines(input),
    buildNegativePhrases: (input) => getShoeNegativePhrases(input),
    buildStylingBoundaryLines: (input) => [getShoeStylingBoundaryLine(context, input)].filter(Boolean),
    getProductSpecificQualityLines: () => []
  };
}

export const germanTrainerAdapter: ShoeCategoryAdapter = {
  category: "germanTrainer",
  status: "active",
  createPromptAdapter: createGermanTrainerPromptAdapter,
  getFieldSchema: () => germanTrainerFieldSchema,
  getReferenceRequirements: () => germanTrainerReferenceRequirements,
  getShotPlanProfile: () => germanTrainerShotPlanProfile,
  getAccuracyGuards: () => germanTrainerAccuracyGuards,
  getNegativeRules: (input) => getShoeNegativePhrases(input),
  getContentProfile: () => germanTrainerContentProfile
};
