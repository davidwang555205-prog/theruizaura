import type { CommercialBrandIntentStrategyV1 } from "./intent-strategy";
import {
  resolveCommercialWardrobe,
  type CommercialWardrobeResolution,
  type CommercialWardrobeStyle,
  type CommercialWardrobeStyleId,
} from "./wardrobe";
import type { CommercialIntentId } from "../types";

type CommercialBrandContextSource = {
  id: string;
  brand: string;
  positioning: string;
  traits: readonly string[];
  emotionalTerritory: string;
  visualLanguage: {
    world: string;
    lighting: string;
    cameraFeeling: string;
    color: string;
    forbiddenStyles: readonly string[];
  };
  productTruth: {
    productCategory: string;
    allowedClaimRule: string;
    authority: string;
    forbiddenClaims: readonly string[];
  };
  wardrobeStyles: Readonly<Record<CommercialWardrobeStyleId, CommercialWardrobeStyle>>;
};

export type CommercialBrandContextV1 = {
  packId: string;
  brand: string;
  positioning: string;
  traits: readonly string[];
  emotionalTerritory: string;
  caseContext: string;
  visualLanguage: CommercialBrandContextSource["visualLanguage"];
  productTruth: CommercialBrandContextSource["productTruth"];
  intentStrategy: CommercialBrandIntentStrategyV1;
  wardrobe: CommercialWardrobeResolution;
  approvedSellingPoints: readonly string[];
};

export function buildCommercialBrandContext(input: {
  pack: CommercialBrandContextSource;
  caseContext: string;
  intentStrategy: CommercialBrandIntentStrategyV1;
  commercialIntent: CommercialIntentId;
  generationNonce?: number;
  season: "春" | "夏" | "秋" | "冬";
  styleId?: CommercialWardrobeStyleId;
  approvedSellingPoints: readonly string[];
}): CommercialBrandContextV1 {
  return {
    packId: input.pack.id,
    brand: input.pack.brand,
    positioning: input.pack.positioning,
    traits: input.pack.traits,
    emotionalTerritory: input.pack.emotionalTerritory,
    caseContext: input.caseContext.trim(),
    visualLanguage: input.pack.visualLanguage,
    productTruth: input.pack.productTruth,
    intentStrategy: input.intentStrategy,
    wardrobe: resolveCommercialWardrobe({
      styles: input.pack.wardrobeStyles,
      intent: input.commercialIntent,
      generationNonce: input.generationNonce,
      season: input.season,
      styleId: input.styleId,
    }),
    approvedSellingPoints: input.approvedSellingPoints,
  };
}

export function renderCommercialIntentStrategy(
  strategy: CommercialBrandIntentStrategyV1
): string[] {
  return [
    `Commercial intent positioning: ${strategy.positioning}.`,
    `Product role: ${strategy.productRole}.`,
    `Product presence: ${strategy.productPresence}.`,
    `Priority: ${strategy.priority}.`,
    `Intent emphasis: ${strategy.emphasis.join(" ")}`,
    `Intent guardrails: ${strategy.guardrails.join(" ")}`,
    ...(strategy.evidenceRequirement
      ? [
        `Product evidence requirement: ${strategy.evidenceRequirement.requirement}`,
        strategy.evidenceRequirement.missingBehavior,
      ]
      : []),
  ];
}

export function renderCommercialBrandContext(
  context: CommercialBrandContextV1
): string[] {
  return [
    `Brand identity: ${context.brand}; ${context.positioning}; ${context.traits.join(", ")}.`,
    `Emotional territory: ${context.emotionalTerritory}`,
    `Case scene: ${context.caseContext}`,
    `World and lighting: ${context.visualLanguage.world} ${context.visualLanguage.lighting}`,
    `Camera and color: ${context.visualLanguage.cameraFeeling} ${context.visualLanguage.color}`,
    `Avoid visual styles: ${context.visualLanguage.forbiddenStyles.join("; ")}.`,
    `Product Truth: ${context.productTruth.productCategory} ${context.productTruth.authority}`,
    `Allowed claim rule: ${context.productTruth.allowedClaimRule}`,
    `Forbidden product claims: ${context.productTruth.forbiddenClaims.join("; ")}.`,
    ...renderCommercialIntentStrategy(context.intentStrategy),
    ...context.approvedSellingPoints.map((claim) => `Approved SKU selling point: ${claim}`),
  ];
}
