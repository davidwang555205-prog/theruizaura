import type { TeamImageType, TeamShoe } from "../types";
import {
  chooseShoeProtectionLines,
  type ShoeProtectionLines
} from "../modules/product/shoe/shoeProtectionRules";

export type SneakerProtectionInput = {
  imageType: TeamImageType;
  shoe: TeamShoe;
  shoeDisplayName: string;
  customShoe: string;
  hasShoe: boolean;
};

export type SneakerProtectionLines = ShoeProtectionLines;

/** Legacy wrapper kept for callers outside the product adapter layer. */
export function chooseSneakerProtectionLines(input: SneakerProtectionInput): SneakerProtectionLines {
  return chooseShoeProtectionLines(input);
}
