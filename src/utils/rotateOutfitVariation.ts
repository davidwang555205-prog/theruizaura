import type { TeamColorDirection, TeamGarmentType, TeamOutfitStyle } from "../types";

export type RotatableOutfit = {
  id: string;
  garmentType: TeamGarmentType;
  outfitStyle: TeamOutfitStyle;
  colorDirection: TeamColorDirection;
  topCategory: string;
  bottomCategory: string;
  visualAnchor: string;
};

type OutfitHistoryEntry = Pick<
  RotatableOutfit,
  "id" | "garmentType" | "outfitStyle" | "colorDirection" | "topCategory" | "bottomCategory" | "visualAnchor"
>;

const memoryHistory = new Map<string, OutfitHistoryEntry[]>();

function readBrowserHistory(key: string): OutfitHistoryEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as OutfitHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function writeBrowserHistory(key: string, history: OutfitHistoryEntry[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(history.slice(0, 12)));
  } catch {
    // Prompt generation must still work if localStorage is blocked.
  }
}

function readHistory(key: string) {
  const browserHistory = readBrowserHistory(key);
  const combined = [...(memoryHistory.get(key) ?? []), ...browserHistory];
  const seen = new Set<string>();

  return combined.filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  });
}

function writeHistory(key: string, selected: RotatableOutfit, currentHistory: OutfitHistoryEntry[]) {
  const nextHistory = [
    {
      id: selected.id,
      garmentType: selected.garmentType,
      outfitStyle: selected.outfitStyle,
      colorDirection: selected.colorDirection,
      topCategory: selected.topCategory,
      bottomCategory: selected.bottomCategory,
      visualAnchor: selected.visualAnchor
    },
    ...currentHistory.filter((entry) => entry.id !== selected.id)
  ].slice(0, 12);

  memoryHistory.set(key, nextHistory);
  writeBrowserHistory(key, nextHistory);
}

function diversityPenalty(candidate: RotatableOutfit, history: OutfitHistoryEntry[], manualGarment = false) {
  const latest = history[0];
  if (!latest) return 0;

  let penalty = 0;
  if (!manualGarment && candidate.garmentType === latest.garmentType) penalty += 30;
  if (candidate.outfitStyle === latest.outfitStyle) penalty += 16;
  if (candidate.colorDirection === latest.colorDirection) penalty += 16;
  if (candidate.topCategory === latest.topCategory) penalty += 12;
  if (candidate.bottomCategory === latest.bottomCategory) penalty += 12;
  if (candidate.visualAnchor === latest.visualAnchor) penalty += 14;
  if (candidate.id === latest.id) penalty += 100;

  history.slice(1, 8).forEach((entry, index) => {
    const recencyWeight = Math.max(1, 8 - index);
    if (candidate.id === entry.id) penalty += 90 + recencyWeight;
    if (!manualGarment && candidate.garmentType === entry.garmentType) penalty += 4;
    if (candidate.outfitStyle === entry.outfitStyle) penalty += 3;
    if (candidate.colorDirection === entry.colorDirection) penalty += 3;
    if (candidate.visualAnchor === entry.visualAnchor) penalty += 6;
  });

  return penalty;
}

export function rotateOutfitVariation<T extends RotatableOutfit>(
  candidates: T[],
  key: string,
  manualGarment = false
): T | null {
  if (!candidates.length) return null;

  const storageKey = `theruiz-aura:standard-outfit-rotation:${key}`;
  const history = readHistory(storageKey);
  const sorted = [...candidates].sort(
    (a, b) => diversityPenalty(a, history, manualGarment) - diversityPenalty(b, history, manualGarment)
  );
  const selected = sorted[0] ?? candidates[0];

  writeHistory(storageKey, selected, history);
  return selected;
}
