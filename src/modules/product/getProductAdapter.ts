import { createGarmentProductAdapter } from "./garment/garmentProductAdapter";
import { createShoeProductAdapter } from "./shoe/shoeProductAdapter";
import type { ProductPromptAdapter } from "./productAdapter";
import type { ProductContext } from "./types";

export function getProductAdapter(productContext: ProductContext): ProductPromptAdapter {
  return productContext.mode === "shoe"
    ? createShoeProductAdapter(productContext)
    : createGarmentProductAdapter(productContext);
}
