import type { ProductContext } from "./types";
import type { TeamShoe } from "./shoe/shoeProductTypes";

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
  return source.productContext ?? {
    mode: "shoe",
    shoe: source.shoe,
    customShoe: source.customShoe
  };
}
