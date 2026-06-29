import type { TeamGarmentTypePreference, TeamImageType, TeamScenePreference, TeamSeason, TeamShoe } from "../types";
import type { ChinaCityProfile } from "../data/chinaUrbanStreetProfiles";
import {
  perSceneOutfitLibrary,
  type ImageType,
  type OutfitEntry,
  type PerSceneOutfitSceneKey,
  type Season
} from "../data/perSceneOutfitLibrary";
import type { GarmentType, ColorDirection, OutfitStyle } from "../data/sceneOutfitSeedLibrary";
import { chooseSmartOutfit } from "./chooseSmartOutfit";
import {
  hasUserSpecifiedClothingRequirement,
  isOutfitConflictingWithUserRequirement,
  normalizePerSceneImageType,
  normalizePerSceneSeason,
  normalizePerSceneShoe,
  resolvePerSceneKey
} from "./outfitLibraryFilters";
import { sanitizeSeasonalOutfitLine } from "./sanitizeSeasonalOutfitLine";

type SummerLifestyleScene =
  | "暑假游乐园"
  | "海边度假"
  | "草原野餐"
  | "酒店度假"
  | "亲子自驾出行"
  | "暑假外出后回家";

type SummerSceneOutfitConfig = {
  automatic: string;
  trousers: string;
  skirt: string;
  shorts: string;
  dress: string;
  lightActive: string;
  automaticGarment: GarmentType;
  outfitStyle: OutfitStyle;
  colorDirection: ColorDirection;
  visualAnchor: string;
  bagCategory: string;
};

const summerSceneOutfitConfigs: Record<SummerLifestyleScene, SummerSceneOutfitConfig> = {
  暑假游乐园: {
    automatic:
      "Use a refined summer amusement-park outfit: a light cotton shirt or silk-cotton top, pale beige relaxed shorts, breathable woven layers, and a structured canvas tote, practical for walking and mature rather than cartoonish or sporty-childish.",
    trousers:
      "Use a light cotton shirt with breathable ivory straight trousers and a structured canvas tote for a practical amusement-park walk.",
    skirt:
      "Use a soft silk-cotton blouse with a muted knee-to-midi skirt and a compact tote, keeping the hem controlled and the sneakers fully readable.",
    shorts:
      "Use a light cotton shirt or mercerized-cotton tee with ivory or pale beige tailored shorts and a structured canvas tote for mature summer walking comfort.",
    dress:
      "Use a clean cotton shirt dress with a controlled hem and a small structured tote for a refined amusement-park outing without tourist styling.",
    lightActive:
      "Use a refined active-inspired summer look with a clean tee, tailored active shorts or light active trousers, and a no-logo tote, never sporty-childish.",
    automaticGarment: "shorts",
    outfitStyle: "relaxedWeekend",
    colorDirection: "neutralDaily",
    visualAnchor: "light cotton summer layer",
    bagCategory: "structured canvas tote"
  },
  海边度假: {
    automatic:
      "Use a refined seaside-holiday outfit: a lightweight cotton-poplin or linen-blend shirt, breathable straight trousers, and one woven or soft leather bag, breezy and mature rather than resort-influencer styled.",
    trousers:
      "Use a lightweight cotton-poplin shirt with breathable linen-blend straight trousers and one soft leather or woven bag for a refined boardwalk outfit.",
    skirt:
      "Use an ivory silk-cotton blouse with a lightweight softly structured midi skirt and one woven bag, keeping the hem away from the sneakers and avoiding resort drama.",
    shorts:
      "Use an airy cotton-poplin sleeveless blouse with soft beige tailored Bermuda shorts and one woven or soft leather bag for mature seaside ease.",
    dress:
      "Use an ivory linen-blend shirt dress with a controlled hem, a lightweight woven overshirt if needed, and one soft bag for a real hotel-by-the-sea wardrobe.",
    lightActive:
      "Use a refined coastal walking look with a clean cotton-poplin top, breathable straight active trousers, and a lightweight woven overshirt, never like beach sportswear.",
    automaticGarment: "trousers",
    outfitStyle: "refinedFeminine",
    colorDirection: "lightClean",
    visualAnchor: "lightweight linen shirt",
    bagCategory: "woven or soft leather bag"
  },
  草原野餐: {
    automatic:
      "Use a quiet grassland-picnic outfit: a light shirt or cream cotton-poplin top, soft beige or muted-sage relaxed trousers, an easy woven summer layer, and one woven tote or canvas bag, refined rather than camping-influencer styled.",
    trousers:
      "Use a light shirt or cream cotton-poplin top with muted-sage or soft beige relaxed trousers and one woven tote for quiet grassland ease.",
    skirt:
      "Use a cream silk-cotton top with a muted midi skirt and one canvas bag, keeping the hem controlled and the sneakers clear above the grass.",
    shorts:
      "Use a soft cotton shirt with stone or beige tailored shorts and one canvas tote for breathable picnic movement without outdoor-gear styling.",
    dress:
      "Use a restrained cotton shirt dress with a light cotton overshirt and one woven tote, keeping the silhouette practical and not pastoral-costume-like.",
    lightActive:
      "Use a refined movement-ready look with a clean mercerized-cotton tee, muted active trousers, and a light overshirt, never technical or camping-oriented.",
    automaticGarment: "trousers",
    outfitStyle: "realDaily",
    colorDirection: "softAccent",
    visualAnchor: "muted-sage relaxed trousers",
    bagCategory: "woven tote or canvas bag"
  },
  酒店度假: {
    automatic:
      "Use a refined hotel-holiday outfit: an ivory shirt dress, quiet silk-cotton set, or cream blouse with soft trousers, plus a lightweight shirt layer and structured travel tote, polished but relaxed rather than staged luxury-resort fashion.",
    trousers:
      "Use a cream blouse with soft straight trousers, a lightweight shirt layer, and structured travel tote for a calm hotel-holiday wardrobe.",
    skirt:
      "Use a silk-cotton top with a muted midi skirt, lightweight shirt layer, and compact travel tote, keeping the sneakers clearly visible below the hem.",
    shorts:
      "Use a clean silk-cotton shirt with refined tailored shorts and a structured travel tote for warm-weather hotel ease without resort posing.",
    dress:
      "Use an ivory shirt dress with a controlled hem, lightweight cotton overshirt, and structured travel tote for a real hotel-holiday outfit.",
    lightActive:
      "Use a quiet travel-ready cotton-poplin set with refined active trousers, a light zip layer, and a no-logo travel tote, never like hotel gym clothing.",
    automaticGarment: "dress",
    outfitStyle: "polishedCommuter",
    colorDirection: "lightClean",
    visualAnchor: "ivory holiday wardrobe",
    bagCategory: "structured travel tote"
  },
  亲子自驾出行: {
    automatic:
      "Use a refined family road-trip outfit: a soft cotton shirt, cream cotton-poplin top, relaxed straight trousers or tailored shorts, a light woven outer layer, and one comfortable tote, practical for car-side movement and destination arrival.",
    trousers:
      "Use a soft cotton shirt with relaxed straight trousers, a light outer layer, and one comfortable tote for practical car-side movement.",
    skirt:
      "Use a clean silk-cotton top with a controlled muted midi skirt and one comfortable tote, keeping the hem and car door away from the sneakers.",
    shorts:
      "Use a cream cotton-poplin top with tailored beige shorts, a light overshirt, and one comfortable tote for easy summer road-trip movement.",
    dress:
      "Use a practical cotton shirt dress with a light cotton overshirt and one travel tote, keeping the silhouette mature and easy for getting in and out of the car.",
    lightActive:
      "Use a refined travel-active look with a clean tee, straight active trousers, a light zip layer, and one practical tote, never like a sports campaign.",
    automaticGarment: "trousers",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    visualAnchor: "soft cotton travel layer",
    bagCategory: "comfortable travel tote"
  },
  暑假外出后回家: {
    automatic:
      "Use a relaxed summer return-home outfit: a light shirt or soft silk-cotton top, breathable trousers or easy tailored shorts, a thin cotton overshirt or shirt layer, and one tote, lived-in and calm rather than posed or homewear-like.",
    trousers:
      "Use a light shirt or soft silk-cotton top with breathable straight trousers, a thin cotton overshirt, and one tote for a calm return-home moment.",
    skirt:
      "Use a soft silk-cotton top with a relaxed muted skirt and thin cotton overshirt, keeping the hem controlled and the sneakers visible at the entryway.",
    shorts:
      "Use a light shirt with easy tailored shorts, a thin cotton overshirt, and one tote for a natural after-outing return without homewear styling.",
    dress:
      "Use a relaxed cotton shirt dress with a thin cotton overshirt and one tote for a warm, lived-in return-home outfit that still feels composed.",
    lightActive:
      "Use a clean light active top with relaxed active trousers and a thin shirt layer for an easy return-home moment, never sloppy or gym-ad-like.",
    automaticGarment: "trousers",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    visualAnchor: "thin summer shirt layer",
    bagCategory: "everyday tote"
  }
};

const seasideSeasonLayerLines: Record<TeamSeason, string> = {
  春: "Use a light cotton-twill overshirt only if the sea breeze needs one, keeping the outfit airy and mild.",
  夏: "Keep the outfit airy, breathable, and sunlit with linen blend, cotton poplin, and washed cotton; an outer layer is optional.",
  秋: "Interpret autumn as a mild coastal day and use a lightweight cotton-twill shirt jacket or compact woven overshirt instead of cold-city layering.",
  冬: "Interpret winter as a mild sunny coastal day and use a clean wind-resistant woven jacket over cotton-poplin layers, keeping the outfit light rather than bulky."
};

type SeasideOutfitVariant = {
  id: string;
  line: string;
  garmentType: GarmentType;
  seasons: TeamSeason[];
  visualAnchor: string;
  bagCategory: string;
  automatic?: boolean;
};

const seasideOutfitVariants: SeasideOutfitVariant[] = [
  {
    id: "stone-linen-trousers",
    line:
      "Use an ivory cotton-poplin shirt with soft-stone linen-blend straight trousers and one light taupe leather shoulder bag for quiet Mediterranean ease.",
    garmentType: "trousers",
    seasons: ["春", "夏", "秋", "冬"],
    visualAnchor: "soft-stone linen-blend straight trousers",
    bagCategory: "light taupe leather shoulder bag",
    automatic: true
  },
  {
    id: "pale-blue-coastal-trousers",
    line:
      "Use a pale mist-blue cotton shirt with cream lightweight tailored trousers and one restrained canvas-leather tote, keeping the palette fresh and coastal rather than resort-like.",
    garmentType: "trousers",
    seasons: ["春", "夏", "秋"],
    visualAnchor: "pale mist-blue cotton shirt",
    bagCategory: "restrained canvas-leather tote",
    automatic: true
  },
  {
    id: "khaki-coastal-trousers",
    line:
      "Use a warm-white woven polo top with pale-khaki pleated straight trousers and one compact soft leather bag for a polished seaside promenade look.",
    garmentType: "trousers",
    seasons: ["春", "夏", "秋", "冬"],
    visualAnchor: "pale-khaki pleated straight trousers",
    bagCategory: "compact soft leather bag",
    automatic: true
  },
  {
    id: "winter-coastal-trousers",
    line:
      "Use a brushed cotton shirt, warm stone cotton-twill trousers, and a clean lightweight wind-resistant jacket with one muted leather bag for a mild winter Mediterranean day.",
    garmentType: "trousers",
    seasons: ["秋", "冬"],
    visualAnchor: "lightweight wind-resistant coastal jacket",
    bagCategory: "muted leather bag",
    automatic: true
  },
  {
    id: "ivory-column-skirt",
    line:
      "Use a pale blue silk-cotton blouse with an ivory softly structured column skirt and one woven shoulder bag, keeping the hem controlled and the sneakers clear.",
    garmentType: "skirt",
    seasons: ["春", "夏", "秋"],
    visualAnchor: "ivory softly structured column skirt",
    bagCategory: "woven shoulder bag",
    automatic: true
  },
  {
    id: "stone-midi-skirt",
    line:
      "Use a warm-white long-sleeve poplin top with a soft-stone A-line midi skirt and one compact taupe bag for understated coastal femininity.",
    garmentType: "skirt",
    seasons: ["春", "秋", "冬"],
    visualAnchor: "soft-stone A-line midi skirt",
    bagCategory: "compact taupe bag",
    automatic: true
  },
  {
    id: "summer-pale-sage-skirt",
    line:
      "Use a warm-white cotton shell with a pale sage lightweight A-line midi skirt and one small taupe shoulder bag for fresh, controlled summer femininity.",
    garmentType: "skirt",
    seasons: ["夏"],
    visualAnchor: "pale sage lightweight A-line midi skirt",
    bagCategory: "small taupe shoulder bag",
    automatic: true
  },
  {
    id: "winter-coastal-skirt",
    line:
      "Use a crisp cotton shirt, a warm-grey woven midi skirt, fine neutral socks, and a lightweight cotton-twill jacket with one small leather bag for a mild coastal winter.",
    garmentType: "skirt",
    seasons: ["冬"],
    visualAnchor: "warm-grey woven midi skirt",
    bagCategory: "small leather bag",
    automatic: true
  },
  {
    id: "beige-bermuda-shorts",
    line:
      "Use an airy cotton-poplin sleeveless blouse with soft beige tailored Bermuda shorts and one woven shoulder bag for mature summer seaside ease.",
    garmentType: "shorts",
    seasons: ["夏"],
    visualAnchor: "soft beige tailored Bermuda shorts",
    bagCategory: "woven shoulder bag",
    automatic: true
  },
  {
    id: "stone-bermuda-shorts",
    line:
      "Use a clean short-sleeve cotton shirt with stone tailored Bermuda shorts and one compact soft leather bag, keeping the silhouette relaxed and refined.",
    garmentType: "shorts",
    seasons: ["春", "夏", "秋"],
    visualAnchor: "stone tailored Bermuda shorts",
    bagCategory: "compact soft leather bag",
    automatic: true
  },
  {
    id: "khaki-bermuda-shoulder-season",
    line:
      "Use a warm-white long-sleeve cotton shirt with pale-khaki tailored Bermuda shorts and a light woven overshirt for a mild spring or autumn coastal walk.",
    garmentType: "shorts",
    seasons: ["春", "秋"],
    visualAnchor: "pale-khaki tailored Bermuda shorts",
    bagCategory: "",
    automatic: true
  },
  {
    id: "winter-coastal-bermuda",
    line:
      "Use a long-sleeve cotton-poplin shirt with knee-length cotton-twill Bermuda shorts, fine neutral socks, and a lightweight wind-resistant jacket for a mild sunny coastal winter.",
    garmentType: "shorts",
    seasons: ["冬"],
    visualAnchor: "knee-length cotton-twill Bermuda shorts",
    bagCategory: ""
  },
  {
    id: "winter-stone-bermuda",
    line:
      "Use a brushed cotton shirt with stone knee-length Bermuda shorts, fine warm-grey socks, and a compact cotton-twill jacket for a sunny Mediterranean winter promenade.",
    garmentType: "shorts",
    seasons: ["冬"],
    visualAnchor: "stone knee-length Bermuda shorts",
    bagCategory: "compact soft leather bag"
  },
  {
    id: "ivory-shirt-dress",
    line:
      "Use an ivory linen-blend shirt dress with a controlled midi hem and one soft taupe bag for a real hotel-by-the-sea wardrobe.",
    garmentType: "dress",
    seasons: ["春", "夏", "秋"],
    visualAnchor: "ivory linen-blend shirt dress",
    bagCategory: "soft taupe bag",
    automatic: true
  },
  {
    id: "pale-sage-shirt-dress",
    line:
      "Use a pale sage washed-cotton shirt dress with a controlled hem and one small woven bag, keeping the color muted and easy against Mediterranean stone.",
    garmentType: "dress",
    seasons: ["春", "夏", "秋"],
    visualAnchor: "pale sage washed-cotton shirt dress",
    bagCategory: "small woven bag",
    automatic: true
  },
  {
    id: "winter-coastal-shirt-dress",
    line:
      "Use a long-sleeve warm-white cotton-twill shirt dress with a controlled hem, fine neutral socks, and a compact wind-resistant woven jacket for mild coastal winter light.",
    garmentType: "dress",
    seasons: ["冬"],
    visualAnchor: "warm-white cotton-twill shirt dress",
    bagCategory: "",
    automatic: true
  },
  {
    id: "winter-stone-shirt-dress",
    line:
      "Use a soft-stone long-sleeve cotton shirt dress with a controlled hem, fine neutral socks, and a warm-white wind-resistant woven jacket for quiet coastal winter clarity.",
    garmentType: "dress",
    seasons: ["冬"],
    visualAnchor: "soft-stone long-sleeve cotton shirt dress",
    bagCategory: "small taupe shoulder bag",
    automatic: true
  },
  {
    id: "coastal-active-trousers",
    line:
      "Use a clean cotton polo top with breathable straight active trousers and a lightweight woven overshirt for an easy coastal walk, never technical beach sportswear.",
    garmentType: "lightActive",
    seasons: ["春", "夏", "秋", "冬"],
    visualAnchor: "breathable straight active trousers",
    bagCategory: "",
    automatic: true
  },
  {
    id: "summer-coastal-active",
    line:
      "Use a warm-white cotton tee with pale stone straight active trousers and one light cotton overshirt for a breathable Mediterranean promenade walk.",
    garmentType: "lightActive",
    seasons: ["夏"],
    visualAnchor: "pale stone straight active trousers",
    bagCategory: "",
    automatic: true
  },
  {
    id: "spring-coastal-active",
    line:
      "Use a pale blue woven cotton top with cream straight active trousers and a lightweight warm-white overshirt for a refined spring promenade.",
    garmentType: "lightActive",
    seasons: ["春"],
    visualAnchor: "cream straight active trousers",
    bagCategory: "",
    automatic: true
  },
  {
    id: "cool-season-coastal-active",
    line:
      "Use a long-sleeve woven cotton top with straight active trousers and a clean wind-resistant jacket for calm coastal movement without a sports-campaign feeling.",
    garmentType: "lightActive",
    seasons: ["秋", "冬"],
    visualAnchor: "clean wind-resistant active layer",
    bagCategory: "",
    automatic: true
  }
];

function chooseSeasideOutfitVariant(input: ChoosePerSceneOutfitInput, preference: TeamGarmentTypePreference) {
  const season = normalizeTeamSeason(input.season);
  const requestedGarment = preference === "自动匹配" ? null : garmentTypeByPreference[preference];
  const seasonMatches = seasideOutfitVariants.filter(
    (variant) =>
      variant.seasons.includes(season) &&
      (requestedGarment ? variant.garmentType === requestedGarment : variant.automatic)
  );
  const garmentFallback = requestedGarment
    ? seasideOutfitVariants.filter((variant) => variant.garmentType === requestedGarment)
    : seasideOutfitVariants.filter((variant) => variant.automatic);
  const pool = seasonMatches.length ? seasonMatches : garmentFallback;
  const nonce = Math.max(0, Math.abs(input.generationNonce ?? 0));
  return pool[nonce % pool.length] ?? seasideOutfitVariants[0];
}

function normalizeTeamSeason(season: TeamSeason | Season): TeamSeason {
  const normalized = normalizePerSceneSeason(season);
  if (normalized === "spring") return "春";
  if (normalized === "summer") return "夏";
  if (normalized === "autumn") return "秋";
  return "冬";
}

const garmentTypeByPreference: Record<Exclude<TeamGarmentTypePreference, "自动匹配">, GarmentType> = {
  裤装: "trousers",
  裙装: "skirt",
  短裤: "shorts",
  连衣裙: "dress",
  轻运动: "lightActive"
};

function isSummerLifestyleScene(scene: string): scene is SummerLifestyleScene {
  return scene in summerSceneOutfitConfigs;
}

function chooseSummerLifestyleOutfit(input: ChoosePerSceneOutfitInput): ChoosePerSceneOutfitResult | null {
  const scene = String(input.scenePreference);
  if (!isSummerLifestyleScene(scene)) return null;
  if (input.imageType !== "产品上脚图" && input.imageType !== "生活场景图") return null;
  if (scene !== "海边度假" && normalizePerSceneSeason(input.season) !== "summer") return null;
  if (hasUserSpecifiedClothingRequirement(input.userExtraRequirement)) return null;

  const preference = input.garmentTypePreference ?? "自动匹配";
  const config = summerSceneOutfitConfigs[scene];
  const seasideVariant = scene === "海边度假" ? chooseSeasideOutfitVariant(input, preference) : null;
  const garmentType = seasideVariant?.garmentType ??
    (preference === "自动匹配" ? config.automaticGarment : garmentTypeByPreference[preference]);
  const selectedBaseLine = seasideVariant?.line ??
    (preference === "自动匹配" ? config.automatic : config[garmentType]);
  const selectedLine =
    scene === "海边度假"
      ? `${selectedBaseLine} ${seasideSeasonLayerLines[normalizeTeamSeason(input.season)]}`
      : selectedBaseLine;
  const selectedSeasonalLine = sanitizeSeasonalOutfitLine(selectedLine, input.season);

  return {
    selectedOutfitId: `summer-lifestyle-${scene}-${garmentType}-${seasideVariant?.id ?? "base"}`,
    selectedPerSceneOutfitLine: selectedSeasonalLine,
    selectedOutfit: null,
    selectedStylingRealismLine:
      scene === "海边度假"
        ? "Keep the seaside styling mature, breathable, and naturally worn. Use lightweight woven fabrics and compact coastal layers, with restrained proportions and clear sneaker visibility."
        : "Keep the outfit practical for real summer movement, mature, breathable, and naturally worn, with restrained styling and clear sneaker visibility.",
    selectedGarmentType: garmentType,
    selectedOutfitStyle: config.outfitStyle,
    selectedColorDirection: config.colorDirection,
    selectedVisualAnchor: seasideVariant?.visualAnchor ?? config.visualAnchor,
    selectedBagCategory: seasideVariant?.bagCategory ?? config.bagCategory,
    selectedAccessoryCategory: ["one restrained scene-relevant accessory"]
  };
}

type ExpandedLifestyleScene =
  | "商务区转角"
  | "写字楼门口"
  | "停车后步行去办公室"
  | "回家进门"
  | "地铁 / 商场通道"
  | "楼下便利店 / 咖啡外带"
  | "咖啡店门口"
  | "书店 / 杂志店门口"
  | "花店 / 买花"
  | "社区市集 / 精品买菜"
  | "城市街角 / 安静街区"
  | "雨天街角"
  | "酒店走廊"
  | "酒店房间"
  | "酒店门口 / 门厅"
  | "衣帽间 / 更衣角"
  | "窗边阅读角"
  | "工作台 / 桌边整理"
  | "入户镜前"
  | "停车场到电梯口"
  | "瑜伽 / 普拉提工作室门口"
  | "公园慢走"
  | "社区步道"
  | "周末轻旅行出发";

type ExpandedSceneCategory = "commute" | "weekend" | "indoor" | "activeRelaxed";

const expandedSceneCategories: Record<ExpandedLifestyleScene, ExpandedSceneCategory> = {
  商务区转角: "commute",
  写字楼门口: "commute",
  停车后步行去办公室: "commute",
  回家进门: "commute",
  "地铁 / 商场通道": "commute",
  "楼下便利店 / 咖啡外带": "commute",
  咖啡店门口: "weekend",
  "书店 / 杂志店门口": "weekend",
  "花店 / 买花": "weekend",
  "社区市集 / 精品买菜": "weekend",
  "城市街角 / 安静街区": "weekend",
  雨天街角: "weekend",
  酒店走廊: "indoor",
  酒店房间: "indoor",
  "酒店门口 / 门厅": "indoor",
  "衣帽间 / 更衣角": "indoor",
  窗边阅读角: "indoor",
  "工作台 / 桌边整理": "indoor",
  入户镜前: "indoor",
  停车场到电梯口: "indoor",
  "瑜伽 / 普拉提工作室门口": "activeRelaxed",
  公园慢走: "activeRelaxed",
  社区步道: "activeRelaxed",
  周末轻旅行出发: "activeRelaxed"
};

const expandedSceneOutfitConfigs: Record<ExpandedSceneCategory, SummerSceneOutfitConfig> = {
  commute: {
    automatic:
      "Use a refined city commute outfit with a light shirt or fine knit, straight tailored trousers, and a restrained seasonal layer, polished but easy for real daily movement.",
    trousers:
      "Use a light shirt or fine knit with straight tailored trousers and a restrained seasonal layer for clean commute proportions.",
    skirt:
      "Use a soft blouse or fine knit with a controlled knee-to-midi skirt, keeping the hem clear of the sneakers.",
    shorts:
      "Use a clean shirt with refined knee-length tailored shorts, mature and city-appropriate rather than resort-like.",
    dress:
      "Use a restrained shirt dress with a controlled hem and a light seasonal layer for an easy polished commute.",
    lightActive:
      "Use a refined movement-ready top with straight active trousers and a clean overshirt or coat, practical but never gym-like.",
    automaticGarment: "trousers",
    outfitStyle: "polishedCommuter",
    colorDirection: "neutralDaily",
    visualAnchor: "straight tailored commute proportions",
    bagCategory: "structured tote"
  },
  weekend: {
    automatic:
      "Use an understated weekend outfit with a light shirt or soft knit and relaxed denim or tailored trousers, naturally shareable but never influencer-styled.",
    trousers:
      "Use a light shirt or soft knit with relaxed straight trousers or clean denim for a believable weekend city look.",
    skirt:
      "Use a fine-knit or clean cotton top with a muted knee-to-midi skirt, relaxed and feminine without sweetness.",
    shorts:
      "Use a clean cotton shirt or knit tee with refined tailored shorts for mature warm-weather city ease.",
    dress:
      "Use a clean shirt dress or restrained knit dress with a controlled hem for quiet weekend femininity.",
    lightActive:
      "Use a refined walking-ready top with straight active trousers and a light overshirt, never technical sportswear.",
    automaticGarment: "trousers",
    outfitStyle: "relaxedWeekend",
    colorDirection: "softAccent",
    visualAnchor: "quiet weekend city layering",
    bagCategory: "soft leather bag"
  },
  indoor: {
    automatic:
      "Use a quiet indoor or travel outfit with a fine knit or soft blouse, relaxed straight trousers, and a light cardigan, composed without looking staged.",
    trousers:
      "Use a fine knit or soft blouse with relaxed straight trousers and a light cardigan for calm indoor sophistication.",
    skirt:
      "Use a refined knit top with a softly structured midi skirt and light cardigan, keeping the hem controlled and the sneakers readable.",
    shorts:
      "Use a clean shirt or soft knit with tailored shorts and a light cardigan for a warm indoor setting, mature and not loungewear-like.",
    dress:
      "Use a restrained shirt dress or fine-knit dress with a controlled hem and a light cardigan.",
    lightActive:
      "Use a quiet knit top with straight active trousers and a soft zip layer, suitable for real movement but not styled as gym clothing.",
    automaticGarment: "trousers",
    outfitStyle: "refinedFeminine",
    colorDirection: "lightClean",
    visualAnchor: "soft indoor layering",
    bagCategory: "compact travel bag"
  },
  activeRelaxed: {
    automatic:
      "Use a refined movement-ready daily outfit with a clean knit or cotton top, relaxed straight trousers, and a light outer layer, comfortable without becoming sportswear.",
    trousers:
      "Use a clean knit or cotton top with relaxed straight trousers and a light outer layer for stable everyday movement.",
    skirt:
      "Use a soft knit top with a controlled casual midi skirt, keeping movement natural and both sneakers readable.",
    shorts:
      "Use a clean cotton or fine-knit top with tailored walking shorts, mature and movement-friendly without gym styling.",
    dress:
      "Use a practical shirt dress with a controlled hem and a light layer for an easy departure or walking moment.",
    lightActive:
      "Use a clean studio-to-street top with straight active trousers and a refined light layer, minimal and functional without performance-sports branding.",
    automaticGarment: "lightActive",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    visualAnchor: "refined movement-ready layers",
    bagCategory: "practical no-logo tote"
  }
};

function isExpandedLifestyleScene(scene: string): scene is ExpandedLifestyleScene {
  return scene in expandedSceneCategories;
}

function chooseExpandedLifestyleOutfit(input: ChoosePerSceneOutfitInput): ChoosePerSceneOutfitResult | null {
  const scene = String(input.scenePreference);
  if (!isExpandedLifestyleScene(scene)) return null;
  if (
    input.imageType !== "产品上脚图" &&
    input.imageType !== "生活场景图" &&
    input.imageType !== "对镜穿搭图"
  ) {
    return null;
  }
  if (hasUserSpecifiedClothingRequirement(input.userExtraRequirement)) return null;

  const category = expandedSceneCategories[scene];
  const config = expandedSceneOutfitConfigs[category];
  const preference = input.garmentTypePreference ?? "自动匹配";
  const garmentType = preference === "自动匹配" ? config.automaticGarment : garmentTypeByPreference[preference];
  const selectedLine = sanitizeSeasonalOutfitLine(
    preference === "自动匹配" ? config.automatic : config[garmentType],
    input.season
  );

  return {
    selectedOutfitId: `expanded-scene-${category}-${scene}-${garmentType}`,
    selectedPerSceneOutfitLine: selectedLine,
    selectedOutfit: null,
    selectedStylingRealismLine:
      "Keep the outfit seasonally believable, naturally worn, proportionally clear, and practical for the selected place and action.",
    selectedGarmentType: garmentType,
    selectedOutfitStyle: config.outfitStyle,
    selectedColorDirection: config.colorDirection,
    selectedVisualAnchor: config.visualAnchor,
    selectedBagCategory: config.bagCategory,
    selectedAccessoryCategory: ["one restrained scene-relevant accessory"]
  };
}

type ChoosePerSceneOutfitInput = {
  scenePreference: TeamScenePreference | string;
  season: TeamSeason | Season;
  shoe: TeamShoe | string;
  imageType: TeamImageType | ImageType;
  userExtraRequirement?: string;
  previousOutfitId?: string;
  generatedHistory?: string[];
  garmentTypePreference?: TeamGarmentTypePreference;
  cityProfile?: ChinaCityProfile | null;
  generationNonce?: number;
};

export type ChoosePerSceneOutfitResult = {
  selectedOutfitId: string | null;
  selectedPerSceneOutfitLine: string | null;
  selectedOutfit: OutfitEntry | null;
  selectedStylingRealismLine: string | null;
  selectedGarmentType: GarmentType | null;
  selectedOutfitStyle: OutfitStyle | null;
  selectedColorDirection: ColorDirection | null;
  selectedVisualAnchor: string | null;
  selectedBagCategory?: string | null;
  selectedAccessoryCategory?: string[] | null;
  usedFallback?: boolean;
  conflictWarnings?: string[];
};

const emptySelection: ChoosePerSceneOutfitResult = {
  selectedOutfitId: null,
  selectedPerSceneOutfitLine: null,
  selectedOutfit: null,
  selectedStylingRealismLine: null,
  selectedGarmentType: null,
  selectedOutfitStyle: null,
  selectedColorDirection: null,
  selectedVisualAnchor: null
};

function hashText(text: string) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getStorageKey(input: ChoosePerSceneOutfitInput, sceneKey: PerSceneOutfitSceneKey) {
  return [
    "theruiz-aura",
    "per-scene-outfit-phase1",
    sceneKey,
    input.season,
    input.shoe,
    input.imageType
  ].join(":");
}

function readStoredHistory(key: string) {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as string[]) : [];
  } catch {
    return [];
  }
}

function writeStoredHistory(key: string, ids: string[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(ids.slice(0, 20)));
  } catch {
    // Best effort only. Prompt generation must still work if localStorage is unavailable.
  }
}

function containsShoe(entry: OutfitEntry, shoe: string) {
  return entry.suitableShoes.includes("ALL") || entry.suitableShoes.includes(shoe);
}

function containsImageType(entry: OutfitEntry, imageType: ImageType | null) {
  return imageType ? entry.imageTypes.includes(imageType) : false;
}

function withoutConflicts(candidates: OutfitEntry[], input: ChoosePerSceneOutfitInput) {
  const filtered = candidates.filter(
    (entry) => !isOutfitConflictingWithUserRequirement(entry, input.userExtraRequirement)
  );
  return filtered.length ? filtered : candidates;
}

function buildCandidatePools(input: ChoosePerSceneOutfitInput, sceneOutfits: OutfitEntry[]) {
  const season = normalizePerSceneSeason(input.season);
  const shoe = normalizePerSceneShoe(input.shoe);
  const imageType = normalizePerSceneImageType(input.imageType);
  const seasonMatches = sceneOutfits.filter((entry) => entry.season.includes(season));
  const shoeMatches = seasonMatches.filter((entry) => containsShoe(entry, shoe));
  const imageMatches = shoeMatches.filter((entry) => containsImageType(entry, imageType));

  return [
    withoutConflicts(imageMatches, input),
    withoutConflicts(shoeMatches, input),
    withoutConflicts(seasonMatches, input),
    withoutConflicts(sceneOutfits, input),
    sceneOutfits
  ].filter((pool) => pool.length > 0);
}

function selectByRotation(candidates: OutfitEntry[], input: ChoosePerSceneOutfitInput, sceneKey: PerSceneOutfitSceneKey) {
  const storageKey = getStorageKey(input, sceneKey);
  const storedHistory = readStoredHistory(storageKey);
  const blockedIds = new Set(
    [input.previousOutfitId, ...(input.generatedHistory ?? []), ...storedHistory.slice(0, 8)].filter(Boolean)
  );
  const available = candidates.filter((entry) => !blockedIds.has(entry.id));
  const pool = available.length ? available : candidates;

  if (typeof input.generationNonce === "number" && Number.isFinite(input.generationNonce)) {
    return pool[Math.abs(input.generationNonce) % pool.length] ?? candidates[0] ?? null;
  }

  const baseIndex = hashText(
    `${sceneKey}|${input.season}|${input.shoe}|${input.imageType}|${input.userExtraRequirement ?? ""}|${storedHistory[0] ?? ""}`
  );
  const selected = pool[baseIndex % pool.length] ?? candidates[0] ?? null;

  if (selected) {
    writeStoredHistory(storageKey, [selected.id, ...storedHistory.filter((id) => id !== selected.id)]);
  }

  return selected;
}

export function choosePerSceneOutfitLine(input: ChoosePerSceneOutfitInput): ChoosePerSceneOutfitResult {
  if (hasUserSpecifiedClothingRequirement(input.userExtraRequirement)) return emptySelection;

  const expandedLifestyleSelection = chooseExpandedLifestyleOutfit(input);
  if (expandedLifestyleSelection) return expandedLifestyleSelection;

  const summerLifestyleSelection = chooseSummerLifestyleOutfit(input);
  if (summerLifestyleSelection) return summerLifestyleSelection;

  const sceneKey = resolvePerSceneKey({
    scenePreference: input.scenePreference,
    imageType: input.imageType,
    userExtraRequirement: input.userExtraRequirement
  });
  if (!sceneKey) return emptySelection;

  const smartSelection = chooseSmartOutfit({
    sceneKey,
    season: normalizePerSceneSeason(input.season),
    shoe: normalizePerSceneShoe(input.shoe),
    imageType: normalizePerSceneImageType(input.imageType),
    garmentTypePreference: input.garmentTypePreference ?? "自动匹配",
    cityProfile: input.cityProfile,
    userExtraRequirement: input.userExtraRequirement,
    previousOutfitId: input.previousOutfitId,
    generationNonce: input.generationNonce
  });

  if (smartSelection) {
    return {
      selectedOutfitId: smartSelection.selectedOutfitId,
      selectedPerSceneOutfitLine: sanitizeSeasonalOutfitLine(
        smartSelection.selectedOutfitLine,
        input.season
      ),
      selectedOutfit: null,
      selectedStylingRealismLine: smartSelection.selectedStylingRealismLine,
      selectedGarmentType: smartSelection.selectedGarmentType,
      selectedOutfitStyle: smartSelection.selectedOutfitStyle,
      selectedColorDirection: smartSelection.selectedColorDirection,
      selectedVisualAnchor: smartSelection.selectedVisualAnchor,
      selectedBagCategory: smartSelection.selectedBagCategory ?? smartSelection.selectedOutfit.bagCategory ?? null,
      selectedAccessoryCategory: smartSelection.selectedAccessoryCategory ?? smartSelection.selectedOutfit.accessoryCategory ?? null,
      conflictWarnings: smartSelection.conflictWarnings
    };
  }

  const sceneOutfits = perSceneOutfitLibrary[sceneKey];
  if (!sceneOutfits?.length) return emptySelection;

  const candidatePools = buildCandidatePools(input, sceneOutfits);
  const selected = selectByRotation(candidatePools[0] ?? sceneOutfits, input, sceneKey);
  if (!selected) return emptySelection;

  return {
    selectedOutfitId: selected.id,
    selectedPerSceneOutfitLine: sanitizeSeasonalOutfitLine(selected.compactLine, input.season),
    selectedOutfit: selected,
    selectedStylingRealismLine: null,
    selectedGarmentType: null,
    selectedOutfitStyle: null,
    selectedColorDirection: null,
    selectedVisualAnchor: null,
    selectedBagCategory: selected.bagCategory ?? null,
    selectedAccessoryCategory: selected.accessoryCategory ?? null
  };
}
