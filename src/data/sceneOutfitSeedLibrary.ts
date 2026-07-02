export type GarmentType = "trousers" | "skirt" | "shorts" | "dress" | "lightActive";

export type OutfitStyle =
  | "cleanMinimal"
  | "realDaily"
  | "bloggerLite"
  | "refinedFeminine"
  | "darkAnchor"
  | "relaxedWeekend"
  | "polishedCommuter"
  | "softActive";

export type ColorDirection = "lightClean" | "neutralDaily" | "darkAnchor" | "softAccent" | "denimBased";

export type SceneOutfitSeed = {
  id: string;
  sceneKey: string;
  garmentType: GarmentType;
  outfitStyle: OutfitStyle;
  colorDirection: ColorDirection;
  season: ("spring" | "summer" | "autumn" | "winter")[];
  suitableShoes: string[];
  imageTypes: string[];
  topCategory: string;
  bottomCategory: string;
  outerLayerCategory?: string;
  bagCategory?: string;
  accessoryCategory?: string[];
  visualAnchor: string;
  outfitLine: string;
  stylingRealismLine: string;
  forbidden?: string[];
};

type SeedDraft = Omit<SceneOutfitSeed, "id" | "sceneKey" | "outfitLine" | "stylingRealismLine"> & {
  outfitLine: string;
  stylingRealismLine?: string;
};

const stylingRealismA =
  "Keep the styling real and not over-arranged, with natural fabric folds, believable layering, one clear visual anchor, and subtle styling choices that feel like a tasteful real-life outfit post rather than an AI template.";

const stylingRealismB =
  "Make the outfit feel like a saved lifestyle outfit reference: grounded, wearable, slightly styled, and naturally photogenic, with restrained accessories and believable daily coordination.";

const baseForbidden = [
  "stiff corporate suit",
  "high heel office mood",
  "old-fashioned mature styling",
  "luxury logo",
  "streetwear dominance",
  "floor-length skirt",
  "floor-length dress",
  "long coat covering shoes",
  "oversized bag blocking shoes",
  "head-to-toe bright color",
  "multiple saturated accents",
  "random color blocking",
  "neon outfit",
  "loud trend color styling"
];

const imageTypes = ["onFoot", "lifestyle", "mirror"];
const activeImageTypes = ["onFoot", "lifestyle", "gymCommute"];
const allShoes = ["ALL"];

const trouserPool: SeedDraft[] = [
  {
    garmentType: "trousers",
    outfitStyle: "cleanMinimal",
    colorDirection: "lightClean",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "white cotton shirt",
    bottomCategory: "cream straight trousers",
    outerLayerCategory: "light beige shirt jacket",
    bagCategory: "taupe shoulder bag as secondary accessory",
    accessoryCategory: ["small gold earrings"],
    visualAnchor: "white cotton shirt",
    outfitLine:
      "Style her in a white cotton shirt, cream straight trousers, a light beige shirt jacket, and a taupe shoulder bag as a secondary accessory for clean THERUIZ AURA daily polish.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    season: ["spring", "autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "oatmeal lightweight knit",
    bottomCategory: "stone relaxed trousers",
    outerLayerCategory: "soft grey cardigan",
    accessoryCategory: ["thin belt"],
    visualAnchor: "oatmeal knit",
    outfitLine:
      "Use an oatmeal lightweight knit, stone relaxed trousers, and a soft grey cardigan for calm wearable texture with no visible bag.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "black clean sleeveless top",
    bottomCategory: "ivory straight trousers",
    outerLayerCategory: "ivory overshirt",
    accessoryCategory: ["minimal earrings"],
    visualAnchor: "black clean top",
    outfitLine:
      "Pair a black clean sleeveless top with ivory straight trousers and an ivory overshirt for grounded contrast without a visible bag.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "bloggerLite",
    colorDirection: "denimBased",
    season: ["spring", "summer", "autumn"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "pale blue open shirt",
    bottomCategory: "dark straight denim",
    outerLayerCategory: "white tee base",
    accessoryCategory: ["slim leather belt"],
    visualAnchor: "pale blue shirt",
    outfitLine:
      "Use a white tee under a pale blue open shirt and dark straight denim for a real city outfit with denim depth and no visible bag.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "polishedCommuter",
    colorDirection: "neutralDaily",
    season: ["spring", "autumn"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "misty blue shirt",
    bottomCategory: "warm beige wide-leg trousers",
    outerLayerCategory: "soft grey blazer",
    bagCategory: "grey shoulder bag as secondary accessory",
    accessoryCategory: ["simple watch"],
    visualAnchor: "misty blue shirt",
    outfitLine:
      "Style her in a misty blue shirt, warm beige tapered trousers, a soft grey blazer, and a grey shoulder bag as a secondary accessory for low-saturation polish.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "bloggerLite",
    colorDirection: "softAccent",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "misty light blue fine-knit short-sleeve top as the only soft color accent",
    bottomCategory: "stone straight trousers",
    outerLayerCategory: "ivory lightweight shirt jacket",
    bagCategory: "soft taupe shoulder bag as secondary accessory",
    accessoryCategory: ["simple watch"],
    visualAnchor: "misty light blue fine-knit top",
    outfitLine:
      "Style her in one misty light blue fine-knit short-sleeve top as the only soft color accent, stone straight trousers, an ivory lightweight shirt jacket, and a soft taupe shoulder bag, keeping the palette restrained, versatile, and THERUIZ AURA refined.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "cleanMinimal",
    colorDirection: "darkAnchor",
    season: ["autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "navy fine-knit top",
    bottomCategory: "charcoal wool trousers",
    outerLayerCategory: "cream short coat",
    bagCategory: "muted brown shoulder bag as secondary accessory",
    accessoryCategory: ["low-saturation scarf"],
    visualAnchor: "navy fine-knit top",
    outfitLine:
      "Use a navy fine-knit top, warm grey wool trousers, a cream short coat, and a muted brown shoulder bag as a secondary accessory for composed seasonal depth.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "polishedCommuter",
    colorDirection: "softAccent",
    season: ["autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "warm ivory fine-knit top",
    bottomCategory: "charcoal tailored trousers",
    outerLayerCategory: "muted berry-wine fine-knit cardigan as the only soft color accent",
    bagCategory: "soft taupe handbag as secondary accessory",
    accessoryCategory: ["simple watch"],
    visualAnchor: "muted berry-wine fine-knit cardigan",
    outfitLine:
      "Use a warm ivory fine-knit top, charcoal tailored trousers, and one muted berry-wine fine-knit cardigan as the only soft color accent, with a soft taupe handbag kept secondary for quiet seasonal depth.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    season: ["summer", "autumn"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "cream linen shirt",
    bottomCategory: "pale khaki linen trousers",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["understated sunglasses only outdoor"],
    visualAnchor: "cream linen shirt",
    outfitLine:
      "Style her in a cream linen shirt and pale khaki linen trousers for breathable daily movement with clear shoes and no visible bag.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "bloggerLite",
    colorDirection: "denimBased",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "grey-blue shirt",
    bottomCategory: "white denim straight trousers",
    outerLayerCategory: "light stone jacket",
    accessoryCategory: ["subtle optical glasses"],
    visualAnchor: "white denim trousers",
    outfitLine:
      "Use a grey-blue shirt, white denim straight trousers, and a light stone jacket for a fresh denim-based outfit with no visible bag.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    season: ["spring", "summer", "autumn"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "dark coffee clean-cut tee",
    bottomCategory: "taupe relaxed trousers",
    outerLayerCategory: "cotton jacket",
    accessoryCategory: ["no visible accessory"],
    visualAnchor: "dark coffee tee",
    outfitLine:
      "Style her in a dark coffee clean-cut tee, taupe relaxed trousers, and a cotton jacket for a grounded dark-anchor daily outfit.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "realDaily",
    colorDirection: "denimBased",
    season: ["spring", "summer", "autumn"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "soft beige blouse",
    bottomCategory: "light blue straight denim",
    outerLayerCategory: "thin beige cardigan",
    bagCategory: "pale grey shoulder bag as secondary accessory",
    accessoryCategory: ["hair clip"],
    visualAnchor: "light blue denim",
    outfitLine:
      "Use a soft beige blouse, light blue straight denim, a thin beige cardigan, and a pale grey shoulder bag as a secondary accessory for an easy low-saturation denim look.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "cleanMinimal",
    colorDirection: "neutralDaily",
    season: ["autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "warm ivory turtleneck",
    bottomCategory: "soft brown corduroy trousers",
    outerLayerCategory: "short wool jacket",
    accessoryCategory: ["wool socks"],
    visualAnchor: "corduroy trousers",
    outfitLine:
      "Use a warm ivory turtleneck, soft brown corduroy trousers, and a short wool jacket for tactile seasonal polish with no visible bag.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "softActive",
    colorDirection: "neutralDaily",
    season: ["spring", "summer", "autumn"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "clean-cut white tee",
    bottomCategory: "taupe jogger-style trousers",
    outerLayerCategory: "light grey cardigan",
    accessoryCategory: ["wearableOnly"],
    visualAnchor: "taupe jogger-style trousers",
    outfitLine:
      "Use a clean-cut white tee, taupe jogger-style trousers, and a light grey cardigan for a polished easy-movement outfit without sporty branding.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "polishedCommuter",
    colorDirection: "softAccent",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "soft powder-blue silk-cotton shirt",
    bottomCategory: "warm grey pleated trousers",
    outerLayerCategory: "no outer layer",
    bagCategory: "stone grey shoulder bag as secondary accessory",
    accessoryCategory: ["thin leather belt"],
    visualAnchor: "soft powder-blue shirt",
    outfitLine:
      "Style her in a soft powder-blue silk-cotton shirt, warm grey pleated trousers, and a stone grey shoulder bag as a secondary accessory for a polished one-shoe-many-outfits city look.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "cleanMinimal",
    colorDirection: "darkAnchor",
    season: ["spring", "autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "deep olive fine-knit polo",
    bottomCategory: "ivory ankle-length trousers",
    outerLayerCategory: "soft beige short jacket",
    accessoryCategory: ["simple watch"],
    visualAnchor: "deep olive fine-knit polo",
    outfitLine:
      "Use a deep olive fine-knit polo, ivory ankle-length trousers, and a soft beige short jacket for a restrained dark-anchor outfit that makes the sneakers feel versatile.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    season: ["spring", "autumn"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "warm stone blouse",
    bottomCategory: "soft olive straight trousers",
    outerLayerCategory: "cream cropped jacket",
    bagCategory: "taupe crossbody bag as secondary accessory",
    accessoryCategory: ["minimal earrings"],
    visualAnchor: "soft olive trousers",
    outfitLine:
      "Pair a warm stone blouse with soft olive straight trousers, a cream cropped jacket, and a taupe crossbody bag as a secondary accessory for a calm daily outfit rotation.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "bloggerLite",
    colorDirection: "denimBased",
    season: ["spring", "summer", "autumn"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "ivory compact knit vest",
    bottomCategory: "washed black straight denim",
    outerLayerCategory: "pale blue shirt",
    accessoryCategory: ["clean low socks"],
    visualAnchor: "washed black straight denim",
    outfitLine:
      "Use an ivory compact knit vest over a pale blue shirt with washed black straight denim for a mature denim-based variation that keeps the sneakers readable.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "polishedCommuter",
    colorDirection: "neutralDaily",
    season: ["autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "cream cashmere-blend crewneck",
    bottomCategory: "taupe wool straight trousers",
    outerLayerCategory: "warm grey short coat",
    bagCategory: "dark coffee tote as secondary accessory",
    accessoryCategory: ["low-saturation scarf"],
    visualAnchor: "taupe wool straight trousers",
    outfitLine:
      "Style her in a cream cashmere-blend crewneck, taupe wool straight trousers, a warm grey short coat, and a dark coffee tote as a secondary accessory for refined cold-weather versatility.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "relaxedWeekend",
    colorDirection: "softAccent",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "pale sage cotton shirt",
    bottomCategory: "cream barrel-leg trousers",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["understated sunglasses only outdoor"],
    visualAnchor: "pale sage cotton shirt",
    outfitLine:
      "Use a pale sage cotton shirt and cream barrel-leg trousers for a relaxed low-saturation outfit that shows how the sneaker works beyond basic denim.",
    forbidden: baseForbidden
  }
];

const skirtPool: SeedDraft[] = [
  {
    garmentType: "skirt",
    outfitStyle: "refinedFeminine",
    colorDirection: "lightClean",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "soft grey knit top",
    bottomCategory: "cream column skirt",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["minimal earrings"],
    visualAnchor: "cream column skirt",
    outfitLine:
      "Pair a soft grey knit top with a cream column skirt for mature feminine ease while keeping ankles and sneakers readable.",
    forbidden: baseForbidden
  },
  {
    garmentType: "skirt",
    outfitStyle: "bloggerLite",
    colorDirection: "softAccent",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "oatmeal knit top",
    bottomCategory: "taupe midi skirt",
    outerLayerCategory: "light cardigan",
    bagCategory: "pale grey shoulder bag as secondary accessory",
    accessoryCategory: ["simple watch"],
    visualAnchor: "taupe midi skirt",
    outfitLine:
      "Use an oatmeal knit top, taupe midi skirt, light cardigan, and a pale grey shoulder bag as a secondary accessory for a soft low-saturation outfit record.",
    forbidden: baseForbidden
  },
  {
    garmentType: "skirt",
    outfitStyle: "refinedFeminine",
    colorDirection: "softAccent",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "dusty rose silk-cotton shirt as the only soft color accent",
    bottomCategory: "stone A-line skirt",
    outerLayerCategory: "no outer layer",
    bagCategory: "soft taupe mini bag as secondary accessory",
    accessoryCategory: ["minimal earrings"],
    visualAnchor: "dusty rose silk-cotton shirt",
    outfitLine:
      "Pair one dusty rose silk-cotton shirt as the only soft color accent with a stone A-line skirt and a soft taupe mini bag, keeping the silhouette calm, mature, versatile, and shoe-readable.",
    forbidden: baseForbidden
  },
  {
    garmentType: "skirt",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    season: ["autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "charcoal fine-knit top",
    bottomCategory: "warm beige straight midi skirt",
    outerLayerCategory: "soft camel jacket",
    bagCategory: "black small shoulder bag as secondary accessory",
    accessoryCategory: ["small gold earrings"],
    visualAnchor: "charcoal fine-knit top",
    outfitLine:
      "Use a charcoal fine-knit top, warm beige straight midi skirt, soft camel jacket, and a black small shoulder bag as a secondary accessory for gentle dark-anchor femininity.",
    forbidden: baseForbidden
  },
  {
    garmentType: "skirt",
    outfitStyle: "refinedFeminine",
    colorDirection: "denimBased",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "ivory short-sleeve shirt",
    bottomCategory: "light denim midi skirt",
    outerLayerCategory: "no outer layer",
    bagCategory: "natural canvas bag as secondary accessory",
    accessoryCategory: ["thin belt"],
    visualAnchor: "light denim skirt",
    outfitLine:
      "Style her in an ivory short-sleeve shirt, light denim midi skirt, and a natural canvas bag as a secondary accessory for relaxed feminine denim styling.",
    forbidden: baseForbidden
  },
  {
    garmentType: "skirt",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    season: ["autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "black fine-knit top",
    bottomCategory: "soft grey straight midi skirt",
    outerLayerCategory: "cream short jacket",
    accessoryCategory: ["clean low socks"],
    visualAnchor: "black fine-knit top",
    outfitLine:
      "Style her in a black fine-knit top, soft grey straight midi skirt, and a cream short jacket for a refined autumn city outfit with no visible bag.",
    forbidden: baseForbidden
  },
  {
    garmentType: "skirt",
    outfitStyle: "cleanMinimal",
    colorDirection: "softAccent",
    season: ["spring", "summer", "autumn"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "pale blue shirt",
    bottomCategory: "pale grey midi skirt",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["subtle optical glasses"],
    visualAnchor: "pale blue shirt",
    outfitLine:
      "Use a pale blue shirt, pale grey midi skirt, and subtle optical glasses for a quiet bookstore-ready outfit with no visible bag.",
    forbidden: baseForbidden
  },
  {
    garmentType: "skirt",
    outfitStyle: "refinedFeminine",
    colorDirection: "neutralDaily",
    season: ["spring", "autumn"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "warm beige blouse",
    bottomCategory: "oatmeal A-line skirt",
    outerLayerCategory: "light wool-blend blazer",
    bagCategory: "muted brown shoulder bag as secondary accessory",
    accessoryCategory: ["no visible accessory"],
    visualAnchor: "oatmeal A-line skirt",
    outfitLine:
      "Use a warm beige blouse, oatmeal A-line skirt, light wool-blend blazer, and a muted brown shoulder bag as a secondary accessory for quiet seasonal polish.",
    forbidden: baseForbidden
  },
  {
    garmentType: "skirt",
    outfitStyle: "realDaily",
    colorDirection: "darkAnchor",
    season: ["autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "soft grey long-sleeve top",
    bottomCategory: "charcoal wool-blend skirt",
    outerLayerCategory: "taupe structured cardigan",
    accessoryCategory: ["wool socks"],
    visualAnchor: "charcoal skirt",
    outfitLine:
      "Pair a soft grey long-sleeve top with a charcoal wool-blend skirt and taupe structured cardigan for a calm dark-anchor skirt outfit.",
    forbidden: baseForbidden
  },
  {
    garmentType: "skirt",
    outfitStyle: "darkAnchor",
    colorDirection: "softAccent",
    season: ["autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "muted sage fine-knit top as the only soft color accent",
    bottomCategory: "taupe straight skirt",
    outerLayerCategory: "cream short coat",
    bagCategory: "muted brown handbag as secondary accessory",
    accessoryCategory: ["minimal gold earrings"],
    visualAnchor: "muted sage fine-knit top",
    outfitLine:
      "Use one muted sage fine-knit top as the only soft color accent with a taupe straight skirt, cream short coat, and muted brown handbag for mature, coordinated seasonal contrast.",
    forbidden: baseForbidden
  },
  {
    garmentType: "skirt",
    outfitStyle: "refinedFeminine",
    colorDirection: "softAccent",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "mist blue cotton-poplin shirt",
    bottomCategory: "warm grey wrap midi skirt",
    outerLayerCategory: "no outer layer",
    bagCategory: "cream small tote as secondary accessory",
    accessoryCategory: ["thin leather belt"],
    visualAnchor: "mist blue cotton-poplin shirt",
    outfitLine:
      "Pair a mist blue cotton-poplin shirt with a warm grey wrap midi skirt and a cream small tote as a secondary accessory for easy feminine styling with clear sneaker balance.",
    forbidden: baseForbidden
  },
  {
    garmentType: "skirt",
    outfitStyle: "cleanMinimal",
    colorDirection: "darkAnchor",
    season: ["spring", "autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "navy compact cardigan",
    bottomCategory: "ivory straight midi skirt",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["simple watch"],
    visualAnchor: "navy compact cardigan",
    outfitLine:
      "Use a navy compact cardigan and ivory straight midi skirt for a quiet dark-anchor skirt outfit that keeps the shoes part of a versatile wardrobe.",
    forbidden: baseForbidden
  },
  {
    garmentType: "skirt",
    outfitStyle: "realDaily",
    colorDirection: "denimBased",
    season: ["spring", "summer", "autumn"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "soft beige sleeveless knit",
    bottomCategory: "dark denim midi skirt",
    outerLayerCategory: "light taupe shirt jacket",
    accessoryCategory: ["minimal earrings"],
    visualAnchor: "dark denim midi skirt",
    outfitLine:
      "Style her in a soft beige sleeveless knit, dark denim midi skirt, and light taupe shirt jacket for a grounded skirt-and-sneaker combination.",
    forbidden: baseForbidden
  },
  {
    garmentType: "skirt",
    outfitStyle: "refinedFeminine",
    colorDirection: "neutralDaily",
    season: ["autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "warm ivory ribbed knit",
    bottomCategory: "soft brown wool-blend A-line skirt",
    outerLayerCategory: "oatmeal short coat",
    bagCategory: "taupe structured handbag as secondary accessory",
    accessoryCategory: ["clean low socks"],
    visualAnchor: "soft brown A-line skirt",
    outfitLine:
      "Use a warm ivory ribbed knit, soft brown wool-blend A-line skirt, oatmeal short coat, and taupe structured handbag as a secondary accessory for warm seasonal sneaker styling.",
    forbidden: baseForbidden
  }
];

const shortsPool: SeedDraft[] = [
  {
    garmentType: "shorts",
    outfitStyle: "relaxedWeekend",
    colorDirection: "lightClean",
    season: ["summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "white cotton T-shirt",
    bottomCategory: "ivory Bermuda shorts",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["simple watch"],
    visualAnchor: "ivory Bermuda shorts",
    outfitLine:
      "Style her in a white cotton T-shirt and ivory Bermuda shorts for clean refined summer movement with no visible bag.",
    forbidden: baseForbidden
  },
  {
    garmentType: "shorts",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    season: ["summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "black clean sleeveless top",
    bottomCategory: "beige tailored shorts",
    outerLayerCategory: "no outer layer",
    bagCategory: "black shoulder bag as secondary accessory",
    accessoryCategory: ["minimal optical glasses"],
    visualAnchor: "black clean top",
    outfitLine:
      "Pair a black clean sleeveless top with beige tailored shorts and a black shoulder bag as a secondary accessory for grounded warm-weather contrast.",
    forbidden: baseForbidden
  },
  {
    garmentType: "shorts",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    season: ["summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "cream linen shirt",
    bottomCategory: "soft khaki Bermuda shorts",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["understated sunglasses only outdoor"],
    visualAnchor: "soft khaki shorts",
    outfitLine:
      "Style her in a cream linen shirt and soft khaki Bermuda shorts for breathable summer styling with no visible bag.",
    forbidden: baseForbidden
  },
  {
    garmentType: "shorts",
    outfitStyle: "bloggerLite",
    colorDirection: "softAccent",
    season: ["summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "dusty rose lightweight knit tee as the only soft color accent",
    bottomCategory: "soft khaki tailored shorts",
    outerLayerCategory: "no outer layer",
    bagCategory: "natural canvas tote as secondary accessory",
    accessoryCategory: ["simple watch"],
    visualAnchor: "dusty rose lightweight knit tee",
    outfitLine:
      "Use one dusty rose lightweight knit tee as the only soft color accent with soft khaki tailored shorts and a natural canvas tote, keeping the outfit clear, mature, restrained, and easy to coordinate.",
    forbidden: baseForbidden
  },
  {
    garmentType: "shorts",
    outfitStyle: "cleanMinimal",
    colorDirection: "neutralDaily",
    season: ["summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "navy knit tee",
    bottomCategory: "light stone cotton-twill Bermuda shorts",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["no visible accessory"],
    visualAnchor: "light stone cotton-twill Bermuda shorts",
    outfitLine:
      "Use a navy knit tee and light stone cotton-twill Bermuda shorts for a clean weekend outfit with no visible bag.",
    forbidden: baseForbidden
  },
  {
    garmentType: "shorts",
    outfitStyle: "bloggerLite",
    colorDirection: "neutralDaily",
    season: ["summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "white oversized shirt",
    bottomCategory: "taupe tailored shorts",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["simple watch"],
    visualAnchor: "taupe tailored shorts",
    outfitLine:
      "Style her in a white oversized shirt and taupe tailored shorts for a relaxed summer city walk with no visible bag.",
    forbidden: baseForbidden
  },
  {
    garmentType: "shorts",
    outfitStyle: "realDaily",
    colorDirection: "softAccent",
    season: ["summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "sage green lightweight shirt",
    bottomCategory: "cream cotton shorts",
    outerLayerCategory: "no outer layer",
    bagCategory: "light tan handbag as secondary accessory",
    accessoryCategory: ["hair clip"],
    visualAnchor: "sage green shirt",
    outfitLine:
      "Use a sage green lightweight shirt, cream cotton shorts, and a light tan handbag as a secondary accessory for a fresh restrained summer look.",
    forbidden: baseForbidden
  },
  {
    garmentType: "shorts",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    season: ["summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "dark coffee clean-cut tee",
    bottomCategory: "charcoal tailored shorts",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["no visible accessory"],
    visualAnchor: "dark coffee tee",
    outfitLine:
      "Style her in a dark coffee clean-cut tee and charcoal tailored shorts for a restrained dark-anchor summer outfit.",
    forbidden: baseForbidden
  },
  {
    garmentType: "shorts",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    season: ["summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "pale blue cotton shirt",
    bottomCategory: "charcoal cotton-twill Bermuda shorts",
    outerLayerCategory: "no outer layer",
    bagCategory: "cream canvas tote as secondary accessory",
    accessoryCategory: ["slim leather belt"],
    visualAnchor: "charcoal cotton-twill Bermuda shorts",
    outfitLine:
      "Use a pale blue cotton shirt, charcoal cotton-twill Bermuda shorts, and a cream canvas tote as a secondary accessory for a grounded summer outfit.",
    forbidden: baseForbidden
  },
  {
    garmentType: "shorts",
    outfitStyle: "relaxedWeekend",
    colorDirection: "neutralDaily",
    season: ["summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "oatmeal lightweight knit tee",
    bottomCategory: "stone grey Bermuda shorts",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["understated sunglasses only outdoor"],
    visualAnchor: "stone grey shorts",
    outfitLine:
      "Use an oatmeal lightweight knit tee and stone grey Bermuda shorts for a calm summer look with no visible bag.",
    forbidden: baseForbidden
  },
  {
    garmentType: "shorts",
    outfitStyle: "relaxedWeekend",
    colorDirection: "softAccent",
    season: ["summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "pale blue short-sleeve shirt",
    bottomCategory: "warm beige pleated shorts",
    outerLayerCategory: "no outer layer",
    bagCategory: "natural canvas tote as secondary accessory",
    accessoryCategory: ["simple watch"],
    visualAnchor: "pale blue short-sleeve shirt",
    outfitLine:
      "Style her in a pale blue short-sleeve shirt, warm beige pleated shorts, and a natural canvas tote as a secondary accessory for a breathable summer sneaker outfit.",
    forbidden: baseForbidden
  },
  {
    garmentType: "shorts",
    outfitStyle: "cleanMinimal",
    colorDirection: "darkAnchor",
    season: ["summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "muted navy sleeveless knit",
    bottomCategory: "ivory linen-blend Bermuda shorts",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["minimal earrings"],
    visualAnchor: "muted navy sleeveless knit",
    outfitLine:
      "Pair a muted navy sleeveless knit with ivory linen-blend Bermuda shorts for restrained summer contrast that stays mature and shoe-readable.",
    forbidden: baseForbidden
  },
  {
    garmentType: "shorts",
    outfitStyle: "bloggerLite",
    colorDirection: "neutralDaily",
    season: ["summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "sea-salt linen vest",
    bottomCategory: "taupe tailored Bermuda shorts",
    outerLayerCategory: "cream lightweight overshirt",
    accessoryCategory: ["understated sunglasses only outdoor"],
    visualAnchor: "taupe tailored Bermuda shorts",
    outfitLine:
      "Use a sea-salt linen vest, taupe tailored Bermuda shorts, and a cream lightweight overshirt for a polished summer option without casual cutoffs.",
    forbidden: baseForbidden
  },
  {
    garmentType: "shorts",
    outfitStyle: "realDaily",
    colorDirection: "softAccent",
    season: ["summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "dusty apricot cotton shirt",
    bottomCategory: "stone cotton-twill shorts",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["hair clip"],
    visualAnchor: "dusty apricot cotton shirt",
    outfitLine:
      "Use a dusty apricot cotton shirt with stone cotton-twill shorts for a soft warm-weather accent that remains understated and easy to match with any THERUIZ AURA sneaker.",
    forbidden: baseForbidden
  }
];

const dressPool: SeedDraft[] = [
  {
    garmentType: "dress",
    outfitStyle: "refinedFeminine",
    colorDirection: "neutralDaily",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "pale khaki shirt dress",
    bottomCategory: "pale khaki shirt dress",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["simple watch"],
    visualAnchor: "pale khaki shirt dress",
    outfitLine:
      "Choose a pale khaki shirt dress for relaxed feminine elegance with clear sneaker visibility and no visible bag.",
    forbidden: baseForbidden
  },
  {
    garmentType: "dress",
    outfitStyle: "realDaily",
    colorDirection: "lightClean",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "ivory straight dress",
    bottomCategory: "ivory straight dress",
    outerLayerCategory: "soft beige cardigan",
    bagCategory: "small shoulder bag as secondary accessory",
    accessoryCategory: ["minimal jewelry"],
    visualAnchor: "ivory straight dress",
    outfitLine:
      "Use an ivory straight dress, soft beige cardigan, and a small shoulder bag as a secondary accessory for a calm one-piece outfit that still keeps the sneakers readable.",
    forbidden: baseForbidden
  },
  {
    garmentType: "dress",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    season: ["autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "soft grey long-sleeve knit dress",
    bottomCategory: "soft grey long-sleeve knit dress",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["wool socks"],
    visualAnchor: "soft grey knit dress",
    outfitLine:
      "Use a soft grey long-sleeve knit dress with thin socks for a quiet cold-weather mirror outfit with no visible bag.",
    forbidden: baseForbidden
  },
  {
    garmentType: "dress",
    outfitStyle: "cleanMinimal",
    colorDirection: "softAccent",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "muted blue-grey shirt dress",
    bottomCategory: "muted blue-grey shirt dress",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["subtle optical glasses"],
    visualAnchor: "muted blue-grey shirt dress",
    outfitLine:
      "Style her in a muted blue-grey shirt dress and subtle optical glasses for a calm spring cafe-side outfit with no visible bag.",
    forbidden: baseForbidden
  },
  {
    garmentType: "dress",
    outfitStyle: "refinedFeminine",
    colorDirection: "softAccent",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "soft grey straight dress",
    bottomCategory: "soft grey straight dress",
    outerLayerCategory: "soft sage green thin cardigan",
    accessoryCategory: ["minimal jewelry"],
    visualAnchor: "soft sage green thin cardigan",
    outfitLine:
      "Style her in a soft grey straight dress with one soft sage green thin cardigan as the only soft color accent, keeping the overall outfit fresh, wearable, versatile, and not loud.",
    forbidden: baseForbidden
  },
  {
    garmentType: "dress",
    outfitStyle: "refinedFeminine",
    colorDirection: "neutralDaily",
    season: ["autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "warm beige knit dress",
    bottomCategory: "warm beige knit dress",
    outerLayerCategory: "cream short jacket",
    bagCategory: "muted brown handbag as secondary accessory",
    accessoryCategory: ["low-saturation scarf"],
    visualAnchor: "warm beige knit dress",
    outfitLine:
      "Use a warm beige knit dress, cream short jacket, and muted brown handbag as a secondary accessory for gentle seasonal sophistication.",
    forbidden: baseForbidden
  },
  {
    garmentType: "dress",
    outfitStyle: "darkAnchor",
    colorDirection: "softAccent",
    season: ["autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "navy wool knit dress",
    bottomCategory: "navy wool knit dress",
    outerLayerCategory: "muted berry-wine fine-knit cardigan as the only soft color accent",
    bagCategory: "warm grey small handbag as secondary accessory",
    accessoryCategory: ["thin socks"],
    visualAnchor: "muted berry-wine fine-knit cardigan",
    outfitLine:
      "Use a navy wool knit dress with one muted berry-wine fine-knit cardigan as the only soft color accent and a warm grey small handbag kept secondary for restrained winter color.",
    forbidden: baseForbidden
  },
  {
    garmentType: "dress",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    season: ["autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "charcoal knit dress",
    bottomCategory: "charcoal knit dress",
    outerLayerCategory: "taupe relaxed coat",
    accessoryCategory: ["thin socks"],
    visualAnchor: "charcoal knit dress",
    outfitLine:
      "Use a charcoal knit dress and taupe relaxed coat for refined seasonal contrast without hiding the shoes.",
    forbidden: baseForbidden
  },
  {
    garmentType: "dress",
    outfitStyle: "realDaily",
    colorDirection: "softAccent",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "light grey cotton dress",
    bottomCategory: "light grey cotton dress",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["no visible accessory"],
    visualAnchor: "light grey cotton dress",
    outfitLine:
      "Choose a light grey cotton dress for a clean one-piece outfit that feels quiet, practical, and shoe-readable.",
    forbidden: baseForbidden
  },
  {
    garmentType: "dress",
    outfitStyle: "bloggerLite",
    colorDirection: "lightClean",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "cream polo dress",
    bottomCategory: "cream polo dress",
    outerLayerCategory: "thin beige cardigan",
    accessoryCategory: ["minimal earrings"],
    visualAnchor: "cream polo dress",
    outfitLine:
      "Choose a cream polo dress with a thin beige cardigan for a light mature one-piece look without sporty sweetness.",
    forbidden: baseForbidden
  },
  {
    garmentType: "dress",
    outfitStyle: "refinedFeminine",
    colorDirection: "softAccent",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "pale blue cotton shirt dress",
    bottomCategory: "pale blue cotton shirt dress",
    outerLayerCategory: "no outer layer",
    bagCategory: "cream tote as secondary accessory",
    accessoryCategory: ["simple watch"],
    visualAnchor: "pale blue cotton shirt dress",
    outfitLine:
      "Choose a pale blue cotton shirt dress with a cream tote as a secondary accessory for a fresh one-piece look that keeps the sneakers useful and not overly sweet.",
    forbidden: baseForbidden
  },
  {
    garmentType: "dress",
    outfitStyle: "cleanMinimal",
    colorDirection: "darkAnchor",
    season: ["spring", "autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "deep olive straight knit dress",
    bottomCategory: "deep olive straight knit dress",
    outerLayerCategory: "warm beige short jacket",
    accessoryCategory: ["minimal earrings"],
    visualAnchor: "deep olive straight knit dress",
    outfitLine:
      "Use a deep olive straight knit dress and warm beige short jacket for a controlled dark-anchor one-piece outfit with clear sneaker contrast.",
    forbidden: baseForbidden
  },
  {
    garmentType: "dress",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    season: ["autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "oatmeal ribbed knit dress",
    bottomCategory: "oatmeal ribbed knit dress",
    outerLayerCategory: "charcoal cropped coat",
    bagCategory: "muted brown shoulder bag as secondary accessory",
    accessoryCategory: ["thin socks"],
    visualAnchor: "charcoal cropped coat",
    outfitLine:
      "Style her in an oatmeal ribbed knit dress, charcoal cropped coat, and muted brown shoulder bag as a secondary accessory for quiet winter depth without hiding the shoes.",
    forbidden: baseForbidden
  },
  {
    garmentType: "dress",
    outfitStyle: "refinedFeminine",
    colorDirection: "neutralDaily",
    season: ["spring", "summer", "autumn"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "stone cotton-poplin wrap dress",
    bottomCategory: "stone cotton-poplin wrap dress",
    outerLayerCategory: "light taupe cardigan",
    accessoryCategory: ["thin leather belt"],
    visualAnchor: "stone wrap dress",
    outfitLine:
      "Use a stone cotton-poplin wrap dress with a light taupe cardigan for soft feminine daily styling that still reads practical with sneakers.",
    forbidden: baseForbidden
  }
];

const activePool: SeedDraft[] = [
  {
    garmentType: "lightActive",
    outfitStyle: "softActive",
    colorDirection: "neutralDaily",
    season: ["spring", "summer", "autumn"],
    suitableShoes: allShoes,
    imageTypes: activeImageTypes,
    topCategory: "clean long-sleeve top",
    bottomCategory: "taupe jogger-style trousers",
    outerLayerCategory: "light cotton jacket",
    accessoryCategory: ["simple watch"],
    visualAnchor: "taupe jogger-style trousers",
    outfitLine:
      "Use a clean long-sleeve top, taupe jogger-style trousers, and a light cotton jacket for calm premium movement styling without a visible bag.",
    forbidden: baseForbidden
  },
  {
    garmentType: "lightActive",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    season: ["spring", "autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes: activeImageTypes,
    topCategory: "dark active top",
    bottomCategory: "straight active trousers",
    outerLayerCategory: "warm taupe zip layer",
    accessoryCategory: ["no visible accessory"],
    visualAnchor: "dark active top",
    outfitLine:
      "Style her in a dark active top, straight active trousers, and a warm taupe zip layer for a restrained city-to-gym transition without sporty branding.",
    forbidden: baseForbidden
  },
  {
    garmentType: "lightActive",
    outfitStyle: "softActive",
    colorDirection: "softAccent",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes: activeImageTypes,
    topCategory: "charcoal active tee",
    bottomCategory: "taupe active trousers",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["misty light blue water bottle as the only soft color accent"],
    visualAnchor: "misty light blue water bottle",
    outfitLine:
      "Use a charcoal active tee and taupe active trousers, with one misty light blue water bottle as the only soft color accent for a restrained city-to-gym detail.",
    forbidden: baseForbidden
  },
  {
    garmentType: "lightActive",
    outfitStyle: "cleanMinimal",
    colorDirection: "darkAnchor",
    season: ["spring", "autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes: activeImageTypes,
    topCategory: "light grey zip jacket",
    bottomCategory: "charcoal active trousers",
    outerLayerCategory: "warm ivory active top",
    accessoryCategory: ["clean low socks"],
    visualAnchor: "charcoal active trousers",
    outfitLine:
      "Use a warm ivory active top under a light grey zip jacket with charcoal active trousers for quiet movement-ready daily styling.",
    forbidden: baseForbidden
  },
  {
    garmentType: "lightActive",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    season: ["summer"],
    suitableShoes: allShoes,
    imageTypes: ["gymCommute"],
    topCategory: "navy clean-cut tee",
    bottomCategory: "dark active shorts",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["no visible accessory"],
    visualAnchor: "navy clean-cut tee",
    outfitLine:
      "Use a navy clean-cut tee and dark active shorts for a restrained warm-weather active transition that still reads refined.",
    forbidden: baseForbidden
  },
  {
    garmentType: "lightActive",
    outfitStyle: "softActive",
    colorDirection: "neutralDaily",
    season: ["spring", "summer", "autumn"],
    suitableShoes: allShoes,
    imageTypes: activeImageTypes,
    topCategory: "ivory active top",
    bottomCategory: "soft grey active trousers",
    outerLayerCategory: "cream overshirt",
    accessoryCategory: ["simple watch"],
    visualAnchor: "soft grey active trousers",
    outfitLine:
      "Style her in an ivory active top, soft grey active trousers, and a cream overshirt for soft active ease without a gym-advertising mood.",
    forbidden: baseForbidden
  },
  {
    garmentType: "lightActive",
    outfitStyle: "realDaily",
    colorDirection: "denimBased",
    season: ["summer", "autumn"],
    suitableShoes: allShoes,
    imageTypes: activeImageTypes,
    topCategory: "cotton jacket",
    bottomCategory: "dark denim straight trousers",
    outerLayerCategory: "clean knit tee",
    accessoryCategory: ["low socks if visible"],
    visualAnchor: "dark denim active mix",
    outfitLine:
      "Use a clean knit tee under a cotton jacket with dark denim straight trousers for movement-ready daily styling.",
    forbidden: baseForbidden
  },
  {
    garmentType: "lightActive",
    outfitStyle: "cleanMinimal",
    colorDirection: "darkAnchor",
    season: ["summer"],
    suitableShoes: allShoes,
    imageTypes: ["gymCommute"],
    topCategory: "white tee",
    bottomCategory: "charcoal active shorts",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["no visible accessory"],
    visualAnchor: "charcoal active shorts",
    outfitLine:
      "Use a white tee and charcoal active shorts for a clean restrained active look that does not turn the sneakers into running shoes.",
    forbidden: baseForbidden
  },
  {
    garmentType: "lightActive",
    outfitStyle: "softActive",
    colorDirection: "softAccent",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes: activeImageTypes,
    topCategory: "clean knit tee",
    bottomCategory: "warm ivory active trousers",
    outerLayerCategory: "light active layer",
    accessoryCategory: ["thin socks if visible"],
    visualAnchor: "light active layer",
    outfitLine:
      "Use a clean knit tee, warm ivory active trousers, and a light active layer for soft active ease with THERUIZ AURA restraint.",
    forbidden: baseForbidden
  },
  {
    garmentType: "lightActive",
    outfitStyle: "softActive",
    colorDirection: "neutralDaily",
    season: ["spring", "summer", "autumn"],
    suitableShoes: allShoes,
    imageTypes: activeImageTypes,
    topCategory: "soft stone active polo",
    bottomCategory: "warm grey straight active trousers",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["simple watch"],
    visualAnchor: "warm grey straight active trousers",
    outfitLine:
      "Use a soft stone active polo and warm grey straight active trousers for refined movement styling that feels city-ready, not like a sports campaign.",
    forbidden: baseForbidden
  },
  {
    garmentType: "lightActive",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    season: ["spring", "summer", "autumn"],
    suitableShoes: allShoes,
    imageTypes: activeImageTypes,
    topCategory: "deep navy clean active tee",
    bottomCategory: "taupe active trousers",
    outerLayerCategory: "cream lightweight zip layer",
    accessoryCategory: ["clean low socks"],
    visualAnchor: "deep navy clean active tee",
    outfitLine:
      "Style her in a deep navy clean active tee, taupe active trousers, and a cream lightweight zip layer for a dark-anchor active option with quiet polish.",
    forbidden: baseForbidden
  },
  {
    garmentType: "lightActive",
    outfitStyle: "softActive",
    colorDirection: "softAccent",
    season: ["summer"],
    suitableShoes: allShoes,
    imageTypes: ["gymCommute"],
    topCategory: "pale blue breathable tee",
    bottomCategory: "stone active shorts",
    outerLayerCategory: "no outer layer",
    accessoryCategory: ["no visible accessory"],
    visualAnchor: "pale blue breathable tee",
    outfitLine:
      "Use a pale blue breathable tee and stone active shorts only for a warm-weather movement context, keeping the styling restrained and shoe-readable.",
    forbidden: baseForbidden
  }
];

const poolByGarment: Record<GarmentType, SeedDraft[]> = {
  trousers: trouserPool,
  skirt: skirtPool,
  shorts: shortsPool,
  dress: dressPool,
  lightActive: activePool
};

const scenePlans: Record<string, { prefix: string; label: string; garments: GarmentType[]; forbidden: string[] }> = {
  commute: {
    prefix: "commute",
    label: "commute",
    garments: ["trousers", "trousers", "trousers", "trousers", "trousers", "trousers", "trousers", "skirt", "skirt", "skirt", "lightActive", "lightActive"],
    forbidden: ["stiff corporate suit", "old-fashioned mature styling", "overly formal suit"]
  },
  cafeExterior: {
    prefix: "cafe",
    label: "cafe-side",
    garments: ["trousers", "trousers", "trousers", "trousers", "skirt", "skirt", "skirt", "shorts", "shorts", "dress", "dress", "lightActive"],
    forbidden: ["brunch influencer styling", "overly youthful outfit", "over-posed blogger energy"]
  },
  weekendCityWalk: {
    prefix: "weekend",
    label: "weekend city walk",
    garments: ["trousers", "trousers", "trousers", "trousers", "shorts", "shorts", "shorts", "dress", "dress", "skirt", "skirt", "lightActive"],
    forbidden: ["tourist outfit", "overly youthful denim styling", "streetwear dominance"]
  },
  boutiqueStreet: {
    prefix: "boutique",
    label: "boutique street",
    garments: ["trousers", "trousers", "trousers", "trousers", "skirt", "skirt", "skirt", "dress", "dress", "shorts", "lightActive", "lightActive"],
    forbidden: ["luxury logo", "socialite", "hard luxury advertising"]
  },
  flowerShop: {
    prefix: "flower",
    label: "flower shop",
    garments: ["skirt", "skirt", "skirt", "skirt", "dress", "dress", "dress", "trousers", "trousers", "trousers", "shorts", "lightActive"],
    forbidden: ["princess dress", "oversized bouquet", "flower-wall influencer look"]
  },
  bakeryDessert: {
    prefix: "bakery",
    label: "bakery or dessert shop",
    garments: ["shorts", "shorts", "shorts", "trousers", "trousers", "trousers", "trousers", "dress", "dress", "skirt", "skirt", "lightActive"],
    forbidden: ["childlike sweet styling", "internet-famous shop look", "cheap T-shirt styling"]
  },
  bookstoreMagazine: {
    prefix: "bookstore",
    label: "bookstore or magazine shop",
    garments: ["trousers", "trousers", "trousers", "trousers", "trousers", "skirt", "skirt", "skirt", "dress", "dress", "shorts", "lightActive"],
    forbidden: ["art-student costume", "over-literary pose", "fake book text"]
  },
  premiumErrands: {
    prefix: "errands",
    label: "premium errands",
    garments: ["trousers", "trousers", "trousers", "trousers", "trousers", "shorts", "shorts", "shorts", "lightActive", "lightActive", "skirt", "dress"],
    forbidden: ["homewear", "messy supermarket look", "shopping cart blocking shoes"]
  },
  lightSocial: {
    prefix: "social",
    label: "quiet lunch or cafe interior",
    garments: ["trousers", "trousers", "trousers", "trousers", "skirt", "skirt", "skirt", "dress", "dress", "shorts", "shorts", "lightActive"],
    forbidden: ["party styling", "formal evening social mood", "banquet dressing", "table clutter blocking shoes"]
  },
  galleryExhibition: {
    prefix: "gallery",
    label: "contemporary art museum",
    garments: ["trousers", "trousers", "trousers", "trousers", "trousers", "skirt", "skirt", "skirt", "dress", "dress", "shorts", "lightActive"],
    forbidden: ["art-student costume", "all-black conceptual styling", "luxury-event dressing", "floor-length hems"]
  },
  mirrorCloset: {
    prefix: "mirror",
    label: "mirror closet outfit record",
    garments: ["trousers", "trousers", "trousers", "trousers", "skirt", "skirt", "skirt", "dress", "dress", "shorts", "shorts", "lightActive"],
    forbidden: ["body-focused mirror", "long-leg selfie", "cropped shoes", "fake luxury room"]
  },
  gymCommute: {
    prefix: "gymcommute",
    label: "city-to-gym commute",
    garments: ["lightActive", "lightActive", "lightActive", "lightActive", "lightActive", "trousers", "trousers", "trousers", "shorts", "shorts", "shorts", "skirt"],
    forbidden: ["sportswear campaign", "running gear", "gym influencer mood", "technical trainer styling"]
  }
};

const sceneDraftOffsets: Record<string, Partial<Record<GarmentType, number>>> = {
  commute: { trousers: 0, skirt: 0, lightActive: 0 },
  cafeExterior: { trousers: 2, skirt: 1, shorts: 0, dress: 1, lightActive: 1 },
  weekendCityWalk: { trousers: 4, shorts: 2, dress: 2, skirt: 3, lightActive: 2 },
  boutiqueStreet: { trousers: 6, skirt: 4, dress: 3, shorts: 4, lightActive: 3 },
  flowerShop: { skirt: 5, dress: 4, trousers: 8, shorts: 5, lightActive: 4 },
  bakeryDessert: { shorts: 6, trousers: 10, dress: 5, skirt: 6, lightActive: 5 },
  bookstoreMagazine: { trousers: 1, skirt: 7, dress: 6, shorts: 7, lightActive: 6 },
  premiumErrands: { trousers: 3, shorts: 8, lightActive: 0, skirt: 2, dress: 7 },
  lightSocial: { trousers: 5, skirt: 4, dress: 5, shorts: 2, lightActive: 2 },
  galleryExhibition: { trousers: 6, skirt: 7, dress: 5, shorts: 4, lightActive: 3 },
  mirrorCloset: { trousers: 5, skirt: 1, dress: 0, shorts: 3, lightActive: 1 },
  gymCommute: { lightActive: 0, trousers: 7, shorts: 3, skirt: 4 }
};

function pickDraft(garment: GarmentType, index: number, sceneKey: string) {
  const pool = poolByGarment[garment];
  const offset = sceneDraftOffsets[sceneKey]?.[garment] ?? 0;
  return pool[(index + offset) % pool.length];
}

function makeSceneSeeds(sceneKey: keyof typeof scenePlans): SceneOutfitSeed[] {
  const plan = scenePlans[sceneKey];
  const garmentCounts: Partial<Record<GarmentType, number>> = {};

  const seeds = plan.garments.map((garment, index) => {
    const draftIndex = garmentCounts[garment] ?? 0;
    garmentCounts[garment] = draftIndex + 1;
    const draft = pickDraft(garment, draftIndex, sceneKey);
    const id = `${plan.prefix}-seed-${String(index + 1).padStart(3, "0")}`;

    return {
      ...draft,
      id,
      sceneKey,
      outfitLine: `${draft.outfitLine} Keep it suitable for ${plan.label}, with clear sneaker readability.`,
      stylingRealismLine: draft.stylingRealismLine ?? (index % 2 === 0 ? stylingRealismA : stylingRealismB),
      forbidden: [...(draft.forbidden ?? []), ...plan.forbidden]
    };
  });

  return enforceSeedDiversity(seeds);
}

const darkAnchorPattern = /black|charcoal|navy|dark coffee|deep olive/i;
const lightTopPattern = /^(white|cream|beige|ivory|off-white|soft beige|warm beige)/i;

function hasDarkAnchor(seed: SceneOutfitSeed) {
  return (
    seed.colorDirection === "darkAnchor" ||
    darkAnchorPattern.test(
      `${seed.topCategory} ${seed.bottomCategory} ${seed.outerLayerCategory ?? ""} ${seed.bagCategory ?? ""} ${seed.outfitLine}`
    )
  );
}

function hasExplicitDarkAnchor(seed: SceneOutfitSeed) {
  return darkAnchorPattern.test(
    `${seed.topCategory} ${seed.bottomCategory} ${seed.outerLayerCategory ?? ""} ${seed.bagCategory ?? ""} ${seed.outfitLine}`
  );
}

function hasDenim(seed: SceneOutfitSeed) {
  return seed.colorDirection === "denimBased" || /denim/i.test(`${seed.topCategory} ${seed.bottomCategory} ${seed.outfitLine}`);
}

function hasNonLightTop(seed: SceneOutfitSeed) {
  return !lightTopPattern.test(seed.topCategory);
}

function addDarkAnchor(seed: SceneOutfitSeed): SceneOutfitSeed {
  return {
    ...seed,
    colorDirection: "darkAnchor",
    visualAnchor: seed.visualAnchor.includes("navy") ? seed.visualAnchor : `${seed.visualAnchor} with navy anchor`,
    outfitLine: `${seed.outfitLine.replace(/\.$/, "")}, with one subtle navy, charcoal, black, dark coffee, or deep olive anchor.`
  };
}

function addDenimBase(seed: SceneOutfitSeed, index: number): SceneOutfitSeed {
  if (seed.garmentType === "shorts") {
    return {
      ...seed,
      colorDirection: "denimBased",
      outerLayerCategory: "light denim overshirt",
      visualAnchor: seed.visualAnchor.includes("denim") ? seed.visualAnchor : `${seed.visualAnchor} with denim overshirt`,
      outfitLine: `${seed.outfitLine.replace(/\.$/, "")}, with one restrained light denim overshirt.`
    };
  }

  const denimBottoms: Record<GarmentType, string[]> = {
    trousers: ["dark straight denim", "light blue straight denim", "white denim straight trousers"],
    skirt: ["light denim midi skirt", "dark denim midi skirt", "soft blue denim skirt"],
    shorts: [seed.bottomCategory],
    dress: [seed.bottomCategory],
    lightActive: ["dark denim straight trousers", "light denim straight trousers", "white denim straight trousers"]
  };
  const denimBottom = denimBottoms[seed.garmentType][index % denimBottoms[seed.garmentType].length];

  return {
    ...seed,
    colorDirection: "denimBased",
    bottomCategory: denimBottom,
    outerLayerCategory: seed.garmentType === "dress" ? "soft denim shirt jacket" : seed.outerLayerCategory,
    visualAnchor: seed.visualAnchor.includes("denim") ? seed.visualAnchor : `${seed.visualAnchor} with denim base`,
    outfitLine: `${seed.outfitLine.replace(/\.$/, "")}, keeping one restrained denim-based element.`
  };
}

function addSoftAccent(seed: SceneOutfitSeed): SceneOutfitSeed {
  return {
    ...seed,
    colorDirection: "softAccent",
    visualAnchor: seed.visualAnchor.includes("misty") ? seed.visualAnchor : `${seed.visualAnchor} with misty accent`,
    outfitLine: `${seed.outfitLine.replace(/\.$/, "")}, with one low-saturation misty blue or pale sage accent.`
  };
}

function addNonLightTop(seed: SceneOutfitSeed): SceneOutfitSeed {
  return {
    ...seed,
    topCategory: "navy fine-knit top",
    visualAnchor: "navy fine-knit top",
    outfitLine: `${seed.outfitLine.replace(/\.$/, "")}, led by a navy fine-knit top instead of an all-light upper body.`
  };
}

const accessoryAlternates = [
  "minimal gold earrings",
  "subtle optical glasses",
  "thin leather belt",
  "hair clip",
  "no visible accessory",
  "clean low socks"
];

function limitRepeatedAccessories(seeds: SceneOutfitSeed[]) {
  const counts = new Map<string, number>();
  seeds.forEach((seed) => {
    (seed.accessoryCategory ?? []).forEach((accessory) => {
      counts.set(accessory, (counts.get(accessory) ?? 0) + 1);
    });
  });

  const next = [...seeds];
  next.forEach((seed, index) => {
    const accessory = seed.accessoryCategory?.[0];
    if (!accessory || (counts.get(accessory) ?? 0) <= 4) return;

    const replacement = accessoryAlternates.find((candidate) => (counts.get(candidate) ?? 0) < 4 && candidate !== accessory);
    if (!replacement) return;

    counts.set(accessory, (counts.get(accessory) ?? 1) - 1);
    counts.set(replacement, (counts.get(replacement) ?? 0) + 1);
    next[index] = {
      ...seed,
      accessoryCategory: [replacement]
    };
  });

  return next;
}

function enforceSeedDiversity(seeds: SceneOutfitSeed[]) {
  const next = [...seeds];

  const denimOrder = next
    .map((seed, index) => ({ seed, index }))
    .sort((a, b) => {
      if (a.seed.garmentType === "trousers" && b.seed.garmentType !== "trousers") return 1;
      if (a.seed.garmentType !== "trousers" && b.seed.garmentType === "trousers") return -1;
      return a.index - b.index;
    });

  for (const item of denimOrder) {
    if (next.filter(hasDenim).length >= 3) break;
    if (!hasDenim(next[item.index])) next[item.index] = addDenimBase(next[item.index], item.index);
  }

  for (let index = 0; next.filter((seed) => seed.colorDirection === "softAccent").length < 2 && index < next.length; index += 1) {
    if (next[index].colorDirection !== "softAccent" && !hasDarkAnchor(next[index]) && !hasDenim(next[index])) {
      next[index] = addSoftAccent(next[index]);
    }
  }

  for (let index = next.length - 1; next.filter(hasNonLightTop).length < 2 && index >= 0; index -= 1) {
    if (!hasNonLightTop(next[index])) next[index] = addNonLightTop(next[index]);
  }

  for (let index = next.length - 1; next.filter(hasExplicitDarkAnchor).length < 4 && index >= 0; index -= 1) {
    if (!hasExplicitDarkAnchor(next[index])) next[index] = addDarkAnchor(next[index]);
  }

  return limitRepeatedAccessories(next);
}

export const sceneOutfitSeedLibrary: Record<string, SceneOutfitSeed[]> = {
  commute: makeSceneSeeds("commute"),
  cafeExterior: makeSceneSeeds("cafeExterior"),
  weekendCityWalk: makeSceneSeeds("weekendCityWalk"),
  boutiqueStreet: makeSceneSeeds("boutiqueStreet"),
  flowerShop: makeSceneSeeds("flowerShop"),
  bakeryDessert: makeSceneSeeds("bakeryDessert"),
  bookstoreMagazine: makeSceneSeeds("bookstoreMagazine"),
  premiumErrands: makeSceneSeeds("premiumErrands"),
  lightSocial: makeSceneSeeds("lightSocial"),
  galleryExhibition: makeSceneSeeds("galleryExhibition"),
  mirrorCloset: makeSceneSeeds("mirrorCloset"),
  gymCommute: makeSceneSeeds("gymCommute")
};
