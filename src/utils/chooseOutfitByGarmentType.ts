import type {
  TeamColorDirection,
  TeamGarmentType,
  TeamGarmentTypePreference,
  TeamImageType,
  TeamOutfitStyle,
  TeamSeason,
  TeamShoe
} from "../types";
import { creatorStylingBoundaryLine, getManualGarmentType, stylingRealismLines, type StandardSceneKey } from "../data/outfitDiversityRules";
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

const baseStylingRealismLine =
  "Keep styling real and wearable: natural fabric folds, clear shoe visibility, believable layering, no fabric melting into shoes, and one clear outfit idea rather than over-styled AI fashion.";

const allSceneKeys: StandardSceneKey[] = [
  "commute",
  "weekendCityWalk",
  "premiumErrands",
  "cafeExterior",
  "bookstoreMagazine",
  "flowerShop",
  "bakeryDessert",
  "boutiqueStreet",
  "hotelTravel",
  "mirrorCloset",
  "entrywayDeparture",
  "cityCorner",
  "gymInterior",
  "gymCommute",
  "materialTable",
  "stillLife"
];

const peopleImageTypes: StandardImageType[] = ["onFoot", "mirror", "lifestyle"];
const allShoes = ["ALL"];

const standardOutfitLibrary: StandardOutfitEntry[] = [
  {
    id: "kw-trousers-white-shirt-cream-trousers",
    garmentType: "trousers",
    outfitStyle: "polishedCommuter",
    colorDirection: "lightClean",
    topCategory: "white cotton shirt",
    bottomCategory: "cream straight trousers",
    visualAnchor: "white cotton shirt",
    seasons: ["春", "夏"],
    sceneAffinities: allSceneKeys,
    shoeAffinity: allShoes,
    imageTypes: peopleImageTypes,
    compactLine:
      "Outfit keywords: white cotton shirt, cream straight trousers, light beige shirt jacket, taupe shoulder bag, simple watch, clean polished commuter styling.",
    bagCategory: "taupe shoulder bag as secondary accessory",
    accessoryCategory: ["simple watch"],
    stylingRealismLine: baseStylingRealismLine
  },
  {
    id: "kw-trousers-linen-khaki",
    garmentType: "trousers",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    topCategory: "cream linen shirt",
    bottomCategory: "pale khaki linen trousers",
    visualAnchor: "cream linen shirt",
    seasons: ["夏", "春"],
    sceneAffinities: allSceneKeys,
    shoeAffinity: allShoes,
    imageTypes: ["onFoot", "lifestyle"],
    compactLine:
      "Outfit keywords: cream linen shirt, pale khaki linen trousers, thin woven belt, light tan handbag, breathable summer city-walk styling.",
    bagCategory: "light tan handbag as secondary accessory",
    accessoryCategory: ["thin woven belt"],
    stylingRealismLine: baseStylingRealismLine
  },
  {
    id: "kw-trousers-denim-blue-shirt",
    garmentType: "trousers",
    outfitStyle: "bloggerLite",
    colorDirection: "denimBased",
    topCategory: "pale blue open shirt",
    bottomCategory: "dark straight denim",
    visualAnchor: "pale blue shirt",
    seasons: ["春", "夏", "秋"],
    sceneAffinities: allSceneKeys,
    shoeAffinity: allShoes,
    imageTypes: peopleImageTypes,
    compactLine:
      "Outfit keywords: white tee base, pale blue open shirt, dark straight denim, slim leather belt, cream canvas tote, real city outfit-record styling.",
    bagCategory: "cream canvas tote as secondary accessory",
    accessoryCategory: ["slim leather belt"],
    stylingRealismLine: baseStylingRealismLine
  },
  {
    id: "kw-trousers-dark-anchor",
    garmentType: "trousers",
    outfitStyle: "darkAnchor",
    colorDirection: "darkAnchor",
    topCategory: "dark coffee clean-cut tee",
    bottomCategory: "taupe relaxed trousers",
    visualAnchor: "dark coffee tee",
    seasons: ["春", "夏", "秋"],
    sceneAffinities: allSceneKeys,
    shoeAffinity: allShoes,
    imageTypes: peopleImageTypes,
    compactLine:
      "Outfit keywords: dark coffee clean-cut tee, taupe relaxed trousers, cotton jacket, minimal earrings, grounded dark-anchor daily styling.",
    accessoryCategory: ["minimal earrings"],
    stylingRealismLine: baseStylingRealismLine
  },
  {
    id: "kw-trousers-knit-cardigan",
    garmentType: "trousers",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    topCategory: "oatmeal lightweight knit",
    bottomCategory: "stone relaxed trousers",
    visualAnchor: "oatmeal knit",
    seasons: ["春", "秋", "冬"],
    sceneAffinities: allSceneKeys,
    shoeAffinity: allShoes,
    imageTypes: peopleImageTypes,
    compactLine:
      "Outfit keywords: oatmeal lightweight knit, stone relaxed trousers, soft grey cardigan, thin belt, calm warm-neutral daily texture.",
    accessoryCategory: ["thin belt"],
    stylingRealismLine: baseStylingRealismLine
  },
  {
    id: "kw-skirt-grey-knit-cream-midi",
    garmentType: "skirt",
    outfitStyle: "refinedFeminine",
    colorDirection: "lightClean",
    topCategory: "soft grey short-sleeve knit",
    bottomCategory: "cream midi skirt",
    visualAnchor: "cream midi skirt",
    seasons: ["春", "夏"],
    sceneAffinities: allSceneKeys,
    shoeAffinity: allShoes,
    imageTypes: peopleImageTypes,
    compactLine:
      "Outfit keywords: soft grey short-sleeve knit, cream midi skirt, taupe handbag, minimal earrings, mature refined feminine styling.",
    bagCategory: "taupe handbag as secondary accessory",
    accessoryCategory: ["minimal earrings"],
    stylingRealismLine: baseStylingRealismLine
  },
  {
    id: "kw-skirt-oatmeal-blue",
    garmentType: "skirt",
    outfitStyle: "bloggerLite",
    colorDirection: "softAccent",
    topCategory: "oatmeal knit top",
    bottomCategory: "misty blue A-line skirt",
    visualAnchor: "misty blue skirt",
    seasons: ["春", "夏"],
    sceneAffinities: allSceneKeys,
    shoeAffinity: allShoes,
    imageTypes: peopleImageTypes,
    compactLine:
      "Outfit keywords: oatmeal knit top, misty blue A-line skirt, pale grey shoulder bag, soft low-saturation blogger outfit styling.",
    bagCategory: "pale grey shoulder bag as secondary accessory",
    accessoryCategory: ["small earrings"],
    stylingRealismLine: baseStylingRealismLine
  },
  {
    id: "kw-skirt-denim-midi",
    garmentType: "skirt",
    outfitStyle: "realDaily",
    colorDirection: "denimBased",
    topCategory: "white ribbed tee",
    bottomCategory: "washed denim midi skirt",
    visualAnchor: "washed denim midi skirt",
    seasons: ["春", "夏", "秋"],
    sceneAffinities: allSceneKeys,
    shoeAffinity: allShoes,
    imageTypes: peopleImageTypes,
    compactLine:
      "Outfit keywords: white ribbed tee, washed denim midi skirt, thin beige cardigan, canvas tote, relaxed weekend denim-skirt styling.",
    bagCategory: "canvas tote as secondary accessory",
    accessoryCategory: ["thin beige cardigan"],
    stylingRealismLine: baseStylingRealismLine
  },
  {
    id: "kw-shorts-white-shirt-denim-bermuda",
    garmentType: "shorts",
    outfitStyle: "relaxedWeekend",
    colorDirection: "denimBased",
    topCategory: "white shirt worn open",
    bottomCategory: "light denim Bermuda shorts",
    visualAnchor: "white shirt outer layer",
    seasons: ["夏"],
    sceneAffinities: allSceneKeys,
    shoeAffinity: allShoes,
    imageTypes: peopleImageTypes,
    compactLine:
      "Outfit keywords: white shirt worn open, clean inner top, light denim Bermuda shorts, canvas tote, refined summer movement styling; do not switch to long trousers.",
    bagCategory: "canvas tote as secondary accessory",
    stylingRealismLine: baseStylingRealismLine
  },
  {
    id: "kw-shorts-charcoal-cream-tailored",
    garmentType: "shorts",
    outfitStyle: "bloggerLite",
    colorDirection: "darkAnchor",
    topCategory: "charcoal knit tee",
    bottomCategory: "cream tailored shorts",
    visualAnchor: "charcoal knit tee",
    seasons: ["夏"],
    sceneAffinities: allSceneKeys,
    shoeAffinity: allShoes,
    imageTypes: peopleImageTypes,
    compactLine:
      "Outfit keywords: charcoal knit tee, cream tailored shorts, black small shoulder bag, subtle optical glasses, grounded outfit-record styling; shorts must stay visible.",
    bagCategory: "black small shoulder bag as secondary accessory",
    accessoryCategory: ["subtle optical glasses"],
    stylingRealismLine: baseStylingRealismLine
  },
  {
    id: "kw-shorts-polo-bermuda",
    garmentType: "shorts",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    topCategory: "cream polo shirt",
    bottomCategory: "stone grey Bermuda shorts",
    visualAnchor: "cream polo shirt",
    seasons: ["夏"],
    sceneAffinities: allSceneKeys,
    shoeAffinity: allShoes,
    imageTypes: ["onFoot", "lifestyle"],
    compactLine:
      "Outfit keywords: cream polo shirt, stone grey Bermuda shorts, woven tote, simple watch, clean weekend city styling; do not lengthen shorts into trousers.",
    bagCategory: "woven tote as secondary accessory",
    accessoryCategory: ["simple watch"],
    stylingRealismLine: baseStylingRealismLine
  },
  {
    id: "kw-dress-ivory-shirt-dress",
    garmentType: "dress",
    outfitStyle: "refinedFeminine",
    colorDirection: "lightClean",
    topCategory: "ivory shirt dress",
    bottomCategory: "ivory shirt dress",
    visualAnchor: "ivory shirt dress",
    seasons: ["春", "夏"],
    sceneAffinities: allSceneKeys,
    shoeAffinity: allShoes,
    imageTypes: peopleImageTypes,
    compactLine:
      "Outfit keywords: ivory shirt dress, soft beige shoulder bag, minimal jewelry, clean one-piece feminine styling with sneakers fully visible.",
    bagCategory: "soft beige shoulder bag as secondary accessory",
    accessoryCategory: ["minimal jewelry"],
    stylingRealismLine: baseStylingRealismLine
  },
  {
    id: "kw-dress-grey-summer",
    garmentType: "dress",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    topCategory: "soft grey summer dress",
    bottomCategory: "soft grey summer dress",
    visualAnchor: "soft grey dress",
    seasons: ["夏"],
    sceneAffinities: allSceneKeys,
    shoeAffinity: allShoes,
    imageTypes: peopleImageTypes,
    compactLine:
      "Outfit keywords: soft grey summer dress, light taupe handbag, restrained earrings, calm one-piece daily styling, sneakers clear and not hidden by hem.",
    bagCategory: "light taupe handbag as secondary accessory",
    accessoryCategory: ["restrained earrings"],
    stylingRealismLine: baseStylingRealismLine
  },
  {
    id: "kw-dress-khaki-sleeveless",
    garmentType: "dress",
    outfitStyle: "relaxedWeekend",
    colorDirection: "softAccent",
    topCategory: "pale khaki sleeveless dress",
    bottomCategory: "pale khaki sleeveless dress",
    visualAnchor: "pale khaki dress",
    seasons: ["春", "夏"],
    sceneAffinities: allSceneKeys,
    shoeAffinity: allShoes,
    imageTypes: peopleImageTypes,
    compactLine:
      "Outfit keywords: pale khaki sleeveless dress, cream tote, subtle gold earrings, fresh warm-weather one-piece styling, mature not sweet.",
    bagCategory: "cream tote as secondary accessory",
    accessoryCategory: ["subtle gold earrings"],
    stylingRealismLine: baseStylingRealismLine
  },
  {
    id: "kw-active-black-shorts",
    garmentType: "lightActive",
    outfitStyle: "softActive",
    colorDirection: "darkAnchor",
    topCategory: "black clean-cut T-shirt",
    bottomCategory: "charcoal active shorts",
    visualAnchor: "black clean-cut T-shirt",
    seasons: ["春", "夏"],
    sceneAffinities: allSceneKeys,
    shoeAffinity: allShoes,
    imageTypes: ["onFoot", "lifestyle", "gym"],
    compactLine:
      "Outfit keywords: black clean-cut T-shirt, charcoal active shorts, no-logo gym tote, water bottle, calm premium light-active styling.",
    bagCategory: "no-logo gym tote as secondary accessory",
    accessoryCategory: ["water bottle"],
    stylingRealismLine: baseStylingRealismLine
  },
  {
    id: "kw-active-grey-shorts-overshirt",
    garmentType: "lightActive",
    outfitStyle: "softActive",
    colorDirection: "neutralDaily",
    topCategory: "pale grey short-sleeve tee",
    bottomCategory: "black active shorts",
    visualAnchor: "pale grey tee",
    seasons: ["夏"],
    sceneAffinities: allSceneKeys,
    shoeAffinity: allShoes,
    imageTypes: ["onFoot", "lifestyle", "gym"],
    compactLine:
      "Outfit keywords: pale grey short-sleeve tee, black active shorts, cream overshirt, clean gym tote, believable city-to-gym styling.",
    bagCategory: "clean gym tote as secondary accessory",
    stylingRealismLine: baseStylingRealismLine
  },
  {
    id: "kw-active-cream-taupe-trousers",
    garmentType: "lightActive",
    outfitStyle: "softActive",
    colorDirection: "lightClean",
    topCategory: "cream clean active top",
    bottomCategory: "taupe straight active trousers",
    visualAnchor: "cream active top",
    seasons: ["春", "夏", "秋"],
    sceneAffinities: allSceneKeys,
    shoeAffinity: allShoes,
    imageTypes: ["onFoot", "lifestyle", "mirror", "gym"],
    compactLine:
      "Outfit keywords: cream clean active top, taupe straight active trousers, soft zip layer, water bottle, refined light movement styling.",
    accessoryCategory: ["water bottle"],
    stylingRealismLine: baseStylingRealismLine
  }
];

const manualFallbackOutfitLines: Record<TeamGarmentType, string> = {
  trousers:
    "Outfit keywords: refined straight trousers or clean lightweight trousers, low-saturation top, practical bag; do not switch to skirts, dresses, or shorts.",
  skirt:
    "Outfit keywords: refined midi skirt or clean A-line skirt, mature low-saturation top, practical bag; do not switch to trousers, shorts, or dresses.",
  shorts:
    "Outfit keywords: refined Bermuda shorts or tailored shorts, clean low-saturation top, practical bag; do not switch to long trousers, skirts, or dresses.",
  dress:
    "Outfit keywords: refined one-piece dress, restrained accessories, clear sneaker visibility; do not switch to trousers, shorts, or a skirt outfit.",
  lightActive:
    "Outfit keywords: refined light-active styling, clean tee, active shorts or clean active trousers, no-logo gym tote; do not switch to formal commuter styling."
};

function normalizeImageType(imageType: TeamImageType): StandardImageType {
  if (imageType === "产品上脚图") return "onFoot";
  if (imageType === "对镜穿搭图") return "mirror";
  if (imageType === "生活场景图") return "lifestyle";
  if (imageType === "产品静物图") return "stillLife";
  if (imageType === "拍摄花絮 / 材质图") return "material";
  return "atmosphere";
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
  const seasonImageCandidates = standardOutfitLibrary
    .filter((entry) => entry.seasons.includes(input.season))
    .filter((entry) => entry.imageTypes.includes(imageType));
  const imageOnlyCandidates = standardOutfitLibrary.filter((entry) => entry.imageTypes.includes(imageType));
  const broadCandidates = seasonImageCandidates.length ? seasonImageCandidates : imageOnlyCandidates;
  const candidates = manualGarment
    ? broadCandidates.filter((entry) => entry.garmentType === manualGarment)
    : broadCandidates;
  const selected = rotateOutfitVariation(
    candidates.length ? candidates : broadCandidates,
    [input.season, input.imageType, input.garmentTypePreference, "broad-keyword-rotation"].join("|"),
    Boolean(manualGarment)
  );

  if (!selected && manualGarment) {
    return {
      outfitLine: manualFallbackOutfitLines[manualGarment],
      stylingRealismLine: creatorStylingBoundaryLine,
      selectedOutfit: null,
      fallbackReason: "Manual garment type was enforced with a simple keyword fallback."
    };
  }

  if (!selected) {
    return {
      outfitLine:
        "Outfit keywords: low-saturation refined daily outfit, clear proportions, believable layering, one practical bag or accessory, sneakers fully visible.",
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
