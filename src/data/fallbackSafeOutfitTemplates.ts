import type { SceneOutfitSeed } from "./sceneOutfitSeedLibrary";

const fallbackStyle =
  "Keep the styling grounded, wearable, low-saturation, and shoe-readable, with no extra handheld props and no garment covering the sneakers.";

function fallbackSeed(input: {
  id: string;
  garmentType: SceneOutfitSeed["garmentType"];
  outfitStyle: SceneOutfitSeed["outfitStyle"];
  colorDirection: SceneOutfitSeed["colorDirection"];
  topCategory: string;
  bottomCategory: string;
  outerLayerCategory?: string;
  bagCategory?: string;
  visualAnchor: string;
  outfitLine: string;
}): SceneOutfitSeed {
  return {
    ...input,
    sceneKey: "fallback",
    season: ["spring", "summer", "autumn", "winter"],
    suitableShoes: ["ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror", "gymCommute"],
    accessoryCategory: ["secondary accessory only"],
    stylingRealismLine: fallbackStyle,
    forbidden: ["sensitive styling", "shoe-obscuring garment", "multiple handheld props"]
  };
}

export const fallbackSafeOutfitTemplates: SceneOutfitSeed[] = [
  fallbackSeed({
    id: "safe-trousers-001",
    garmentType: "trousers",
    outfitStyle: "cleanMinimal",
    colorDirection: "denimBased",
    topCategory: "white shirt",
    bottomCategory: "dark straight denim",
    bagCategory: "secondary canvas tote",
    visualAnchor: "white shirt",
    outfitLine: "Style her in a white shirt, dark straight denim, and a secondary canvas tote for a clean fallback outfit with clear sneaker visibility."
  }),
  fallbackSeed({
    id: "safe-trousers-002",
    garmentType: "trousers",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    topCategory: "cream knit top",
    bottomCategory: "soft grey straight trousers",
    bagCategory: "taupe shoulder bag as secondary accessory",
    visualAnchor: "cream knit top",
    outfitLine: "Use a cream knit top, soft grey straight trousers, and a taupe shoulder bag as a secondary accessory for safe neutral daily styling."
  }),
  fallbackSeed({
    id: "safe-trousers-003",
    garmentType: "trousers",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    topCategory: "black clean sleeveless top",
    bottomCategory: "cream straight trousers",
    bagCategory: "black small shoulder bag as secondary accessory",
    visualAnchor: "black clean top",
    outfitLine: "Style her in a black clean sleeveless top, cream straight trousers, and a black small shoulder bag as a secondary accessory for safe contrast."
  }),
  fallbackSeed({
    id: "safe-skirt-001",
    garmentType: "skirt",
    outfitStyle: "refinedFeminine",
    colorDirection: "lightClean",
    topCategory: "soft grey knit top",
    bottomCategory: "cream midi skirt",
    bagCategory: "taupe handbag as secondary accessory",
    visualAnchor: "cream midi skirt",
    outfitLine: "Pair a soft grey knit top with a cream midi skirt and a taupe handbag as a secondary accessory for safe feminine styling."
  }),
  fallbackSeed({
    id: "safe-skirt-002",
    garmentType: "skirt",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    topCategory: "white short-sleeve shirt",
    bottomCategory: "warm beige straight midi skirt",
    bagCategory: "light tan shoulder bag as secondary accessory",
    visualAnchor: "white short-sleeve shirt",
    outfitLine: "Use a white short-sleeve shirt, warm beige straight midi skirt, and a light tan shoulder bag as a secondary accessory for safe daily polish."
  }),
  fallbackSeed({
    id: "safe-shorts-001",
    garmentType: "shorts",
    outfitStyle: "relaxedWeekend",
    colorDirection: "neutralDaily",
    topCategory: "white clean-cut T-shirt",
    bottomCategory: "stone grey Bermuda shorts",
    bagCategory: "woven bag as secondary accessory",
    visualAnchor: "stone grey Bermuda shorts",
    outfitLine: "Style her in a white clean-cut T-shirt, stone grey Bermuda shorts, and a woven bag as a secondary accessory for safe warm-weather movement."
  }),
  fallbackSeed({
    id: "safe-dress-001",
    garmentType: "dress",
    outfitStyle: "refinedFeminine",
    colorDirection: "lightClean",
    topCategory: "cream shirt dress",
    bottomCategory: "cream shirt dress",
    outerLayerCategory: "soft beige cardigan",
    bagCategory: "small shoulder bag as secondary accessory",
    visualAnchor: "cream shirt dress",
    outfitLine: "Choose a cream shirt dress, soft beige cardigan, and a small shoulder bag as a secondary accessory for safe one-piece sneaker styling."
  }),
  fallbackSeed({
    id: "safe-lightactive-001",
    garmentType: "lightActive",
    outfitStyle: "softActive",
    colorDirection: "neutralDaily",
    topCategory: "clean-cut white tee",
    bottomCategory: "taupe jogger-style trousers",
    outerLayerCategory: "light grey zip jacket",
    bagCategory: "gym tote as secondary accessory",
    visualAnchor: "taupe jogger trousers",
    outfitLine: "Use a clean-cut white tee, taupe jogger-style trousers, light grey zip jacket, and gym tote as a secondary accessory for safe light-active styling."
  })
];
