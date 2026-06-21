import type { TeamImageType, TeamPromptMode } from "../types";

export type StructuredPromptParts = {
  timeLine?: string;
  placeLine?: string;
  productLine?: string;
  modelLine?: string;
  outfitLine?: string;
  sceneLine?: string;
  moodLine?: string;
  actionLine?: string;
  negativeLine?: string;
  imageType: TeamImageType;
  promptMode: TeamPromptMode;
  userExtraRequirement?: string;
};

function normalizeSectionContent(content = "") {
  return content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();
}

function buildSection(title: string, content?: string) {
  const normalized = normalizeSectionContent(content);
  return normalized ? `${title}:\n${normalized}` : "";
}

export function buildStructuredPrompt(parts: StructuredPromptParts) {
  const isStillLife = parts.imageType === "产品静物图" || parts.imageType === "拍摄花絮 / 材质图";
  const productSection = buildSection("Product", parts.productLine);
  const sections = [
    buildSection("Time", parts.timeLine),
    buildSection("Location", parts.placeLine),
    productSection,
    isStillLife ? "" : buildSection("Model", parts.modelLine),
    isStillLife ? "" : buildSection("Styling", parts.outfitLine),
    buildSection("Scene", parts.sceneLine),
    buildSection("Mood", parts.moodLine),
    isStillLife ? "" : buildSection("Action", parts.actionLine),
    buildSection("Negative", parts.negativeLine)
  ].filter(Boolean);

  const extraRequirement = parts.userExtraRequirement?.trim();
  const body = sections.join("\n\n");

  return extraRequirement ? `${body}\n\nAdditional user requirement: ${extraRequirement}` : body;
}
