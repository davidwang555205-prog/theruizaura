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
      "Use a refined summer amusement-park outfit: a light cotton shirt or soft knit top, pale beige relaxed shorts, breathable layers, and a structured canvas tote, practical for walking and mature rather than cartoonish or sporty-childish.",
    trousers:
      "Use a light cotton shirt with breathable ivory straight trousers and a structured canvas tote for a practical amusement-park walk.",
    skirt:
      "Use a soft knit top with a muted knee-to-midi skirt and a compact tote, keeping the hem controlled and the sneakers fully readable.",
    shorts:
      "Use a light cotton shirt or knit tee with ivory or pale beige tailored shorts and a structured canvas tote for mature summer walking comfort.",
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
      "Use a refined seaside-holiday outfit: a lightweight linen shirt, cream sleeveless knit, breathable straight trousers or soft beige shorts, and one woven or soft leather bag, breezy and mature rather than resort-influencer styled.",
    trousers:
      "Use a lightweight linen shirt with breathable cream straight trousers and one soft leather or woven bag for a refined boardwalk outfit.",
    skirt:
      "Use a cream fine-knit top with a muted flowing midi skirt and one woven bag, keeping the hem away from the sneakers and avoiding resort drama.",
    shorts:
      "Use a cream clean sleeveless knit with soft beige tailored shorts and one woven or soft leather bag for mature seaside ease.",
    dress:
      "Use an ivory linen-blend shirt dress with a controlled hem, light cardigan, and one soft bag for a real hotel-by-the-sea wardrobe.",
    lightActive:
      "Use a refined coastal walking look with a clean active top, breathable straight active trousers, and a light overshirt, never like beach sportswear.",
    automaticGarment: "trousers",
    outfitStyle: "refinedFeminine",
    colorDirection: "lightClean",
    visualAnchor: "lightweight linen shirt",
    bagCategory: "woven or soft leather bag"
  },
  草原野餐: {
    automatic:
      "Use a quiet grassland-picnic outfit: a light shirt or cream knit top, soft beige or muted-sage relaxed trousers, an easy summer layer, and one woven tote or canvas bag, refined rather than camping-influencer styled.",
    trousers:
      "Use a light shirt or cream knit top with muted-sage or soft beige relaxed trousers and one woven tote for quiet grassland ease.",
    skirt:
      "Use a cream knit top with a muted midi skirt and one canvas bag, keeping the hem controlled and the sneakers clear above the grass.",
    shorts:
      "Use a soft cotton shirt with stone or beige tailored shorts and one canvas tote for breathable picnic movement without outdoor-gear styling.",
    dress:
      "Use a restrained cotton shirt dress with a light cardigan and one woven tote, keeping the silhouette practical and not pastoral-costume-like.",
    lightActive:
      "Use a refined movement-ready look with a clean knit tee, muted active trousers, and a light overshirt, never technical or camping-oriented.",
    automaticGarment: "trousers",
    outfitStyle: "realDaily",
    colorDirection: "softAccent",
    visualAnchor: "muted-sage relaxed trousers",
    bagCategory: "woven tote or canvas bag"
  },
  酒店度假: {
    automatic:
      "Use a refined hotel-holiday outfit: an ivory shirt dress, quiet knit set, or cream blouse with soft trousers, plus a light cardigan and structured travel tote, polished but relaxed rather than staged luxury-resort fashion.",
    trousers:
      "Use a cream blouse with soft straight trousers, a light cardigan, and structured travel tote for a calm hotel-holiday wardrobe.",
    skirt:
      "Use a fine-knit top with a muted midi skirt, light cardigan, and compact travel tote, keeping the sneakers clearly visible below the hem.",
    shorts:
      "Use a clean silk-cotton shirt with refined tailored shorts and a structured travel tote for warm-weather hotel ease without resort posing.",
    dress:
      "Use an ivory shirt dress with a controlled hem, light cardigan, and structured travel tote for a real hotel-holiday outfit.",
    lightActive:
      "Use a quiet travel-ready knit set with refined active trousers, a light zip layer, and a no-logo travel tote, never like hotel gym clothing.",
    automaticGarment: "dress",
    outfitStyle: "polishedCommuter",
    colorDirection: "lightClean",
    visualAnchor: "ivory holiday wardrobe",
    bagCategory: "structured travel tote"
  },
  亲子自驾出行: {
    automatic:
      "Use a refined family road-trip outfit: a soft cotton shirt, cream knit top, relaxed straight trousers or tailored shorts, a light outer layer, and one comfortable tote, practical for car-side movement and destination arrival.",
    trousers:
      "Use a soft cotton shirt with relaxed straight trousers, a light outer layer, and one comfortable tote for practical car-side movement.",
    skirt:
      "Use a clean knit top with a controlled muted midi skirt and one comfortable tote, keeping the hem and car door away from the sneakers.",
    shorts:
      "Use a cream knit top with tailored beige shorts, a light overshirt, and one comfortable tote for easy summer road-trip movement.",
    dress:
      "Use a practical cotton shirt dress with a light cardigan and one travel tote, keeping the silhouette mature and easy for getting in and out of the car.",
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
      "Use a relaxed summer return-home outfit: a light shirt or soft knit top, breathable trousers or easy tailored shorts, a thin cardigan or shirt layer, and one tote, lived-in and calm rather than posed or homewear-like.",
    trousers:
      "Use a light shirt or soft knit top with breathable straight trousers, a thin cardigan, and one tote for a calm return-home moment.",
    skirt:
      "Use a soft knit top with a relaxed muted skirt and thin cardigan, keeping the hem controlled and the sneakers visible at the entryway.",
    shorts:
      "Use a light shirt with easy tailored shorts, a thin cardigan, and one tote for a natural after-outing return without homewear styling.",
    dress:
      "Use a relaxed cotton shirt dress with a thin cardigan and one tote for a warm, lived-in return-home outfit that still feels composed.",
    lightActive:
      "Use a clean light active top with relaxed active trousers and a thin shirt layer for an easy return-home moment, never sloppy or gym-ad-like.",
    automaticGarment: "trousers",
    outfitStyle: "realDaily",
    colorDirection: "neutralDaily",
    visualAnchor: "thin summer cardigan",
    bagCategory: "everyday tote"
  }
};

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
  if (normalizePerSceneSeason(input.season) !== "summer") return null;
  if (hasUserSpecifiedClothingRequirement(input.userExtraRequirement)) return null;

  const preference = input.garmentTypePreference ?? "自动匹配";
  const config = summerSceneOutfitConfigs[scene];
  const garmentType = preference === "自动匹配" ? config.automaticGarment : garmentTypeByPreference[preference];
  const selectedLine =
    preference === "自动匹配"
      ? config.automatic
      : config[garmentType];

  return {
    selectedOutfitId: `summer-lifestyle-${scene}-${garmentType}`,
    selectedPerSceneOutfitLine: selectedLine,
    selectedOutfit: null,
    selectedStylingRealismLine:
      "Keep the outfit practical for real summer movement, mature, breathable, and naturally worn, with restrained styling and clear sneaker visibility.",
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
      selectedPerSceneOutfitLine: smartSelection.selectedOutfitLine,
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
    selectedPerSceneOutfitLine: selected.compactLine,
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
