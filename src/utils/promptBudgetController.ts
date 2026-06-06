import type { LightingSpaceType } from "../data/sceneLightingSpaceProfiles";
import type { StandardSceneKey } from "../data/outfitDiversityRules";
import type { TeamImageType } from "../types";
import type { StructuredPromptParts } from "./buildStructuredPrompt";

type PromptBudgetInput = {
  promptParts: StructuredPromptParts;
  imageType: TeamImageType;
  sceneKey: StandardSceneKey;
  lightingSpaceType: LightingSpaceType;
};

function getBudget(input: PromptBudgetInput) {
  if (input.imageType === "产品静物图" || input.lightingSpaceType === "stillLifeStudioNatural") return 2200;
  if (input.imageType === "对镜穿搭图" || input.sceneKey === "mirrorCloset") return 2600;
  if (input.sceneKey === "gymInterior" || input.lightingSpaceType === "indoorGymLight") return 2800;
  return 2800;
}

function getLength(parts: StructuredPromptParts) {
  return [
    parts.timeLine,
    parts.placeLine,
    parts.productLine,
    parts.modelLine,
    parts.outfitLine,
    parts.sceneLine,
    parts.moodLine,
    parts.actionLine,
    parts.negativeLine
  ]
    .filter(Boolean)
    .join(" ").length;
}

function keepSentences(line = "", count: number) {
  const sentences = line
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  return sentences.length > count ? sentences.slice(0, count).join(" ") : line;
}

function compressNegative(line = "", maxPhrases: number) {
  if (!/^Avoid\s/i.test(line)) return line;
  const phrases = line
    .replace(/^Avoid\s+/i, "")
    .replace(/\.$/, "")
    .split(/,\s*/)
    .map((phrase) => phrase.trim())
    .filter(Boolean);

  return phrases.length ? `Avoid ${Array.from(new Set(phrases)).slice(0, maxPhrases).join(", ")}.` : "";
}

export function controlPromptBudget(input: PromptBudgetInput) {
  const budget = getBudget(input);
  let parts = { ...input.promptParts };

  if (getLength(parts) <= budget) return parts;

  parts.moodLine = keepSentences(parts.moodLine, 3);
  parts.outfitLine = keepSentences(parts.outfitLine, 4);
  parts.placeLine = keepSentences(parts.placeLine, 2);

  if (getLength(parts) <= budget) return parts;

  parts.sceneLine = keepSentences(parts.sceneLine, 5);
  parts.actionLine = keepSentences(parts.actionLine, 4);
  parts.negativeLine = compressNegative(parts.negativeLine, 48);

  if (getLength(parts) <= budget) return parts;

  parts.moodLine = keepSentences(parts.moodLine, 2);
  parts.outfitLine = keepSentences(parts.outfitLine, 3);
  parts.sceneLine = keepSentences(parts.sceneLine, 4);
  parts.negativeLine = compressNegative(parts.negativeLine, 36);

  return parts;
}
