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
  accessoryCategory?: string[];
  imageTypes?: string[];
  season?: SceneOutfitSeed["season"];
  visualAnchor: string;
  outfitLine: string;
}): SceneOutfitSeed {
  return {
    ...input,
    sceneKey: "fallback",
    season: input.season ?? ["spring", "summer", "autumn", "winter"],
    suitableShoes: ["ALL"],
    imageTypes: input.imageTypes ?? ["onFoot", "lifestyle", "mirror", "gymCommute"],
    accessoryCategory: input.accessoryCategory ?? ["secondary accessory only"],
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
    season: ["spring", "autumn"],
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
    season: ["spring", "autumn", "winter"],
    accessoryCategory: ["simple watch"],
    visualAnchor: "cream knit top",
    outfitLine: "Use a cream knit top and soft grey tailored trousers for safe neutral daily styling with no visible bag."
  }),
  fallbackSeed({
    id: "safe-trousers-003",
    garmentType: "trousers",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    topCategory: "black clean sleeveless top",
    bottomCategory: "ivory straight trousers",
    season: ["summer"],
    accessoryCategory: ["no visible accessory"],
    visualAnchor: "black clean top",
    outfitLine: "Style her in a black clean sleeveless top and ivory straight trousers for safe contrast with no visible bag."
  }),
  fallbackSeed({
    id: "safe-trousers-004",
    garmentType: "trousers",
    outfitStyle: "polishedCommuter",
    colorDirection: "softAccent",
    topCategory: "pale blue shirt",
    bottomCategory: "warm beige wide-leg trousers",
    season: ["spring", "summer"],
    accessoryCategory: ["subtle optical glasses"],
    visualAnchor: "pale blue shirt",
    outfitLine: "Style her in a pale blue shirt, warm beige wide-leg trousers, and subtle optical glasses for a relaxed polished city outfit."
  }),
  fallbackSeed({
    id: "safe-trousers-005",
    garmentType: "trousers",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    topCategory: "oatmeal knit",
    bottomCategory: "charcoal wool trousers",
    outerLayerCategory: "cream short jacket",
    season: ["autumn", "winter"],
    accessoryCategory: ["low-saturation scarf"],
    visualAnchor: "charcoal wool trousers",
    outfitLine: "Use an oatmeal knit, charcoal wool trousers, and a cream short jacket for a calm autumn commute fallback."
  }),
  fallbackSeed({
    id: "safe-trousers-006",
    garmentType: "trousers",
    outfitStyle: "softActive",
    colorDirection: "neutralDaily",
    topCategory: "clean-cut white tee",
    bottomCategory: "taupe jogger-style trousers",
    season: ["spring", "summer", "autumn"],
    accessoryCategory: ["wearableOnly"],
    visualAnchor: "taupe jogger-style trousers",
    outfitLine: "Use a clean-cut white tee and taupe jogger-style trousers for safe easy-movement styling without sporty branding."
  }),
  fallbackSeed({
    id: "safe-trousers-007",
    garmentType: "trousers",
    outfitStyle: "realDaily",
    colorDirection: "lightClean",
    topCategory: "grey-blue shirt",
    bottomCategory: "cream straight trousers",
    season: ["spring", "summer"],
    bagCategory: "soft taupe shoulder bag as secondary accessory",
    visualAnchor: "grey-blue shirt",
    outfitLine: "Use a grey-blue shirt, cream straight trousers, and a soft taupe shoulder bag as a secondary accessory for a safe low-saturation outfit."
  }),
  fallbackSeed({
    id: "safe-trousers-008",
    garmentType: "trousers",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    topCategory: "navy fine-knit top",
    bottomCategory: "warm beige trousers",
    season: ["spring", "autumn", "winter"],
    accessoryCategory: ["simple watch"],
    visualAnchor: "navy fine-knit top",
    outfitLine: "Use a navy fine-knit top and warm beige trousers for safe dark-anchor daily styling."
  }),
  fallbackSeed({
    id: "safe-skirt-001",
    garmentType: "skirt",
    outfitStyle: "refinedFeminine",
    colorDirection: "lightClean",
    topCategory: "soft grey knit top",
    bottomCategory: "cream column skirt",
    season: ["spring", "autumn", "winter"],
    accessoryCategory: ["clean low socks"],
    visualAnchor: "cream column skirt",
    outfitLine: "Pair a soft grey knit top with a cream column skirt and clean low socks for safe feminine styling."
  }),
  fallbackSeed({
    id: "safe-skirt-002",
    garmentType: "skirt",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    topCategory: "white short-sleeve shirt",
    bottomCategory: "warm beige straight midi skirt",
    season: ["summer"],
    bagCategory: "light tan shoulder bag as secondary accessory",
    visualAnchor: "white short-sleeve shirt",
    outfitLine: "Use a white short-sleeve shirt, warm beige straight midi skirt, and a light tan shoulder bag as a secondary accessory for safe daily polish."
  }),
  fallbackSeed({
    id: "safe-skirt-003",
    garmentType: "skirt",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    topCategory: "black fine-knit top",
    bottomCategory: "soft grey midi skirt",
    season: ["spring", "autumn", "winter"],
    accessoryCategory: ["no visible accessory"],
    visualAnchor: "black fine-knit top",
    outfitLine: "Style her in a black fine-knit top and soft grey midi skirt for a refined city outfit with no visible bag."
  }),
  fallbackSeed({
    id: "safe-skirt-004",
    garmentType: "skirt",
    outfitStyle: "cleanMinimal",
    colorDirection: "softAccent",
    topCategory: "pale blue shirt",
    bottomCategory: "taupe midi skirt",
    season: ["spring", "autumn"],
    accessoryCategory: ["subtle optical glasses"],
    visualAnchor: "pale blue shirt",
    outfitLine: "Use a pale blue shirt, taupe midi skirt, and subtle optical glasses for a quiet bookstore outfit."
  }),
  fallbackSeed({
    id: "safe-shorts-001",
    garmentType: "shorts",
    outfitStyle: "relaxedWeekend",
    colorDirection: "lightClean",
    topCategory: "white clean-cut T-shirt",
    bottomCategory: "ivory Bermuda shorts",
    season: ["summer"],
    accessoryCategory: ["simple watch"],
    visualAnchor: "ivory Bermuda shorts",
    outfitLine: "Style her in a white cotton T-shirt and ivory Bermuda shorts for safe warm-weather movement with no visible bag."
  }),
  fallbackSeed({
    id: "safe-shorts-002",
    garmentType: "shorts",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    topCategory: "black clean sleeveless top",
    bottomCategory: "beige tailored shorts",
    season: ["summer"],
    bagCategory: "black small shoulder bag as secondary accessory",
    accessoryCategory: ["minimal optical glasses"],
    visualAnchor: "black clean top",
    outfitLine: "Pair a black clean sleeveless top with beige tailored shorts and a black small shoulder bag as a secondary accessory for safe summer contrast."
  }),
  fallbackSeed({
    id: "safe-shorts-003",
    garmentType: "shorts",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    topCategory: "cream linen shirt",
    bottomCategory: "soft khaki Bermuda shorts",
    season: ["summer"],
    accessoryCategory: ["understated sunglasses only outdoor"],
    visualAnchor: "soft khaki Bermuda shorts",
    outfitLine: "Use a cream linen shirt and soft khaki Bermuda shorts for breathable summer styling with no visible bag."
  }),
  fallbackSeed({
    id: "safe-shorts-004",
    garmentType: "shorts",
    outfitStyle: "cleanMinimal",
    colorDirection: "denimBased",
    topCategory: "navy knit tee",
    bottomCategory: "light denim Bermuda shorts",
    season: ["summer"],
    accessoryCategory: ["no visible accessory"],
    visualAnchor: "light denim Bermuda shorts",
    outfitLine: "Use a navy knit tee and light denim Bermuda shorts for a clean weekend outfit with no visible bag."
  }),
  fallbackSeed({
    id: "safe-shorts-005",
    garmentType: "shorts",
    outfitStyle: "bloggerLite",
    colorDirection: "neutralDaily",
    topCategory: "white oversized shirt",
    bottomCategory: "taupe tailored shorts",
    season: ["summer"],
    accessoryCategory: ["simple watch"],
    visualAnchor: "taupe tailored shorts",
    outfitLine: "Style her in a white oversized shirt and taupe tailored shorts for a relaxed summer city walk."
  }),
  fallbackSeed({
    id: "safe-shorts-006",
    garmentType: "shorts",
    outfitStyle: "realDaily",
    colorDirection: "softAccent",
    topCategory: "sage green lightweight shirt",
    bottomCategory: "cream cotton shorts",
    season: ["summer"],
    bagCategory: "light tan handbag as secondary accessory",
    accessoryCategory: ["hair clip"],
    visualAnchor: "sage green lightweight shirt",
    outfitLine: "Use a sage green lightweight shirt, cream cotton shorts, and a light tan handbag as a secondary accessory for restrained summer freshness."
  }),
  fallbackSeed({
    id: "safe-shorts-007",
    garmentType: "shorts",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    topCategory: "dark coffee clean-cut tee",
    bottomCategory: "charcoal tailored shorts",
    season: ["summer"],
    accessoryCategory: ["no visible accessory"],
    visualAnchor: "dark coffee clean-cut tee",
    outfitLine: "Style her in a dark coffee clean-cut tee and charcoal tailored shorts for a restrained dark-anchor summer outfit."
  }),
  fallbackSeed({
    id: "safe-dress-001",
    garmentType: "dress",
    outfitStyle: "refinedFeminine",
    colorDirection: "neutralDaily",
    topCategory: "pale khaki shirt dress",
    bottomCategory: "pale khaki shirt dress",
    season: ["spring", "summer"],
    accessoryCategory: ["simple watch"],
    visualAnchor: "pale khaki shirt dress",
    outfitLine: "Choose a pale khaki shirt dress for safe one-piece sneaker styling with no visible bag."
  }),
  fallbackSeed({
    id: "safe-dress-002",
    garmentType: "dress",
    outfitStyle: "cleanMinimal",
    colorDirection: "lightClean",
    topCategory: "ivory straight dress",
    bottomCategory: "ivory straight dress",
    outerLayerCategory: "soft beige cardigan",
    season: ["spring", "autumn"],
    visualAnchor: "ivory straight dress",
    outfitLine: "Choose an ivory straight dress layered with a soft beige cardigan for safe one-piece styling."
  }),
  fallbackSeed({
    id: "safe-dress-003",
    garmentType: "dress",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    topCategory: "soft grey long-sleeve knit dress",
    bottomCategory: "soft grey long-sleeve knit dress",
    season: ["autumn", "winter"],
    accessoryCategory: ["thin socks"],
    visualAnchor: "soft grey knit dress",
    outfitLine: "Use a soft grey long-sleeve knit dress and thin socks for a quiet winter mirror outfit."
  }),
  fallbackSeed({
    id: "safe-dress-004",
    garmentType: "dress",
    outfitStyle: "cleanMinimal",
    colorDirection: "softAccent",
    topCategory: "muted blue-grey shirt dress",
    bottomCategory: "muted blue-grey shirt dress",
    season: ["spring"],
    accessoryCategory: ["subtle optical glasses"],
    visualAnchor: "muted blue-grey shirt dress",
    outfitLine: "Style her in a muted blue-grey shirt dress and subtle optical glasses for a calm spring cafe-side outfit."
  }),
  fallbackSeed({
    id: "safe-lightactive-001",
    garmentType: "lightActive",
    outfitStyle: "softActive",
    colorDirection: "neutralDaily",
    topCategory: "clean long-sleeve top",
    bottomCategory: "taupe jogger-style trousers",
    outerLayerCategory: "light cotton jacket",
    season: ["spring", "autumn"],
    accessoryCategory: ["simple watch"],
    visualAnchor: "taupe jogger trousers",
    outfitLine: "Use a clean long-sleeve top, taupe jogger-style trousers, and a light cotton jacket for safe light-active styling."
  }),
  fallbackSeed({
    id: "safe-lightactive-002",
    garmentType: "lightActive",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    topCategory: "dark active top",
    bottomCategory: "straight active trousers",
    season: ["spring", "summer", "autumn", "winter"],
    accessoryCategory: ["no visible accessory"],
    visualAnchor: "dark active top",
    outfitLine: "Style her in a dark active top and straight active trousers for a restrained movement-ready fallback."
  }),
  fallbackSeed({
    id: "safe-lightactive-003",
    garmentType: "lightActive",
    outfitStyle: "cleanMinimal",
    colorDirection: "darkAnchor",
    topCategory: "light grey zip jacket",
    bottomCategory: "charcoal active trousers",
    outerLayerCategory: "ivory active top",
    season: ["autumn", "winter"],
    accessoryCategory: ["clean low socks"],
    visualAnchor: "charcoal active trousers",
    outfitLine: "Use an ivory active top under a light grey zip jacket with charcoal active trousers for quiet active styling."
  }),
  fallbackSeed({
    id: "safe-lightactive-004",
    garmentType: "lightActive",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    topCategory: "navy clean-cut tee",
    bottomCategory: "dark active shorts",
    imageTypes: ["gymCommute"],
    season: ["summer"],
    accessoryCategory: ["no visible accessory"],
    visualAnchor: "navy clean-cut tee",
    outfitLine: "Use a navy clean-cut tee and dark active shorts only for a refined city-to-gym context."
  })
];
