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
import { sanitizeSeasonalOutfitLine } from "./sanitizeSeasonalOutfitLine";

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
    id: "std-premium-trousers-cobalt-accent",
    garmentType: "trousers",
    outfitStyle: "cleanMinimal",
    colorDirection: "softAccent",
    topCategory: "misty light blue fine-knit top as the only soft color accent",
    bottomCategory: "stone straight trousers",
    visualAnchor: "misty light blue fine-knit top",
    seasons: ["春", "夏"],
    sceneAffinities: ["commute", "weekendCityWalk", "mirrorCloset", "cityCorner"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Silver Romance", "Aire", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Use one misty light blue fine-knit top as the only soft color accent with stone straight trousers, an ivory lightweight layer, and a soft taupe bag; keep the color restrained, versatile, and easy to coordinate.",
    bagCategory: "soft taupe shoulder bag",
    isPremiumWardrobe: true
  },
  {
    id: "std-premium-trousers-burgundy-accent",
    garmentType: "trousers",
    outfitStyle: "polishedCommuter",
    colorDirection: "softAccent",
    topCategory: "warm ivory fine-knit top",
    bottomCategory: "charcoal tailored trousers",
    visualAnchor: "muted berry-wine fine-knit cardigan",
    seasons: ["秋", "冬"],
    sceneAffinities: ["commute", "hotelTravel", "mirrorCloset", "premiumErrands", "cityCorner"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Cappuccino", "Maple Grove", "Oreo", "Panda", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Use a warm ivory fine-knit top, charcoal tailored trousers, and one muted berry-wine fine-knit cardigan as the only soft color accent, with a soft taupe bag kept secondary.",
    bagCategory: "soft taupe handbag",
    isPremiumWardrobe: true
  },
  {
    id: "std-skirt-cream",
    garmentType: "skirt",
    outfitStyle: "refinedFeminine",
    colorDirection: "lightClean",
    topCategory: "soft grey silk-cotton short-sleeve blouse",
    bottomCategory: "cream midi skirt",
    visualAnchor: "cream midi skirt",
    seasons: ["春", "夏"],
    sceneAffinities: ["cafeExterior", "flowerShop", "bookstoreMagazine", "mirrorCloset"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Silver Romance", "Lemon", "Delphinium Blue", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Pair a soft grey silk-cotton short-sleeve blouse with a cream midi skirt, taupe handbag, and minimal earrings for breathable mature feminine ease."
  },
  {
    id: "std-skirt-accent",
    garmentType: "skirt",
    outfitStyle: "bloggerLite",
    colorDirection: "softAccent",
    topCategory: "oatmeal cotton-poplin top",
    bottomCategory: "misty blue A-line skirt",
    visualAnchor: "misty blue skirt",
    seasons: ["春", "夏"],
    sceneAffinities: ["bookstoreMagazine", "flowerShop", "cafeExterior", "weekendCityWalk"],
    shoeAffinity: ["Delphinium Blue", "Cloud Dancer", "Sand Dollar", "Silver Romance", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Use an oatmeal cotton-poplin top, a misty blue A-line skirt, and a pale grey shoulder bag for a low-saturation feminine outfit with subtle freshness."
  },
  {
    id: "std-premium-skirt-tomato-accent",
    garmentType: "skirt",
    outfitStyle: "refinedFeminine",
    colorDirection: "softAccent",
    topCategory: "dusty rose silk-cotton shirt as the only soft color accent",
    bottomCategory: "stone A-line skirt",
    visualAnchor: "dusty rose silk-cotton shirt",
    seasons: ["春", "夏"],
    sceneAffinities: ["cafeExterior", "flowerShop", "weekendCityWalk", "mirrorCloset", "cityCorner"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Silver Romance", "Aire", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Pair one dusty rose silk-cotton shirt as the only soft color accent with a stone A-line skirt and a soft taupe mini bag, keeping the color restrained, mature, and easy to coordinate.",
    bagCategory: "soft taupe mini bag",
    isPremiumWardrobe: true
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
    topCategory: "ivory silk-cotton short-sleeve top",
    bottomCategory: "champagne satin midi skirt",
    visualAnchor: "champagne satin midi skirt",
    seasons: ["春", "秋"],
    sceneAffinities: ["cafeExterior", "mirrorCloset", "lightSocial", "weekendCityWalk"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Silver Romance", "Lemon", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Style her in an ivory silk-cotton short-sleeve top, champagne satin midi skirt, and structured mini leather bag for calm elegant daily styling, avoiding overly formal evening mood while staying daily and believable.",
    bagCategory: "structured mini leather bag",
    isPremiumWardrobe: true
  },
  {
    id: "std-shorts-stone-cotton",
    garmentType: "shorts",
    outfitStyle: "relaxedWeekend",
    colorDirection: "neutralDaily",
    topCategory: "white shirt worn open",
    bottomCategory: "light stone cotton-twill Bermuda shorts",
    visualAnchor: "white shirt outer layer",
    seasons: ["夏"],
    sceneAffinities: ["weekendCityWalk", "cafeExterior", "bakeryDessert", "premiumErrands"],
    shoeAffinity: ["Aire", "Cloud Dancer", "Sand Dollar", "Lemon", "Delphinium Blue", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Use a white shirt worn open as a light layer, a clean inner top, light stone cotton-twill Bermuda shorts, and a canvas tote for refined summer movement."
  },
  {
    id: "std-shorts-dark",
    garmentType: "shorts",
    outfitStyle: "bloggerLite",
    colorDirection: "darkAnchor",
    topCategory: "charcoal mercerized-cotton tee",
    bottomCategory: "cream tailored shorts",
    visualAnchor: "charcoal mercerized-cotton tee",
    seasons: ["夏"],
    sceneAffinities: ["cafeExterior", "weekendCityWalk", "premiumErrands", "mirrorCloset"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Silver Romance", "Oreo", "Panda", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Pair a charcoal mercerized-cotton tee with cream tailored shorts, a black small shoulder bag, and subtle optical glasses for a grounded summer outfit-record feel."
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
  },
  {
    id: "std-versatile-powder-blue-shirt",
    garmentType: "trousers",
    outfitStyle: "polishedCommuter",
    colorDirection: "softAccent",
    topCategory: "soft powder-blue silk-cotton shirt",
    bottomCategory: "warm grey pleated trousers",
    visualAnchor: "soft powder-blue shirt",
    seasons: ["春", "夏"],
    sceneAffinities: ["commute", "cafeExterior", "lightSocial", "galleryExhibition", "studioLaunch"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Silver Romance", "Aire", "Delphinium Blue", "Lemon", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Style her in a soft powder-blue silk-cotton shirt, warm grey pleated trousers, refined flat-front tailoring, and restrained accessories for a versatile luxury-level daily look that shows the sneaker works beyond one basic pairing.",
    accessoryCategory: ["thin leather belt"],
    isPremiumWardrobe: true
  },
  {
    id: "std-versatile-olive-polo",
    garmentType: "trousers",
    outfitStyle: "cleanMinimal",
    colorDirection: "darkAnchor",
    topCategory: "deep olive fine-knit polo",
    bottomCategory: "ivory ankle-length trousers",
    visualAnchor: "deep olive fine-knit polo",
    seasons: ["春", "秋", "冬"],
    sceneAffinities: ["commute", "bookstoreMagazine", "galleryExhibition", "mirrorCloset", "studioLaunch"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Cappuccino", "Maple Grove", "Oreo", "Panda", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Use a deep olive fine-knit polo, ivory ankle-length trousers, a soft beige short jacket, and precise understated tailoring for a mature dark-anchor styling option with clear sneaker balance.",
    isPremiumWardrobe: true
  },
  {
    id: "std-versatile-soft-olive-trousers",
    garmentType: "trousers",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    topCategory: "warm stone blouse",
    bottomCategory: "soft olive straight trousers",
    visualAnchor: "soft olive straight trousers",
    seasons: ["春", "秋"],
    sceneAffinities: ["weekendCityWalk", "premiumErrands", "boutiqueStreet", "flowerShop", "lightSocial"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Lemon", "Maple Grove", "Cappuccino", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Pair a warm stone blouse with soft olive straight trousers and a cream cropped jacket for a calm real-life outfit rotation that keeps the sneaker readable and easy to style.",
    isPremiumWardrobe: true
  },
  {
    id: "std-versatile-mist-blue-skirt",
    garmentType: "skirt",
    outfitStyle: "refinedFeminine",
    colorDirection: "softAccent",
    topCategory: "mist blue cotton-poplin shirt",
    bottomCategory: "warm grey wrap midi skirt",
    visualAnchor: "mist blue cotton-poplin shirt",
    seasons: ["春", "夏"],
    sceneAffinities: ["cafeExterior", "flowerShop", "lightSocial", "galleryExhibition", "mirrorCloset"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Silver Romance", "Aire", "Delphinium Blue", "Lemon", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Pair a mist blue cotton-poplin shirt with a warm grey wrap midi skirt and clean accessory restraint for feminine daily styling that still feels practical with sneakers.",
    isPremiumWardrobe: true
  },
  {
    id: "std-versatile-dark-denim-skirt",
    garmentType: "skirt",
    outfitStyle: "realDaily",
    colorDirection: "denimBased",
    topCategory: "soft beige mercerized-cotton sleeveless top",
    bottomCategory: "dark denim midi skirt",
    visualAnchor: "dark denim midi skirt",
    seasons: ["春", "夏", "秋"],
    sceneAffinities: ["weekendCityWalk", "bookstoreMagazine", "cafeExterior", "premiumErrands", "mirrorCloset"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Oreo", "Panda", "Delphinium Blue", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Style her in a soft beige mercerized-cotton sleeveless top and dark denim midi skirt for a grounded skirt-and-sneaker combination with mature daily ease.",
    isPremiumWardrobe: true
  },
  {
    id: "std-versatile-tailored-bermuda",
    garmentType: "shorts",
    outfitStyle: "relaxedWeekend",
    colorDirection: "softAccent",
    topCategory: "pale blue short-sleeve shirt",
    bottomCategory: "warm beige pleated shorts",
    visualAnchor: "pale blue short-sleeve shirt",
    seasons: ["夏"],
    sceneAffinities: ["weekendCityWalk", "bakeryDessert", "premiumErrands", "cafeExterior", "mirrorCloset"],
    shoeAffinity: ["Aire", "Cloud Dancer", "Sand Dollar", "Lemon", "Delphinium Blue", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Style her in a pale blue short-sleeve shirt, warm beige pleated shorts, and clean summer tailoring for a breathable sneaker outfit without casual cutoffs.",
    isPremiumWardrobe: true
  },
  {
    id: "std-versatile-pale-blue-dress",
    garmentType: "dress",
    outfitStyle: "refinedFeminine",
    colorDirection: "softAccent",
    topCategory: "pale blue cotton shirt dress",
    bottomCategory: "pale blue cotton shirt dress",
    visualAnchor: "pale blue cotton shirt dress",
    seasons: ["春", "夏"],
    sceneAffinities: ["cafeExterior", "lightSocial", "flowerShop", "mirrorCloset", "studioLaunch"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Silver Romance", "Aire", "Delphinium Blue", "Lemon", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Choose a pale blue cotton shirt dress with clean waist definition and restrained accessories for a fresh one-piece look that keeps the sneakers useful and not overly sweet.",
    isPremiumWardrobe: true
  },
  {
    id: "std-versatile-olive-knit-dress",
    garmentType: "dress",
    outfitStyle: "cleanMinimal",
    colorDirection: "darkAnchor",
    topCategory: "deep olive straight knit dress",
    bottomCategory: "deep olive straight knit dress",
    visualAnchor: "deep olive straight knit dress",
    seasons: ["春", "秋", "冬"],
    sceneAffinities: ["galleryExhibition", "bookstoreMagazine", "lightSocial", "mirrorCloset", "studioLaunch"],
    shoeAffinity: ["Cloud Dancer", "Sand Dollar", "Cappuccino", "Maple Grove", "Oreo", "Panda", "ALL"],
    imageTypes: ["onFoot", "lifestyle", "mirror"],
    compactLine:
      "Use a deep olive straight knit dress and warm beige short jacket for a controlled dark-anchor one-piece outfit with luxury-level fabric quality and clear sneaker contrast.",
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

const highSaturationGarmentPattern =
  /cobalt blue|tomato red|forest green|deep burgundy|high-saturation garment|only saturated garment|only saturated accent/i;

function hasHighSaturationGarment(entry: StandardOutfitEntry) {
  return highSaturationGarmentPattern.test(
    [entry.topCategory, entry.bottomCategory, entry.visualAnchor, entry.compactLine].join(" ")
  );
}

type StudioWardrobePiece = {
  top: string;
  bottom: string;
  layer?: string;
};

const studioSeasonTopPools: Record<TeamSeason, string[]> = {
  春: [
    "an ivory silk-cotton shirt",
    "a pale grey fine-gauge merino knit",
    "a soft blue compact-poplin shirt"
  ],
  夏: [
    "an ivory silk-linen shirt",
    "a warm-white mercerized-cotton tee",
    "a pale grey featherweight cotton polo"
  ],
  秋: [
    "an oatmeal fine-gauge cashmere knit",
    "an ivory washed-silk blouse",
    "a warm grey compact merino polo knit"
  ],
  冬: [
    "a warm ivory cashmere turtleneck",
    "an oatmeal dense fine-knit sweater",
    "a soft grey double-knit top"
  ]
};

const studioSeasonBottomPools: Record<
  TeamSeason,
  Record<"trousers" | "skirt" | "shorts", string[]>
> = {
  春: {
    trousers: [
      "warm grey high-twist wool straight trousers",
      "soft-stone fluid wool wide-leg trousers",
      "oatmeal wool-silk pleated trousers"
    ],
    skirt: [
      "a soft grey silk-wool A-line midi skirt",
      "a taupe compact-twill column midi skirt",
      "a warm ivory fine-pleated wool-blend midi skirt"
    ],
    shorts: [
      "soft-stone wool-silk tailored Bermuda shorts",
      "taupe cotton-silk tailored shorts",
      "warm grey compact-twill Bermuda shorts"
    ]
  },
  夏: {
    trousers: [
      "soft-stone high-twist summer-wool trousers",
      "taupe silk-linen straight trousers",
      "warm grey lightweight fluid-twill trousers"
    ],
    skirt: [
      "an ivory silk-linen A-line midi skirt",
      "a soft-stone cupro column skirt",
      "a taupe featherweight pleated midi skirt"
    ],
    shorts: [
      "soft-stone silk-linen tailored Bermuda shorts",
      "warm grey high-twist wool tailored shorts",
      "taupe compact-cotton Bermuda shorts"
    ]
  },
  秋: {
    trousers: [
      "charcoal fluid-wool straight trousers",
      "taupe double-pleated wool trousers",
      "warm beige brushed-wool wide-leg trousers"
    ],
    skirt: [
      "a charcoal wool-silk column midi skirt",
      "an oatmeal compact-knit midi skirt",
      "a taupe brushed-wool A-line midi skirt"
    ],
    shorts: [
      "charcoal wool-silk tailored Bermuda shorts",
      "taupe brushed-wool tailored shorts",
      "warm grey double-face Bermuda shorts"
    ]
  },
  冬: {
    trousers: [
      "charcoal double-face wool straight trousers",
      "winter-white dense wool trousers",
      "taupe cashmere-blend wide-leg trousers"
    ],
    skirt: [
      "a charcoal double-knit column midi skirt",
      "a winter-white wool A-line midi skirt",
      "a taupe cashmere-blend straight midi skirt"
    ],
    shorts: [
      "charcoal double-face wool tailored Bermuda shorts",
      "taupe cashmere-blend tailored shorts",
      "warm grey dense-wool Bermuda shorts"
    ]
  }
};

const studioSeasonDressPools: Record<TeamSeason, string[]> = {
  春: [
    "an ivory silk-twill shirt dress with a precise waist line",
    "a soft-stone compact-knit midi dress with clean shoulder structure",
    "a pale grey wool-silk column dress with relaxed shaping"
  ],
  夏: [
    "an ivory silk-linen shirt dress with an easy controlled drape",
    "a soft-stone mercerized-cotton midi dress with clean panel lines",
    "a taupe featherweight crepe dress with restrained volume"
  ],
  秋: [
    "an oatmeal fine-knit midi dress with sculpted relaxed proportions",
    "a warm grey wool-silk shirt dress with a precise collar and cuff",
    "a taupe compact-knit column dress with clean seam architecture"
  ],
  冬: [
    "a warm ivory cashmere-blend midi dress with quiet structure",
    "a charcoal double-knit column dress with refined seam shaping",
    "a taupe fine-wool shirt dress with a precise collar and controlled volume"
  ]
};

const studioSeasonActivePools: Record<TeamSeason, StudioWardrobePiece[]> = {
  春: [
    { top: "a cream matte rib-knit active top", bottom: "taupe bonded-jersey straight active trousers", layer: "a soft-stone lightweight zip jacket" },
    { top: "a pale grey compact-knit polo top", bottom: "charcoal fluid active trousers", layer: "an ivory technical-cotton overshirt" },
    { top: "a warm-white clean-cut tee", bottom: "soft grey tailored active trousers", layer: "a taupe matte jersey layer" }
  ],
  夏: [
    { top: "an ivory mercerized-cotton active tee", bottom: "warm grey lightweight active trousers" },
    { top: "a pale grey fine-rib active top", bottom: "taupe tailored active shorts", layer: "a featherweight cream overshirt" },
    { top: "a warm-white structured sleeveless cotton top", bottom: "charcoal fluid active trousers" }
  ],
  秋: [
    { top: "an oatmeal compact-knit active top", bottom: "charcoal tailored active trousers", layer: "a taupe matte zip jacket" },
    { top: "a warm grey fine-merino polo top", bottom: "soft-stone bonded-jersey trousers", layer: "an ivory technical-cotton jacket" },
    { top: "a cream dense jersey tee", bottom: "taupe fluid active trousers", layer: "a soft grey knit layer" }
  ],
  冬: [
    { top: "a warm ivory fine-merino active knit", bottom: "charcoal dense-jersey active trousers", layer: "a taupe clean insulated jacket" },
    { top: "an oatmeal compact-knit top", bottom: "warm grey structured active trousers", layer: "a cream matte zip layer" },
    { top: "a soft grey double-knit top", bottom: "taupe winter-weight active trousers", layer: "a warm-white lightweight padded jacket" }
  ]
};

const studioLuxuryConstructionLines = [
  "Demand luxury-grade tailoring with precise shoulder and collar lines, balanced volume, clean internal structure, refined seam work, and controlled natural drape.",
  "Render high-end ready-to-wear quality through exact hems, subtle shaping, dense matte surfaces, believable fabric weight, and soft dimensional folds.",
  "Use no-logo luxury construction with sculpted but relaxed proportions, clean edge finishing, tactile natural fibers, and no synthetic shine."
];

const studioSeasonMaterialLines: Record<TeamSeason, string> = {
  春: "Use breathable silk-cotton, fine merino, light wool-silk, or compact poplin with a fresh but substantial hand feel.",
  夏: "Use breathable silk-linen, high-twist summer wool, mercerized cotton, or featherweight crepe with an opaque refined finish.",
  秋: "Use cashmere-feeling knit, brushed wool, washed silk, or compact twill with tactile depth and controlled layering.",
  冬: "Use fine cashmere, double-face wool, dense knit, or refined winter-weight twill with warmth but no bulky volume."
};

function getStudioAutomaticGarmentTypes(season: TeamSeason): TeamGarmentType[] {
  return season === "夏" ? ["trousers", "skirt", "shorts", "dress"] : ["trousers", "skirt", "dress"];
}

function chooseStudioLaunchOutfit(input: ChooseStandardOutfitInput): StandardOutfitSelection {
  const nonce = Math.max(0, Math.abs(input.generationNonce ?? 0));
  const manualGarment = getManualGarmentType(input.garmentTypePreference);
  const automaticGarments = getStudioAutomaticGarmentTypes(input.season);
  const garmentType = manualGarment ?? automaticGarments[nonce % automaticGarments.length] ?? "trousers";
  const variationStep = manualGarment ? nonce : Math.floor(nonce / automaticGarments.length);
  const variationIndex = variationStep % 3;
  const constructionLine = studioLuxuryConstructionLines[variationIndex];
  const materialLine = studioSeasonMaterialLines[input.season];
  const paletteClause =
    "keeping every garment in a restrained low-chroma palette such as ivory, cream, oatmeal, warm grey, soft stone, taupe, muted blue, charcoal, winter white, or restrained navy, with no visible logo, showy accessory, or handheld styling prop";
  let topCategory = "luxury-cut neutral top";
  let bottomCategory = "luxury-cut neutral garment";
  let compactLine = "";

  if (garmentType === "dress") {
    const dress = studioSeasonDressPools[input.season][variationIndex];
    topCategory = dress;
    bottomCategory = dress;
    compactLine = sanitizeSeasonalOutfitLine(
      `Style her in ${dress}, ${paletteClause}. ${constructionLine} ${materialLine}`,
      input.season
    );
  } else if (garmentType === "lightActive") {
    const active = studioSeasonActivePools[input.season][variationIndex];
    topCategory = active.top;
    bottomCategory = active.bottom;
    compactLine = sanitizeSeasonalOutfitLine(
      `Style her in ${active.top}, ${active.bottom}${active.layer ? `, and ${active.layer}` : ""} as refined studio activewear, ${paletteClause}. ${constructionLine} ${materialLine}`,
      input.season
    );
  } else {
    const top = studioSeasonTopPools[input.season][variationIndex];
    const bottom = studioSeasonBottomPools[input.season][garmentType][variationIndex];
    topCategory = top;
    bottomCategory = bottom;
    compactLine = sanitizeSeasonalOutfitLine(
      `Style her in ${top} with ${bottom}, ${paletteClause}. ${constructionLine} ${materialLine}`,
      input.season
    );
  }

  const selectedOutfit: StandardOutfitEntry = {
    id: `studio-${input.season}-${garmentType}-${variationIndex}`,
    garmentType,
    outfitStyle: garmentType === "lightActive" ? "softActive" : garmentType === "skirt" || garmentType === "dress" ? "refinedFeminine" : "cleanMinimal",
    colorDirection: variationIndex === 1 ? "neutralDaily" : variationIndex === 2 ? "darkAnchor" : "lightClean",
    topCategory,
    bottomCategory,
    visualAnchor: bottomCategory,
    seasons: [input.season],
    sceneAffinities: ["studioLaunch"],
    shoeAffinity: ["ALL"],
    imageTypes: [normalizeImageType(input.imageType)],
    compactLine,
    stylingRealismLine:
      "Make the studio wardrobe look genuinely expensive through cut, material density, seam precision, fabric behavior, and natural fit rather than branding or decorative styling.",
    isPremiumWardrobe: true
  };

  return {
    outfitLine: selectedOutfit.compactLine,
    stylingRealismLine: selectedOutfit.stylingRealismLine ?? stylingRealismLines[0],
    selectedOutfit
  };
}

function chooseSeasonSafeManualOutfit(input: ChooseStandardOutfitInput): StandardOutfitSelection {
  const studioSafeSelection = chooseStudioLaunchOutfit(input);
  const selected = studioSafeSelection.selectedOutfit;

  if (!selected) return studioSafeSelection;

  const compactLine = sanitizeSeasonalOutfitLine(selected.compactLine, input.season)
    .replace(/refined studio activewear/gi, "refined light activewear")
    .replace(/handheld styling prop/gi, "unnecessary handheld styling prop");
  const selectedOutfit: StandardOutfitEntry = {
    ...selected,
    id: `season-safe-${input.sceneKey}-${selected.id}`,
    sceneAffinities: [input.sceneKey],
    compactLine,
    stylingRealismLine:
      "Keep the explicitly selected garment category, while adapting its fabric weight, layering, cut, and coverage to the selected season and scene."
  };

  return {
    outfitLine: sanitizeSeasonalOutfitLine(selectedOutfit.compactLine, input.season),
    stylingRealismLine: selectedOutfit.stylingRealismLine ?? stylingRealismLines[0],
    selectedOutfit,
    fallbackReason: "Used a season-safe outfit while preserving the selected garment category."
  };
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
        "Follow the user's requested clothing direction exactly, refining only its cut, fabric quality, fit, and styling so it remains mature, wearable, and consistent with THERUIZ AURA.",
      stylingRealismLine: creatorStylingBoundaryLine,
      selectedOutfit: null
    };
  }

  if (input.sceneKey === "studioLaunch") {
    return chooseStudioLaunchOutfit(input);
  }

  const manualGarment = forceGymInteriorActivewear ? "lightActive" : getManualGarmentType(input.garmentTypePreference);
  const allowLightActive =
    forceGymInteriorActivewear || input.sceneKey === "gymCommute" || manualGarment === "lightActive";
  const imageType = normalizeImageTypeForScene(input);
  const baseCandidates = standardOutfitLibrary
    .filter((entry) => entry.seasons.includes(input.season))
    .filter(
      (entry) =>
        entry.sceneAffinities.includes(input.sceneKey) ||
        input.sceneKey === "cityCorner" ||
        input.sceneKey === "studioLaunch"
    )
    .filter((entry) => input.sceneKey !== "studioLaunch" || !hasHighSaturationGarment(entry))
    .filter((entry) => entry.imageTypes.includes(imageType))
    .filter((entry) => !forceGymInteriorActivewear || entry.garmentType === "lightActive")
    .filter((entry) => allowLightActive || entry.garmentType !== "lightActive")
    .filter((entry) => containsShoe(entry, input.shoe));

  const manualCandidates = manualGarment
    ? baseCandidates.filter((entry) => entry.garmentType === manualGarment)
    : baseCandidates;
  if (manualGarment && !manualCandidates.length) {
    return chooseSeasonSafeManualOutfit(input);
  }

  const fallbackReason = undefined;
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
    outfitLine: sanitizeSeasonalOutfitLine(selected.compactLine, input.season),
    stylingRealismLine: selected.stylingRealismLine ?? stylingRealismLines[0],
    selectedOutfit: selected,
    fallbackReason
  };
}
