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
import { chooseSmartOutfit, type ChooseSmartOutfitResult } from "./chooseSmartOutfit";
import {
  getImageTypeOutfitTags,
  isOutfitConflictingWithUserRequirement,
  normalizePerSceneImageType,
  normalizePerSceneSeason,
  normalizePerSceneShoe,
  resolvePerSceneKey,
  scoreOutfitUserPreference
} from "./outfitLibraryFilters";

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
  scoreBreakdown?: ChooseSmartOutfitResult["scoreBreakdown"];
  usedFallback?: boolean;
  fallbackReason?: string;
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

function scoreEntry(entry: OutfitEntry, input: ChoosePerSceneOutfitInput) {
  const season = normalizePerSceneSeason(input.season);
  const shoe = normalizePerSceneShoe(input.shoe);
  const imageType = normalizePerSceneImageType(input.imageType);
  const imageTags = getImageTypeOutfitTags(input.imageType);
  const tags = new Set(entry.styleTags);
  let score = 0;

  if (entry.season.includes(season)) score += 30;
  if (containsShoe(entry, shoe)) score += 22;
  if (entry.suitableShoes.includes("ALL")) score += 5;
  if (containsImageType(entry, imageType)) score += 18;

  imageTags.forEach((tag) => {
    if (tags.has(tag)) score += 6;
  });

  if (entry.styleCluster.includes("darkAnchor")) score += 2;
  if (entry.styleTags.some((tag) => /real|daily|premium gym|clean commute/.test(tag))) score += 4;

  return score + scoreOutfitUserPreference(entry, input.userExtraRequirement);
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
  const ranked = [...candidates].sort((a, b) => scoreEntry(b, input) - scoreEntry(a, input));
  const topScore = ranked.length ? scoreEntry(ranked[0], input) : 0;
  const topCandidates = ranked.filter((entry) => scoreEntry(entry, input) >= topScore - 8);
  const storageKey = getStorageKey(input, sceneKey);
  const storedHistory = readStoredHistory(storageKey);
  const blockedIds = new Set(
    [input.previousOutfitId, ...(input.generatedHistory ?? []), ...storedHistory.slice(0, 8)].filter(Boolean)
  );
  const available = topCandidates.filter((entry) => !blockedIds.has(entry.id));
  const pool = available.length ? available : topCandidates.length ? topCandidates : ranked;
  const baseIndex = hashText(
    `${sceneKey}|${input.season}|${input.shoe}|${input.imageType}|${input.userExtraRequirement ?? ""}|${storedHistory[0] ?? ""}`
  );
  const selected = pool[baseIndex % pool.length] ?? ranked[0] ?? null;

  if (selected) {
    writeStoredHistory(storageKey, [selected.id, ...storedHistory.filter((id) => id !== selected.id)]);
  }

  return selected;
}

export function choosePerSceneOutfitLine(input: ChoosePerSceneOutfitInput): ChoosePerSceneOutfitResult {
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
    previousOutfitId: input.previousOutfitId
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
      scoreBreakdown: smartSelection.scoreBreakdown,
      usedFallback: smartSelection.usedFallback,
      fallbackReason: smartSelection.fallbackReason,
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
    selectedVisualAnchor: null
  };
}
