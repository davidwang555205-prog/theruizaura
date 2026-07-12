import type { ProductPromptAdapter } from "../productAdapter";
import { getShoeCategoryAdapter } from "./shoeCategoryRegistry";
import { resolveShoeCategory, type ShoeProductContext } from "./shoeProductTypes";

/**
 * Compatibility entry point for the product layer. Existing THERUIZ AURA
 * products resolve to the active German-trainer adapter; explicitly selected
 * future categories resolve only to their own adapter and never fall back.
 */
export function createShoeProductAdapter(context: ShoeProductContext): ProductPromptAdapter {
  const category = resolveShoeCategory(context);
  return getShoeCategoryAdapter(category).createPromptAdapter({ ...context, category });
}
