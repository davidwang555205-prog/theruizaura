import type { ProductPromptAdapter } from "../productAdapter";
import type { ProductPresenceInput } from "../types";
import type { GarmentProductContext } from "./garmentProductTypes";
import {
  buildGarmentAccuracyLines,
  buildGarmentClippingLines,
  buildGarmentCompositionLines,
  buildGarmentNegativePhrases,
  buildGarmentProductLine,
  buildGarmentSceneControlLines,
  buildGarmentStylingBoundaryLines,
  buildGarmentVisibilityLines,
  getGarmentDisplayName,
  getGarmentQualityLines
} from "./garmentProtectionRules";

function isGarmentProductImage(input: ProductPresenceInput) {
  if (input.imageType === "非产品氛围图") return false;
  if (input.imageType === "拍摄花絮 / 材质图") {
    return /garment|clothing|fabric|textile|dress|shirt|top|coat|jacket|trousers|skirt|服装|衣服|面料|布料|裙|衬衫|外套|裤/i.test(
      input.extraRequirement
    );
  }
  return true;
}

export function createGarmentProductAdapter(context: GarmentProductContext): ProductPromptAdapter {
  return {
    mode: "garment",

    getDisplayName() {
      return getGarmentDisplayName(context);
    },

    isProductPresent(input) {
      return isGarmentProductImage(input);
    },

    buildProductLine(input) {
      return buildGarmentProductLine(context, input);
    },

    buildAccuracyLines(input) {
      return buildGarmentAccuracyLines(context, input);
    },

    buildVisibilityLines(input) {
      return buildGarmentVisibilityLines(input);
    },

    buildClippingLines(input) {
      return buildGarmentClippingLines(input);
    },

    buildSceneControlLines(input) {
      return buildGarmentSceneControlLines(input);
    },

    buildCompositionLines(input) {
      return buildGarmentCompositionLines(input);
    },

    buildImageTypeLines(input) {
      if (input.imageType === "非产品氛围图") {
        return [
          "Generate a non-product atmospheric THERUIZ AURA image. The product does not need to be the main subject; express quiet order, warm restraint, daily elegance, calm negative space, and refined lifestyle atmosphere."
        ];
      }
      return buildGarmentSceneControlLines(input);
    },

    buildActionSafetyLines(input) {
      return input.productPresent
        ? [
            "Keep the model's body, hands, hair, pose, and supporting accessories from hiding, pulling, penetrating, or redesigning the primary garment."
          ]
        : [];
    },

    buildNegativePhrases(input) {
      return buildGarmentNegativePhrases(input);
    },

    buildStylingBoundaryLines(input) {
      return buildGarmentStylingBoundaryLines(context, input);
    },

    getProductSpecificQualityLines(input) {
      return getGarmentQualityLines(input);
    }
  };
}
