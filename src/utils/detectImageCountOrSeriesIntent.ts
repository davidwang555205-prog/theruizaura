import type { TeamImageType } from "../types";

export type ImageCountIntent = "singleImage" | "twoImageSet" | "multiImageSet";

const TWO_IMAGE_PATTERNS = [
  /(^|[^0-9])2\s*张/,
  /两张/,
  /二张/,
  /\btwo\s+images?\b/,
  /\b2\s+images?\b/,
  /\btwo-image\b/
];

const MULTI_IMAGE_PATTERNS = [
  /一组/,
  /系列/,
  /三张/,
  /3\s*张/,
  /四张/,
  /4\s*张/,
  /多图/,
  /同一模特/,
  /同一个人/,
  /同样长相/,
  /同一套穿搭/,
  /不要换脸/,
  /脸一致/,
  /模特一致/,
  /\bseries\b/,
  /\bset\b/,
  /\bthree\s+images?\b/,
  /\b3\s+images?\b/,
  /\bfour\s+images?\b/,
  /\b4\s+images?\b/,
  /\bmultiple\s+images?\b/,
  /\bsame\s+model\b/,
  /\bsame\s+woman\b/,
  /\bsame\s+face\b/,
  /\bsame\s+outfit\b/,
  /\bconsistent\s+model\b/,
  /\bcoherent\s+series\b/,
  /\bdo\s+not\s+change\s+face\b/
];

export function detectImageCountOrSeriesIntent(
  userExtraRequirement = "",
  _imageType?: TeamImageType
): ImageCountIntent {
  const text = userExtraRequirement.trim().toLowerCase();

  if (!text) return "singleImage";
  if (TWO_IMAGE_PATTERNS.some((pattern) => pattern.test(text))) return "twoImageSet";
  if (MULTI_IMAGE_PATTERNS.some((pattern) => pattern.test(text))) return "multiImageSet";

  return "singleImage";
}
