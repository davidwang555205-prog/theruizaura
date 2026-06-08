import type { TeamImageType } from "../types";

export const promptQualityPatchLabels = [
  "鞋型保护",
  "鞋子可见性",
  "鞋带默认系好",
  "材质规则",
  "穿模保护",
  "季节匹配",
  "城市真实感",
  "品牌视觉统一",
  "图片类型差异"
];

export const promptQualityPatchNotice = `已启用：${promptQualityPatchLabels.join(" / ")}。`;

export const promptQualityPatches = {
  sneakerShapeProtection:
    "Strictly preserve the uploaded THERUIZ AURA sneaker reference: low-cut German trainer silhouette, rounded toe box, slim outsole, original panel structure, tongue shape, stitching, lace thickness, material transitions, color relationship and proportions. Do not redesign the shoe.",
  sneakerVisibility:
    "Keep at least one sneaker fully visible from toe to heel, with the second sneaker clearly readable. Keep trouser hems, skirt hems and socks physically separated from the sneakers. The shoe opening, tongue, tied laces and outsole must remain clear.",
  materialRule:
    "Only Aire 微风 uses lambskin lining. Other current THERUIZ AURA styles use pigskin lining unless manually specified.",
  bodyAndClippingProtection:
    "Keep body scale, leg length, hand size, foot scale and shoe-to-leg relationship realistic. No fabric melting into shoes, no fused legs, no distorted feet, no extra toes, no over-stretched legs, no plastic skin, no AI mannequin.",
  seasonalOutfitMatch:
    "Make the outfit, fabric thickness, layering, light and city atmosphere match the selected season and city climate. Summer should feel breathable and light. Autumn should use soft layering. Winter should use believable warm layering. Spring should feel mild and fresh.",
  cityRealism:
    "Use a believable contemporary Chinese city environment. Keep sidewalks, storefronts, pavement, greenery, street depth and daily details realistic. Avoid European old town streets, American suburban streets, fake luxury mall backgrounds or studio-like outdoor sets unless specifically selected.",
  brandVisualUnity:
    "Keep the image in THERUIZ AURA Quiet Warm Luxury style: cream-white, warm beige, soft stone, natural daylight, low saturation, relaxed elegance, tactile authenticity and believable daily sophistication. Clean but warm, refined but not distant, feminine but not sweet, real but not ordinary.",
  imageTypeDifference:
    "Adjust the composition and commercial feeling according to the selected image type. Xiaohongshu outfit images should feel natural and lifestyle-driven. Tmall detail images should be cleaner, more commercial and product-readable. Taobao main still-life images should keep the product as the absolute subject. Material detail images should focus on sharp texture, stitching, tied laces and material transitions. Mirror selfie images should feel like a real outfit record, not a beauty selfie."
};

export const promptQualityNegativePhrases = [
  "running shoes",
  "chunky sneakers",
  "platform sole",
  "skateboard shoes",
  "deformed shoe",
  "redesigned shoe",
  "wrong toe shape",
  "thick outsole",
  "missing laces",
  "untied laces",
  "loose hanging laces",
  "missing lace loops",
  "lace ends disappearing",
  "broken laces",
  "distorted feet",
  "extra toes",
  "fused legs",
  "cropped shoes",
  "hidden shoes",
  "fabric melting into shoes",
  "plastic skin",
  "AI mannequin",
  "over-posed influencer",
  "showroom pose",
  "beauty selfie",
  "forced direct stare",
  "CGI render",
  "3D render",
  "glossy fake material",
  "harsh overexposure",
  "messy background",
  "luxury cliché",
  "logo overload",
  "European old town street",
  "American suburban street",
  "fake luxury mall background"
];

function isPeopleImageType(imageType: TeamImageType) {
  return imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图";
}

function isMaterialDetailImageType(imageType: TeamImageType) {
  return imageType === "拍摄花絮 / 材质图" || imageType === "产品静物图";
}

export function getPromptQualityPatchLines(input: { imageType: TeamImageType; hasShoe: boolean }) {
  const peopleImage = isPeopleImageType(input.imageType);
  const materialDetailImage = isMaterialDetailImageType(input.imageType);

  return {
    productLines: [
      input.hasShoe ? promptQualityPatches.sneakerShapeProtection : "",
      input.hasShoe || materialDetailImage ? promptQualityPatches.materialRule : ""
    ].filter(Boolean),
    modelLines: [peopleImage ? promptQualityPatches.bodyAndClippingProtection : ""].filter(Boolean),
    outfitLines: [peopleImage ? promptQualityPatches.seasonalOutfitMatch : ""].filter(Boolean),
    sceneLines: [
      input.hasShoe ? promptQualityPatches.sneakerVisibility : "",
      promptQualityPatches.cityRealism,
      promptQualityPatches.imageTypeDifference
    ].filter(Boolean),
    moodLines: [promptQualityPatches.brandVisualUnity].filter(Boolean),
    negativePhrases: promptQualityNegativePhrases
  };
}
