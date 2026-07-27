import type { TeamImageType, TeamPromptParams } from "../types";

const SHOE_KEYWORDS = [
  "鞋子", "鞋", "样鞋", "产品", "鞋带", "鞋舌", "鞋底", "鞋面", "鞋头", "鞋型",
  "德训鞋", "单鞋", "双鞋", "鞋跟", "上脚", "sneaker", "sneakers", "shoe", "shoes",
  "lace", "laces", "product", "outsole", "sole", "tongue", "upper", "toe box"
];

export function isNonProductAtmosphereImage(imageType: TeamImageType): boolean {
  return imageType === "非产品氛围图";
}

export function resolveProductPresence(params: Pick<TeamPromptParams, "imageType" | "extraRequirement">): boolean {
  if (isNonProductAtmosphereImage(params.imageType)) return false;

  if (
    params.imageType === "产品上脚图" ||
    params.imageType === "对镜穿搭图" ||
    params.imageType === "生活场景图" ||
    params.imageType === "产品静物图"
  ) return true;

  const extra = params.extraRequirement.trim().toLowerCase();
  return SHOE_KEYWORDS.some((keyword) => extra.includes(keyword.toLowerCase()));
}

