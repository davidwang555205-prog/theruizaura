import { fmcgCategoryLabels, fmcgCategoryProtection, fmcgThemeCards, fmcgTopicLabels } from "./catalog";
import type { FmcgCompiledSet, FmcgPromptInput, FmcgThemeCard } from "./types";

function rotate<T>(items: T[], offset: number): T[] {
  if (!items.length) return [];
  const start = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
}

function selectCards(input: FmcgPromptInput): FmcgThemeCard[] {
  return rotate(fmcgThemeCards[input.topicId], input.generationNonce).slice(0, input.imageCount);
}

function clean(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function compileCard(input: FmcgPromptInput, card: FmcgThemeCard, index: number): string {
  const confirmedDescription = clean(input.confirmedProductDescription);
  const confirmedClaims = clean(input.confirmedClaims);
  const brandVisual = clean(input.brandVisual);
  const extraRequirement = clean(input.extraRequirement);
  const referenceInstruction = input.referencePlan.order.length
    ? `Upload the confirmed product references in the displayed Reference Plan order. Use them as the only source for package appearance and product identity.`
    : "No confirmed product references are currently bound. Keep this as a draft plan and do not invent package appearance.";
  return [
    `IMAGE ${index + 1} — ${card.title}`,
    "PRODUCT",
    `Create one ${fmcgCategoryLabels[input.fmcgCategory]} product image for the THERUIZ AURA ${fmcgTopicLabels[input.topicId]} content theme.`,
    input.productName.trim() ? `User-confirmed product name: ${clean(input.productName)}.` : "Treat the product name as unspecified.",
    confirmedDescription ? `User-confirmed product description: ${confirmedDescription}.` : "Do not infer package material, product contents, ingredients, flavor, fragrance, capacity, efficacy, claims, or readable packaging copy.",
    confirmedClaims ? `Only these user-confirmed claims may appear as semantic direction: ${confirmedClaims}. Do not create additional claims.` : "No product claims are confirmed; do not add efficacy, ingredient, health, environmental, promotional, or compliance claims.",
    `Product protection: ${fmcgCategoryProtection[input.fmcgCategory].join(" ")}. Preserve only what is visibly confirmed by the uploaded references.`,
    "SCENE",
    `${card.scene}. Purpose: ${card.purpose}.`,
    "ACTION",
    `${card.action}. Use this as the only primary action for the image.`,
    "COMPOSITION",
    `${card.composition}. Product evidence responsibility: ${card.evidenceRole}. Keep the product commercially readable without exaggerated scale.`,
    "CAMERA AND LIGHTING",
    "Use a natural-perspective commercial photography lens, a stable working distance, realistic contact shadows, physically coherent reflections, and category-appropriate light. Avoid ultra-wide distortion and false macro enlargement.",
    "SEASON",
    `Express ${input.season} through surrounding light, environment, and restrained supporting colors. Do not change the confirmed package colors.`,
    brandVisual ? `BRAND VISUAL\n${brandVisual}` : "BRAND VISUAL\nQuiet, warm, restrained, tactile, realistic, commercially usable, and free of synthetic luxury effects.",
    extraRequirement ? `USER REQUIREMENT\n${extraRequirement}` : "",
    "REFERENCE MAPPING",
    referenceInstruction,
    "NEGATIVE",
    "No invented package geometry, no altered closure or dispenser, no extra product units, no fabricated logo, no random readable text, no invented claims, no floating product, no plastic-looking surfaces, no impossible reflections, no malformed hands, and no unrelated product category cues.",
  ].filter(Boolean).join("\n\n");
}

export function compileFmcgPromptSet(input: FmcgPromptInput): FmcgCompiledSet {
  if (input.productTruth.productCategory !== "fmcg" || input.referencePlan.productCategory !== "fmcg") {
    throw new Error("FMCG_CATEGORY_MISMATCH");
  }
  if (input.productTruth.fmcgCategory !== input.fmcgCategory) throw new Error("FMCG_TRUTH_CATEGORY_MISMATCH");
  const selected = selectCards(input);
  return {
    productCategory: "fmcg",
    topicId: input.topicId,
    cards: selected.map((card, index) => ({ ...card, index, prompt: compileCard(input, card, index) })),
  };
}

export function formatFmcgPromptSet(set: FmcgCompiledSet): string {
  return set.cards.map((card) => card.prompt).join("\n\n---\n\n");
}
