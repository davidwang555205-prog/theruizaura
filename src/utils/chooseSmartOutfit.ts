import type { TeamGarmentTypePreference } from "../types";
import type { ChinaCityProfile } from "../data/chinaUrbanStreetProfiles";
import { fallbackSafeOutfitTemplates } from "../data/fallbackSafeOutfitTemplates";
import { garmentTypePreferenceMap } from "../data/outfitDiversityRules";
import {
  sceneOutfitSeedLibrary,
  type GarmentType,
  type SceneOutfitSeed
} from "../data/sceneOutfitSeedLibrary";
import {
  readOutfitGeneratedHistory,
  writeOutfitGeneratedHistory,
  type OutfitGeneratedHistoryEntry
} from "./outfitGeneratedHistory";
import { parseUserOutfitRequirement, type ParsedUserOutfitRequirement } from "./parseUserOutfitRequirement";
import { trimOutfitPromptBudget } from "./trimOutfitPromptBudget";
import { validateSceneOutfitSeedLibrary } from "./validateSceneOutfitSeedLibrary";

export type ChooseSmartOutfitInput = {
  sceneKey: string;
  season: "spring" | "summer" | "autumn" | "winter";
  shoe: string;
  imageType: string | null;
  garmentTypePreference: TeamGarmentTypePreference;
  cityProfile?: ChinaCityProfile | null;
  userExtraRequirement?: string;
  previousOutfitId?: string | null;
  generatedHistory?: OutfitGeneratedHistoryEntry[];
  generationNonce?: number;
};

export type ChooseSmartOutfitResult = {
  selectedOutfitId: string;
  selectedOutfitLine: string;
  selectedStylingRealismLine: string;
  selectedOutfit: Pick<SceneOutfitSeed, "bagCategory" | "accessoryCategory">;
  selectedGarmentType: GarmentType;
  selectedOutfitStyle: SceneOutfitSeed["outfitStyle"];
  selectedColorDirection: SceneOutfitSeed["colorDirection"];
  selectedVisualAnchor: string;
  selectedTopCategory: string;
  selectedBottomCategory: string;
  selectedBagCategory?: string;
  selectedAccessoryCategory?: string[];
  conflictWarnings: string[];
};

let libraryValidated = false;

const sensitiveWords = [
  "sexy",
  "seductive",
  "bodycon",
  "sports bra",
  "beauty selfie",
  "revealing",
  "curvy",
  "young girl",
  "teen girl",
  "hot pants"
];

const shoeBlockingWords = [
  "floor-length",
  "covering shoes",
  "long coat covering shoes",
  "oversized bag blocking shoes",
  "oversized shopping bag",
  "props near shoes"
];

const primaryHandheldWords = ["coffee", "cup", "book", "magazine", "flowers", "flower", "paper bag", "water bottle", "phone"];

const handheldConflictPairs = [
  ["coffee", "flowers"],
  ["coffee", "book"],
  ["phone", "coffee"],
  ["tote", "water bottle"],
  ["flowers", "book"],
  ["paper bag", "coffee"]
];

function validateOnce() {
  if (libraryValidated) return;
  libraryValidated = true;
  validateSceneOutfitSeedLibrary();
}

function getManualGarment(preference: TeamGarmentTypePreference): GarmentType | null {
  return preference === "自动匹配" ? null : garmentTypePreferenceMap[preference];
}

function forceGymInteriorActivewear(input: ChooseSmartOutfitInput) {
  return input.sceneKey === "gymInterior";
}

function normalizeText(value?: string) {
  return (value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function seedText(seed: SceneOutfitSeed) {
  return [
    seed.outfitLine,
    seed.stylingRealismLine,
    seed.topCategory,
    seed.bottomCategory,
    seed.outerLayerCategory,
    seed.bagCategory,
    seed.visualAnchor,
    seed.colorDirection,
    seed.garmentType,
    ...(seed.accessoryCategory ?? [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function hasPrimaryHandheldObject(text: string) {
  return primaryHandheldWords.some((word) => new RegExp(`\\b${word}\\b`, "i").test(text));
}

function hasMultipleMainHandheld(text: string) {
  return handheldConflictPairs.some(([first, second]) => {
    const firstMatch = new RegExp(`\\b${first}\\b`, "i").test(text);
    const secondMatch = new RegExp(`\\b${second}\\b`, "i").test(text);
    return firstMatch && secondMatch;
  });
}

function seedMatchesImageType(seed: SceneOutfitSeed, imageType: string | null) {
  if (!imageType) return true;
  return seed.imageTypes.includes(imageType) || seed.imageTypes.includes("ALL");
}

function seedMatchesShoe(seed: SceneOutfitSeed, shoe: string) {
  return seed.suitableShoes.includes("ALL") || seed.suitableShoes.includes(shoe);
}

function seedMatchesGarment(seed: SceneOutfitSeed, garment: GarmentType | null) {
  return garment ? seed.garmentType === garment : true;
}

function seedMatchesSceneGarmentContext(seed: SceneOutfitSeed, input: ChooseSmartOutfitInput, manualGarment: GarmentType | null) {
  if (seed.garmentType !== "lightActive") return true;
  return manualGarment === "lightActive" || input.sceneKey === "gymCommute" || input.sceneKey === "gymInterior";
}

function conflictsWithStrongUserExclusion(seed: SceneOutfitSeed, parsed: ParsedUserOutfitRequirement) {
  const text = seedText(seed);

  if (parsed.hardExclusions.includes(seed.garmentType)) return true;
  if (parsed.hardExclusions.includes("skirt") && seed.garmentType === "skirt") return true;
  if (parsed.hardExclusions.includes("dress") && seed.garmentType === "dress") return true;
  if (parsed.hardExclusions.includes("shorts") && seed.garmentType === "shorts") return true;
  if (parsed.hardExclusions.includes("lightActive") && seed.garmentType === "lightActive") return true;
  if (parsed.hardExclusions.includes("all-light outfit") && seed.colorDirection === "lightClean") return true;
  if (parsed.hardExclusions.includes("black") && /\bblack\b/i.test(text)) return true;
  if (parsed.hardExclusions.includes("handheldObject") && hasPrimaryHandheldObject(text)) return true;

  return false;
}

function isSafeSeed(seed: SceneOutfitSeed, input: ChooseSmartOutfitInput, manualGarment: GarmentType | null, parsed: ParsedUserOutfitRequirement) {
  const text = seedText(seed);

  if (input.previousOutfitId && seed.id === input.previousOutfitId) return false;
  if (!seed.season.includes(input.season)) return false;
  if (!seedMatchesImageType(seed, input.imageType)) return false;
  if (!seedMatchesShoe(seed, input.shoe)) return false;
  if (!seedMatchesGarment(seed, manualGarment)) return false;
  if (!seedMatchesSceneGarmentContext(seed, input, manualGarment)) return false;
  if (includesAny(text, sensitiveWords)) return false;
  if (includesAny(text, shoeBlockingWords)) return false;
  if (hasMultipleMainHandheld(text)) return false;
  if (conflictsWithStrongUserExclusion(seed, parsed)) return false;

  return true;
}

function recentHas(history: OutfitGeneratedHistoryEntry[], key: keyof OutfitGeneratedHistoryEntry, value?: string, take = 3) {
  if (!value) return false;
  return history.slice(0, take).some((item) => item[key] === value);
}

function applySimpleDedupe(candidates: SceneOutfitSeed[], history: OutfitGeneratedHistoryEntry[]) {
  const withoutRecentIds = candidates.filter((seed) => !recentHas(history, "outfitId", seed.id, 5));
  const base = withoutRecentIds.length ? withoutRecentIds : candidates;
  const withoutBottomRepeat = base.filter((seed) => !recentHas(history, "bottomCategory", seed.bottomCategory, 3));
  const bottomBase = withoutBottomRepeat.length ? withoutBottomRepeat : base;
  const withoutTopRepeat = bottomBase.filter((seed) => !recentHas(history, "topCategory", seed.topCategory, 3));
  const topBase = withoutTopRepeat.length ? withoutTopRepeat : bottomBase;
  const withoutBagRepeat = topBase.filter((seed) => !seed.bagCategory || !recentHas(history, "bagCategory", seed.bagCategory, 3));

  return withoutBagRepeat.length ? withoutBagRepeat : topBase;
}

function getSeasonalSuitabilityScore(seed: SceneOutfitSeed, season: ChooseSmartOutfitInput["season"]) {
  const text = seedText(seed);
  const has = (pattern: RegExp) => pattern.test(text);
  const controlledAccentBonus =
    has(/\b(cobalt blue|tomato red|deep burgundy|forest green|apple green)\b/i) &&
    has(/\b(only saturated accent|controlled|restrained)\b/i)
      ? 2
      : 0;

  if (season === "summer") {
    return (
      (has(/\b(linen|short-sleeve|sleeveless|bermuda|shorts|cotton tee|lightweight|breathable)\b/i) ? 4 : 0) +
      (has(/\b(pale blue|cream|ivory|khaki|light denim)\b/i) ? 1 : 0) -
      (has(/\b(wool|coat|turtleneck|scarf|cashmere|corduroy)\b/i) ? 8 : 0) +
      controlledAccentBonus
    );
  }

  if (season === "winter") {
    return (
      (has(/\b(wool|coat|turtleneck|cashmere|warm grey|charcoal|navy|long-sleeve|knit dress|winter)\b/i) ? 5 : 0) +
      (has(/\b(knit|cardigan|jacket|dark denim|structured denim)\b/i) ? 2 : 0) -
      (has(/\b(sleeveless|shorts|bermuda|linen|lightweight)\b/i) ? 8 : 0) +
      controlledAccentBonus
    );
  }

  if (season === "autumn") {
    return (
      (has(/\b(knit|cardigan|jacket|trench|wool|corduroy|taupe|brown|charcoal|navy|dark denim|warm grey)\b/i) ? 4 : 0) -
      (has(/\b(sleeveless|shorts|bermuda|linen)\b/i) ? 6 : 0) +
      controlledAccentBonus
    );
  }

  return (
    (has(/\b(shirt|denim|trench|cardigan|lightweight|pale blue|cream|ivory|khaki)\b/i) ? 3 : 0) -
    (has(/\b(heavy wool|winter coat|turtleneck|bermuda shorts)\b/i) ? 4 : 0) +
    controlledAccentBonus
  );
}

function simplePrioritySort(
  candidates: SceneOutfitSeed[],
  history: OutfitGeneratedHistoryEntry[],
  season: ChooseSmartOutfitInput["season"]
) {
  const recent = history.slice(0, 5);

  return [...candidates].sort((a, b) => {
    const aText = seedText(a);
    const bText = seedText(b);
    const aRepeatsVisualAnchor = recent.some((item) => item.visualAnchor === a.visualAnchor);
    const bRepeatsVisualAnchor = recent.some((item) => item.visualAnchor === b.visualAnchor);
    const aHasNoBag = !a.bagCategory || /no visible bag|no visible accessory|wearableonly/i.test(aText);
    const bHasNoBag = !b.bagCategory || /no visible bag|no visible accessory|wearableonly/i.test(bText);
    const aShoeReadable = !includesAny(aText, shoeBlockingWords);
    const bShoeReadable = !includesAny(bText, shoeBlockingWords);
    const seasonScoreDelta = getSeasonalSuitabilityScore(b, season) - getSeasonalSuitabilityScore(a, season);

    if (seasonScoreDelta !== 0) return seasonScoreDelta;
    if (aRepeatsVisualAnchor !== bRepeatsVisualAnchor) return aRepeatsVisualAnchor ? 1 : -1;
    if (aShoeReadable !== bShoeReadable) return aShoeReadable ? -1 : 1;
    if (aHasNoBag !== bHasNoBag) return aHasNoBag ? -1 : 1;
    return 0;
  });
}

function hashSelectionSalt(value: string) {
  return [...value].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0);
}

function buildSelectionSalt(input: ChooseSmartOutfitInput, suffix = "primary") {
  return [
    suffix,
    input.sceneKey,
    input.season,
    input.shoe,
    input.imageType ?? "unknown",
    input.garmentTypePreference
  ].join("|");
}

function selectByGenerationNonce(candidates: SceneOutfitSeed[], generationNonce?: number, selectionSalt = "") {
  if (!candidates.length) return null;
  if (typeof generationNonce !== "number" || !Number.isFinite(generationNonce)) return candidates[0];

  const offset = selectionSalt ? hashSelectionSalt(selectionSalt) : 0;
  return candidates[Math.abs(generationNonce + offset) % candidates.length] ?? candidates[0];
}

function chooseFallback(input: ChooseSmartOutfitInput, manualGarment: GarmentType | null, history: OutfitGeneratedHistoryEntry[], parsed: ParsedUserOutfitRequirement) {
  const safeFallbacks = fallbackSafeOutfitTemplates.filter((seed) => isSafeSeed(seed, input, manualGarment, parsed));
  const relaxedFallbacks = fallbackSafeOutfitTemplates.filter((seed) => {
    const text = seedText(seed);
    return (
      seed.season.includes(input.season) &&
      seedMatchesShoe(seed, input.shoe) &&
      seedMatchesGarment(seed, manualGarment) &&
      seedMatchesSceneGarmentContext(seed, input, manualGarment) &&
      seedMatchesImageType(seed, input.imageType) &&
      !includesAny(text, sensitiveWords) &&
      !includesAny(text, shoeBlockingWords) &&
      !hasMultipleMainHandheld(text) &&
      !conflictsWithStrongUserExclusion(seed, parsed)
    );
  });
  const seasonFallbacks = fallbackSafeOutfitTemplates.filter(
    (seed) => seed.season.includes(input.season) && seedMatchesSceneGarmentContext(seed, input, manualGarment)
  );
  const pool = safeFallbacks.length ? safeFallbacks : relaxedFallbacks.length ? relaxedFallbacks : seasonFallbacks.length ? seasonFallbacks : fallbackSafeOutfitTemplates;
  const deduped = applySimpleDedupe(pool, history);
  return selectByGenerationNonce(simplePrioritySort(deduped, history, input.season), input.generationNonce, buildSelectionSalt(input, "fallback")) ?? pool[0];
}

function toHistoryEntry(input: ChooseSmartOutfitInput, selected: SceneOutfitSeed): OutfitGeneratedHistoryEntry {
  return {
    sceneKey: input.sceneKey,
    shoe: input.shoe,
    season: input.season,
    imageType: input.imageType ?? "unknown",
    outfitId: selected.id,
    garmentType: selected.garmentType,
    outfitStyle: selected.outfitStyle,
    colorDirection: selected.colorDirection,
    topCategory: selected.topCategory,
    bottomCategory: selected.bottomCategory,
    visualAnchor: selected.visualAnchor,
    bagCategory: selected.bagCategory,
    timestamp: Date.now()
  };
}

function buildResult(input: {
  smartInput: ChooseSmartOutfitInput;
  selected: SceneOutfitSeed;
  conflictWarnings: string[];
}): ChooseSmartOutfitResult {
  const trimmed = trimOutfitPromptBudget({
    outfitLine: input.selected.outfitLine,
    stylingRealismLine: input.selected.stylingRealismLine
  });

  if (typeof input.smartInput.generationNonce !== "number") {
    writeOutfitGeneratedHistory(toHistoryEntry(input.smartInput, input.selected));
  }

  return {
    selectedOutfitId: input.selected.id,
    selectedOutfitLine: trimmed.outfitLine,
    selectedStylingRealismLine: trimmed.stylingRealismLine,
    selectedOutfit: {
      bagCategory: input.selected.bagCategory,
      accessoryCategory: input.selected.accessoryCategory
    },
    selectedGarmentType: input.selected.garmentType,
    selectedOutfitStyle: input.selected.outfitStyle,
    selectedColorDirection: input.selected.colorDirection,
    selectedVisualAnchor: input.selected.visualAnchor,
    selectedTopCategory: input.selected.topCategory,
    selectedBottomCategory: input.selected.bottomCategory,
    selectedBagCategory: input.selected.bagCategory,
    selectedAccessoryCategory: input.selected.accessoryCategory,
    conflictWarnings: input.conflictWarnings
  };
}

export function chooseSmartOutfit(input: ChooseSmartOutfitInput): ChooseSmartOutfitResult | null {
  validateOnce();

  const parsedUserRequirement = parseUserOutfitRequirement({
    userExtraRequirement: input.userExtraRequirement,
    garmentTypePreference: input.garmentTypePreference
  });
  const effectiveParsedUserRequirement = forceGymInteriorActivewear(input)
    ? {
        ...parsedUserRequirement,
        hardExclusions: parsedUserRequirement.hardExclusions.filter((item) => item !== "lightActive"),
        resolvedGarmentTypePreference: "轻运动" as const,
        conflictWarnings: [
          ...parsedUserRequirement.conflictWarnings,
          "Gym interior forces fitness-related clothing only."
        ]
      }
    : parsedUserRequirement;
  const manualGarment = forceGymInteriorActivewear(input)
    ? "lightActive"
    : getManualGarment(effectiveParsedUserRequirement.resolvedGarmentTypePreference);
  const history = input.generatedHistory ?? readOutfitGeneratedHistory();
  const sceneCandidates = sceneOutfitSeedLibrary[input.sceneKey] ?? [];
  if (forceGymInteriorActivewear(input) && !sceneCandidates.length) {
    return null;
  }

  const filtered = sceneCandidates.filter((seed) => isSafeSeed(seed, input, manualGarment, effectiveParsedUserRequirement));
  const selected =
    selectByGenerationNonce(
      simplePrioritySort(applySimpleDedupe(filtered, history), history, input.season),
      input.generationNonce,
      buildSelectionSalt(input)
    ) ??
    chooseFallback(input, manualGarment, history, effectiveParsedUserRequirement);

  if (!selected) return null;

  return buildResult({
    smartInput: input,
    selected,
    conflictWarnings: effectiveParsedUserRequirement.conflictWarnings
  });
}
