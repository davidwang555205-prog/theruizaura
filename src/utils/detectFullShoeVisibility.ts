import type { TeamImageType, TeamScenePreference } from "../types";

export type FullShoeVisibilityInput = {
  imageType: TeamImageType;
  scenePreference: Exclude<TeamScenePreference, "自动匹配">;
  selectedSneakerProtectionLines: string[];
  userExtraRequirement: string;
  finalPromptIntent?: string;
};

export type FullShoeVisibilityOutput = {
  fullShoeVisibility: boolean;
  bothShoesVisible: boolean;
};

const fullShoeKeywords = [
  "sneakers clearly visible",
  "full shoe visible",
  "at least one sneaker fully visible",
  "both sneakers visible",
  "shoes fully readable",
  "鞋子完整露出",
  "至少一只鞋完整可见",
  "双鞋清楚可见",
  "鞋子完整",
  "完整露鞋"
];

const bothShoesKeywords = [
  "both sneakers visible",
  "both shoes visible",
  "second sneaker must remain clearly readable",
  "both sneakers clearly visible",
  "双鞋清楚可见",
  "两只鞋",
  "双鞋"
];

function includesAny(text: string, keywords: string[]) {
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

export function detectFullShoeVisibility(
  input: FullShoeVisibilityInput
): FullShoeVisibilityOutput {
  const intentText = [
    ...input.selectedSneakerProtectionLines,
    input.userExtraRequirement,
    input.finalPromptIntent
  ]
    .filter(Boolean)
    .join(" ");

  const fullShoeVisibility =
    input.imageType === "产品静物图" ||
    input.imageType === "产品上脚图" ||
    input.imageType === "对镜穿搭图" ||
    input.scenePreference === "健身房内" ||
    input.scenePreference === "去运动的路上" ||
    (input.imageType === "生活场景图" &&
      includesAny(intentText, ["sneakers clearly visible", "shoes fully readable"])) ||
    includesAny(intentText, fullShoeKeywords);

  const bothShoesVisible =
    input.imageType === "产品静物图" ||
    input.imageType === "产品上脚图" ||
    input.imageType === "对镜穿搭图" ||
    includesAny(intentText, bothShoesKeywords);

  return {
    fullShoeVisibility,
    bothShoesVisible
  };
}
