import type { ProductContext } from "./types";
import { resolveShoeCategory, type ShoeProductContext, type TeamShoe } from "./shoe/shoeProductTypes";

export type ProductContextSource = {
  productContext?: ProductContext;
  shoe: TeamShoe;
  customShoe: string;
};

/**
 * Compatibility boundary for the legacy UI and soft-seeding callers.
 * New product-aware code should pass productContext explicitly; legacy callers
 * continue to resolve to shoe mode until the garment UI is introduced.
 */
export function resolveProductContext(source: ProductContextSource): ProductContext {
  if (source.productContext?.mode === "garment") return source.productContext;

  const shoeContext: ShoeProductContext = source.productContext?.mode === "shoe"
    ? source.productContext
    : { mode: "shoe", shoe: source.shoe, customShoe: source.customShoe };

  return { ...shoeContext, category: resolveShoeCategory(shoeContext) };
}
