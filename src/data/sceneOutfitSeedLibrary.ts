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
  "oversized bag blocking shoes"
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
    accessoryCategory: ["simple watch"],
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
    bottomCategory: "stone straight trousers",
    outerLayerCategory: "soft grey cardigan",
    bagCategory: "taupe crossbody bag as secondary accessory",
    accessoryCategory: ["thin belt"],
    visualAnchor: "oatmeal knit",
    outfitLine:
      "Use an oatmeal lightweight knit, stone straight trousers, a soft grey cardigan, and a taupe crossbody bag as a secondary accessory for calm wearable texture.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    season: ["spring", "summer", "autumn"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "black clean sleeveless top",
    bottomCategory: "cream straight trousers",
    outerLayerCategory: "ivory overshirt",
    bagCategory: "black small shoulder bag as secondary accessory",
    accessoryCategory: ["minimal earrings"],
    visualAnchor: "black clean top",
    outfitLine:
      "Pair a black clean sleeveless top with cream straight trousers, an ivory overshirt, and a black small shoulder bag as a secondary accessory for grounded contrast.",
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
    bagCategory: "cream canvas tote as secondary accessory",
    accessoryCategory: ["slim leather belt"],
    visualAnchor: "pale blue shirt",
    outfitLine:
      "Use a white tee under a pale blue open shirt, dark straight denim, and a cream canvas tote as a secondary accessory for a real city outfit with denim depth.",
    forbidden: baseForbidden
  },
  {
    garmentType: "trousers",
    outfitStyle: "polishedCommuter",
    colorDirection: "softAccent",
    season: ["spring", "autumn"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "misty blue shirt",
    bottomCategory: "warm beige tapered trousers",
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
    outfitStyle: "cleanMinimal",
    colorDirection: "darkAnchor",
    season: ["autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "navy fine-knit top",
    bottomCategory: "warm grey wool trousers",
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
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    season: ["summer", "autumn"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "cream linen shirt",
    bottomCategory: "pale khaki ankle trousers",
    outerLayerCategory: "no outer layer",
    bagCategory: "light tan shoulder bag as secondary accessory",
    accessoryCategory: ["understated sunglasses only outdoor"],
    visualAnchor: "cream linen shirt",
    outfitLine:
      "Style her in a cream linen shirt, pale khaki ankle trousers, and a light tan shoulder bag as a secondary accessory for breathable daily movement with clear shoes.",
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
    bottomCategory: "cream midi skirt",
    outerLayerCategory: "no outer layer",
    bagCategory: "taupe handbag as secondary accessory",
    accessoryCategory: ["minimal earrings"],
    visualAnchor: "cream midi skirt",
    outfitLine:
      "Pair a soft grey knit top with a cream midi skirt and a taupe handbag as a secondary accessory for mature feminine ease while keeping ankles and sneakers readable.",
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
    bottomCategory: "sage A-line midi skirt",
    outerLayerCategory: "light cardigan",
    bagCategory: "pale grey shoulder bag as secondary accessory",
    accessoryCategory: ["simple watch"],
    visualAnchor: "sage skirt",
    outfitLine:
      "Use an oatmeal knit top, sage A-line midi skirt, light cardigan, and a pale grey shoulder bag as a secondary accessory for a soft low-saturation outfit record.",
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
  }
];

const shortsPool: SeedDraft[] = [
  {
    garmentType: "shorts",
    outfitStyle: "relaxedWeekend",
    colorDirection: "denimBased",
    season: ["summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "white shirt worn open",
    bottomCategory: "light denim Bermuda shorts",
    outerLayerCategory: "clean inner top",
    bagCategory: "canvas tote as secondary accessory",
    accessoryCategory: ["simple watch"],
    visualAnchor: "denim Bermuda shorts",
    outfitLine:
      "Use a white shirt worn open over a clean inner top, light denim Bermuda shorts, and a canvas tote as a secondary accessory for refined summer movement.",
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
    bottomCategory: "stone grey Bermuda shorts",
    outerLayerCategory: "no outer layer",
    bagCategory: "woven bag as secondary accessory",
    accessoryCategory: ["understated sunglasses only outdoor"],
    visualAnchor: "stone grey shorts",
    outfitLine:
      "Style her in a cream linen shirt, stone grey Bermuda shorts, and a restrained woven bag as a secondary accessory for practical warm-weather ease.",
    forbidden: baseForbidden
  },
  {
    garmentType: "shorts",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    season: ["summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "charcoal clean-cut tee",
    bottomCategory: "cream tailored Bermuda shorts",
    outerLayerCategory: "no outer layer",
    bagCategory: "black shoulder bag as secondary accessory",
    accessoryCategory: ["minimal optical glasses"],
    visualAnchor: "charcoal tee",
    outfitLine:
      "Pair a charcoal clean-cut tee with cream tailored Bermuda shorts and a black shoulder bag as a secondary accessory for a grounded summer outfit reference.",
    forbidden: baseForbidden
  }
];

const dressPool: SeedDraft[] = [
  {
    garmentType: "dress",
    outfitStyle: "refinedFeminine",
    colorDirection: "softAccent",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "ivory shirt dress",
    bottomCategory: "ivory shirt dress",
    outerLayerCategory: "soft beige cardigan",
    bagCategory: "small shoulder bag as secondary accessory",
    accessoryCategory: ["minimal jewelry"],
    visualAnchor: "ivory shirt dress",
    outfitLine:
      "Choose an ivory shirt dress with a soft beige cardigan and a small shoulder bag as a secondary accessory for relaxed feminine elegance with sneaker visibility.",
    forbidden: baseForbidden
  },
  {
    garmentType: "dress",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    season: ["summer", "autumn"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "soft grey knit dress",
    bottomCategory: "soft grey knit dress",
    outerLayerCategory: "no outer layer",
    bagCategory: "light taupe handbag as secondary accessory",
    accessoryCategory: ["simple watch"],
    visualAnchor: "soft grey dress",
    outfitLine:
      "Use a soft grey knit dress and a light taupe handbag as a secondary accessory for a calm one-piece outfit that still keeps the sneakers readable.",
    forbidden: baseForbidden
  },
  {
    garmentType: "dress",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    season: ["autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes,
    topCategory: "black knit dress",
    bottomCategory: "black knit dress",
    outerLayerCategory: "warm grey short coat",
    bagCategory: "cream shoulder bag as secondary accessory",
    accessoryCategory: ["low-saturation scarf"],
    visualAnchor: "black knit dress",
    outfitLine:
      "Use a black knit dress, warm grey short coat, and a cream shoulder bag as a secondary accessory for refined seasonal contrast without hiding the shoes.",
    forbidden: baseForbidden
  }
];

const activePool: SeedDraft[] = [
  {
    garmentType: "lightActive",
    outfitStyle: "softActive",
    colorDirection: "darkAnchor",
    season: ["spring", "summer", "autumn"],
    suitableShoes: allShoes,
    imageTypes: activeImageTypes,
    topCategory: "black clean-cut T-shirt",
    bottomCategory: "charcoal active shorts",
    outerLayerCategory: "light grey zip jacket",
    bagCategory: "gym tote as secondary accessory",
    accessoryCategory: ["water bottle as single primary handheld object"],
    visualAnchor: "black active tee",
    outfitLine:
      "Use a black clean-cut T-shirt, charcoal active shorts, light grey zip jacket, and gym tote as a secondary accessory for calm premium movement styling.",
    forbidden: baseForbidden
  },
  {
    garmentType: "lightActive",
    outfitStyle: "cleanMinimal",
    colorDirection: "softAccent",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes: activeImageTypes,
    topCategory: "misty blue tee",
    bottomCategory: "taupe active trousers",
    outerLayerCategory: "cream overshirt",
    bagCategory: "gym tote as secondary accessory",
    accessoryCategory: ["simple watch"],
    visualAnchor: "misty blue tee",
    outfitLine:
      "Style her in a misty blue tee, taupe active trousers, cream overshirt, and gym tote as a secondary accessory for a clean city-to-gym transition.",
    forbidden: baseForbidden
  },
  {
    garmentType: "lightActive",
    outfitStyle: "realDaily",
    colorDirection: "denimBased",
    season: ["summer", "autumn"],
    suitableShoes: allShoes,
    imageTypes: activeImageTypes,
    topCategory: "white clean tee",
    bottomCategory: "dark denim straight trousers",
    outerLayerCategory: "soft zip layer",
    bagCategory: "grey gym tote as secondary accessory",
    accessoryCategory: ["low socks if visible"],
    visualAnchor: "dark denim active mix",
    outfitLine:
      "Use a white clean tee, dark denim straight trousers, soft zip layer, and grey gym tote as a secondary accessory for movement-ready daily styling.",
    forbidden: baseForbidden
  },
  {
    garmentType: "lightActive",
    outfitStyle: "softActive",
    colorDirection: "softAccent",
    season: ["spring", "summer"],
    suitableShoes: allShoes,
    imageTypes: activeImageTypes,
    topCategory: "pale sage active top",
    bottomCategory: "warm ivory jogger-style trousers",
    outerLayerCategory: "oatmeal zip jacket",
    bagCategory: "light grey gym tote as secondary accessory",
    accessoryCategory: ["thin socks if visible"],
    visualAnchor: "pale sage active top",
    outfitLine:
      "Use a pale sage active top, warm ivory jogger-style trousers, oatmeal zip jacket, and light grey gym tote as a secondary accessory for soft active ease.",
    forbidden: baseForbidden
  },
  {
    garmentType: "lightActive",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    season: ["autumn", "winter"],
    suitableShoes: allShoes,
    imageTypes: activeImageTypes,
    topCategory: "deep olive clean tee",
    bottomCategory: "black straight active trousers",
    outerLayerCategory: "warm grey lightweight jacket",
    bagCategory: "black gym tote as secondary accessory",
    accessoryCategory: ["water bottle as single primary handheld object"],
    visualAnchor: "deep olive tee",
    outfitLine:
      "Style her in a deep olive clean tee, black straight active trousers, warm grey lightweight jacket, and black gym tote as a secondary accessory for restrained active depth.",
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
    forbidden: ["brunch influencer styling", "sweet girl outfit", "over-posed blogger energy"]
  },
  weekendCityWalk: {
    prefix: "weekend",
    label: "weekend city walk",
    garments: ["trousers", "trousers", "trousers", "trousers", "shorts", "shorts", "shorts", "dress", "dress", "skirt", "skirt", "lightActive"],
    forbidden: ["tourist outfit", "teenage denim styling", "streetwear dominance"]
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

function pickDraft(garment: GarmentType, index: number) {
  const pool = poolByGarment[garment];
  return pool[index % pool.length];
}

function makeSceneSeeds(sceneKey: keyof typeof scenePlans): SceneOutfitSeed[] {
  const plan = scenePlans[sceneKey];
  const garmentCounts: Partial<Record<GarmentType, number>> = {};

  const seeds = plan.garments.map((garment, index) => {
    const draftIndex = garmentCounts[garment] ?? 0;
    garmentCounts[garment] = draftIndex + 1;
    const draft = pickDraft(garment, draftIndex);
    const id = `${plan.prefix}-seed-${String(index + 1).padStart(3, "0")}`;

    return {
      ...draft,
      id,
      sceneKey,
      outfitLine: `${draft.outfitLine} Keep it suitable for a ${plan.label} scene with clear lower-leg and sneaker readability.`,
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

function addDenimBase(seed: SceneOutfitSeed): SceneOutfitSeed {
  const denimBottom =
    seed.garmentType === "skirt"
      ? "light denim midi skirt"
      : seed.garmentType === "shorts"
        ? "light denim Bermuda shorts"
        : seed.garmentType === "dress"
          ? seed.bottomCategory
          : "dark straight denim";

  return {
    ...seed,
    colorDirection: "denimBased",
    bottomCategory: denimBottom,
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

function enforceSeedDiversity(seeds: SceneOutfitSeed[]) {
  const next = [...seeds];

  for (let index = next.length - 1; next.filter(hasDarkAnchor).length < 4 && index >= 0; index -= 1) {
    if (!hasDarkAnchor(next[index])) next[index] = addDarkAnchor(next[index]);
  }

  for (let index = 0; next.filter(hasDenim).length < 3 && index < next.length; index += 1) {
    if (!hasDenim(next[index])) next[index] = addDenimBase(next[index]);
  }

  for (let index = 0; next.filter((seed) => seed.colorDirection === "softAccent").length < 2 && index < next.length; index += 1) {
    if (next[index].colorDirection !== "softAccent" && !hasDarkAnchor(next[index]) && !hasDenim(next[index])) {
      next[index] = addSoftAccent(next[index]);
    }
  }

  for (let index = next.length - 1; next.filter(hasNonLightTop).length < 2 && index >= 0; index -= 1) {
    if (!hasNonLightTop(next[index])) next[index] = addNonLightTop(next[index]);
  }

  return next;
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
  mirrorCloset: makeSceneSeeds("mirrorCloset"),
  gymCommute: makeSceneSeeds("gymCommute")
};
