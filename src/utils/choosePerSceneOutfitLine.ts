import type { TeamImageType, TeamScenePreference, TeamSeason, TeamShoe } from "../types";
import {
  perSceneOutfitLibrary,
  type PerSceneOutfitLine,
  type PerSceneOutfitSceneKey
} from "../data/perSceneOutfitLibrary";
import {
  getImageTypeOutfitTags,
  hasUserSpecifiedClothingRequirement,
  resolvePerSceneKey
} from "./outfitLibraryFilters";

type ChoosePerSceneOutfitInput = {
  scenePreference: TeamScenePreference;
  season: TeamSeason;
  shoe: TeamShoe;
  imageType: TeamImageType;
  userExtraRequirement?: string;
  previousOutfitId?: string;
  generatedHistory?: string[];
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
    "per-scene-outfit",
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
    // Local storage rotation is best-effort; prompt generation should still work if storage is blocked.
  }
}

function scoreLine(line: PerSceneOutfitLine, input: ChoosePerSceneOutfitInput) {
  const tags = new Set(line.styleTags);
  const imageTags = getImageTypeOutfitTags(input.imageType);
  const extra = (input.userExtraRequirement ?? "").toLowerCase();
  let score = 0;

  if (line.season.includes(input.season)) score += 30;
  if (line.suitableShoes.includes(input.shoe)) score += 18;
  if (line.suitableShoes.includes("自定义")) score += 3;

  imageTags.forEach((tag) => {
    if (tags.has(tag)) score += 6;
  });

  if (input.imageType === "对镜穿搭图" && tags.has("trouser-readability")) score += 10;
  if (input.imageType === "产品上脚图" && tags.has("shoe-readable")) score += 10;
  if (input.imageType === "生活场景图" && (tags.has("real life") || tags.has("warm daily"))) score += 8;
  if ((input.scenePreference === "健身房内" || input.scenePreference === "去运动的路上") && tags.has("active")) {
    score += 14;
  }

  if (/裙|skirt/.test(extra) && tags.has("skirt")) score += 18;
  if (/短裤|shorts|bermuda/.test(extra) && tags.has("shorts")) score += 18;
  if (/牛仔|denim|jeans/.test(extra) && tags.has("denim")) score += 14;
  if (/深色|黑|black|navy|charcoal|dark/.test(extra) && tags.has("dark anchor")) score += 12;
  if (/运动|gym|active|健身/.test(extra) && tags.has("active")) score += 16;

  return score;
}

function selectByRotation(candidates: PerSceneOutfitLine[], input: ChoosePerSceneOutfitInput, sceneKey: PerSceneOutfitSceneKey) {
  const storageKey = getStorageKey(input, sceneKey);
  const storedHistory = readStoredHistory(storageKey);
  const blockedIds = new Set([
    input.previousOutfitId,
    ...(input.generatedHistory ?? []),
    ...storedHistory.slice(0, Math.min(8, storedHistory.length))
  ].filter(Boolean));
  const available = candidates.filter((line) => !blockedIds.has(line.id));
  const pool = available.length ? available : candidates;
  const baseIndex = hashText(`${sceneKey}|${input.season}|${input.shoe}|${input.imageType}|${input.userExtraRequirement ?? ""}`);
  const selected = pool[baseIndex % pool.length] ?? candidates[0];

  if (selected) {
    writeStoredHistory(storageKey, [selected.id, ...storedHistory.filter((id) => id !== selected.id)]);
  }

  return selected;
}

export function choosePerSceneOutfitLine(input: ChoosePerSceneOutfitInput): PerSceneOutfitLine | null {
  if (hasUserSpecifiedClothingRequirement(input.userExtraRequirement)) return null;

  const sceneKey = resolvePerSceneKey({
    scenePreference: input.scenePreference,
    imageType: input.imageType,
    userExtraRequirement: input.userExtraRequirement
  });
  const scene = perSceneOutfitLibrary[sceneKey];
  if (!scene) return null;

  const seasonMatches = scene.outfitLines.filter((line) => line.season.includes(input.season));
  const shoeMatches = seasonMatches.filter(
    (line) => line.suitableShoes.includes(input.shoe) || line.suitableShoes.includes("自定义")
  );
  const baseCandidates = shoeMatches.length ? shoeMatches : seasonMatches.length ? seasonMatches : scene.outfitLines;
  const scoredCandidates = [...baseCandidates].sort((a, b) => scoreLine(b, input) - scoreLine(a, input));
  const topScore = scoredCandidates.length ? scoreLine(scoredCandidates[0], input) : 0;
  const topCandidates = scoredCandidates.filter((line) => scoreLine(line, input) >= topScore - 8);

  return selectByRotation(topCandidates.length ? topCandidates : scoredCandidates, input, sceneKey);
}
