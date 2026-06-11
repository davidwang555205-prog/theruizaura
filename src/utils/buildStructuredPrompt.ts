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
  const sections = [
    buildSection("时间", parts.timeLine),
    buildSection("地点", parts.placeLine),
    isStillLife ? buildSection("产品", parts.productLine) : "",
    isStillLife ? "" : buildSection("人物", parts.modelLine),
    isStillLife ? "" : buildSection("穿着", parts.outfitLine),
    buildSection("场景", parts.sceneLine),
    buildSection("氛围", parts.moodLine),
    isStillLife ? "" : buildSection("动作", parts.actionLine),
    buildSection("负面词", parts.negativeLine)
  ].filter(Boolean);

  const extraRequirement = parts.userExtraRequirement?.trim();
  const body = sections.join("\n\n");

  return extraRequirement ? `${body}\n\nAdditional user requirement: ${extraRequirement}` : body;
}
