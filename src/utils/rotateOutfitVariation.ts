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

const memoryIndex = new Map<string, number>();

function readIndex(key: string) {
  const memoryValue = memoryIndex.get(key);
  if (typeof memoryValue === "number") return memoryValue;
  if (typeof window === "undefined") return 0;

  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

function writeIndex(key: string, nextIndex: number) {
  memoryIndex.set(key, nextIndex);
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, String(nextIndex));
  } catch {
    // Prompt generation must still work if localStorage is blocked.
  }
}

export function rotateOutfitVariation<T extends RotatableOutfit>(
  candidates: T[],
  key: string,
  _manualGarment = false,
  explicitRotationIndex?: number
): T | null {
  if (!candidates.length) return null;

  const stableCandidates = [...candidates].sort((a, b) => a.id.localeCompare(b.id));

  if (typeof explicitRotationIndex === "number" && Number.isFinite(explicitRotationIndex)) {
    return stableCandidates[Math.abs(explicitRotationIndex) % stableCandidates.length] ?? stableCandidates[0];
  }

  const storageKey = `theruiz-aura:standard-outfit-round-robin:${key}`;
  const currentIndex = readIndex(storageKey);
  const selected = stableCandidates[currentIndex % stableCandidates.length] ?? stableCandidates[0];

  writeIndex(storageKey, currentIndex + 1);
  return selected;
}
