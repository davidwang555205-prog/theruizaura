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
import { parseUserOutfitRequirement } from "./parseUserOutfitRequirement";
import {
  minimumAcceptableOutfitScore,
  scoreOutfitCandidate,
  type OutfitScoreBreakdown
} from "./scoreOutfitCandidate";
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
  selectedBagCategory?: string;
  selectedAccessoryCategory?: string[];
  scoreBreakdown: OutfitScoreBreakdown;
  usedFallback: boolean;
  fallbackReason?: string;
  conflictWarnings: string[];
};

let libraryValidated = false;
let outfitGenerationCounter = 0;

function validateOnce() {
  if (libraryValidated) return;
  libraryValidated = true;
  validateSceneOutfitSeedLibrary();
}

function getManualGarment(preference: TeamGarmentTypePreference): GarmentType | null {
  return preference === "自动匹配" ? null : garmentTypePreferenceMap[preference];
}

function seedMatchesImageType(seed: SceneOutfitSeed, imageType: string | null) {
  if (!imageType) return true;
  return seed.imageTypes.includes(imageType);
}

function seedMatchesGarment(seed: SceneOutfitSeed, garment: GarmentType | null) {
  return garment ? seed.garmentType === garment : true;
}

function fallbackText(seed: SceneOutfitSeed) {
  return [
    seed.topCategory,
    seed.bottomCategory,
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

function scoreFallbackDiversity(seed: SceneOutfitSeed, history: OutfitGeneratedHistoryEntry[]) {
  const recent = history.slice(0, 5);
  const text = fallbackText(seed);
  let penalty = seed.bagCategory ? 4 : -6;

  if (/no visible accessory|wearableonly/i.test(text)) penalty -= 4;

  recent.forEach((item, index) => {
    const weight = index < 2 ? 1 : 0.6;
    if (item.outfitId === seed.id) penalty += 999;
    if (item.bottomCategory === seed.bottomCategory) penalty += 20 * weight;
    if (item.topCategory === seed.topCategory) penalty += 16 * weight;
    if (item.bagCategory && item.bagCategory === seed.bagCategory) penalty += 12 * weight;
    if (item.garmentType === seed.garmentType) penalty += 4 * weight;
    if (item.colorDirection === seed.colorDirection) penalty += 4 * weight;
  });

  return penalty;
}

function chooseFallback(
  input: ChooseSmartOutfitInput,
  blockedGarment: GarmentType | null,
  history: OutfitGeneratedHistoryEntry[],
  rotationIndex: number
) {
  const manualFallbacks = fallbackSafeOutfitTemplates.filter((seed) => seedMatchesGarment(seed, blockedGarment));
  const imageFallbacks = (manualFallbacks.length ? manualFallbacks : fallbackSafeOutfitTemplates).filter((seed) =>
    seedMatchesImageType(seed, input.imageType)
  );
  const pool = imageFallbacks.length ? imageFallbacks : manualFallbacks.length ? manualFallbacks : fallbackSafeOutfitTemplates;
  const ranked = [...pool].sort((a, b) => scoreFallbackDiversity(a, history) - scoreFallbackDiversity(b, history));
  return ranked[rotationIndex % ranked.length] ?? ranked[0] ?? pool[0];
}

function chooseRotatingAcceptableSeed(
  scored: { seed: SceneOutfitSeed; score: OutfitScoreBreakdown }[],
  rotationIndex: number
) {
  const bestScore = scored[0]?.score.totalScore ?? 0;
  const acceptable = scored.filter(
    (entry) =>
      entry.score.totalScore >= minimumAcceptableOutfitScore &&
      entry.score.totalScore >= bestScore - 12
  );

  if (!acceptable.length) return null;
  return acceptable[rotationIndex % acceptable.length] ?? acceptable[0];
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
  scoreBreakdown: OutfitScoreBreakdown;
  usedFallback: boolean;
  fallbackReason?: string;
  conflictWarnings: string[];
}): ChooseSmartOutfitResult {
  const trimmed = trimOutfitPromptBudget({
    outfitLine: input.selected.outfitLine,
    stylingRealismLine: input.selected.stylingRealismLine
  });

  writeOutfitGeneratedHistory(toHistoryEntry(input.smartInput, input.selected));

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
    selectedBagCategory: input.selected.bagCategory,
    selectedAccessoryCategory: input.selected.accessoryCategory,
    scoreBreakdown: input.scoreBreakdown,
    usedFallback: input.usedFallback,
    fallbackReason: input.fallbackReason,
    conflictWarnings: input.conflictWarnings
  };
}

export function chooseSmartOutfit(input: ChooseSmartOutfitInput): ChooseSmartOutfitResult | null {
  validateOnce();

  const rotationIndex = outfitGenerationCounter;
  outfitGenerationCounter += 1;

  const parsedUserRequirement = parseUserOutfitRequirement({
    userExtraRequirement: input.userExtraRequirement,
    garmentTypePreference: input.garmentTypePreference
  });
  const manualGarment = getManualGarment(parsedUserRequirement.resolvedGarmentTypePreference);
  const history = input.generatedHistory ?? readOutfitGeneratedHistory();
  const sceneCandidates = sceneOutfitSeedLibrary[input.sceneKey] ?? [];

  if (!sceneCandidates.length) return null;

  const scored = sceneCandidates
    .filter((seed) => seedMatchesImageType(seed, input.imageType))
    .map((seed) => ({
      seed,
      score: scoreOutfitCandidate({
        outfit: seed,
        sceneKey: input.sceneKey,
        season: input.season,
        shoe: input.shoe,
        imageType: input.imageType,
        garmentTypePreference: input.garmentTypePreference,
        cityProfile: input.cityProfile,
        userExtraRequirement: input.userExtraRequirement,
        parsedUserRequirement,
        generatedHistory: history,
        previousOutfitId: input.previousOutfitId
      })
    }))
    .filter((entry) => !entry.score.hardRejected)
    .sort((a, b) => b.score.totalScore - a.score.totalScore);

  const selected = chooseRotatingAcceptableSeed(scored, rotationIndex);
  if (selected) {
    return buildResult({
      smartInput: input,
      selected: selected.seed,
      scoreBreakdown: selected.score,
      usedFallback: false,
      conflictWarnings: parsedUserRequirement.conflictWarnings
    });
  }

  const fallback = chooseFallback(input, manualGarment, history, rotationIndex);
  const fallbackScore = scoreOutfitCandidate({
    outfit: fallback,
    sceneKey: input.sceneKey,
    season: input.season,
    shoe: input.shoe,
    imageType: input.imageType,
    garmentTypePreference: input.garmentTypePreference,
    cityProfile: input.cityProfile,
    userExtraRequirement: input.userExtraRequirement,
    parsedUserRequirement,
    generatedHistory: history,
    previousOutfitId: input.previousOutfitId
  });

  return buildResult({
    smartInput: input,
    selected: fallback,
    scoreBreakdown: fallbackScore,
    usedFallback: true,
    fallbackReason: scored[0]
      ? `Best seed score ${scored[0].score.totalScore} was below minimum ${minimumAcceptableOutfitScore}.`
      : `No seed passed hard filters; fallback safe outfit template was used.`,
    conflictWarnings: parsedUserRequirement.conflictWarnings
  });
}
