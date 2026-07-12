import { resolveProductContext } from "../modules/product";
import { getShoeCategoryAdapter } from "../modules/product/shoe/shoeCategoryRegistry";
import type { ShoeCategory } from "../modules/product/shoe/shoeProductTypes";
import type { ProductMode } from "../modules/product/types";
import type { TeamPromptParams } from "../types";
import { generateTeamPrompt } from "./generatePrompt";

export type CurrentSinglePrompt = {
  mode: ProductMode;
  category?: ShoeCategory;
  productKey: string;
  prompt: string;
};

/** The one-shot route always resolves the active product adapter before building. */
export function buildCurrentSinglePrompt(params: TeamPromptParams): CurrentSinglePrompt {
  const context = resolveProductContext(params);
  if (context.mode === "shoe") {
    if (!context.category) throw new Error("The active shoe category is missing.");
    const adapter = getShoeCategoryAdapter(context.category);
    if (adapter.status !== "active") throw new Error(`Shoe category ${context.category} is not active.`);
  }
  const prompt = generateTeamPrompt(params).prompt.trim();
  if (!prompt) throw new Error("The current product adapter returned an empty single prompt.");
  return {
    mode: context.mode,
    category: context.mode === "shoe" ? context.category : undefined,
    productKey: JSON.stringify(context),
    prompt
  };
}
