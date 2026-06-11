import type { StructuredPromptParts } from "./buildStructuredPrompt";

export type PromptPriorityBuckets = {
  hardConstraints: {
    timeLine?: string[];
    placeLine?: string[];
    productLine?: string[];
    modelLine?: string[];
    outfitLine?: string[];
    sceneLine?: string[];
    moodLine?: string[];
    actionLine?: string[];
    negativeLine?: string[];
  };
  softAestheticLines?: {
    timeLine?: string[];
    placeLine?: string[];
    outfitLine?: string[];
    sceneLine?: string[];
    moodLine?: string[];
    actionLine?: string[];
  };
};

function appendLines(base = "", lines: string[] = []) {
  return [base, ...lines]
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");
}

function appendNegative(base = "", lines: string[] = []) {
  const phrases = [base.replace(/^Avoid\s+/i, "").replace(/\.$/, ""), ...lines]
    .join(", ")
    .split(/,\s*/)
    .map((phrase) => phrase.trim())
    .filter(Boolean);

  return phrases.length ? `Avoid ${Array.from(new Set(phrases)).join(", ")}.` : "";
}

function trimSoftLine(line = "", maxSentences: number) {
  const sentences = line
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (sentences.length <= maxSentences) return line;
  return sentences.slice(0, maxSentences).join(" ");
}

export function applyPromptPriorityEngine(input: {
  promptParts: StructuredPromptParts;
  buckets: PromptPriorityBuckets;
  maxSoftSentences?: number;
}) {
  const maxSoftSentences = input.maxSoftSentences ?? 4;
  const parts = { ...input.promptParts };

  parts.timeLine = appendLines(parts.timeLine, [
    ...trimSoftLine(appendLines("", input.buckets.softAestheticLines?.timeLine), maxSoftSentences).split(/\n/),
    ...(input.buckets.hardConstraints.timeLine ?? [])
  ]);
  parts.placeLine = appendLines(parts.placeLine, [
    ...trimSoftLine(appendLines("", input.buckets.softAestheticLines?.placeLine), maxSoftSentences).split(/\n/),
    ...(input.buckets.hardConstraints.placeLine ?? [])
  ]);
  parts.productLine = appendLines(parts.productLine, input.buckets.hardConstraints.productLine);
  parts.modelLine = appendLines(parts.modelLine, input.buckets.hardConstraints.modelLine);
  parts.outfitLine = appendLines(parts.outfitLine, [
    ...trimSoftLine(appendLines("", input.buckets.softAestheticLines?.outfitLine), maxSoftSentences).split(/\n/),
    ...(input.buckets.hardConstraints.outfitLine ?? [])
  ]);
  parts.sceneLine = appendLines(parts.sceneLine, [
    ...trimSoftLine(appendLines("", input.buckets.softAestheticLines?.sceneLine), maxSoftSentences).split(/\n/),
    ...(input.buckets.hardConstraints.sceneLine ?? [])
  ]);
  parts.moodLine = appendLines(parts.moodLine, [
    ...trimSoftLine(appendLines("", input.buckets.softAestheticLines?.moodLine), maxSoftSentences).split(/\n/),
    ...(input.buckets.hardConstraints.moodLine ?? [])
  ]);
  parts.actionLine = appendLines(parts.actionLine, [
    ...trimSoftLine(appendLines("", input.buckets.softAestheticLines?.actionLine), maxSoftSentences).split(/\n/),
    ...(input.buckets.hardConstraints.actionLine ?? [])
  ]);
  parts.negativeLine = appendNegative(parts.negativeLine, input.buckets.hardConstraints.negativeLine);

  return parts;
}
