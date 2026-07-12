import type { ProductAdapterInput, ProductMode, ProductPresenceInput } from "./types";

export interface ProductPromptAdapter {
  mode: ProductMode;

  getDisplayName(): string;

  isProductPresent(input: ProductPresenceInput): boolean;

  buildProductLine(input: ProductAdapterInput): string;

  buildAccuracyLines(input: ProductAdapterInput): string[];

  buildVisibilityLines(input: ProductAdapterInput): string[];

  buildClippingLines(input: ProductAdapterInput): string[];

  buildSceneControlLines(input: ProductAdapterInput): string[];

  buildCompositionLines(input: ProductAdapterInput): string[];

  buildImageTypeLines(input: ProductAdapterInput): string[];

  buildActionSafetyLines(input: ProductAdapterInput): string[];
  buildNegativePhrases(input: ProductAdapterInput): string[];

  buildStylingBoundaryLines(input: ProductAdapterInput): string[];

  getProductSpecificQualityLines(input: ProductAdapterInput): string[];
}
