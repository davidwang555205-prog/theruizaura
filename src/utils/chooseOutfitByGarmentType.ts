import type {
  TeamColorDirection,
  TeamGarmentType,
  TeamGarmentTypePreference,
  TeamImageType,
  TeamOutfitStyle,
  TeamSeason,
  TeamShoe
} from "../types";
import {
  creatorStylingBoundaryLine,
  getManualGarmentType,
  sceneOutfitTendencyMap,
  stylingRealismLines,
  type StandardSceneKey
} from "../data/outfitDiversityRules";
import { normalizePerSceneShoe } from "./outfitLibraryFilters";
import { rotateOutfitVariation, type RotatableOutfit } from "./rotateOutfitVariation";

type StandardImageType = "onFoot" | "mirror" | "lifestyle" | "gym" | "stillLife" | "atmosphere" | "material";

export type StandardOutfitEntry = RotatableOutfit & {
  seasons: TeamSeason[];
  sceneAffinities: StandardSceneKey[];
  shoeAffinity: string[];
  imageTypes: StandardImageType[];
  compactLine: string;
  bagCategory?: string;
  accessoryCategory?: string[];
  stylingRealismLine?: string;
  isPremiumWardrobe?: boolean;
};

export type StandardOutfitSelection = {
  outfitLine: string;
  stylingRealismLine: string;
  selectedOutfit: StandardOutfitEntry | null;
  fallbackReason?: string;
};

const standardOutfitLibrary: StandardOutfitEntry[] = [
  {
    id: "std-trousers-light",
    garmentType: "trousers",
    outfitStyle: "polishedCommuter",
    colorDirection: "lightClean",
    topCategory: "white cotton shirt",
    bottomCategory: "cream straight trousers",
    visualAnchor: "white shirt",
    seasons: ["春", "夏"],
    sceneAffinities: ["commute", "cafeExterior", "bookstoreMagazine", "premiumErrands"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Delphinium Blue", "Aire", "Lemon", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Style her in a white cotton shirt, cream straight trousers, a structured taupe tote, and subtle gold earrings for clean refined daily polish."
  },
  {
    id: "std-trousers-denim",
    garmentType: "trousers",
    outfitStyle: "cleanMinimal",
    colorDirection: "denimBased",
    topCategory: "pale blue shirt",
    bottomCategory: "dark straight denim",
    visualAnchor: "pale blue shirt",
    seasons: ["春", "夏", "秋"],
    sceneAffinities: ["commute", "weekendCityWalk", "bookstoreMagazine", "cafeExterior"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Delphinium Blue", "Silver Romance", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Use a pale blue shirt with dark straight denim, a slim leather belt, and a cream canvas tote for a real city outfit with denim depth."
  },
  {
    id: "std-premium-trousers-silk-wool",
    garmentType: "trousers",
    outfitStyle: "polishedCommuter",
    colorDirection: "neutralDaily",
    topCategory: "ivory silk blouse",
    bottomCategory: "warm grey wool-blend straight trousers",
    visualAnchor: "ivory silk blouse",
    seasons: ["春", "秋", "冬"],
    sceneAffinities: ["commute", "premiumErrands", "hotelTravel", "mirrorCloset", "cityCorner"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Cappuccino", "Maple Grove", "Oreo", "Panda", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Style her in an ivory silk blouse, warm grey wool-blend straight trousers, a soft cashmere cardigan, structured taupe leather tote, and minimal leather belt for quiet luxury commuter styling with no visible luxury logos, no flashy jewelry, no fake socialite mood, and a daily believable feeling.",
    bagCategory: "structured taupe leather tote",
    accessoryCategory: ["minimal leather belt"],
    isPremiumWardrobe: true
  },
  {
    id: "std-premium-trousers-coat",
    garmentType: "trousers",
    outfitStyle: "polishedCommuter",
    colorDirection: "darkAnchor",
    topCategory: "cream fine-gauge knit top",
    bottomCategory: "charcoal tailored trousers",
    visualAnchor: "charcoal tailored trousers",
    seasons: ["秋", "冬"],
    sceneAffinities: ["commute", "hotelTravel", "premiumErrands", "mirrorCloset", "cityCorner"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Cappuccino", "Maple Grove", "Oreo", "Panda", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Style her in a cream fine-gauge knit top, charcoal tailored trousers, a camel double-face wool coat, slim leather belt, and matte gold earrings for refined office-to-city styling with no visible luxury logos, no rich-lady posing, and a mature quiet mood.",
    accessoryCategory: ["slim leather belt", "matte gold earrings"],
    isPremiumWardrobe: true
  },
  {
    id: "std-premium-trousers-poplin",
    garmentType: "trousers",
    outfitStyle: "cleanMinimal",
    colorDirection: "neutralDaily",
    topCategory: "white cotton-poplin shirt",
    bottomCategory: "oatmeal pleated wool trousers",
    visualAnchor: "oatmeal pleated wool trousers",
    seasons: ["春", "秋", "冬"],
    sceneAffinities: ["commute", "bookstoreMagazine", "premiumErrands", "hotelTravel", "mirrorCloset"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Cappuccino", "Maple Grove", "Oreo", "Panda", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Use a white cotton-poplin shirt, oatmeal pleated wool trousers, a soft beige cashmere scarf, and structured brown leather handbag for understated premium wardrobe styling with no visible luxury logos and a real daily city feeling.",
    bagCategory: "structured brown leather handbag",
    accessoryCategory: ["soft beige cashmere scarf"],
    isPremiumWardrobe: true
  },
  {
    id: "std-trousers-summer",
    garmentType: "trousers",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    topCategory: "cream linen shirt",
    bottomCategory: "pale khaki lightweight trousers",
    visualAnchor: "cream linen shirt",
    seasons: ["夏"],
    sceneAffinities: ["weekendCityWalk", "premiumErrands", "bakeryDessert", "cafeExterior"],
    shoeAffinity: ["Aire", "Cloud Dancer", "Sand Dollar", "Lemon", "Delphinium Blue", "ALL"],
    imageTypes: ["onFoot", "lifestyle"],
    compactLine:
      "Use a cream linen shirt, pale khaki lightweight trousers, a light tan handbag, and restrained summer accessories for breathable daily ease."
  },
  {
    id: "std-skirt-cream",
    garmentType: "skirt",
    outfitStyle: "refinedFeminine",
    colorDirection: "lightClean",
    topCategory: "soft grey short-sleeve knit",
    bottomCategory: "cream midi skirt",
    visualAnchor: "cream midi skirt",
    seasons: ["春", "夏"],
    sceneAffinities: ["cafeExterior", "flowerShop", "bookstoreMagazine", "mirrorCloset"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Silver Romance", "Lemon", "Delphinium Blue", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Pair a soft grey short-sleeve knit with a cream midi skirt, taupe handbag, and minimal earrings for mature feminine ease."
  },
  {
    id: "std-skirt-accent",
    garmentType: "skirt",
    outfitStyle: "bloggerLite",
    colorDirection: "softAccent",
    topCategory: "oatmeal knit top",
    bottomCategory: "misty blue A-line skirt",
    visualAnchor: "misty blue skirt",
    seasons: ["春", "夏"],
    sceneAffinities: ["bookstoreMagazine", "flowerShop", "cafeExterior", "weekendCityWalk"],
    shoeAffinity: ["Delphinium Blue", "Cloud Dancer", "Sand Dollar", "Silver Romance", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Use an oatmeal knit top, a misty blue A-line skirt, and a pale grey shoulder bag for a low-saturation feminine outfit with subtle freshness."
  },
  {
    id: "std-premium-skirt-silk-pleated",
    garmentType: "skirt",
    outfitStyle: "refinedFeminine",
    colorDirection: "neutralDaily",
    topCategory: "cream silk blouse",
    bottomCategory: "soft grey pleated midi skirt",
    visualAnchor: "soft grey pleated midi skirt",
    seasons: ["春", "秋"],
    sceneAffinities: ["cafeExterior", "bookstoreMagazine", "mirrorCloset", "premiumErrands", "lightSocial"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Silver Romance", "Lemon", "Panda", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Pair a cream silk blouse with a soft grey pleated midi skirt, taupe leather handbag, and minimal pearl earrings for refined feminine quiet luxury styling, with sneakers clearly visible below the hem and no visible luxury logos.",
    bagCategory: "taupe leather handbag",
    accessoryCategory: ["minimal pearl earrings"],
    isPremiumWardrobe: true
  },
  {
    id: "std-premium-skirt-satin",
    garmentType: "skirt",
    outfitStyle: "refinedFeminine",
    colorDirection: "softAccent",
    topCategory: "ivory cashmere short-sleeve knit",
    bottomCategory: "champagne satin midi skirt",
    visualAnchor: "champagne satin midi skirt",
    seasons: ["春", "秋"],
    sceneAffinities: ["cafeExterior", "mirrorCloset", "lightSocial", "weekendCityWalk"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Silver Romance", "Lemon", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Style her in an ivory cashmere short-sleeve knit, champagne satin midi skirt, and structured mini leather bag for calm elegant daily styling, avoiding overly formal evening mood while staying daily and believable.",
    bagCategory: "structured mini leather bag",
    isPremiumWardrobe: true
  },
  {
    id: "std-shorts-denim",
    garmentType: "shorts",
    outfitStyle: "relaxedWeekend",
    colorDirection: "denimBased",
    topCategory: "white shirt worn open",
    bottomCategory: "light denim Bermuda shorts",
    visualAnchor: "white shirt outer layer",
    seasons: ["夏"],
    sceneAffinities: ["weekendCityWalk", "cafeExterior", "bakeryDessert", "premiumErrands"],
    shoeAffinity: ["Aire", "Cloud Dancer", "Sand Dollar", "Lemon", "Delphinium Blue", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Use a white shirt worn open as a light layer, a clean inner top, light denim Bermuda shorts, and a canvas tote for refined summer movement."
  },
  {
    id: "std-shorts-dark",
    garmentType: "shorts",
    outfitStyle: "bloggerLite",
    colorDirection: "darkAnchor",
    topCategory: "charcoal knit tee",
    bottomCategory: "cream tailored shorts",
    visualAnchor: "charcoal knit tee",
    seasons: ["夏"],
    sceneAffinities: ["cafeExterior", "weekendCityWalk", "premiumErrands", "mirrorCloset"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Silver Romance", "Oreo", "Panda", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Pair a charcoal knit tee with cream tailored shorts, a black small shoulder bag, and subtle optical glasses for a grounded outfit-record feel."
  },
  {
    id: "std-dress-ivory",
    garmentType: "dress",
    outfitStyle: "refinedFeminine",
    colorDirection: "lightClean",
    topCategory: "ivory shirt dress",
    bottomCategory: "ivory shirt dress",
    visualAnchor: "ivory shirt dress",
    seasons: ["春", "夏"],
    sceneAffinities: ["flowerShop", "cafeExterior", "bookstoreMagazine", "mirrorCloset", "weekendCityWalk"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Lemon", "Delphinium Blue", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Choose an ivory shirt dress with a soft beige shoulder bag and minimal jewelry for relaxed feminine elegance without vacation styling."
  },
  {
    id: "std-dress-grey",
    garmentType: "dress",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    topCategory: "soft grey summer dress",
    bottomCategory: "soft grey summer dress",
    visualAnchor: "soft grey dress",
    seasons: ["夏"],
    sceneAffinities: ["weekendCityWalk", "cafeExterior", "bookstoreMagazine", "premiumErrands"],
    shoeAffinity: ["Silver Romance", "Cloud Dancer", "Sand Dollar", "Aire", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Use a soft grey summer dress, light taupe handbag, and restrained earrings for a calm one-piece outfit that still keeps the sneakers readable."
  },
  {
    id: "std-dress-khaki",
    garmentType: "dress",
    outfitStyle: "relaxedWeekend",
    colorDirection: "softAccent",
    topCategory: "pale khaki sleeveless dress",
    bottomCategory: "pale khaki sleeveless dress",
    visualAnchor: "pale khaki dress",
    seasons: ["夏", "春"],
    sceneAffinities: ["weekendCityWalk", "flowerShop", "bakeryDessert", "mirrorCloset"],
    shoeAffinity: ["Aire", "Lemon", "Cloud Dancer", "Sand Dollar", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Choose a pale khaki sleeveless dress with a cream tote and subtle gold earrings for fresh warm-weather ease that stays mature."
  },
  {
    id: "std-premium-dress-silk-shirt",
    garmentType: "dress",
    outfitStyle: "refinedFeminine",
    colorDirection: "lightClean",
    topCategory: "ivory silk shirt dress",
    bottomCategory: "ivory silk shirt dress",
    visualAnchor: "ivory silk shirt dress",
    seasons: ["春", "夏"],
    sceneAffinities: ["cafeExterior", "flowerShop", "bookstoreMagazine", "mirrorCloset", "weekendCityWalk", "lightSocial"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Silver Romance", "Lemon", "Delphinium Blue", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Choose an ivory silk shirt dress with a thin leather belt, soft beige shoulder bag, and minimal jewelry for refined one-piece luxury styling with sneakers fully visible and no visible luxury logos.",
    bagCategory: "soft beige shoulder bag",
    accessoryCategory: ["thin leather belt", "minimal jewelry"],
    isPremiumWardrobe: true
  },
  {
    id: "std-premium-dress-wool-blend",
    garmentType: "dress",
    outfitStyle: "refinedFeminine",
    colorDirection: "neutralDaily",
    topCategory: "stone grey long-sleeve wool-blend dress",
    bottomCategory: "stone grey long-sleeve wool-blend dress",
    visualAnchor: "stone grey long-sleeve wool-blend dress",
    seasons: ["秋", "冬"],
    sceneAffinities: ["mirrorCloset", "hotelTravel", "bookstoreMagazine", "lightSocial"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Cappuccino", "Silver Romance", "Oreo", "Panda", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Style her in a stone grey long-sleeve wool-blend dress, cream cashmere cardigan, and structured taupe handbag for quiet polished daily styling that feels warm and mature, with no fake socialite mood.",
    bagCategory: "structured taupe handbag",
    isPremiumWardrobe: true
  },
  {
    id: "std-active-black",
    garmentType: "lightActive",
    outfitStyle: "softActive",
    colorDirection: "darkAnchor",
    topCategory: "black clean-cut T-shirt",
    bottomCategory: "charcoal clean active shorts",
    visualAnchor: "black clean-cut T-shirt",
    seasons: ["春", "夏"],
    sceneAffinities: ["gymInterior", "gymCommute", "premiumErrands"],
    shoeAffinity: ["Aire", "Cloud Dancer", "Sand Dollar", "Oreo", "Panda", "ALL"],
    imageTypes: ["gym", "lifestyle", "onFoot"],
    compactLine:
      "Use a black clean-cut T-shirt, charcoal clean active shorts, and a practical no-logo gym tote for a calm premium movement-ready outfit."
  },
  {
    id: "std-active-grey",
    garmentType: "lightActive",
    outfitStyle: "softActive",
    colorDirection: "neutralDaily",
    topCategory: "pale grey short-sleeve tee",
    bottomCategory: "black active shorts",
    visualAnchor: "pale grey tee",
    seasons: ["夏"],
    sceneAffinities: ["gymInterior", "gymCommute", "premiumErrands"],
    shoeAffinity: ["Aire", "Cloud Dancer", "Sand Dollar", "Delphinium Blue", "Lemon", "ALL"],
    imageTypes: ["gym", "lifestyle"],
    compactLine:
      "Style her in a pale grey short-sleeve tee, black active shorts, a cream overshirt, and a clean gym tote for a believable premium gym moment."
  },
  {
    id: "std-active-cream",
    garmentType: "lightActive",
    outfitStyle: "softActive",
    colorDirection: "lightClean",
    topCategory: "cream clean active top",
    bottomCategory: "taupe straight active trousers",
    visualAnchor: "cream active top",
    seasons: ["春", "夏", "秋"],
    sceneAffinities: ["gymInterior", "gymCommute", "premiumErrands", "mirrorCloset"],
    shoeAffinity: ["Aire", "Cloud Dancer", "Sand Dollar", "Lemon", "ALL"],
    imageTypes: ["gym", "lifestyle", "mirror"],
    compactLine:
      "Use a cream clean active top, taupe straight active trousers, a soft zip layer, and a water bottle for refined light movement styling."
  },
  {
    id: "std-premium-active-transition",
    garmentType: "lightActive",
    outfitStyle: "softActive",
    colorDirection: "neutralDaily",
    topCategory: "cream ribbed active tank",
    bottomCategory: "warm grey wide-leg lounge trousers",
    visualAnchor: "warm grey wide-leg lounge trousers",
    seasons: ["春", "夏", "秋"],
    sceneAffinities: ["gymCommute"],
    shoeAffinity: ["Aire", "Cloud Dancer", "Sand Dollar", "Oreo", "Panda", "ALL"],
    imageTypes: ["lifestyle", "onFoot", "mirror"],
    compactLine:
      "Use a cream ribbed active tank, warm grey wide-leg lounge trousers, soft beige zip layer, and no-logo leather gym tote for quiet premium gym-transition styling that feels clean and refined rather than sporty.",
    bagCategory: "no-logo leather gym tote",
    isPremiumWardrobe: true
  }
];

function normalizeImageType(imageType: TeamImageType): StandardImageType {
  if (imageType === "产品上脚图") return "onFoot";
  if (imageType === "对镜穿搭图") return "mirror";
  if (imageType === "生活场景图") return "lifestyle";
  if (imageType === "产品静物图") return "stillLife";
  if (imageType === "拍摄花絮 / 材质图") return "material";
  return "atmosphere";
}

function normalizeImageTypeForScene(input: ChooseStandardOutfitInput): StandardImageType {
  return input.sceneKey === "gymInterior" ? "gym" : normalizeImageType(input.imageType);
}

function containsShoe(entry: StandardOutfitEntry, shoe: TeamShoe) {
  const normalizedShoe = normalizePerSceneShoe(shoe);
  return entry.shoeAffinity.includes("ALL") || entry.shoeAffinity.includes(normalizedShoe);
}

function scoreOutfit(entry: StandardOutfitEntry, input: ChooseStandardOutfitInput) {
  const tendency = sceneOutfitTendencyMap[input.sceneKey];
  const imageType = normalizeImageTypeForScene(input);
  let score = 0;

  if (entry.seasons.includes(input.season)) score += 30;
  if (entry.sceneAffinities.includes(input.sceneKey)) score += 28;
  if (entry.imageTypes.includes(imageType)) score += 18;
  if (containsShoe(entry, input.shoe)) score += 16;
  if (tendency?.preferredStyles.includes(entry.outfitStyle)) score += 10;
  if (tendency?.preferredColors.includes(entry.colorDirection)) score += 10;
  if (tendency?.preferredGarments.includes(entry.garmentType)) score += 10;
  if (input.sceneKey === "gymInterior" && entry.garmentType === "lightActive") score += 35;
  if (input.imageType === "对镜穿搭图" && entry.imageTypes.includes("mirror")) score += 12;

  return score;
}

function shouldSkipOutfit(imageType: TeamImageType) {
  return imageType === "非产品氛围图" || imageType === "拍摄花絮 / 材质图" || imageType === "产品静物图";
}

export type ChooseStandardOutfitInput = {
  imageType: TeamImageType;
  sceneKey: StandardSceneKey;
  season: TeamSeason;
  shoe: TeamShoe;
  garmentTypePreference: TeamGarmentTypePreference;
  userExtraRequirement: string;
  userSpecifiedClothing: boolean;
  generationNonce?: number;
  preferPremiumWardrobe?: boolean;
};

export function chooseOutfitByGarmentType(input: ChooseStandardOutfitInput): StandardOutfitSelection {
  if (shouldSkipOutfit(input.imageType)) {
    return { outfitLine: "", stylingRealismLine: "", selectedOutfit: null };
  }

  const forceGymInteriorActivewear = input.sceneKey === "gymInterior";

  if (input.userSpecifiedClothing && !forceGymInteriorActivewear) {
    return {
      outfitLine:
        "Use the user's requested clothing direction in a refined, mature, wearable THERUIZ AURA way, keeping the outfit polished, low-saturation, and not pose-centered.",
      stylingRealismLine: creatorStylingBoundaryLine,
      selectedOutfit: null
    };
  }

  const manualGarment = forceGymInteriorActivewear ? "lightActive" : getManualGarmentType(input.garmentTypePreference);
  const allowLightActive =
    forceGymInteriorActivewear || input.sceneKey === "gymCommute" || manualGarment === "lightActive";
  const imageType = normalizeImageTypeForScene(input);
  const baseCandidates = standardOutfitLibrary
    .filter((entry) => entry.seasons.includes(input.season))
    .filter((entry) => entry.sceneAffinities.includes(input.sceneKey) || input.sceneKey === "cityCorner")
    .filter((entry) => entry.imageTypes.includes(imageType))
    .filter((entry) => !forceGymInteriorActivewear || entry.garmentType === "lightActive")
    .filter((entry) => allowLightActive || entry.garmentType !== "lightActive")
    .filter((entry) => containsShoe(entry, input.shoe));

  const manualCandidates = manualGarment
    ? baseCandidates.filter((entry) => entry.garmentType === manualGarment)
    : baseCandidates;
  const fallbackReason = manualGarment && !manualCandidates.length ? "Selected garment type was softened for this scene." : undefined;
  const candidatePool = manualCandidates.length ? manualCandidates : baseCandidates;
  const premiumCandidates = input.preferPremiumWardrobe
    ? candidatePool.filter((entry) => entry.isPremiumWardrobe)
    : [];
  const candidates = (premiumCandidates.length ? premiumCandidates : candidatePool).sort(
    (a, b) => scoreOutfit(b, input) - scoreOutfit(a, input)
  );
  const rotationKey = [
    input.shoe,
    input.sceneKey,
    input.season,
    input.imageType,
    input.garmentTypePreference
  ].join("|");
  const selected = rotateOutfitVariation(
    candidates,
    rotationKey,
    Boolean(manualGarment),
    input.generationNonce
  );

  if (!selected) {
    return {
      outfitLine: forceGymInteriorActivewear
        ? "Use refined fitness-related clothing only: a clean active top, active shorts or active trousers, a light zip layer if needed, and a practical gym bag, with every styling choice clearly suitable for a premium gym interior."
        : "Use a low-saturation refined daily outfit with clear proportions, believable layering, and one practical bag or accessory that supports the sneakers.",
      stylingRealismLine: stylingRealismLines[0],
      selectedOutfit: null,
      fallbackReason
    };
  }

  return {
    outfitLine: selected.compactLine,
    stylingRealismLine: selected.stylingRealismLine ?? stylingRealismLines[0],
    selectedOutfit: selected,
    fallbackReason
  };
}
