import type { TeamImageType, TeamShoe } from "../types";

export type PhotoRealityMode =
  | "premiumStudio"
  | "realDaily"
  | "materialTruth"
  | "lifestyleAtmosphere";

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
    "Keep at least one sneaker fully visible from toe to heel, with the second sneaker clearly readable. Keep garment hems and socks physically separated from the sneakers. The sneaker collar, tongue, tied laces and outsole must remain clear.",
  materialRule:
    "All current THERUIZ AURA styles use pigskin lining unless manually specified. Keep lining details accurate and secondary to the selected image type.",
  bodyAndClippingProtection:
    "Keep body scale, leg length, hand size, foot scale and shoe-to-leg relationship realistic. No fabric melting into shoes, no fused legs, no distorted feet, no extra toes, no over-stretched legs, no plastic skin, no mannequin-like stiffness.",
  seasonalOutfitMatch:
    "Make the outfit, fabric thickness, layering, light and city atmosphere match the selected season and city climate. Summer should feel breathable and light. Autumn should use soft layering. Winter should use believable warm layering. Spring should feel mild and fresh.",
  cityRealism:
    "Use a believable contemporary Chinese city environment. Keep sidewalks, storefronts, pavement, greenery, street depth and daily details realistic. Avoid European old town streets, American suburban streets, synthetic luxury mall backgrounds or studio-like outdoor sets unless specifically selected.",
  europeanCityRealism:
    "Use a believable contemporary European city environment with realistic architecture, pavement, storefront proportions, daily wear, natural street depth, subtle local movement, and no tourist-landmark or postcard staging.",
  brandVisualUnity:
    "Keep the image in THERUIZ AURA Quiet Warm Luxury style: cream-white, warm beige, soft stone, natural daylight, low saturation, relaxed elegance, tactile authenticity and believable daily sophistication. Clean but warm, refined but not distant, feminine but not sweet, real but not ordinary.",
  imageTypeDifference:
    "Adjust the composition and commercial feeling according to the selected image type. Outfit images should feel natural and lifestyle-driven. Detail images should be cleaner and product-readable. Still-life images should keep the product as the absolute subject. Brand atmosphere images may include material table or behind-the-scenes details through extra requirements."
};

const compactPatchLines = {
  sneakerShapeProtection:
    "Preserve the uploaded low-cut German trainer shape, rounded toe box, slim outsole, panels, tongue, stitching, laces, color, material transitions, and proportions; do not redesign it.",
  sneakerVisibility:
    "Keep at least one sneaker fully visible, the second readable, outsole grounded, and keep fabric, socks, collar, tongue, tied laces, and floor contact physically separated.",
  pigskinMaterialRule:
    "Use pigskin lining for current THERUIZ AURA styles when lining is visible or relevant; keep material details accurate and secondary to the selected image type.",
  standardMaterialRule:
    "Use pigskin lining for current THERUIZ AURA styles when lining is visible or relevant; keep material details accurate and do not invent a different lining.",
  materialDetailRule:
    "For material or behind-the-scenes images, show only relevant material details, samples, swatches, laces, stitching, notes, or partial product details; do not turn the image into a direct full-shoe product shot unless explicitly requested.",
  bodyAndClippingProtection:
    "Keep body scale, leg length, hand size, foot scale, and shoe-to-leg relationship realistic; avoid fabric melting, fused legs, distorted feet, plastic skin, and mannequin-like stiffness.",
  seasonalOutfitMatch:
    "Match outfit weight, fabric, layering, light, and city climate to the selected season.",
  cityRealism:
    "Use a believable contemporary Chinese city setting with realistic sidewalks, storefronts, pavement, greenery, street depth, and daily details.",
  europeanCityRealism:
    "Use a believable contemporary European city street with realistic architecture, pavement, storefront proportions, daily wear, natural depth, subtle local movement, and no tourist-landmark or postcard staging.",
  brandVisualUnity:
    "Maintain THERUIZ AURA Quiet Warm Luxury: cream-white, warm beige, soft stone, natural daylight, low saturation, tactile daily sophistication.",
  imageTypeDifference:
    "Match composition to image type: lifestyle outfit images feel natural, detail images stay product-readable, still-life keeps the shoe as subject, mirror selfies feel like real outfit records."
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
  "distorted feet",
  "extra toes",
  "fused legs",
  "oversized sneakers",
  "foreground-enlarged shoes",
  "macro shoe close-up",
  "extreme low-angle feet shot",
  "wide-angle shoe distortion",
  "cropped shoes",
  "hidden shoes",
  "fabric melting into shoes",
  "plastic skin",
  "mannequin-like person",
  "over-posed influencer",
  "CGI render",
  "3D render",
  "European old town street",
  "American suburban street",
  "synthetic luxury mall background"
];

const photoRealityModeLines: Record<
  PhotoRealityMode,
  { sceneLine: string; moodLine: string; negativePhrases: string[] }
> = {
  premiumStudio: {
    sceneLine:
      "Premium launch-studio polish: seamless background, soft directional main light, precise contact shadows, accurate product color, no lived-in clutter.",
    moodLine:
      "The studio image should feel commercial-grade, quiet, tactile, and expensive, with realism shown through skin texture, fabric behavior, material accuracy, floor contact, and natural shadows rather than messy lifestyle details.",
    negativePhrases: [
      "messy candid feeling",
      "random daily clutter",
      "documentary street mood",
      "cheap studio setup",
      "glossy CGI studio",
      "flat catalog flash",
      "over-lived-in background"
    ]
  },
  realDaily: {
    sceneLine:
      "Real daily photo feeling: slight imperfect framing, natural depth falloff, mild wear on surrounding surfaces, and believable background life; keep the sneaker itself clean, undamaged, and structurally accurate.",
    moodLine:
      "The image should feel like a refined real-camera daily capture: tasteful and elevated, but not overly polished, empty, staged, or showroom-like.",
    negativePhrases: [
      "AI lifestyle set",
      "empty perfect street",
      "showroom-like staging",
      "fake storefront depth",
      "over-polished campaign mood",
      "pasted subject",
      "synthetic background"
    ]
  },
  materialTruth: {
    sceneLine:
      "Material-truth clarity: real surface contact, accurate color, tactile stitching, lace texture, panel transitions, soft shadows.",
    moodLine:
      "The product or material image should feel premium and physically real, with texture and construction carrying the value rather than decorative props or artificial gloss.",
    negativePhrases: [
      "CGI product render",
      "glossy fake material",
      "floating product",
      "cheap e-commerce table",
      "decorative clutter",
      "fake material texture"
    ]
  },
  lifestyleAtmosphere: {
    sceneLine:
      "Her lifestyle world: believable daily objects, natural object contact, warm restraint, and an orderly but visibly used personal rhythm.",
    moodLine:
      "The atmosphere image should feel like her day, wardrobe, table, city, weekend, travel, before-leaving or after-returning moment, with one or two quiet signs of recent human presence and real life kept orderly but not showroom-perfect.",
    negativePhrases: [
      "brand-process overload",
      "product development catalog",
      "empty Pinterest scene",
      "fake elite lifestyle",
      "random decorative props",
      "sterile showroom atmosphere"
    ]
  }
};

export function getPhotoRealityPatchLines(mode: PhotoRealityMode) {
  return photoRealityModeLines[mode];
}

function isPeopleImageType(imageType: TeamImageType) {
  return imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图";
}

function isMaterialDetailImageType(imageType: TeamImageType) {
  return imageType === "拍摄花絮 / 材质图" || imageType === "产品静物图";
}

function getMaterialRuleLine(input: { imageType: TeamImageType; hasShoe: boolean; shoe?: TeamShoe }) {
  const materialDetailImage = isMaterialDetailImageType(input.imageType);

  if (input.imageType === "拍摄花絮 / 材质图") {
    if (!input.hasShoe) return "";
    return compactPatchLines.materialDetailRule;
  }

  if (!input.hasShoe && !materialDetailImage) return "";
  return compactPatchLines.pigskinMaterialRule;
}

export function getPromptQualityPatchLines(input: {
  imageType: TeamImageType;
  hasShoe: boolean;
  shoe?: TeamShoe;
  includeCityRealism?: boolean;
  streetRegion?: "china" | "europe";
}) {
  const peopleImage = isPeopleImageType(input.imageType);
  const materialDetailImage = isMaterialDetailImageType(input.imageType);

  return {
    productLines: [
      input.hasShoe ? compactPatchLines.sneakerShapeProtection : "",
      getMaterialRuleLine(input)
    ].filter(Boolean),
    modelLines: [peopleImage ? compactPatchLines.bodyAndClippingProtection : ""].filter(Boolean),
    outfitLines: [peopleImage ? compactPatchLines.seasonalOutfitMatch : ""].filter(Boolean),
    sceneLines: [
      input.hasShoe && input.imageType !== "拍摄花絮 / 材质图" && input.imageType !== "非产品氛围图"
        ? compactPatchLines.sneakerVisibility
        : "",
      input.includeCityRealism
        ? input.streetRegion === "europe"
          ? compactPatchLines.europeanCityRealism
          : compactPatchLines.cityRealism
        : "",
      compactPatchLines.imageTypeDifference
    ].filter(Boolean),
    moodLines: [compactPatchLines.brandVisualUnity].filter(Boolean),
    negativePhrases:
      input.streetRegion === "europe"
        ? promptQualityNegativePhrases.filter((phrase) => phrase !== "European old town street")
        : promptQualityNegativePhrases
  };
}
