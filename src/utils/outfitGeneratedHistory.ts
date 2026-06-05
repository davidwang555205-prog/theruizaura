import type { ColorDirection, GarmentType, OutfitStyle } from "../data/sceneOutfitSeedLibrary";

export type OutfitGeneratedHistoryEntry = {
  sceneKey: string;
  shoe: string;
  season: string;
  imageType: string;
  outfitId: string;
  garmentType: GarmentType;
  outfitStyle: OutfitStyle;
  colorDirection: ColorDirection;
  topCategory: string;
  bottomCategory: string;
  visualAnchor: string;
  bagCategory?: string;
  timestamp: number;
};

const HISTORY_KEY = "theruiz-aura:outfit-intelligence-v2:history";
let memoryHistory: OutfitGeneratedHistoryEntry[] = [];

export function readOutfitGeneratedHistory(): OutfitGeneratedHistoryEntry[] {
  if (typeof window === "undefined") return memoryHistory;

  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as OutfitGeneratedHistoryEntry[]) : memoryHistory;
  } catch {
    return memoryHistory;
  }
}

export function writeOutfitGeneratedHistory(entry: OutfitGeneratedHistoryEntry) {
  const current = readOutfitGeneratedHistory();
  const next = [entry, ...current.filter((item) => item.outfitId !== entry.outfitId)].slice(0, 20);
  memoryHistory = next;

  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Best effort only. Prompt generation must continue even if localStorage is unavailable.
  }
}

export function clearOutfitGeneratedHistory() {
  memoryHistory = [];

  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    // Best effort only. Prompt generation must continue even if localStorage is unavailable.
  }
}
