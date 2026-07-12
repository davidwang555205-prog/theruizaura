import type { ProductPromptAdapter } from "../productAdapter";
import type { ProductAdapterInput, ProductPresenceInput } from "../types";
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

export function createShoeProductAdapter(context: ShoeProductContext): ProductPromptAdapter {
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

    getDisplayName() {
      return getShoeDisplayName(context);
    },

    isProductPresent(input) {
      if (input.imageType === "非产品氛围图") return false;
      if (isPeopleOrProductImage(input.imageType)) return true;
      return shoeRequirementMentionsProduct(input.extraRequirement);
    },

    buildProductLine(input) {
      return getProtection(input).productLine;
    },

    buildAccuracyLines(input) {
      return [getProtection(input).shoeSpecificAccuracyLine].filter(Boolean);
    },

    buildVisibilityLines(input) {
      return [getProtection(input).visibilityLine].filter(Boolean);
    },

    buildClippingLines(input) {
      return [getProtection(input).clippingLine].filter(Boolean);
    },

    buildSceneControlLines(input) {
      return [getProtection(input).sceneControlLine].filter(Boolean);
    },

    buildCompositionLines(input) {
      return [getShoeStudioCompositionLine(input)].filter(Boolean);
    },

    buildImageTypeLines(input) {
      return [getShoeImageTypeLine(input)].filter(Boolean);
    },

    buildActionSafetyLines(input) {
      return getShoeActionSafetyLines(input);
    },

    buildNegativePhrases(input) {
      return getShoeNegativePhrases(input);
    },

    buildStylingBoundaryLines(input) {
      return [getShoeStylingBoundaryLine(context, input)].filter(Boolean);
    },

    getProductSpecificQualityLines() {
      return [];
    }
  };
}
