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
    topCategory: "soft grey silk-cotton top",
    bottomCategory: "cream column skirt",
    season: ["spring", "autumn", "winter"],
    accessoryCategory: ["clean low socks"],
    visualAnchor: "cream column skirt",
    outfitLine: "Pair a soft grey silk-cotton top with a cream column skirt and clean low socks for safe feminine styling."
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
    topCategory: "black fine silk-cotton top",
    bottomCategory: "soft grey midi skirt",
    season: ["spring", "autumn", "winter"],
    accessoryCategory: ["no visible accessory"],
    visualAnchor: "black fine silk-cotton top",
    outfitLine: "Style her in a black fine silk-cotton top and soft grey midi skirt for a refined city outfit with no visible bag."
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
    colorDirection: "neutralDaily",
    topCategory: "navy mercerized-cotton tee",
    bottomCategory: "light stone cotton-twill Bermuda shorts",
    season: ["summer"],
    accessoryCategory: ["no visible accessory"],
    visualAnchor: "light stone cotton-twill Bermuda shorts",
    outfitLine: "Use a navy mercerized-cotton tee and light stone cotton-twill Bermuda shorts for a clean weekend outfit with no visible bag."
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
  }),
  fallbackSeed({
    id: "safe-trousers-009",
    garmentType: "trousers",
    outfitStyle: "polishedCommuter",
    colorDirection: "softAccent",
    topCategory: "soft powder-blue silk-cotton shirt",
    bottomCategory: "warm grey pleated trousers",
    season: ["spring", "summer"],
    bagCategory: "stone grey shoulder bag as secondary accessory",
    accessoryCategory: ["thin leather belt"],
    visualAnchor: "soft powder-blue shirt",
    outfitLine:
      "Style her in a soft powder-blue silk-cotton shirt, warm grey pleated trousers, and a stone grey shoulder bag as a secondary accessory for a safe polished outfit rotation."
  }),
  fallbackSeed({
    id: "safe-trousers-010",
    garmentType: "trousers",
    outfitStyle: "cleanMinimal",
    colorDirection: "darkAnchor",
    topCategory: "deep olive fine-knit polo",
    bottomCategory: "ivory ankle-length trousers",
    outerLayerCategory: "soft beige short jacket",
    season: ["spring", "autumn", "winter"],
    accessoryCategory: ["simple watch"],
    visualAnchor: "deep olive fine-knit polo",
    outfitLine:
      "Use a deep olive fine-knit polo, ivory ankle-length trousers, and a soft beige short jacket for a safe dark-anchor outfit that keeps sneakers readable."
  }),
  fallbackSeed({
    id: "safe-trousers-011",
    garmentType: "trousers",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    topCategory: "warm stone blouse",
    bottomCategory: "soft olive straight trousers",
    outerLayerCategory: "cream cropped jacket",
    season: ["spring", "autumn"],
    bagCategory: "taupe crossbody bag as secondary accessory",
    accessoryCategory: ["minimal earrings"],
    visualAnchor: "soft olive trousers",
    outfitLine:
      "Pair a warm stone blouse with soft olive straight trousers, a cream cropped jacket, and a taupe crossbody bag as a secondary accessory for a safe daily variation."
  }),
  fallbackSeed({
    id: "safe-trousers-012",
    garmentType: "trousers",
    outfitStyle: "bloggerLite",
    colorDirection: "denimBased",
    topCategory: "ivory compact knit vest",
    bottomCategory: "washed black straight denim",
    outerLayerCategory: "pale blue shirt",
    season: ["spring", "summer", "autumn"],
    accessoryCategory: ["clean low socks"],
    visualAnchor: "washed black straight denim",
    outfitLine:
      "Use an ivory compact knit vest over a pale blue shirt with washed black straight denim for a safe mature denim-based sneaker outfit."
  }),
  fallbackSeed({
    id: "safe-skirt-005",
    garmentType: "skirt",
    outfitStyle: "refinedFeminine",
    colorDirection: "softAccent",
    topCategory: "mist blue cotton-poplin shirt",
    bottomCategory: "warm grey wrap midi skirt",
    season: ["spring", "summer"],
    bagCategory: "cream small tote as secondary accessory",
    accessoryCategory: ["thin leather belt"],
    visualAnchor: "mist blue cotton-poplin shirt",
    outfitLine:
      "Pair a mist blue cotton-poplin shirt with a warm grey wrap midi skirt and a cream small tote as a secondary accessory for a safe feminine sneaker look."
  }),
  fallbackSeed({
    id: "safe-skirt-006",
    garmentType: "skirt",
    outfitStyle: "cleanMinimal",
    colorDirection: "darkAnchor",
    topCategory: "navy compact cardigan",
    bottomCategory: "ivory straight midi skirt",
    season: ["spring", "autumn", "winter"],
    accessoryCategory: ["simple watch"],
    visualAnchor: "navy compact cardigan",
    outfitLine:
      "Use a navy compact cardigan and ivory straight midi skirt for a safe dark-anchor skirt outfit with clear sneaker balance."
  }),
  fallbackSeed({
    id: "safe-skirt-007",
    garmentType: "skirt",
    outfitStyle: "realDaily",
    colorDirection: "denimBased",
    topCategory: "soft beige mercerized-cotton sleeveless top",
    bottomCategory: "dark denim midi skirt",
    outerLayerCategory: "no outer layer",
    season: ["spring", "summer", "autumn"],
    accessoryCategory: ["minimal earrings"],
    visualAnchor: "dark denim midi skirt",
    outfitLine:
      "Style her in a soft beige mercerized-cotton sleeveless top and dark denim midi skirt for a safe skirt-and-sneaker variation."
  }),
  fallbackSeed({
    id: "safe-shorts-008",
    garmentType: "shorts",
    outfitStyle: "relaxedWeekend",
    colorDirection: "softAccent",
    topCategory: "pale blue short-sleeve shirt",
    bottomCategory: "warm beige pleated shorts",
    season: ["summer"],
    bagCategory: "natural canvas tote as secondary accessory",
    accessoryCategory: ["simple watch"],
    visualAnchor: "pale blue short-sleeve shirt",
    outfitLine:
      "Style her in a pale blue short-sleeve shirt, warm beige pleated shorts, and a natural canvas tote as a secondary accessory for safe summer sneaker styling."
  }),
  fallbackSeed({
    id: "safe-shorts-009",
    garmentType: "shorts",
    outfitStyle: "cleanMinimal",
    colorDirection: "darkAnchor",
    topCategory: "muted navy mercerized-cotton sleeveless top",
    bottomCategory: "ivory linen-blend Bermuda shorts",
    season: ["summer"],
    accessoryCategory: ["minimal earrings"],
    visualAnchor: "muted navy mercerized-cotton sleeveless top",
    outfitLine:
      "Pair a muted navy mercerized-cotton sleeveless top with ivory linen-blend Bermuda shorts for safe restrained summer contrast."
  }),
  fallbackSeed({
    id: "safe-shorts-010",
    garmentType: "shorts",
    outfitStyle: "bloggerLite",
    colorDirection: "neutralDaily",
    topCategory: "sea-salt linen vest",
    bottomCategory: "taupe tailored Bermuda shorts",
    outerLayerCategory: "cream lightweight overshirt",
    season: ["summer"],
    accessoryCategory: ["understated sunglasses only outdoor"],
    visualAnchor: "taupe tailored Bermuda shorts",
    outfitLine:
      "Use a sea-salt linen vest, taupe tailored Bermuda shorts, and a cream lightweight overshirt for a safe polished summer option without casual cutoffs."
  }),
  fallbackSeed({
    id: "safe-dress-005",
    garmentType: "dress",
    outfitStyle: "refinedFeminine",
    colorDirection: "softAccent",
    topCategory: "pale blue cotton shirt dress",
    bottomCategory: "pale blue cotton shirt dress",
    season: ["spring", "summer"],
    bagCategory: "cream tote as secondary accessory",
    accessoryCategory: ["simple watch"],
    visualAnchor: "pale blue cotton shirt dress",
    outfitLine:
      "Choose a pale blue cotton shirt dress with a cream tote as a secondary accessory for a safe fresh one-piece sneaker outfit."
  }),
  fallbackSeed({
    id: "safe-dress-006",
    garmentType: "dress",
    outfitStyle: "cleanMinimal",
    colorDirection: "darkAnchor",
    topCategory: "deep olive straight knit dress",
    bottomCategory: "deep olive straight knit dress",
    outerLayerCategory: "warm beige short jacket",
    season: ["spring", "autumn", "winter"],
    accessoryCategory: ["minimal earrings"],
    visualAnchor: "deep olive straight knit dress",
    outfitLine:
      "Use a deep olive straight knit dress and warm beige short jacket for a safe controlled dark-anchor one-piece outfit."
  }),
  fallbackSeed({
    id: "safe-lightactive-005",
    garmentType: "lightActive",
    outfitStyle: "softActive",
    colorDirection: "neutralDaily",
    topCategory: "soft stone active polo",
    bottomCategory: "warm grey straight active trousers",
    season: ["spring", "summer", "autumn"],
    accessoryCategory: ["simple watch"],
    visualAnchor: "warm grey straight active trousers",
    outfitLine:
      "Use a soft stone active polo and warm grey straight active trousers for safe refined movement styling."
  }),
  fallbackSeed({
    id: "safe-lightactive-006",
    garmentType: "lightActive",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    topCategory: "deep navy clean active tee",
    bottomCategory: "taupe active trousers",
    outerLayerCategory: "cream lightweight zip layer",
    season: ["spring", "summer", "autumn"],
    accessoryCategory: ["clean low socks"],
    visualAnchor: "deep navy clean active tee",
    outfitLine:
      "Style her in a deep navy clean active tee, taupe active trousers, and a cream lightweight zip layer for a safe dark-anchor active option."
  })
];
