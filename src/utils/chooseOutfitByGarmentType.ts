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
  }
];

const manualFallbackOutfitLines: Record<TeamGarmentType, string> = {
  trousers:
    "Use refined straight trousers or clean lightweight trousers only, with a low-saturation top and one practical bag; do not switch to skirts, dresses, or shorts.",
  skirt:
    "Use a refined midi skirt or clean A-line skirt only, with a mature low-saturation top and one practical bag; do not switch to trousers, shorts, or dresses.",
  shorts:
    "Use refined Bermuda shorts or tailored shorts only, with a clean low-saturation top and one practical bag; do not switch to long trousers, skirts, or dresses.",
  dress:
    "Use one refined one-piece dress only, with restrained accessories and clear sneaker visibility; do not switch to trousers, shorts, or a skirt outfit.",
  lightActive:
    "Use refined light-active styling only, such as a clean tee with active shorts or clean active trousers and a no-logo gym tote; do not switch to formal commuter styling."
};

function normalizeImageType(imageType: TeamImageType): StandardImageType {
  if (imageType === "产品上脚图") return "onFoot";
  if (imageType === "对镜穿搭图") return "mirror";
  if (imageType === "生活场景图") return "lifestyle";
  if (imageType === "产品静物图") return "stillLife";
  if (imageType === "拍摄花絮 / 材质图") return "material";
  return "atmosphere";
}

function containsShoe(entry: StandardOutfitEntry, shoe: TeamShoe) {
  const normalizedShoe = normalizePerSceneShoe(shoe);
  return entry.shoeAffinity.includes("ALL") || entry.shoeAffinity.includes(normalizedShoe);
}

function scoreOutfit(entry: StandardOutfitEntry, input: ChooseStandardOutfitInput) {
  const tendency = sceneOutfitTendencyMap[input.sceneKey];
  const imageType = normalizeImageType(input.imageType);
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
};

export function chooseOutfitByGarmentType(input: ChooseStandardOutfitInput): StandardOutfitSelection {
  if (shouldSkipOutfit(input.imageType)) {
    return { outfitLine: "", stylingRealismLine: "", selectedOutfit: null };
  }

  if (input.userSpecifiedClothing) {
    return {
      outfitLine:
        "Use the user's requested clothing direction in a refined, mature, wearable THERUIZ AURA way, keeping the outfit polished, low-saturation, and not pose-centered.",
      stylingRealismLine: creatorStylingBoundaryLine,
      selectedOutfit: null
    };
  }

  const manualGarment = getManualGarmentType(input.garmentTypePreference);
  const imageType = normalizeImageType(input.imageType);
  const baseCandidates = standardOutfitLibrary
    .filter((entry) => entry.seasons.includes(input.season))
    .filter((entry) => entry.sceneAffinities.includes(input.sceneKey) || input.sceneKey === "cityCorner")
    .filter((entry) => entry.imageTypes.includes(imageType))
    .filter((entry) => containsShoe(entry, input.shoe));

  const relaxedManualCandidates = manualGarment
    ? standardOutfitLibrary
        .filter((entry) => entry.garmentType === manualGarment)
        .filter((entry) => entry.imageTypes.includes(imageType))
        .filter((entry) => entry.seasons.includes(input.season) || input.season === "秋" || input.season === "冬")
        .filter((entry) => containsShoe(entry, input.shoe) || entry.shoeAffinity.includes("ALL"))
    : [];

  const manualCandidates = manualGarment
    ? baseCandidates.filter((entry) => entry.garmentType === manualGarment)
    : [];

  const candidates = manualGarment
    ? (manualCandidates.length ? manualCandidates : relaxedManualCandidates)
    : baseCandidates;

  const selected = rotateOutfitVariation(
    [...candidates].sort((a, b) => scoreOutfit(b, input) - scoreOutfit(a, input)),
    [input.shoe, input.sceneKey, input.season, input.imageType, input.garmentTypePreference].join("|"),
    Boolean(manualGarment)
  );

  if (!selected && manualGarment) {
    return {
      outfitLine: manualFallbackOutfitLines[manualGarment],
      stylingRealismLine: creatorStylingBoundaryLine,
      selectedOutfit: null,
      fallbackReason: "Manual garment type was enforced with a simple fallback."
    };
  }

  if (!selected) {
    return {
      outfitLine:
        "Use a low-saturation refined daily outfit with clear proportions, believable layering, and one practical bag or accessory that supports the sneakers.",
      stylingRealismLine: stylingRealismLines[0],
      selectedOutfit: null
    };
  }

  return {
    outfitLine: selected.compactLine,
    stylingRealismLine: selected.stylingRealismLine ?? stylingRealismLines[0],
    selectedOutfit: selected
  };
}
