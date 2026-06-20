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

type BudgetSection = Exclude<keyof StructuredPromptParts, "imageType" | "promptMode" | "userExtraRequirement">;

const sectionOrder: BudgetSection[] = [
  "timeLine",
  "placeLine",
  "productLine",
  "modelLine",
  "outfitLine",
  "sceneLine",
  "moodLine",
  "actionLine",
  "negativeLine"
];

const peopleSectionCaps: Record<BudgetSection, number> = {
  timeLine: 14,
  placeLine: 36,
  productLine: 76,
  modelLine: 76,
  outfitLine: 80,
  sceneLine: 48,
  moodLine: 18,
  actionLine: 30,
  negativeLine: 41
};

const nonPeopleSectionCaps: Record<BudgetSection, number> = {
  timeLine: 16,
  placeLine: 34,
  productLine: 52,
  modelLine: 0,
  outfitLine: 0,
  sceneLine: 62,
  moodLine: 34,
  actionLine: 0,
  negativeLine: 48
};

const conceptPatterns: Array<{ key: string; pattern: RegExp; max: number }> = [
  { key: "ageIdentity", pattern: /aged?\s+\d|around age|asian mixed|asian woman/i, max: 1 },
  { key: "gaze", pattern: /gaze|eye contact|look(?:ing)? (?:at|toward|away|down)/i, max: 1 },
  { key: "skinFace", pattern: /skin texture|pores|under-eye|facial asymmetry|doll-like eyes/i, max: 1 },
  { key: "bodyScale", pattern: /body proportion|body scale|leg length|shoulder-neck|grounded weight/i, max: 1 },
  { key: "shoeVisibility", pattern: /fully visible from toe to heel|second (?:sneaker )?clearly readable/i, max: 1 },
  { key: "shoeClipping", pattern: /merge into the shoe|shoe-foot clipping|separation between ankle|sneaker collar/i, max: 1 },
  { key: "scenePhysical", pattern: /physically believable|spatially believable|realistic spatial|object contact/i, max: 1 },
  { key: "cameraCapture", pattern: /photography capture|documentary clarity|editorial still-life capture|daily color capture/i, max: 1 },
  { key: "seasonCompatibility", pattern: /selected season|season and city climate|seasonal layering/i, max: 1 }
];

function isPeopleImage(imageType: TeamImageType) {
  return imageType === "产品上脚图" || imageType === "对镜穿搭图" || imageType === "生活场景图";
}

function countWords(text = "") {
  return text.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)?/g)?.length ?? 0;
}

function splitSentences(line = "") {
  return line
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function sentenceConcept(sentence: string) {
  return conceptPatterns.find((item) => item.pattern.test(sentence));
}

function reduceSemanticRepeats(line = "") {
  const counts = new Map<string, number>();
  return splitSentences(line)
    .filter((sentence) => {
      const concept = sentenceConcept(sentence);
      if (!concept) return true;
      const count = counts.get(concept.key) ?? 0;
      if (count >= concept.max) return false;
      counts.set(concept.key, count + 1);
      return true;
    })
    .join(" ");
}

function limitWords(line = "", maxWords: number, allowPartial = false) {
  if (!line || maxWords <= 0) return "";
  if (countWords(line) <= maxWords) return line.trim();

  const kept: string[] = [];
  let used = 0;
  for (const sentence of splitSentences(line)) {
    const words = sentence.match(/\S+/g) ?? [];
    if (used + words.length <= maxWords) {
      kept.push(sentence);
      used += words.length;
      continue;
    }
    const remaining = maxWords - used;
    if (allowPartial && (!kept.length || remaining >= 8)) {
      let partial = words.slice(0, Math.max(0, remaining));
      let lastComma = -1;
      for (let index = 0; index < partial.length; index += 1) {
        if (/[,;:]$/.test(partial[index])) lastComma = index;
      }
      if (lastComma >= 7) partial = partial.slice(0, lastComma + 1);
      let trailingConjunction = -1;
      for (let index = Math.max(0, partial.length - 5); index < partial.length; index += 1) {
        const word = partial[index].toLowerCase().replace(/[^a-z-]/g, "");
        if (["and", "or", "but"].includes(word)) trailingConjunction = index;
      }
      if (trailingConjunction >= 0) partial = partial.slice(0, trailingConjunction);
      while (
        partial.length &&
        /^(?:and|or|but|with|without|to|for|of|in|at|a|an|the)[,;:]?$/i.test(partial[partial.length - 1] ?? "")
      ) {
        partial.pop();
      }
      if (partial.length) kept.push(`${partial.join(" ").replace(/[,:;]$/, "")}.`);
    }
    break;
  }
  return kept.join(" ").trim();
}

function compressNegative(line = "", maxWords: number) {
  if (!line) return "";
  const prefix = /^Avoid\s+/i.test(line) ? "Avoid " : "";
  const phrases = line
    .replace(/^Avoid\s+/i, "")
    .replace(/\.$/, "")
    .split(/,\s*/)
    .map((phrase) => phrase.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const kept: string[] = [];
  let words = countWords(prefix);

  for (const phrase of phrases) {
    const key = phrase.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key || seen.has(key)) continue;
    const phraseWords = countWords(phrase);
    if (kept.length && words + phraseWords > maxWords) break;
    seen.add(key);
    kept.push(phrase);
    words += phraseWords;
  }

  return kept.length ? `${prefix}${kept.join(", ")}.` : "";
}

function totalWords(parts: StructuredPromptParts) {
  return sectionOrder.reduce((total, key) => total + countWords(parts[key]), 0);
}

export function controlPromptBudget(input: PromptBudgetInput) {
  const peopleImage = isPeopleImage(input.imageType);
  const caps = peopleImage ? peopleSectionCaps : nonPeopleSectionCaps;
  const globalCap = peopleImage ? 350 : 270;
  const parts = { ...input.promptParts };

  sectionOrder.forEach((key) => {
    const line = parts[key] ?? "";
    parts[key] = key === "negativeLine"
      ? compressNegative(line, caps[key])
      : limitWords(reduceSemanticRepeats(line), caps[key], key === "outfitLine");
  });

  if (totalWords(parts) > globalCap) {
    const shrinkOrder: BudgetSection[] = ["moodLine", "actionLine", "negativeLine", "outfitLine", "sceneLine", "placeLine"];
    for (const key of shrinkOrder) {
      if (totalWords(parts) <= globalCap) break;
      const current = countWords(parts[key]);
      const floor = key === "modelLine" || key === "outfitLine" ? 34 : 18;
      const nextLimit = Math.max(floor, current - 10);
      parts[key] = key === "negativeLine"
        ? compressNegative(parts[key], nextLimit)
        : limitWords(parts[key], nextLimit, key === "outfitLine");
    }
  }

  return parts;
}
